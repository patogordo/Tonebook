<script setup lang="ts">
// Uma página: conecta ao NanoCore pelo Web MIDI, leva o preset escolhido ao timbre de uma música e deixa ajustar
// cada parâmetro ao vivo e dá nome ao preset. Nada é gravado pelo site: quem salva é o pedal (segurar o MASTER).
import {
  BLOCKS,
  NAME_MAX,
  blockInfo,
  cc,
  paramCC,
  presetName,
  renameMessage,
  toneMessages,
  type Block,
  type Tone,
} from '#shared/nanocore'
import { SONGS, type Song, type SongPart } from '#shared/songs'
import { parseSong } from '#shared/import'
import promptText from '#shared/prompt-ia.md?raw'

type Status = 'idle' | 'unsupported' | 'denied' | 'missing' | 'ready'
const STATUS_TEXT: Record<Status, string> = {
  idle: 'Desconectado',
  unsupported: 'Este navegador não tem Web MIDI. Use o Chrome ou o Edge, no computador ou no Android.',
  denied: 'O navegador não liberou o acesso ao MIDI.',
  missing: 'NanoCore não encontrado. Confira o cabo USB.',
  ready: 'NanoCore conectado',
}

const status = ref<Status>('idle')
const slot = ref(64)
const current = ref<{ song: Song; part: SongPart; tone: Tone; slot: number } | null>(null)
const name = ref('')
let output: MIDIOutput | undefined
const { baseURL } = useRuntimeConfig().app // no GitHub Pages o site fica em /Tonebook/
let seq = 1

// Músicas coladas como JSON (de IA) ficam no navegador; o que estiver salvo passa de novo pelo validador ao abrir
const STORE = 'tonebook:songs'
const saved = ref<Song[]>(loadSaved())
const allSongs = computed(() => [...SONGS, ...saved.value])
const pasted = ref('')
const importMsg = ref('')
const importError = ref('')
const copied = ref(false)

function loadSaved(): Song[] {
  try {
    const list = JSON.parse(localStorage.getItem(STORE) ?? '[]') as unknown[]
    return list.flatMap(s => {
      try {
        return [parseSong(JSON.stringify(s))]
      } catch {
        return []
      }
    })
  } catch {
    return []
  }
}

function persist() {
  try {
    localStorage.setItem(STORE, JSON.stringify(saved.value))
  } catch {
    importError.value = 'O navegador não deixou salvar: a música fica só até fechar a aba.'
  }
}

async function copyPrompt() {
  await navigator.clipboard.writeText(promptText)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

// Confere o JSON, salva (substitui a de mesmo título e artista) e já manda a primeira parte para o pedal
function importSong() {
  importError.value = importMsg.value = ''
  let song: Song
  try {
    song = parseSong(pasted.value)
  } catch (e) {
    importError.value = (e as Error).message
    return
  }
  const same = (s: Song) =>
    s.title.toLowerCase() === song.title.toLowerCase() && s.artist.toLowerCase() === song.artist.toLowerCase()
  saved.value = [...saved.value.filter(s => !same(s)), song]
  persist()
  pasted.value = ''
  apply(song, song.parts[0]!)
  importMsg.value = output
    ? `${song.title} salva neste navegador e enviada ao preset ${slot.value}.`
    : `${song.title} salva neste navegador. Conecte ao NanoCore para enviar.`
}

function removeSong(song: Song) {
  saved.value = saved.value.filter(s => s !== song)
  persist()
  if (current.value?.song === song) current.value = null
}

async function connect() {
  if (!navigator.requestMIDIAccess) return (status.value = 'unsupported')
  try {
    const access = await navigator.requestMIDIAccess({ sysex: true }) // o nome do preset vai por SysEx
    const pick = () => {
      output = [...access.outputs.values()].find(o => /nanocore/i.test(o.name ?? ''))
      status.value = output ? 'ready' : 'missing'
    }
    access.onstatechange = pick
    pick()
  } catch {
    status.value = 'denied'
  }
}

function apply(song: Song, part: SongPart) {
  if (!output) return
  const tone = structuredClone(toRaw(part.tone)) // as salvas chegam como proxy reativo, que não clona
  current.value = { song, part, tone, slot: slot.value }

  // nome sugerido: título (e parte, se houver mais de uma) só com letras e números, até 8 caracteres
  const label = song.parts.length > 1 ? song.title + part.name : song.title
  name.value = presetName(label.normalize('NFD').replace(/[^A-Za-z0-9]/g, ''))

  // a troca de preset vai na hora; o resto espera 150 ms, porque o pedal sobrescreve o que chega enquanto carrega
  const [programChange, ...rest] = [...toneMessages(tone, slot.value), renameMessage(name.value, seq++)]
  const start = performance.now()
  output.send(programChange!, start)
  rest.forEach((message, i) => output!.send(message, start + 150 + i * 4))
}

// renomeia o preset ativo, que é o que acabou de receber o timbre
function rename() {
  output?.send(renameMessage(name.value, seq++))
}

function tweak(block: Block, index: number, value: number) {
  const state = current.value!.tone.blocks[block]!
  state.params![index] = value
  output?.send(cc(paramCC(block, state.type ?? 0, index), value))
}

const activeBlocks = computed(() => {
  const tone = current.value?.tone
  if (!tone) return []
  return BLOCKS.filter(b => tone.blocks[b]?.on).map(b => ({
    block: b,
    state: tone.blocks[b]!,
    info: blockInfo(b, tone.blocks[b]!),
  }))
})
</script>

<template>
  <main>
    <header class="brand">
      <img :src="`${baseURL}logo.svg`" alt="" width="48" height="48" />
      <div>
        <h1>Tonebook</h1>
        <p class="muted">Timbres de músicas para a pedaleira LIVTRA NanoCore, enviados pelo USB MIDI.</p>
      </div>
    </header>

    <section class="card connect">
      <button v-if="status !== 'ready'" @click="connect">Conectar ao NanoCore</button>
      <span :class="['status', status]">{{ STATUS_TEXT[status] }}</span>
      <label class="slot">
        Preset de destino
        <input v-model.number="slot" type="number" min="1" max="64" />
      </label>
    </section>

    <RecorderCard />

    <section v-for="song in allSongs" :key="song.title + song.artist" class="card">
      <h2 class="song-title">
        <span
          >{{ song.title }} <span class="muted">· {{ song.artist }}</span></span
        >
        <button v-if="saved.includes(song)" class="secondary small" @click="removeSong(song)">Remover</button>
      </h2>
      <div class="parts">
        <div v-for="part in song.parts" :key="part.name" class="part">
          <div>
            <strong>{{ part.name }}</strong>
            <p class="muted">{{ part.hint }}</p>
          </div>
          <button :disabled="status !== 'ready'" @click="apply(song, part)">Enviar</button>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>Música nova por IA</h2>
      <ol class="steps">
        <li>
          Copie as instruções, preencha as linhas <strong>MÚSICA</strong> e <strong>GUITARRA</strong> e cole no Claude,
          no ChatGPT ou em outra IA.
        </li>
        <li>
          Cole abaixo o JSON que ela devolver e clique em <strong>Aplicar e salvar</strong>: o timbre vai para o preset
          {{ slot }} e fica salvo neste navegador.
        </li>
      </ol>
      <button class="secondary" @click="copyPrompt">{{ copied ? 'Copiado!' : 'Copiar instruções para a IA' }}</button>
      <textarea
        v-model="pasted"
        rows="6"
        spellcheck="false"
        placeholder='{ "title": "…", "artist": "…", "parts": [ … ] }'
      />
      <button :disabled="!pasted.trim()" @click="importSong">Aplicar e salvar</button>
      <p v-if="importError" class="error">{{ importError }}</p>
      <p v-if="importMsg" class="ok">{{ importMsg }}</p>
    </section>

    <section v-if="current" class="card">
      <h2>
        {{ current.song.title }}: {{ current.part.name }} <span class="muted">· preset {{ current.slot }}</span>
      </h2>
      <ol class="steps">
        <li>
          No pedal, escolha o amp <strong>{{ current.tone.amp }}</strong> e a caixa
          <strong>{{ current.tone.cab }}</strong> (modelo de amp e IR não passam por MIDI).
        </li>
        <li>Toque e ajuste abaixo; cada mudança vai na hora para o pedal.</li>
        <li>O nome já foi junto; mude abaixo se quiser.</li>
        <li>
          Gostou? Segure o botão <strong>MASTER</strong> do pedal para gravar no preset {{ current.slot }}, com o nome.
        </li>
      </ol>
      <form class="name-row" @submit.prevent="rename">
        <label>
          Nome no pedal
          <input
            :value="name"
            :maxlength="NAME_MAX"
            required
            @input="name = presetName(($event.target as HTMLInputElement).value)"
          />
        </label>
        <button type="submit">Mudar nome</button>
        <span class="muted">Até {{ NAME_MAX }} caracteres, sem acento. Vale para o preset ativo no pedal.</span>
      </form>
      <div v-for="{ block, state, info } in activeBlocks" :key="block" class="block">
        <h3>{{ info.name }}</h3>
        <label v-for="(label, i) in info.params" :key="label" class="param">
          <span>{{ label }}</span>
          <input
            type="range"
            min="0"
            max="127"
            :value="Math.round(state.params![i]! * 127)"
            @input="tweak(block, i, Number(($event.target as HTMLInputElement).value) / 127)"
          />
          <output>{{ Math.round(state.params![i]! * 100) }}</output>
        </label>
      </div>
    </section>
  </main>
</template>

<style>
:root {
  --bg: #111315;
  --surface: #1b1e21;
  --line: #2c3035;
  --text: #e8e6e3;
  --muted: #9aa0a6;
  --brand: #f0a43a;
  --ok: #5fc27e;
  --danger: #e66;
  color-scheme: dark;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font:
    16px/1.5 system-ui,
    sans-serif;
}
main {
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 16px 64px;
}
h1 {
  margin: 0;
  font-size: 1.6rem;
}
h2 {
  margin: 0 0 12px;
  font-size: 1.15rem;
}
h3 {
  margin: 16px 0 4px;
  font-size: 0.95rem;
  color: var(--brand);
}
p {
  margin: 0;
}
.muted {
  color: var(--muted);
  font-weight: normal;
  font-size: 0.9rem;
}
.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}
.connect {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.status.ready {
  color: var(--ok);
}
.status.unsupported,
.status.denied,
.status.missing {
  color: var(--danger);
}
.slot {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}
.slot input {
  width: 64px;
}
input[type='number'] {
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 6px 8px;
  font: inherit;
}
button {
  background: var(--brand);
  color: #1a1205;
  border: 0;
  border-radius: 8px;
  padding: 8px 16px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.parts {
  display: grid;
  gap: 8px;
}
.part {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid var(--line);
}
.steps {
  margin: 0 0 8px;
  padding-left: 20px;
  color: var(--muted);
  font-size: 0.9rem;
}
.steps strong {
  color: var(--text);
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.brand img {
  border-radius: 10px;
  flex: none;
}
.song-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
button.small {
  padding: 4px 10px;
  font-size: 0.85rem;
}
textarea {
  display: block;
  width: 100%;
  margin: 12px 0;
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 8px;
  font:
    0.85rem/1.4 ui-monospace,
    monospace;
}
.ok {
  color: var(--ok);
  margin-top: 8px;
  font-size: 0.9rem;
}
.name-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 4px 0 8px;
}
.name-row label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}
.name-row input {
  width: 9rem;
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 6px 8px;
  font: inherit;
}
.param {
  display: grid;
  grid-template-columns: 9.5rem 1fr 2.5rem;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}
.param input {
  width: 100%;
  accent-color: var(--brand);
}
.param output {
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}
@media (max-width: 480px) {
  .slot {
    margin-left: 0;
  }
  .param {
    grid-template-columns: 7rem 1fr 2rem;
  }
}
</style>

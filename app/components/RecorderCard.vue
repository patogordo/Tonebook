<script setup lang="ts">
// Grava esta aba (com a câmera flutuando no canto, então entram as configurações e quem toca) e o som escolhido:
// o que sai do NanoCore pelo USB, o microfone ou os dois misturados. Só no computador: celular não grava a tela
// pelo navegador.
const supported = !!navigator.mediaDevices?.getDisplayMedia
const camStream = shallowRef<MediaStream>()
const camWidth = ref(320)
const usePedal = ref(true)
const useMic = ref(false)
const recording = ref(false)
const seconds = ref(0)
const error = ref('')
const file = ref<{ url: string, name: string }>()
let recorder: MediaRecorder | undefined
let timer: ReturnType<typeof setInterval> | undefined

const stopTracks = (s: MediaStream) => s.getTracks().forEach(t => t.stop())
const clock = computed(() => `${Math.floor(seconds.value / 60)}:${String(seconds.value % 60).padStart(2, '0')}`)
const isPedal = (label: string) => /nanocore/i.test(label)

async function toggleCamera() {
  error.value = ''
  if (camStream.value) {
    stopTracks(camStream.value)
    camStream.value = undefined
    return
  }
  try {
    camStream.value = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
  } catch {
    error.value = 'A câmera não foi liberada.'
  }
}

// Abre a primeira entrada de áudio cujo nome passa no filtro. Sem cancelamento de eco, redução de ruído e ganho
// automático: são filtros de voz que cortam e comprimem a guitarra
async function openInput(match: (label: string) => boolean, missing: string): Promise<MediaStream> {
  const inputs = async () => (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'audioinput')
  let list = await inputs()
  if (!list.some(d => d.label)) {
    stopTracks(await navigator.mediaDevices.getUserMedia({ audio: true })) // os nomes só aparecem com a permissão
    list = await inputs()
  }
  const device = list.find(d => match(d.label))
  if (!device) throw new Error(missing)
  return navigator.mediaDevices.getUserMedia({
    audio: { deviceId: { exact: device.deviceId }, echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 2 },
  })
}

async function start() {
  error.value = ''
  const inputs: MediaStream[] = []
  let screen: MediaStream
  try {
    if (usePedal.value) inputs.push(await openInput(isPedal, 'Não achei o áudio do NanoCore. Confira o cabo USB.'))
    if (useMic.value) inputs.push(await openInput(l => !isPedal(l), 'Não achei um microfone.'))
    screen = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: false, preferCurrentTab: true } as DisplayMediaStreamOptions)
  } catch (e) {
    inputs.forEach(stopTracks)
    error.value = e instanceof DOMException ? 'A gravação não foi liberada.' : (e as Error).message
    return
  }
  // as entradas escolhidas viram uma faixa só
  const mixer = new AudioContext()
  const mix = mixer.createMediaStreamDestination()
  for (const input of inputs) mixer.createMediaStreamSource(input).connect(mix)

  const stream = new MediaStream([...screen.getVideoTracks(), ...mix.stream.getAudioTracks()])
  const mimeType = ['video/mp4;codecs=avc1,mp4a.40.2', 'video/webm;codecs=vp9,opus', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t))
  const chunks: Blob[] = []
  const rec = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 256_000 })
  rec.ondataavailable = e => chunks.push(e.data)
  rec.onstop = () => {
    stopTracks(screen)
    inputs.forEach(stopTracks)
    mixer.close()
    clearInterval(timer)
    recording.value = false
    const blob = new Blob(chunks, { type: rec.mimeType })
    if (file.value) URL.revokeObjectURL(file.value.url)
    const stamp = new Date().toLocaleString('sv').replace(/[: ]/g, '-')
    file.value = { url: URL.createObjectURL(blob), name: `tonebook-${stamp}.${blob.type.includes('mp4') ? 'mp4' : 'webm'}` }
  }
  // parar pelo aviso de compartilhamento do navegador também encerra a gravação
  screen.getVideoTracks()[0]!.onended = () => rec.state === 'recording' && rec.stop()
  recorder = rec
  rec.start(1000)
  recording.value = true
  seconds.value = 0
  timer = setInterval(() => seconds.value++, 1000)
}
</script>

<template>
  <section v-if="supported" class="card">
    <h2>Gravar vídeo</h2>
    <p class="muted">Grava esta aba, com a câmera no canto, e o som escolhido. Quando o navegador perguntar, escolha esta aba.</p>
    <div class="rec-row">
      <label class="check"><input v-model="usePedal" type="checkbox" :disabled="recording"> Som do NanoCore (USB)</label>
      <label class="check"><input v-model="useMic" type="checkbox" :disabled="recording"> Microfone</label>
    </div>
    <div class="rec-row">
      <button class="secondary" @click="toggleCamera">{{ camStream ? 'Desligar câmera' : 'Ligar câmera' }}</button>
      <label v-if="camStream" class="check">Tamanho <input v-model.number="camWidth" type="range" min="160" max="720" step="10"></label>
      <button v-if="!recording" :disabled="!usePedal && !useMic" @click="start">Gravar</button>
      <button v-else class="danger" @click="recorder?.stop()">Parar · {{ clock }}</button>
      <a v-if="file && !recording" class="download" :href="file.url" :download="file.name">Baixar vídeo</a>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
  </section>
  <video v-if="camStream" class="camera" :style="{ width: `${camWidth}px` }" :srcObject.prop="camStream" autoplay muted playsinline />
</template>

<style>
.rec-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 12px; }
.check { display: flex; align-items: center; gap: 6px; font-size: 0.9rem; }
.check input { accent-color: var(--brand); width: 18px; height: 18px; }
button.secondary { background: var(--surface); color: var(--text); border: 1px solid var(--line); }
button.danger { background: var(--danger); color: #fff; }
.download { color: var(--brand); font-weight: 600; }
.error { color: var(--danger); margin-top: 8px; font-size: 0.9rem; }
.camera {
  position: fixed; right: 16px; bottom: 16px; z-index: 10; max-width: calc(100vw - 32px); aspect-ratio: 4 / 3;
  object-fit: cover; border: 2px solid var(--line); border-radius: 12px; background: #000;
}
.check input[type=range] { width: 120px; height: auto; }
</style>

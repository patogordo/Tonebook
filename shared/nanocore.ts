// Mapa de MIDI do LIVTRA NanoCore (guia oficial "MIDI Control User Guide", firmware 1.04+) e a tradução de um
// timbre em mensagens. Os parâmetros vão de 0 a 1, como no arquivo de preset do ToneCommand, e viram CC 0–127.
// Modelo de amp e IR da caixa não passam por MIDI: o pedal só deixa escolher na tela dele ou no app.

export type Block = 'fx1' | 'fx2' | 'amp' | 'cab' | 'mod' | 'delay' | 'reverb' | 'eq'

export interface BlockState {
  on: boolean
  type?: number // ID do guia de MIDI (no reverb: 4 = Shimmer, 5 = Cloud, 6 = Spring)
  params?: number[] // 0–1, na ordem do guia
}

export interface Tone {
  amp: string // nome do modelo no pedal (ex.: VXAC30)
  cab: string // nome da IR no pedal (ex.: AC30212)
  blocks: Partial<Record<Block, BlockState>>
}

export const BLOCKS: Block[] = ['fx1', 'fx2', 'amp', 'cab', 'mod', 'delay', 'reverb', 'eq']

const ON_CC: Record<Block, number> = { fx1: 20, fx2: 21, amp: 23, cab: 24, mod: 25, delay: 26, reverb: 27, eq: 28 }
const TYPE_CC: Partial<Record<Block, number>> = { fx1: 40, fx2: 41, mod: 45, delay: 46, reverb: 47, eq: 48 }
const EQ_CC = [91, 92, 93, 94, 95, 96, 97, 33]

export function paramCC(block: Block, type: number, index: number): number {
  switch (block) {
    case 'fx1': return (type === 3 ? 51 : 50) + index // o compressor sozinho começa no limiar dele (CC51)
    case 'fx2': return (type >= 8 ? 68 : 57) + index // pitch e wahs usam os CCs da modulação
    case 'amp': return 60 + index
    case 'cab': return 65 + index
    case 'mod': return 68 + index
    case 'delay': return 74 + index
    case 'reverb': return 85 + index
    case 'eq': return EQ_CC[index]!
  }
}

export const cc = (control: number, value: number): number[] => [0xb0, control, Math.round(Math.min(1, Math.max(0, value)) * 127)]

// Mensagens que levam o preset `slot` (1–64, como na tela) a este timbre: troca de preset, depois o tipo de
// cada bloco antes dos parâmetros (o significado deles depende do tipo) e por fim o liga/desliga.
export function toneMessages(tone: Tone, slot: number): number[][] {
  const out = [[0xc0, slot - 1]]
  for (const block of BLOCKS) {
    const state = tone.blocks[block] ?? { on: false }
    if (state.on) {
      const typeCC = TYPE_CC[block]
      if (typeCC !== undefined && state.type !== undefined) out.push([0xb0, typeCC, state.type])
      state.params?.forEach((v, i) => out.push(cc(paramCC(block, state.type ?? 0, i), v)))
    }
    out.push([0xb0, ON_CC[block], state.on ? 127 : 0])
  }
  return out
}

// SysEx do próprio ToneCommand (não documentado; lido das respostas do pedal enquanto o app renomeava um preset).
// Quadro: F0 7D 4E 43 70 <dados> F7. Dados: [02][seq u16][comando u16][tamanho u16][conteúdo], little-endian,
// em grupos de 7 bytes: um byte com os bits altos (bit i = bit 7 do i-ésimo) e os 7 bytes com 7 bits.
export function pack7(raw: number[]): number[] {
  const out: number[] = []
  for (let i = 0; i < raw.length; i += 7) {
    const group = raw.slice(i, i + 7)
    out.push(group.reduce((msb, b, j) => msb | (b >> 7) << j, 0), ...group.map(b => b & 0x7f))
  }
  return out
}

export function sysex(seq: number, command: number, data: number[]): number[] {
  const u16 = (n: number) => [n & 0xff, n >> 8 & 0xff]
  return [0xf0, 0x7d, 0x4e, 0x43, 0x70, ...pack7([0x02, ...u16(seq), ...u16(command), ...u16(data.length), ...data]), 0xf7]
}

// Nomes dos presets de fábrica e do app têm até 8 caracteres ASCII; acento vira a letra sem acento
export const NAME_MAX = 8
export const presetName = (text: string) => text.normalize('NFD').replace(/[^\x20-\x7e]/g, '').slice(0, NAME_MAX)

// Renomeia o preset ativo (comando 0x6d, subcomando 0x08, como o app faz). Vale até trocar de preset: o MASTER salva.
export function renameMessage(name: string, seq: number): number[] {
  const bytes = [...presetName(name)].map(c => c.charCodeAt(0))
  return sysex(seq, 0x6d, [0x08, bytes.length, ...bytes])
}

const DRIVE = ['Ganho', 'Tom', 'Volume']
const RATE_FB = ['Velocidade', 'Realimentação', 'Mix', 'Volume']
const TIME_FB = (...mid: string[]) => ['Tempo', 'Realimentação', ...mid, 'Mix', 'Volume']
const REV = (third: string, fourth: string) => ['Decaimento', 'Pré-delay', third, fourth, 'Mix', 'Volume']

export const TYPES: Partial<Record<Block, { name: string, params: string[] }[]>> = {
  fx1: [
    { name: 'Gate', params: ['Limiar'] },
    { name: 'Auto Gate', params: [] },
    { name: 'Gate + Compressor', params: ['Gate', 'Limiar', 'Ratio', 'Knee', 'Ataque', 'Release', 'Ganho'] },
    { name: 'Compressor', params: ['Limiar', 'Ratio', 'Knee', 'Ataque', 'Release', 'Ganho'] },
  ],
  fx2: [
    { name: 'Scream (TS9)', params: DRIVE },
    { name: 'Klone', params: DRIVE },
    { name: 'OCD', params: DRIVE },
    { name: 'DS2', params: DRIVE },
    { name: 'PiFuzz (Big Muff)', params: DRIVE },
    { name: 'Range (Rangemaster)', params: ['Boost'] },
    { name: 'XAC (AC Booster)', params: ['Boost'] },
    { name: 'Fiman (Friedman)', params: ['Boost'] },
    { name: 'Pitch', params: ['Afinação', 'Fino', 'Mix', 'Volume'] },
    { name: 'Envelope Wah', params: ['Frequência', 'Envelope', 'Q', 'Mix', 'Volume'] },
    { name: 'Wah', params: ['Frequência', 'Varredura', 'Velocidade', 'Forma', 'Mix', 'Volume'] },
  ],
  mod: [
    { name: 'Chorus', params: ['Velocidade', 'Profundidade', 'Volume'] },
    { name: 'Phaser', params: RATE_FB },
    { name: 'Flanger', params: RATE_FB },
    { name: 'Tremolo', params: ['Velocidade', 'Profundidade', 'Onda', 'Suavidade', 'Mix', 'Volume'] },
    { name: 'Vibrato', params: ['Velocidade', 'Profundidade', 'Onda', 'Mix', 'Volume'] },
  ],
  delay: [
    { name: 'BBD', params: TIME_FB('Idade') },
    { name: 'Digital', params: TIME_FB() },
    { name: 'Duck', params: TIME_FB('Filtro') },
    { name: 'Ice', params: TIME_FB('Intervalo') },
    { name: 'Reverse', params: TIME_FB() },
    { name: 'LoFi', params: TIME_FB('Bits', 'Mix LoFi') },
    { name: 'Smear', params: TIME_FB('Smear', 'Filtro') },
    { name: 'Mod', params: TIME_FB('Prof. da mod.', 'Vel. da mod.') },
  ],
  reverb: [
    { name: 'Room', params: REV('Tom', 'Mod') },
    { name: 'Plate', params: REV('Tom', 'Mod') },
    { name: 'Hall', params: REV('Tom', 'Amortecer graves') },
    { name: 'Concert', params: REV('Amortecer agudos', 'Mod') },
    { name: 'Shimmer', params: REV('Tom', 'Afinação') },
    { name: 'Cloud', params: ['Decaimento', 'Tom', 'Prof. da mod.', 'Vel. da mod.', 'Mix', 'Volume'] },
    { name: 'Spring', params: REV('Crossover', 'Mod') },
  ],
  eq: [
    { name: 'EQ de 3 bandas', params: ['Graves', 'Médios', 'Agudos'] },
    { name: 'EQ de 6 bandas', params: ['120 Hz', '250 Hz', '500 Hz', '1 kHz', '2 kHz', '4 kHz'] },
    { name: 'EQ de 8 bandas', params: ['60 Hz', '120 Hz', '250 Hz', '500 Hz', '1 kHz', '2 kHz', '4 kHz', '8 kHz'] },
  ],
}

const FIXED: Partial<Record<Block, string[]>> = {
  amp: ['Ganho', 'Graves', 'Médios', 'Agudos', 'Volume'],
  cab: ['Corte de graves', 'Corte de agudos', 'Volume'],
}

export const BLOCK_NAMES: Record<Block, string> = {
  fx1: 'Gate / compressor', fx2: 'Drive', amp: 'Amp', cab: 'Caixa', mod: 'Modulação', delay: 'Delay', reverb: 'Reverb', eq: 'EQ',
}

export function blockInfo(block: Block, state: BlockState): { name: string, params: string[] } {
  const fixed = FIXED[block]
  if (fixed) return { name: BLOCK_NAMES[block], params: fixed }
  return TYPES[block]?.[state.type ?? 0] ?? { name: '?', params: [] }
}

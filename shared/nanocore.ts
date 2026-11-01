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

// Modelos de amp e caixa de fábrica, na ordem do manual (V01). O MIDI não troca o modelo: o site só diz qual escolher
// no pedal, e o JSON colado só pode usar estes nomes. Cada pedal pode ter só parte deles carregada (o app troca).
export const AMPS: Record<string, string> = {
  BogXTC1: 'Bogner Ecstasy (XTC), tom 1',
  BogXTC2: 'Bogner Ecstasy (XTC), tom 2',
  ENGP1: 'ENGL Powerball, tom 1',
  ENGP2: 'ENGL Powerball, tom 2',
  Fd59Bm: "Fender '59 Bassman",
  Fd65Dk: "Fender '65 Darkface, limpo",
  Hiw103: 'Hiwatt DR103',
  MarDSL1: 'Marshall DSL50, tom 1',
  MarDSL2: 'Marshall DSL50, tom 2',
  Mar8001: 'Marshall JCM800, tom 1',
  Mar8002: 'Marshall JCM800, tom 2',
  MesR1: 'Mesa Rectifier, tom 1',
  MesR2: 'Mesa Rectifier, tom 2',
  MesR3: 'Mesa Rectifier, tom 3',
  OgG120: 'Orange Graphic 120',
  Pey51501: 'Peavey 5150, tom 1',
  Pey51502: 'Peavey 5150, tom 2',
  Pey6505: 'Peavey 6505',
  RanT21: 'Randall T2, tom 1',
  RanT22: 'Randall T2, tom 2',
  RoJC120: 'Roland JC-120, limpo',
  SLO1001: 'Soldano SLO-100, tom 1',
  SLO1002: 'Soldano SLO-100, tom 2',
  SLO1003: 'Soldano SLO-100, tom 3',
  VXAC30: 'Vox AC30',
  ApSVTVR: 'Ampeg SVT VR (baixo)',
  ApSVTCL: 'Ampeg SVT-CL (baixo)',
  Adn900: 'Ashdown ABM900 (baixo)',
  Hiw320: 'Hiwatt Jupiter 320 (baixo)',
  MarSup: 'Marshall Super Bass (baixo)',
}
export const CABS: Record<string, string> = {
  Bog412A: 'Bogner 4x12, tom A',
  Bog412B: 'Bogner 4x12, tom B',
  Eng412A: 'ENGL 4x12 Vintage 30, tom A',
  Eng412B: 'ENGL 4x12 Vintage 30, tom B',
  FdTR212: 'Fender Twin Reverb 2x12',
  Fd59BM410: "Fender '59 Bassman 4x10",
  Hiw412: 'Hiwatt 4x12',
  Mar412A: 'Marshall 4x12 V30, tom A',
  Mar412B: 'Marshall 4x12 V30, tom B',
  Mar96412A: 'Marshall 1960B 4x12, tom A',
  Mar96412B: 'Marshall 1960B 4x12, tom B',
  Mes412A: 'Mesa 4x12 V30, tom A',
  Mes412B: 'Mesa 4x12 V30, tom B',
  Mes412C: 'Mesa 4x12 V30, tom C',
  Og412: 'Orange 4x12 V30',
  pey412A: 'Peavey 5150 4x12, tom A',
  pey412B: 'Peavey 5150 4x12, tom B',
  peyVk412: 'Peavey Valveking 4x12',
  Ran112A: 'Randall 1x12, tom A',
  Ran112B: 'Randall 1x12, tom B',
  Ran112C: 'Randall 1x12, tom C',
  SLO412A: 'Soldano 4x12, tom A',
  SLO412B: 'Soldano 4x12, tom B',
  SLO412C: 'Soldano 4x12, tom C',
  AC30212: 'Vox AC30 2x12',
  AP810: 'Ampeg 8x10 (baixo)',
  Ap410: 'Ampeg SVT 4x10 (baixo)',
  Adn410: 'Ashdown 4x10 (baixo)',
  HiwB410: 'Hiwatt 4x10 (baixo)',
  Mar412: 'Marshall 4x12',
}

const ON_CC: Record<Block, number> = { fx1: 20, fx2: 21, amp: 23, cab: 24, mod: 25, delay: 26, reverb: 27, eq: 28 }
const TYPE_CC: Partial<Record<Block, number>> = { fx1: 40, fx2: 41, mod: 45, delay: 46, reverb: 47, eq: 48 }
const EQ_CC = [91, 92, 93, 94, 95, 96, 97, 33]

export function paramCC(block: Block, type: number, index: number): number {
  switch (block) {
    case 'fx1':
      return (type === 3 ? 51 : 50) + index // o compressor sozinho começa no limiar dele (CC51)
    case 'fx2':
      return (type >= 8 ? 68 : 57) + index // pitch e wahs usam os CCs da modulação
    case 'amp':
      return 60 + index
    case 'cab':
      return 65 + index
    case 'mod':
      return 68 + index
    case 'delay':
      return 74 + index
    case 'reverb':
      return 85 + index
    case 'eq':
      return EQ_CC[index]!
  }
}

export const cc = (control: number, value: number): number[] => [
  0xb0,
  control,
  Math.round(Math.min(1, Math.max(0, value)) * 127),
]

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
    out.push(
      group.reduce((msb, b, j) => msb | ((b >> 7) << j), 0),
      ...group.map(b => b & 0x7f),
    )
  }
  return out
}

export function unpack7(packed: number[]): number[] {
  const out: number[] = []
  for (let i = 0; i < packed.length; i += 8) {
    const msb = packed[i]!
    packed.slice(i + 1, i + 8).forEach((b, j) => out.push(b | (((msb >> j) & 1) << 7)))
  }
  return out
}

const HEADER = [0xf0, 0x7d, 0x4e, 0x43]

export function sysex(seq: number, command: number, data: number[]): number[] {
  const u16 = (n: number) => [n & 0xff, (n >> 8) & 0xff]
  return [...HEADER, 0x70, ...pack7([0x02, ...u16(seq), ...u16(command), ...u16(data.length), ...data]), 0xf7]
}

// O que o pedal manda: resposta a um pedido (0x71, com o status; 0 = aceito) ou aviso (0x72, ex.: 0x60 = preset ativo)
export interface PedalMessage {
  kind: 'response' | 'notice'
  seq: number
  command: number
  status: number
  data: number[]
}

export function parseSysex(message: ArrayLike<number>): PedalMessage | null {
  const bytes = Array.from(message)
  const isOurs = HEADER.every((b, i) => bytes[i] === b) && bytes.at(-1) === 0xf7
  if (!isOurs || (bytes[4] !== 0x71 && bytes[4] !== 0x72)) return null
  const raw = unpack7(bytes.slice(5, -1))
  const u16 = (i: number) => (raw[i] ?? 0) | ((raw[i + 1] ?? 0) << 8)
  if (bytes[4] === 0x71) {
    return { kind: 'response', seq: u16(1), command: u16(3), status: raw[5] ?? -1, data: raw.slice(8, 8 + u16(6)) }
  }
  return { kind: 'notice', seq: 0, command: u16(1), status: 0, data: raw.slice(5, 5 + u16(3)) }
}

export const NOTICE_ACTIVE_PRESET = 0x60

// Nomes dos presets de fábrica e do app têm até 8 caracteres ASCII; acento vira a letra sem acento
export const NAME_MAX = 8
export const presetName = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[^\x20-\x7e]/g, '')
    .slice(0, NAME_MAX)

// Renomeia o preset ativo (comando 0x6d, subcomando 0x08, como o app faz). Vale até trocar de preset; saveMessage grava.
// Grava o preset ativo na memória do pedal (comando 0x46 com o número do preset, como o botão de salvar do app).
// Só com o preset ativo: o app nunca mandou outro número, e não se sabe o que o pedal faz nesse caso.
export function saveMessage(slot: number, seq: number): number[] {
  return sysex(seq, 0x46, [slot - 1])
}

export function renameMessage(name: string, seq: number): number[] {
  const bytes = [...presetName(name)].map(c => c.charCodeAt(0))
  return sysex(seq, 0x6d, [0x08, bytes.length, ...bytes])
}

const DRIVE = ['Ganho', 'Tom', 'Volume']
const RATE_FB = ['Velocidade', 'Realimentação', 'Mix', 'Volume']
const TIME_FB = (...mid: string[]) => ['Tempo', 'Realimentação', ...mid, 'Mix', 'Volume']
const REV = (third: string, fourth: string) => ['Decaimento', 'Pré-delay', third, fourth, 'Mix', 'Volume']

export const TYPES: Partial<Record<Block, { name: string; params: string[] }[]>> = {
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
  fx1: 'Gate / compressor',
  fx2: 'Drive',
  amp: 'Amp',
  cab: 'Caixa',
  mod: 'Modulação',
  delay: 'Delay',
  reverb: 'Reverb',
  eq: 'EQ',
}

export function blockInfo(block: Block, state: BlockState): { name: string; params: string[] } {
  const fixed = FIXED[block]
  if (fixed) return { name: BLOCK_NAMES[block], params: fixed }
  return TYPES[block]?.[state.type ?? 0] ?? { name: '?', params: [] }
}

// Confere o JSON de uma música colado no site (normalmente gerado por IA a partir de shared/prompt-ia.md) e devolve
// só os campos conhecidos. Tudo que chega aqui é texto de fora: nada passa sem tipo, faixa e quantidade conferidos.
import { AMPS, BLOCKS, CABS, TYPES, blockInfo, type Block, type BlockState } from './nanocore.ts'
import type { Song, SongPart } from './songs.ts'

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

function text(v: unknown, field: string, max: number): string {
  if (typeof v !== 'string' || !v.trim()) throw new Error(`"${field}" precisa ser um texto.`)
  if (v.length > max) throw new Error(`"${field}" passa de ${max} caracteres.`)
  return v.trim()
}

function block(name: Block, v: unknown, where: string): BlockState {
  if (!isObject(v) || typeof v.on !== 'boolean') throw new Error(`${where}: "${name}" precisa de "on" true ou false.`)
  const types = TYPES[name]
  let type: number | undefined
  if (types) {
    if (!Number.isInteger(v.type) || (v.type as number) < 0 || (v.type as number) >= types.length) {
      throw new Error(`${where}: "${name}.type" precisa ser um número de 0 a ${types.length - 1}.`)
    }
    type = v.type as number
  }
  const expected = blockInfo(name, { on: true, type }).params
  const params = v.params ?? []
  if (!Array.isArray(params) || params.length !== expected.length) {
    throw new Error(
      `${where}: "${name}" precisa de ${expected.length} parâmetros (${expected.join(', ') || 'nenhum'}).`,
    )
  }
  if (!params.every(p => typeof p === 'number' && p >= 0 && p <= 1)) {
    throw new Error(`${where}: os parâmetros de "${name}" vão de 0 a 1.`)
  }
  return type === undefined ? { on: v.on, params: params as number[] } : { on: v.on, type, params: params as number[] }
}

function part(v: unknown, index: number): SongPart {
  const where = `Parte ${index + 1}`
  if (!isObject(v) || !isObject(v.tone) || !isObject(v.tone.blocks)) throw new Error(`${where}: falta "tone.blocks".`)
  const { amp, cab, blocks } = v.tone as { amp: unknown; cab: unknown; blocks: Record<string, unknown> }
  if (typeof amp !== 'string' || !(amp in AMPS))
    throw new Error(`${where}: amp "${amp}" não existe no pedal. Use um de: ${Object.keys(AMPS).join(', ')}.`)
  if (typeof cab !== 'string' || !(cab in CABS))
    throw new Error(`${where}: caixa "${cab}" não existe no pedal. Use uma de: ${Object.keys(CABS).join(', ')}.`)
  const unknown = Object.keys(blocks).filter(k => !BLOCKS.includes(k as Block))
  if (unknown.length) throw new Error(`${where}: bloco desconhecido: ${unknown.join(', ')}.`)
  const tone = { amp, cab, blocks: {} as Partial<Record<Block, BlockState>> }
  for (const name of BLOCKS) if (name in blocks) tone.blocks[name] = block(name, blocks[name], where)
  const fx2 = tone.blocks.fx2
  if (fx2?.on && (fx2.type ?? 0) >= 8 && tone.blocks.mod?.on) {
    throw new Error(`${where}: pitch e wah no drive usam os mesmos controles da modulação; desligue a modulação.`)
  }
  return { name: text(v.name, `${where}: name`, 30), hint: text(v.hint, `${where}: hint`, 300), tone }
}

export function parseSong(input: string): Song {
  // IA costuma cercar o JSON com ```json ... ``` ou com uma frase: vale o trecho entre a primeira { e a última }
  const start = input.indexOf('{')
  const end = input.lastIndexOf('}')
  let data: unknown
  try {
    data = JSON.parse(input.slice(start, end + 1))
  } catch {
    throw new Error('Não achei um JSON válido no texto colado.')
  }
  if (!isObject(data) || !Array.isArray(data.parts) || !data.parts.length || data.parts.length > 4) {
    throw new Error('O JSON precisa de "title", "artist" e de 1 a 4 "parts".')
  }
  return { title: text(data.title, 'title', 60), artist: text(data.artist, 'artist', 60), parts: data.parts.map(part) }
}

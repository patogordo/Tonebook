// O JSON colado vem de IA: o validador recusa o que o pedal não entende, e o prompt não pode divergir do código
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { parseSong } from '../shared/import.ts'
import { AMPS, CABS, TYPES, blockInfo, type Block } from '../shared/nanocore.ts'
import { SONGS } from '../shared/songs.ts'

const prompt = readFileSync(new URL('../shared/prompt-ia.md', import.meta.url), 'utf8')
const example = prompt.split('```json')[1]!.split('```')[0]!

test('o exemplo do prompt passa no validador e é o Seven Nation Army do site', () => {
  assert.deepEqual(parseSong(example), SONGS.find(s => s.title === 'Seven Nation Army'))
})

test('o prompt lista todos os tipos, parâmetros, amps e caixas do código', () => {
  for (const [block, types] of Object.entries(TYPES)) {
    types.forEach((t, i) => assert.ok(prompt.includes(`| ${i} | ${t.name} | ${t.params.join(', ') || 'nenhum'} |`), `${block} ${i} ${t.name}`))
  }
  for (const block of ['amp', 'cab'] as Block[]) {
    assert.ok(prompt.includes(`| ${block} | ${blockInfo(block, { on: true }).params.join(', ')} |`), block)
  }
  for (const name of [...Object.keys(AMPS), ...Object.keys(CABS)]) assert.ok(prompt.includes(`\`${name}\``), name)
})

test('aceita o JSON cercado por texto ou por bloco de código', () => {
  assert.equal(parseSong(`Aqui está:\n\`\`\`json\n${example}\n\`\`\`\nBom som!`).title, 'Seven Nation Army')
})

test('recusa o que o pedal não entende', () => {
  const song = JSON.parse(example)
  const broken = (change: () => void, message: RegExp) => {
    const before = JSON.stringify(song)
    change()
    assert.throws(() => parseSong(JSON.stringify(song)), message)
    Object.assign(song, JSON.parse(before))
  }
  broken(() => (song.parts[0].tone.amp = 'Marshall'), /amp "Marshall" não existe/)
  broken(() => (song.parts[0].tone.cab = 'X'), /caixa "X" não existe/)
  broken(() => song.parts[0].tone.blocks.fx2.params.pop(), /"fx2" precisa de 3 parâmetros/)
  broken(() => (song.parts[0].tone.blocks.amp.params[0] = 1.5), /vão de 0 a 1/)
  broken(() => (song.parts[0].tone.blocks.reverb.type = 7), /"reverb.type" precisa ser um número de 0 a 6/)
  broken(() => (song.parts[0].tone.blocks.wah = { on: true }), /bloco desconhecido: wah/)
  broken(() => {
    song.parts[0].tone.blocks.fx2 = { on: true, type: 8, params: [0, 0.5, 1, 0.8] }
    song.parts[0].tone.blocks.mod = { on: true, type: 0, params: [0.3, 0.3, 0.8] }
  }, /desligue a modulação/)
  broken(() => (song.parts = []), /de 1 a 4 "parts"/)
  assert.throws(() => parseSong('não é json'), /Não achei um JSON válido/)
})

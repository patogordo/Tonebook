// node --test (Node 22.18+ roda TypeScript direto)
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { BLOCKS, blockInfo, toneMessages, type Tone } from '../shared/nanocore.ts'
import { SONGS } from '../shared/songs.ts'

const fuzz: Tone = { amp: 'VXAC30', cab: 'AC30212', blocks: {
  fx1: { on: true, type: 0, params: [0.45] },
  fx2: { on: true, type: 4, params: [0.38, 0.55, 0.6] },
} }

test('troca para o preset pedido antes de tudo', () => {
  assert.deepEqual(toneMessages(fuzz, 64)[0], [0xc0, 63])
})

test('tipo vem antes dos parâmetros, e os CCs batem com o guia', () => {
  const msgs = toneMessages(fuzz, 64).map(m => m.join(','))
  const at = (m: number[]) => msgs.indexOf(m.join(','))
  assert.ok(at([0xb0, 41, 4]) > 0 && at([0xb0, 41, 4]) < at([0xb0, 57, 48])) // Muff, depois ganho 0,38
  assert.ok(at([0xb0, 50, 57]) > 0) // limiar do gate
  assert.ok(at([0xb0, 26, 0]) > 0) // delay que não está no timbre sai desligado
  assert.ok(at([0xb0, 21, 127]) > 0) // drive ligado
})

test('compressor, pitch e EQ de 8 bandas usam os CCs próprios', () => {
  const msgs = toneMessages({ amp: '', cab: '', blocks: {
    fx1: { on: true, type: 3, params: [1] },
    fx2: { on: true, type: 8, params: [0, 0.5, 1] },
    eq: { on: true, type: 2, params: [0, 0, 0, 0, 0, 0, 0, 1] },
  } }, 1).map(m => m.join(','))
  assert.ok(msgs.includes('176,51,127'))
  assert.ok(msgs.includes('176,70,127')) // mix do pitch vai nos CCs da modulação
  assert.ok(msgs.includes('176,33,127'))
})

test('todo timbre tem tipos e parâmetros que existem e valores entre 0 e 1', () => {
  for (const song of SONGS) for (const part of song.parts) for (const block of BLOCKS) {
    const state = part.tone.blocks[block]
    if (!state) continue
    const info = blockInfo(block, state)
    assert.notEqual(info.name, '?', `${song.title} ${part.name} ${block}`)
    assert.equal(state.params?.length ?? 0, info.params.length, `${song.title} ${part.name} ${block}`)
    assert.ok(state.params?.every(v => v >= 0 && v <= 1) ?? true)
  }
})

// node --test (Node 22.18+ roda TypeScript direto)
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  BLOCKS,
  NOTICE_ACTIVE_PRESET,
  blockInfo,
  pack7,
  parseSysex,
  presetName,
  renameMessage,
  saveMessage,
  selectMessage,
  toneMessages,
  unpack7,
  type Tone,
} from '../shared/nanocore.ts'
import { SONGS } from '../shared/songs.ts'

const fuzz: Tone = {
  amp: 'VXAC30',
  cab: 'AC30212',
  blocks: {
    fx1: { on: true, type: 0, params: [0.45] },
    fx2: { on: true, type: 4, params: [0.38, 0.55, 0.6] },
  },
}

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
  const msgs = toneMessages(
    {
      amp: '',
      cab: '',
      blocks: {
        fx1: { on: true, type: 3, params: [1] },
        fx2: { on: true, type: 8, params: [0, 0.5, 1] },
        eq: { on: true, type: 2, params: [0, 0, 0, 0, 0, 0, 0, 1] },
      },
    },
    1,
  ).map(m => m.join(','))
  assert.ok(msgs.includes('176,51,127'))
  assert.ok(msgs.includes('176,70,127')) // mix do pitch vai nos CCs da modulação
  assert.ok(msgs.includes('176,33,127'))
})

test('todo timbre tem tipos e parâmetros que existem e valores entre 0 e 1', () => {
  for (const song of SONGS)
    for (const part of song.parts)
      for (const block of BLOCKS) {
        const state = part.tone.blocks[block]
        if (!state) continue
        const info = blockInfo(block, state)
        assert.notEqual(info.name, '?', `${song.title} ${part.name} ${block}`)
        assert.equal(state.params?.length ?? 0, info.params.length, `${song.title} ${part.name} ${block}`)
        assert.ok(state.params?.every(v => v >= 0 && v <= 1) ?? true)
      }
})

test('empacota em 7 bits igual ao pedal (resposta de batimento capturada do NanoCore)', () => {
  // F0 7D 4E 43 71 02 02 10 12 68 00 00 04 08 00 02 01 08 13 F7: seq 0x1290, comando 0x68, status 0, 4 bytes
  const raw = [0x02, 0x90, 0x12, 0x68, 0x00, 0x00, 0x04, 0x00, 0x02, 0x01, 0x88, 0x13]
  assert.deepEqual(pack7(raw), [0x02, 0x02, 0x10, 0x12, 0x68, 0x00, 0x00, 0x04, 0x08, 0x00, 0x02, 0x01, 0x08, 0x13])
})

test('renomear manda o comando 0x6d, subcomando 0x08, com o nome limpo', () => {
  const msg = renameMessage('Ação!', 1)
  assert.deepEqual(msg.slice(0, 5), [0xf0, 0x7d, 0x4e, 0x43, 0x70])
  assert.equal(msg.at(-1), 0xf7)
  // [02][seq 1][0x6d][tamanho 7][08 05 "Acao!"], em grupos de 7
  assert.deepEqual(
    msg.slice(5, -1),
    pack7([0x02, 1, 0, 0x6d, 0, 7, 0, 0x08, 5, ...[...'Acao!'].map(c => c.charCodeAt(0))]),
  )
  assert.equal(presetName('Seven Nation Army'), 'Seven Na')
})

test('lê as respostas e os avisos do pedal (mensagens capturadas)', () => {
  // resposta ao "salvar" do app: comando 0x46, status 0, preset 53 (slot 0x34)
  const save = [0xf0, 0x7d, 0x4e, 0x43, 0x71, 0x02, 0x02, 0x0b, 0x28, 0x46, 0x00, 0x00, 0x01, 0x00, 0x00, 0x34, 0xf7]
  assert.deepEqual(parseSysex(save), { kind: 'response', seq: 0x288b, command: 0x46, status: 0, data: [0x34] })
  // aviso de preset ativo: 0x60, preset 52 (slot 0x33)
  const active = [0xf0, 0x7d, 0x4e, 0x43, 0x72, 0x00, 0x02, 0x60, 0x00, 0x01, 0x00, 0x33, 0xf7]
  assert.deepEqual(parseSysex(active), {
    kind: 'notice',
    seq: 0,
    command: NOTICE_ACTIVE_PRESET,
    status: 0,
    data: [0x33],
  })
  assert.equal(parseSysex([0xb0, 20, 127]), null)
})

test('salvar manda o comando 0x46 com o preset, e o empacotamento ida e volta não perde nada', () => {
  const msg = saveMessage(53, 7)
  assert.deepEqual(unpack7(msg.slice(5, -1)), [0x02, 7, 0, 0x46, 0, 1, 0, 0x34])
  const bytes = Array.from({ length: 300 }, (_, i) => (i * 37) & 0xff)
  assert.deepEqual(unpack7(pack7(bytes)), bytes)
})

test('selecionar manda o comando 0x6d, subcomando 0x09, com o preset (como o app)', () => {
  assert.deepEqual(unpack7(selectMessage(64, 9).slice(5, -1)), [0x02, 9, 0, 0x6d, 0, 2, 0, 0x09, 0x3f])
})

// Timbres de músicas conhecidas, pensados para uma Les Paul com humbuckers. São pontos de partida: ajuste no ouvido.
import type { Tone } from './nanocore'

export interface SongPart {
  name: string
  hint: string
  tone: Tone
}

export interface Song {
  title: string
  artist: string
  parts: SongPart[]
}

export const SONGS: Song[] = [
  {
    title: 'Let It Happen',
    artist: 'Tame Impala',
    parts: [
      {
        // O que as fontes repetem: Strat limpa num AC30, Dyna Comp apertado, phaser (Phase 90 / Small Stone) e delay
        // analógico (Memory Man). Nada de fuzz. O EQ tira o embolado do humbucker para chegar perto do single-coil.
        // Compressor (manual): limiar −60..0 dB, ratio 1,1..20:1, knee 0..24 dB, ataque 0..200 ms,
        // release 0..1000 ms, ganho −24..+24 dB → −30 dB, ~8:1, 6 dB, 5 ms, 200 ms, +9 dB.
        // Delay BBD: 1..2000 ms → ~360 ms (colcheia pontuada a ~125 bpm).
        name: 'Guitarra',
        hint: 'Chave no meio (os dois microfones), tone aberto. Compressão forte, phaser lento e eco analógico curto num AC30 limpo.',
        tone: {
          amp: 'VXAC30',
          cab: 'AC30212',
          blocks: {
            fx1: { on: true, type: 3, params: [0.5, 0.365, 0.25, 0.025, 0.2, 0.69] },
            amp: { on: true, params: [0.3, 0.3, 0.5, 0.65, 0.8] },
            cab: { on: true, params: [0.6, 0.75, 0.8] },
            mod: { on: true, type: 1, params: [0.15, 0.35, 0.5, 0.8] },
            delay: { on: true, type: 0, params: [0.18, 0.3, 0.4, 0.22, 0.8] },
            reverb: { on: true, type: 1, params: [0.25, 0.15, 0.6, 0.25, 0.15, 1] },
            eq: { on: true, type: 1, params: [0.45, 0.4, 0.43, 0.5, 0.57, 0.6] },
          },
        },
      },
    ],
  },
  {
    title: 'Creep',
    artist: 'Radiohead',
    parts: [
      {
        name: 'Estrofe',
        hint: 'Microfone do braço. Fender limpo, chorus leve e sala pequena.',
        tone: {
          amp: 'Fd65Dk',
          cab: 'FdTR212',
          blocks: {
            amp: { on: true, params: [0.5, 0.4, 0.55, 0.7, 0.8] },
            cab: { on: true, params: [0.5, 0.7, 0.8] },
            mod: { on: true, type: 0, params: [0.3, 0.4, 0.8] },
            reverb: { on: true, type: 0, params: [0.15, 0.1, 0.6, 0.1, 0.2, 1] },
          },
        },
      },
      {
        name: 'Refrão',
        hint: 'Microfone da ponte. Distorção num AC30 e gate para o "chunk" cortar seco.',
        tone: {
          amp: 'VXAC30',
          cab: 'AC30212',
          blocks: {
            fx1: { on: true, type: 0, params: [0.4] },
            fx2: { on: true, type: 2, params: [0.75, 0.55, 0.65] },
            amp: { on: true, params: [0.65, 0.45, 0.6, 0.65, 0.75] },
            cab: { on: true, params: [0.55, 0.65, 0.8] },
            reverb: { on: true, type: 0, params: [0.1, 0.07, 0.6, 0, 0.15, 1] },
          },
        },
      },
    ],
  },
  {
    title: 'No Surprises',
    artist: 'Radiohead',
    parts: [
      {
        name: 'Arpejo',
        hint: 'Microfone do braço com o tone da guitarra um pouco fechado. Fender limpo, compressão leve, chorus lento e plate.',
        tone: {
          amp: 'Fd65Dk',
          cab: 'FdTR212',
          blocks: {
            fx1: { on: true, type: 3, params: [0.5, 0.15, 0.3, 0.1, 0.3, 0.6] },
            amp: { on: true, params: [0.45, 0.35, 0.5, 0.75, 0.8] },
            cab: { on: true, params: [0.55, 0.8, 0.8] },
            mod: { on: true, type: 0, params: [0.2, 0.3, 0.8] },
            reverb: { on: true, type: 1, params: [0.35, 0.15, 0.6, 0.3, 0.22, 1] },
          },
        },
      },
    ],
  },
  {
    // Não há equipamento documentado da gravação: o ponto de partida segue o que se ouve (riff seco e médio na
    // frente, solo com mais sustentação e ambiente).
    title: 'Jane!',
    artist: 'The Long Faces',
    parts: [
      {
        name: 'Riff',
        hint: 'Microfone da ponte. TS9 empurrando um Marshall com pouco ganho: seco, médio na frente, gate para cortar firme.',
        tone: {
          amp: 'MarDSL1',
          cab: 'Mar412A',
          blocks: {
            fx1: { on: true, type: 0, params: [0.4] },
            fx2: { on: true, type: 0, params: [0.35, 0.55, 0.7] },
            amp: { on: true, params: [0.55, 0.45, 0.65, 0.6, 0.75] },
            cab: { on: true, params: [0.6, 0.65, 0.8] },
            reverb: { on: true, type: 0, params: [0.15, 0.08, 0.6, 0.05, 0.12, 1] },
          },
        },
      },
      {
        name: 'Solo',
        hint: 'Microfone da ponte. Klone no Marshall com mais ganho, delay curto e plate para sustentar.',
        tone: {
          amp: 'MarDSL2',
          cab: 'Mar412A',
          blocks: {
            fx1: { on: true, type: 0, params: [0.35] },
            fx2: { on: true, type: 1, params: [0.45, 0.6, 0.75] },
            amp: { on: true, params: [0.65, 0.45, 0.65, 0.6, 0.8] },
            cab: { on: true, params: [0.55, 0.7, 0.8] },
            delay: { on: true, type: 1, params: [0.35, 0.3, 0.2, 1] },
            reverb: { on: true, type: 1, params: [0.35, 0.15, 0.6, 0.25, 0.2, 1] },
          },
        },
      },
    ],
  },
  {
    title: 'Come As You Are',
    artist: 'Nirvana',
    parts: [
      {
        name: 'Riff',
        hint: 'Microfone da ponte, afinação um tom abaixo como na gravação. Limpo com chorus fundo, o "aquático" do Small Clone.',
        tone: {
          amp: 'Fd65Dk',
          cab: 'FdTR212',
          blocks: {
            amp: { on: true, params: [0.4, 0.45, 0.5, 0.65, 0.8] },
            cab: { on: true, params: [0.5, 0.75, 0.8] },
            mod: { on: true, type: 0, params: [0.35, 0.75, 0.8] },
            reverb: { on: true, type: 0, params: [0.15, 0.08, 0.6, 0.1, 0.12, 1] },
          },
        },
      },
      {
        name: 'Refrão e solo',
        hint: 'Microfone da ponte. Distorção Boss DS num Fender Bassman, com o chorus mais leve por baixo.',
        tone: {
          amp: 'Fd59Bm',
          cab: 'Fd59BM410',
          blocks: {
            fx1: { on: true, type: 0, params: [0.4] },
            fx2: { on: true, type: 3, params: [0.6, 0.5, 0.7] },
            amp: { on: true, params: [0.45, 0.5, 0.5, 0.6, 0.75] },
            cab: { on: true, params: [0.55, 0.65, 0.8] },
            mod: { on: true, type: 0, params: [0.35, 0.55, 0.8] },
            reverb: { on: true, type: 0, params: [0.12, 0.07, 0.6, 0, 0.12, 1] },
          },
        },
      },
    ],
  },
  {
    title: 'Seven Nation Army',
    artist: 'The White Stripes',
    parts: [
      {
        // Um timbre só, que responde à mão: o Muff com pouco ganho comprime menos e deixa a diferença entre o abafado
        // e o aberto; o gate fica baixo para não cortar as notas abafadas, que chegam mais fracas
        name: 'Riff e refrão',
        hint: 'Microfone da ponte. Riff com palm muting: fica fechado e grave. Solte a mão no refrão e o fuzz abre, sem trocar de preset.',
        tone: {
          amp: 'Fd59Bm',
          cab: 'Fd59BM410',
          blocks: {
            fx1: { on: true, type: 0, params: [0.3] },
            fx2: { on: true, type: 4, params: [0.5, 0.45, 0.65] },
            amp: { on: true, params: [0.5, 0.55, 0.6, 0.55, 0.8] },
            cab: { on: true, params: [0.35, 0.6, 0.8] },
            reverb: { on: true, type: 0, params: [0.12, 0.05, 0.6, 0, 0.1, 1] },
          },
        },
      },
    ],
  },
]

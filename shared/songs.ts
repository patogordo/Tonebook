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
        name: 'Limpo',
        hint: 'Microfone do braço. Compressão, phaser lento e um eco discreto.',
        tone: {
          amp: 'Fd65Dk',
          cab: 'FdTR212',
          blocks: {
            fx1: { on: true, type: 3, params: [0.62, 0, 0.18, 0.07, 0.13, 0.62] },
            amp: { on: true, params: [0.4, 0.28, 0.55, 0.82, 0.8] },
            cab: { on: true, params: [0.65, 0.82, 0.8] },
            mod: { on: true, type: 1, params: [0.1, 0.3, 0.5, 0.8] },
            delay: { on: true, type: 1, params: [0.3, 0.2, 0.15, 1] },
            reverb: { on: true, type: 1, params: [0.3, 0.22, 0.7, 0.28, 0.2, 1] },
          },
        },
      },
      {
        name: 'Fuzz',
        hint: 'Big Muff num AC30 quase limpo, phaser e gate para não chiar parado.',
        tone: {
          amp: 'VXAC30',
          cab: 'AC30212',
          blocks: {
            fx1: { on: true, type: 0, params: [0.45] },
            fx2: { on: true, type: 4, params: [0.38, 0.55, 0.6] },
            amp: { on: true, params: [0.3, 0.38, 0.62, 0.52, 0.8] },
            cab: { on: true, params: [0.56, 0.65, 0.8] },
            mod: { on: true, type: 1, params: [0.15, 0.3, 0.5, 0.8] },
            reverb: { on: true, type: 1, params: [0.25, 0.2, 0.7, 0.25, 0.18, 1] },
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
]

# AGENTS.md

Guia para agentes de código (e pessoas) neste repositório. O que o site faz está no `README.md`; o que se sabe da
pedaleira, em `docs/protocolo.md`; como os timbres são pensados e medidos, em `docs/timbres.md`.

## O projeto

Tonebook leva um preset da pedaleira LIVTRA NanoCore ao timbre de uma música, direto do navegador.

- **Nuxt 4 como SPA** (`ssr: false`), TypeScript estrito, sem servidor: o build é estático (`pnpm generate`) e roda
  no GitHub Pages.
- **Web MIDI** para falar com o pedal (CC e Program Change do guia oficial; SysEx do app oficial só para o nome).
- **MediaRecorder**, `getDisplayMedia` e `getUserMedia` para gravar vídeo da aba com a câmera e o som do pedal.
- **pnpm** e Node 22.18 ou mais novo (os testes rodam TypeScript direto com `node --test`).

## Comandos

```bash
pnpm install
pnpm dev                 # http://localhost:3300
pnpm test                # node --test tests/*.test.ts
pnpm typecheck           # vue-tsc
pnpm format              # Prettier (o CI roda pnpm format:check; Markdown fica de fora)
pnpm generate            # site estático em .output/public
NUXT_APP_BASE_URL=/Tonebook/ pnpm generate   # como o GitHub Pages publica (.github/workflows/pages.yml)
swiftc -O tools/midi.swift -o tools/midi     # sonda de MIDI (macOS), veja docs/protocolo.md
```

Antes de entregar: `pnpm format`, `pnpm typecheck`, `pnpm test` e, se mexeu no que vai para o pedal, um teste com o pedal ligado
(abaixo).

## Onde fica cada coisa

| Caminho | Conteúdo |
| --- | --- |
| `shared/nanocore.ts` | Mapa de CCs do guia oficial, tipos e parâmetros de cada bloco (`TYPES`), modelos de amp e caixa (`AMPS`, `CABS`), tradução de um timbre em mensagens (`toneMessages`) e o SysEx do nome (`pack7`, `sysex`, `renameMessage`) |
| `shared/songs.ts` | As músicas que vêm com o site |
| `shared/import.ts` | Validador do JSON colado (`parseSong`) |
| `shared/prompt-ia.md` | Instruções para uma IA gerar o JSON de uma música; o site copia este arquivo |
| `app/app.vue` | A página: conexão, músicas, editor ao vivo, nome do preset, música por IA, músicas salvas |
| `app/components/RecorderCard.vue` | Gravação de vídeo (aba, câmera, som do pedal e microfone) |
| `tests/` | Mapa de CCs, empacotamento do SysEx contra uma mensagem real do pedal, validador e sincronia do prompt |
| `tools/midi.swift`, `tools/decode.py` | Sonda de MIDI e decodificador do SysEx, para investigar o pedal |
| `docs/` | Protocolo do pedal, timbres, como rodar local, deploy e as capturas de tela do README |
| `public/` | Logo e ícones |

O que está em `shared/` é importado com `#shared/...` no app e com o caminho relativo e a extensão `.ts` entre os
arquivos de `shared/` (assim o Node roda os testes sem build).

## Invariantes (não quebre)

- **Gravar na memória do pedal só com clique em "Salvar no pedal"**, com confirmação, e só no preset ativo que recebeu
  o timbre (`pedalOnCurrent`: o pedal avisa a troca de preset com `0x60`, e o site recusa se não for o mesmo). O
  `0x46` nunca vai com outro número que não o do preset ativo. Nada de sessão de escrita (`0x21` a `0x24`) ou de
  firmware.
- **SysEx só com o que o app oficial manda**, com dados no mesmo formato e conferido no pedal (status 0 na resposta).
  Hoje são três: renomear (`0x6d 08`), salvar (`0x46`) e, nos testes, selecionar (`0x6d 09`). Comando novo segue o roteiro de
  `docs/protocolo.md` e entra com a mensagem capturada num teste. Nunca teste comando desconhecido no pedal.
- **Tudo que vem de fora passa pelo `parseSong`**: o JSON colado e o que está salvo no navegador. Campo novo no
  formato entra no validador, no `prompt-ia.md` e nos testes juntos.
- **`prompt-ia.md` acompanha o código.** O teste confere que ele lista todos os tipos, parâmetros, amps e caixas, e
  que o exemplo passa no validador. Mudou `TYPES`, `AMPS` ou `CABS`? Mude o prompt (as listas de amp e caixa seguem o
  formato `` - `Nome`: descrição ``).
- **Tipos com os IDs do guia de MIDI** e parâmetros na ordem dele, de 0 a 1. No reverb o MIDI e o arquivo de backup
  numeram diferente; o código usa o MIDI.
- **Tipo antes dos parâmetros** e 150 ms depois do Program Change antes dos CCs (o pedal sobrescreve o que chega
  enquanto carrega o preset).
- **Nada de dado pessoal** em código, commits, exemplos ou testes.
- **Teste no pedal só nos presets combinados com quem é dono do pedal**; os outros guardam os timbres da pessoa.

## Timbres

- Música nova em `shared/songs.ts`, com um comentário dizendo o que é documentado e o que é estimativa, e o `hint` com
  microfone e técnica. `pnpm test` confere tipos, quantidade e faixa dos parâmetros.
- Siga `docs/timbres.md`: um timbre só quando a diferença vem da mão, compressor que devolve o volume, nada de efeito
  que a gravação não tem.
- Para conferir no pedal: mande o timbre (pelo site ou montando as mensagens com `toneMessages`), grave a saída com
  `ffmpeg` e meça, como em `docs/timbres.md`.

## Testando no navegador

- O Web MIDI só existe em navegadores Chromium (Chrome, Edge, Brave), no computador e no Android. O nome do preset
  pede a permissão de SysEx ("controlar e reprogramar dispositivos MIDI").
- Automatizando com Playwright: `context.grantPermissions(['midi', 'midi-sysex'], { origin })` funciona no Chromium.
  No Brave, a permissão por DevTools Protocol é ignorada.
- A captura da aba (`getDisplayMedia`) precisa que a pessoa escolha a aba; no macOS, o processo que abre o navegador
  também precisa de permissão de gravação de tela, e a câmera fica preta sem a permissão de câmera do sistema. Nos
  testes automáticos, troque `getDisplayMedia` por um canvas (`addInitScript`) e teste o resto de verdade.

## Convenções

- Comentários, documentação, textos da interface e commits em **português, com acentuação correta**; identificadores
  em inglês. Os arquivos abrem com um comentário curto explicando o porquê.
- Commits no formato `Área: o que mudou` (ex.: `Músicas: …`, `Nome do preset: …`, `Gravação: …`).
- Tema escuro único, com os tokens de `app/app.vue` (`--bg`, `--surface`, `--line`, `--text`, `--muted`, `--brand`,
  `--ok`, `--danger`). Pense no celular: o site conecta pelo Chrome do Android com cabo OTG; a gravação de vídeo é só
  no computador.
- Mudou um comportamento visível? Atualize o `README.md`.

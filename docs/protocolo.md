# O NanoCore por dentro

Tudo o que o Tonebook sabe sobre a pedaleira LIVTRA NanoCore: o que vem do guia oficial de MIDI e o que foi
observado no aparelho. **Nada aqui é oficial** e a parte observada pode mudar com uma atualização de firmware. As
observações são de novembro de 2026, num NanoCore ligado por USB a um Mac, com o app ToneCommand 1.3.3.

## O aparelho no USB

- Aparece como **Nanocore** (USB `33c3:1301`), com duas funções:
  - **placa de som**: 2 entradas e 2 saídas, 44,1 kHz. A entrada é o som já processado, o que sai do pedal;
  - **MIDI**: uma porta "Nanocore" de entrada e de saída. Por Bluetooth, o mesmo MIDI aparece como "Nanocore Midi".
- O **loopback** (menu de ajustes do pedal) mistura o áudio que vem do computador com a guitarra e devolve pelo USB. O
  áudio do computador **não passa pelos efeitos**, então não dá para fazer reamp.
- Para gravar a saída do pedal no macOS: `ffmpeg -f avfoundation -i ":0" -t 30 saida.wav` (o `:0` é o índice da
  entrada; a lista sai com `ffmpeg -f avfoundation -list_devices true -i ""`).

## MIDI oficial

Fonte: [NanoCore MIDI Control User Guide](https://openparcelbox.com/manuals/NANOCORE-MIDI-Control-User-Guide.pdf)
(firmware 1.04 ou mais novo). O canal 0 do pedal é omni, o padrão.

| Função | Mensagem |
| --- | --- |
| Liga e desliga (0 desliga, 127 liga) | FX1 `CC20`, FX2 `CC21`, amp `CC23`, caixa `CC24`, modulação `CC25`, delay `CC26`, reverb `CC27`, EQ `CC28` |
| Tipo (o ID exato da tabela) | FX1 `CC40`, FX2 `CC41`, modulação `CC45`, delay `CC46`, reverb `CC47`, EQ `CC48` |
| Parâmetros de FX1 | gate `CC50`; compressor `CC51` a `CC56`; no Gate + Compressor, `CC50` a `CC56` em sequência |
| Parâmetros de FX2 | drives e boosts `CC57` a `CC59`; pitch e wahs (tipos 8 a 10) `CC68` a `CC73` |
| Amp | `CC60` a `CC64` (ganho, graves, médios, agudos, volume) |
| Caixa | `CC65` a `CC67` (corte de graves, corte de agudos, volume) |
| Modulação | `CC68` a `CC73` |
| Delay | `CC74` a `CC79` |
| Reverb | `CC85` a `CC90` |
| EQ | `CC91` a `CC97` e `CC33` (oitava banda do EQ de 8) |
| Preset | Program Change `0` a `63` (a tela mostra 1 a 64); `CC81` anterior, `CC82` próximo |
| Afinador | `CC80` 127 abre, 0 fecha |

Os tipos e a ordem dos parâmetros estão em `shared/nanocore.ts` (`TYPES`) e, com as faixas reais, em
`shared/prompt-ia.md`. O valor do CC é linear: 0 é o mínimo do parâmetro, 127 o máximo.

O que se aprendeu usando:

- **CC68 a CC73 são compartilhados**: com o FX2 em pitch ou wah, eles mexem no FX2 e a modulação fica sem controle.
- **O reverb tem duas numerações.** No MIDI: 0 Room, 1 Plate, 2 Hall, 3 Concert, 4 Shimmer, 5 Cloud, 6 Spring. No
  arquivo de backup e no manual: 4 Spring, 5 Shimmer, 6 Cloud.
- **Fora do MIDI**: modelo de amp, IR da caixa, ordem da cadeia, volume do preset e nome. O nome vai pelo SysEx abaixo.
- **Program Change para um preset vazio** carrega um preset padrão chamado "preset", com volume 100 (os de fábrica
  ficam por volta de 85).
- **O pedal leva alguns milissegundos** para carregar um preset. CC enviado logo depois do Program Change pode ser
  sobrescrito; o site espera 150 ms.
- **CC e Program Change não salvam nada.** As mudanças valem até trocar de preset. Para gravar, o site usa o comando de
  salvar do app oficial (`0x46`, abaixo): testado, o preset voltou com o timbre e o nome depois de trocar e voltar.
- **Trocar de preset descarta o que não foi salvo**, venha a troca do pedal, do Program Change ou do app (tocar num
  preset na lista do ToneCommand recarrega o preset da memória).
- No próprio pedal, salvar não é só segurar o MASTER: na tela principal, segurar o MASTER faz o número piscar; depois
  é girar o SELECTOR até o preset, apertar, escolher REPLACE e apertar de novo (manual, "Preset Save Operation"). Não
  foi testado se esse caminho grava o que veio pelo MIDI.

### Faixas que pegam de surpresa

- Faixas simétricas têm o neutro em **0,5**: graves, médios, agudos e volume do amp (−10 a +10 dB), bandas do EQ
  (−15 a +15 dB) e a realimentação do phaser e do flanger (−95 a +95).
- No compressor, ratio 0 é **1,1:1**, quase nada de compressão. Vários presets de fábrica usam ratio perto de 0.
- O manual dá o Pitch de −12 a +12 semitons; as notas do firmware 1.12 falam em ±24. O mesmo valor muda de nota
  conforme o firmware.

## SysEx do ToneCommand (não documentado)

O app oficial fala com o pedal por SysEx próprio. O formato foi decifrado assim: o CoreMIDI entrega o que o pedal
manda a **todo** programa conectado à porta, então as respostas aos pedidos do app aparecem para qualquer um que
esteja ouvindo (`tools/midi listen`). O empacotamento em 7 bits foi conferido contra mensagens reais do pedal (teste
em `tests/nanocore.test.ts`).

### Quadro

```
F0 7D 4E 43 <tipo> <dados empacotados> F7
```

- `7D` é o ID de fabricante para uso não comercial; `4E 43` é "NC".
- `<tipo>`: `70` pedido, `71` resposta, `72` aviso (o pedal manda sozinho).
- **Empacotamento**: os dados vão em grupos de até 7 bytes. Cada grupo começa com um byte que guarda os bits altos
  (o bit *i* é o bit 7 do *i*-ésimo byte do grupo), seguido dos 7 bytes com só os 7 bits baixos.

Depois de desempacotar (números little-endian):

| Tipo | Conteúdo |
| --- | --- |
| Pedido `70` | `[02][seq u16][comando u16][tamanho u16][dados]` |
| Resposta `71` | `[02][seq u16][comando u16][status u8][tamanho u16][dados]` (status 0 = aceito) |
| Aviso `72` | `[02][comando u16][tamanho u16][dados]` |

O `seq` é um contador de quem pede; a resposta repete o `seq` e o comando.

### Comandos vistos

| Comando | O que faz | Dados | Situação |
| --- | --- | --- | --- |
| `0x68` | Batimento: o app manda a cada 3 s | resposta `02 01 88 13` (0x1388 = 5000, provavelmente o prazo em ms) | observado |
| `0x6d` sub `0x08` | **Renomeia o preset ativo** | `08 <tamanho> <ASCII>` | **usado pelo site**, testado no pedal |
| `0x6d` sub `0x09` | Seleciona o preset | `09 <slot 0–63>` | testado no pedal |
| `0x46` | **Salva o preset ativo na memória** | `<slot 0–63>` do preset ativo | **usado pelo site**, testado no pedal (é o botão de salvar do app) |
| `0x6d` sub `0x00` | O app manda ao começar a editar | resposta `00 04 ff 03 08` | observado, sentido desconhecido |
| `0x41` | Lê o registro de um preset | resposta `[slot][início u16][total u16][trecho]`, em trechos de até 200 bytes; o registro começa com `01 02 07 00 02 10` e o nome num campo de 16 bytes | observado; o formato do pedido não apareceu |
| `0x63` | Retrato do preset ativo | resposta começa com `03 <slot> <volume>` e segue com floats | observado |
| `0x30`, `0x50` | O app lê ao trocar de preset | respostas de 20 bytes | sentido desconhecido |
| `0x21` a `0x24` | Sessão de escrita (início, dados, confirmação com CRC, fim) para mandar arquivos de amp e IR | | **não use** |
| `0x3a`, `0x5b` | Existem no app | | sentido desconhecido |

| Aviso | Dados |
| --- | --- |
| `0x60` | preset ativo: `<slot>` |
| `0x62` | parâmetro mudou: `<effectId> <índice> <float32>` (o `effectId` é o do arquivo de backup, abaixo) |
| `0x69` | volume do preset: `<0–100>` |

O pedal **só avisa o que muda**: trocar entre dois presets com o mesmo volume não gera `0x69`.

### Regra de segurança

Só mande ao pedal um comando que o app oficial também manda, com dados no mesmo formato. O `0x46` só com o número do
preset ativo, como o app faz: o que o pedal faz com outro número não se sabe. O app também atualiza
firmware e grava arquivos na memória do pedal; um comando desconhecido pode apagar presets ou travar o aparelho. Para
descobrir um comando novo:

1. `swiftc -O tools/midi.swift -o tools/midi` e `tools/midi listen 300 > log.txt`;
2. faça a operação **uma vez** no ToneCommand;
3. `python3 tools/decode.py log.txt` e procure a resposta com o comando e os dados;
4. reproduza com `tools/midi send …`, confira o status 0 e só então leve para o site, com a mensagem capturada num
   teste.

Atenção: o app renomeia o **preset ativo**, e ao abrir a edição ele pode trocar o preset ativo sozinho (na captura que
revelou o `0x6d 08`, ele selecionou o preset 41 antes de renomear).

## Arquivo de backup do ToneCommand (`.npreset`)

O backup é um ZIP:

- `manifest.json` (`schema: "nanocore.preset.bundle"`, `version: 1`), com `presets`, `ampSlots` e `irSlots`;
- `amp/slot_XX.ead`: os modelos de amp carregados (12242 bytes cada);
- `ir/slot_XX.bin`: as IRs (float32 little-endian, 1024 amostras).

Cada preset traz `slot` (0–63), `name` e `preset` com:

- `ampSlot`, `irSlot` (255 = sem IR), `presetVolume` (0–100), `fx2Slot` (30 + tipo do drive; 255 com pitch ou wah);
- `slots`: os 8 blocos sempre nesta ordem, com o `effectId` de cada um:

  | Posição | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
  | --- | --- | --- | --- | --- | --- | --- | --- | --- |
  | Bloco | FX1 | FX2 | amp | caixa | delay | modulação | reverb | EQ |
  | `effectId` | 7 | 8 | 1 | 2 | 5 | 4 | 3 | 6 |

  Cada bloco: `enabled`, `variant` (o tipo; mesma ordem do MIDI, menos o reverb, como dito acima), `params` (0 a 1) e
  `tempoSync`. No arquivo, a lista de parâmetros às vezes não traz o último, o volume que o MIDI tem;
- `chainOrder`: a ordem da cadeia, com as posições de `slots` (padrão `[0,1,2,3,4,5,6,7]`, delay antes da modulação).

Um backup editado à mão (presets novos acrescentados ao `manifest.json`, o resto do ZIP igual) é importado pelo app
sem problema.

# NanoCore Tones

Site que leva um preset do LIVTRA NanoCore ao timbre de músicas conhecidas, pelo USB MIDI do próprio pedal.
Por enquanto: **Let It Happen** (Tame Impala), **Creep** (Radiohead), estrofe e refrão, **No Surprises** (Radiohead), o arpejo limpo, **Jane!** (The Long Faces), riff e solo, **Come As You Are** (Nirvana), riff limpo e refrão com o solo, **Seven Nation Army** (The White Stripes), um timbre só: palm muting no riff e a mão solta no refrão, **Pluto Projector** (Rex Orange County) **Impostor Syndrome** (Sidney Gish) e **At Doom's Gate** (E1M1, do Doom de 1993).

## Como usar

```bash
pnpm install
pnpm dev          # http://localhost:3300
```

1. Ligue o NanoCore no USB e abra o site no Chrome, no Edge ou no Brave (computador ou Android). Safari e iPhone
   não têm Web MIDI.
2. **Conectar ao NanoCore** e permita o acesso ao MIDI quando o navegador pedir (inclusive "controlar e reprogramar
   dispositivos MIDI": é por ele que vai o nome do preset).
3. Escolha o preset de destino (padrão: 64) e clique em **Enviar** na parte da música.
4. No pedal, escolha o amp e a caixa indicados. O MIDI do NanoCore não troca o modelo de amp nem a IR.
5. Toque e ajuste nos controles: cada mudança vai na hora para o pedal.
6. O nome do preset vai junto com o timbre (até 8 caracteres, sem acento). Para trocar, edite **Nome no pedal** e
   clique em **Mudar nome**; vale para o preset ativo.
7. Para gravar, segure o botão **MASTER** do pedal (o nome é salvo junto). O site nunca grava nada sozinho: trocar de preset antes de
   salvar descarta as mudanças.

## Música nova por IA

1. **Copiar instruções para a IA** copia o `shared/prompt-ia.md`: troque a linha `MÚSICA:` pelo nome da música e do
   artista e cole no Claude, no ChatGPT ou em outra IA. As instruções trazem os efeitos, a ordem e a faixa real de cada
   parâmetro (do manual), os amps e caixas carregados neste pedal, a guitarra (Les Paul, humbuckers) e as regras de
   timbre: um timbre só quando a diferença vem da mão, compressor que devolve o volume e assim por diante.
2. Cole a resposta no campo e clique em **Aplicar e salvar**. O site confere tudo (tipos, quantidade e faixa dos
   parâmetros, nomes de amp e caixa) e recusa com a explicação do erro; texto ou bloco de código em volta do JSON não
   atrapalham.
3. A música vai na hora para o preset de destino e fica salva neste navegador, junto das outras, com **Remover**.
   Colar de novo uma música com o mesmo título e artista substitui a anterior.

## Gravar vídeo

No computador (Chrome, Edge ou Brave; celular não grava a tela pelo navegador):

1. **Ligar câmera**: ela aparece no canto da página, e o controle **Tamanho** muda o tamanho dela (160 a 720 px).
2. Marque o som: **Som do NanoCore (USB)**, **Microfone** ou os dois, que entram misturados. O som entra sem os
   filtros de voz do navegador (cancelamento de eco, redução de ruído, ganho automático), que estragam a guitarra.
3. **Gravar** e, quando o navegador perguntar o que compartilhar, escolha **esta aba**. O vídeo mostra a página com
   as configurações e a câmera no canto.
4. **Parar** e **Baixar vídeo** (MP4; WebM nos navegadores que não gravam MP4).

Na primeira vez, o macOS pede permissão de câmera e microfone para o navegador.

## Limites do MIDI do pedal

- O nome não está no guia de MIDI: vai pelo SysEx do próprio ToneCommand (`F0 7D 4E 43 70 … F7`, comando `0x6d`,
  subcomando `0x08`), descoberto pelas respostas do pedal enquanto o app renomeava um preset. Uma atualização de
  firmware pode mudar isso; o pedal responde com status 0 quando aceita.
- Modelo de amp, IR da caixa, ordem da cadeia e volume do preset não passam por MIDI. Um preset vazio (como o 64)
  abre com volume 100, mais alto que os de fábrica (por volta de 85).
- Pitch e wahs do bloco de drive usam os mesmos CCs da modulação: com um deles ligado, mexer na modulação mexe nele.

## Código

- `shared/nanocore.ts`: mapa de CCs do guia oficial de MIDI (firmware 1.04+) e a tradução de um timbre em mensagens.
- `shared/songs.ts`: os timbres. Parâmetros de 0 a 1, na ordem do guia; tipos pelos IDs do guia (no reverb,
  4 = Shimmer, 5 = Cloud, 6 = Spring, diferente da ordem do arquivo de preset do ToneCommand).
- `shared/prompt-ia.md`: as instruções para a IA. O teste confere que elas listam todos os tipos, parâmetros, amps e
  caixas do código e que o exemplo passa no validador.
- `shared/import.ts`: o validador do JSON colado.
- `app/app.vue`: a página.

```bash
pnpm test         # mapa de CCs e conferência dos timbres
pnpm typecheck
pnpm generate     # site estático em .output/public
```

Música nova: acrescente em `shared/songs.ts` e rode `pnpm test`, que confere tipos, quantidade de parâmetros e faixa
dos valores.

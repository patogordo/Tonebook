# NanoCore Tones

Site que leva um preset do LIVTRA NanoCore ao timbre de músicas conhecidas, pelo USB MIDI do próprio pedal.
Por enquanto: **Let It Happen** (Tame Impala), partes limpa e com fuzz, **Creep** (Radiohead), estrofe e refrão, e **No Surprises** (Radiohead), o arpejo limpo.

## Como usar

```bash
pnpm install
pnpm dev          # http://localhost:3300
```

1. Ligue o NanoCore no USB e abra o site no Chrome, no Edge ou no Brave (computador ou Android). Safari e iPhone
   não têm Web MIDI.
2. **Conectar ao NanoCore** e permita o acesso ao MIDI quando o navegador pedir.
3. Escolha o preset de destino (padrão: 64) e clique em **Enviar** na parte da música.
4. No pedal, escolha o amp e a caixa indicados. O MIDI do NanoCore não troca o modelo de amp nem a IR.
5. Toque e ajuste nos controles: cada mudança vai na hora para o pedal.
6. Para gravar, segure o botão **MASTER** do pedal. O site nunca grava nada sozinho: trocar de preset antes de
   salvar descarta as mudanças.

## Limites do MIDI do pedal

- Modelo de amp, IR da caixa, ordem da cadeia e volume do preset não passam por MIDI. Um preset vazio (como o 64)
  abre com volume 100, mais alto que os de fábrica (por volta de 85).
- Pitch e wahs do bloco de drive usam os mesmos CCs da modulação: com um deles ligado, mexer na modulação mexe nele.

## Código

- `shared/nanocore.ts`: mapa de CCs do guia oficial de MIDI (firmware 1.04+) e a tradução de um timbre em mensagens.
- `shared/songs.ts`: os timbres. Parâmetros de 0 a 1, na ordem do guia; tipos pelos IDs do guia (no reverb,
  4 = Shimmer, 5 = Cloud, 6 = Spring, diferente da ordem do arquivo de preset do ToneCommand).
- `app/app.vue`: a página.

```bash
pnpm test         # mapa de CCs e conferência dos timbres
pnpm typecheck
pnpm generate     # site estático em .output/public
```

Música nova: acrescente em `shared/songs.ts` e rode `pnpm test`, que confere tipos, quantidade de parâmetros e faixa
dos valores.

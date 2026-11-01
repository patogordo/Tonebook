# Rodar localmente

## Do que precisa

- Node 22.18 ou mais novo (os testes rodam TypeScript direto pelo Node).
- pnpm. Com o Corepack, que vem com o Node, basta `corepack enable`: a versão certa sai do `package.json`.
- Chrome, Edge ou Brave para abrir o site (o Web MIDI só existe nos navegadores Chromium).
- Um LIVTRA NanoCore ligado por USB, para mandar timbres. Sem ele, o site abre igual e o botão de conectar avisa que
  não achou o pedal.

## Passo a passo

```bash
git clone https://github.com/patogordo/Tonebook.git
cd Tonebook
corepack enable
pnpm install
pnpm dev
```

Abra http://localhost:3300 e clique em **Conectar ao NanoCore**. O `localhost` conta como endereço seguro, então o
Web MIDI, a câmera e a gravação funcionam sem HTTPS.

Para abrir pelo celular, use o site publicado (HTTPS): em outro endereço da rede, sem HTTPS, o navegador bloqueia o
Web MIDI.

## Antes de mandar uma mudança

```bash
pnpm format       # Prettier no código (Markdown fica de fora)
pnpm typecheck    # vue-tsc
pnpm test         # mapa de MIDI, SysEx, validador, timbres e sincronia do prompt
```

O GitHub Actions roda os três (com `pnpm format:check`) em todo push e pull request.

## Ver o build de produção

```bash
pnpm generate                                   # site estático em .output/public
python3 -m http.server 3000 -d .output/public   # http://localhost:3000
```

Para ver exatamente como o GitHub Pages serve, numa subpasta:

```bash
NUXT_APP_BASE_URL=/Tonebook/ pnpm generate
mkdir -p /tmp/pages && cp -R .output/public /tmp/pages/Tonebook
python3 -m http.server 3000 -d /tmp/pages       # http://localhost:3000/Tonebook/
```

## Mexendo com o pedal

Para investigar o MIDI do NanoCore (só macOS), compile a sonda e ouça o que o pedal manda:

```bash
swiftc -O tools/midi.swift -o tools/midi
tools/midi listen 30 > log.txt
python3 tools/decode.py log.txt
```

O formato e a regra de segurança (nunca mandar ao pedal um comando que o app oficial não manda) estão em
[`protocolo.md`](protocolo.md).

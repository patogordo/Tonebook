# Deploy

O Tonebook é um site estático: não tem servidor, banco, variável de ambiente nem segredo. O build é
`pnpm generate`, e o resultado (`.output/public`) vai para qualquer hospedagem estática **com HTTPS**, que o Web MIDI,
a câmera e a gravação de tela exigem.

## GitHub Pages (o padrão do repositório)

O workflow [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) roda em todo push na `main`: confere a
formatação, os tipos e os testes, gera o site com o endereço base `/<nome do repositório>/` e publica.

Na primeira vez (também num fork):

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Faça um push na `main` ou rode o workflow em **Actions → Testes e GitHub Pages → Run workflow**.

O site fica em `https://<usuário>.github.io/<repositório>/`; neste repositório,
https://patogordo.github.io/Tonebook/.

## Outra hospedagem estática

Netlify, Vercel, Cloudflare Pages e afins:

| Campo | Valor |
| --- | --- |
| Comando de build | `pnpm generate` |
| Pasta publicada | `.output/public` |
| Node | 22.18 ou mais novo |

Na raiz de um domínio, não precisa de mais nada. Numa subpasta, gere com o endereço base:

```bash
NUXT_APP_BASE_URL=/tonebook/ pnpm generate
```

## Servidor próprio

Qualquer servidor web que entregue arquivos serve. Exemplo com o nginx, na raiz do domínio:

```nginx
server {
  listen 443 ssl;
  server_name tonebook.exemplo.com;
  # certificados TLS aqui (ssl_certificate e ssl_certificate_key)
  root /var/www/tonebook;     # o conteúdo de .output/public
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

```bash
pnpm generate
rsync -a --delete .output/public/ servidor:/var/www/tonebook/
```

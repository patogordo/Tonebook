// Site estático (SPA): tudo roda no navegador, que fala com o pedal pelo Web MIDI.
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  ssr: false,
  devtools: { enabled: false },
  app: {
    head: {
      title: 'Tonebook',
      htmlAttrs: { lang: 'pt-BR' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Timbres de músicas para a pedaleira LIVTRA NanoCore, enviados pelo navegador via USB MIDI.',
        },
        { name: 'theme-color', content: '#111315' },
      ],
      // relativos: o GitHub Pages serve o site em /Tonebook/
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: 'logo.svg' },
        { rel: 'apple-touch-icon', href: 'apple-touch-icon.png' },
      ],
    },
  },
})

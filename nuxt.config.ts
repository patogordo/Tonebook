// Site estático (SPA): tudo roda no navegador, que fala com o pedal pelo Web MIDI.
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  ssr: false,
  devtools: { enabled: false },
  app: {
    head: {
      title: 'NanoCore Tones',
      htmlAttrs: { lang: 'pt-BR' },
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
})

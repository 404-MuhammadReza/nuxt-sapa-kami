// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  experimental: { asyncContext: true },
  modules: ['@nuxt/a11y', '@nuxt/eslint', '@nuxt/hints', '@vueuse/nuxt','nuxt-svgo', 'dayjs-nuxt'],
  css: ['@/assets/css/base.css'],
  runtimeConfig: { backendUrl: '' },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'SAPA KAMI - PT Timah Industri',
      meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
    }
  },
  dayjs: {
    locales: ['id'],
    defaultLocale: 'id',
    defaultTimezone: 'Asia/Jakarta',
    plugins: ['relativeTime', 'utc', 'timezone']
  },
})

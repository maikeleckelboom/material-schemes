import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/icon', '@nuxt/fonts'],
  typescript: {
    strict: true,
    typeCheck: true
  },
  vite: {
    plugins: [tailwindcss()]
  },
  css: ['@/assets/css/tailwind.css']
});

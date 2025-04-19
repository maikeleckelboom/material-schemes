import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: {enabled: true},
    future: {
        compatibilityVersion: 4
    },
    modules: [
        '@nuxt/icon',
        '@nuxt/fonts',
        '@nuxt/image',
        '@nuxt/test-utils',
        'shadcn-nuxt',
    ],
    shadcn: {
        prefix: '',
        componentDir: './layers/ui/components'
    },
    css: ['~/assets/css/tailwind.css'],
    vite: {
        plugins: [
            tailwindcss(),
        ],
    },
})

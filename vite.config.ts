import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'


import Unocss from 'unocss/vite'
import {
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      manifest: {
        "name": process.env.VITE_APP_NAME,
        "short_name": process.env.VITE_APP_SHORT_NAME,
        "description": "",
        "theme_color": "#f69435",
        "display": "standalone",
        "scope": "/",
        "start_url": "/",
        "icons": [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
        ],
      },
    }
    ),
    Unocss({
      presets: [
        presetUno(),
        presetAttributify(),
        presetIcons({
          scale: 1.2,
          warn: true,
        }),
      ],
      transformers: [
        transformerDirectives(),
        transformerVariantGroup(),
      ]
    }),
  ],
  define:{
    appVersion: JSON.stringify(process.env.npm_package_version)
  },
  server: {
    watch: {
      usePolling: true,
    },
    // https: false
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
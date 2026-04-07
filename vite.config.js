import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import electron from 'vite-plugin-electron'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      manifest: {
        name: 'LalibreINV Workspace',
        short_name: 'LalibreINV',
        description: 'Gestor Avanzado de Investigación Cualitativa',
        theme_color: '#2563eb',
        icons: [
          {
            src: '/LALIBRE.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/LALIBRE.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    }),
    electron({
      entry: 'electron/main.js',
    })
  ],
})
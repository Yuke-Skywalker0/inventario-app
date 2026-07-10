import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'Inventario',
        short_name: 'Inventario',
        description: 'Trova, controlla e aggiorna ciò che hai in magazzino, in pochi secondi.',
        theme_color: '#e8590c',
        background_color: '#f2f4f3',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait-primary',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // Offline shell: app statica sempre disponibile. La cache dei
        // DATI (prodotti, movimenti) è gestita separatamente via IndexedDB
        // nella Fase 21 (Offline-first), non dal Service Worker.
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Le chiamate API non vanno MAI servite dalla cache del Service
            // Worker: la coerenza dei dati (quantità, movimenti) è gestita
            // esplicitamente da IndexedDB + coda di sync, non da una cache
            // HTTP generica che potrebbe servire dati stantii.
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkOnly'
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  server: {
    port: 5173
  }
});

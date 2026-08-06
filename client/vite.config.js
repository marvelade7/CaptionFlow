import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate', // auto-updates SW in the background
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
            manifest: {
                name: 'CaptionFlow',
                short_name: 'CaptionFlow',
                description: 'AI-powered transcription and speech-to-text',
                theme_color: '#7C3AED', // matches your primary
                background_color: '#0f0f0f', // or your app bg
                display: 'standalone',
                start_url: '/',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    }
                ]
            },
            devOptions: {
                enabled: false,
            },
            workbox: {
                // controls what gets precached for offline use
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
            }
        })],
});

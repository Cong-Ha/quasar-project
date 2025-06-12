// --- src/quasar.config.ts ---
import { defineConfig } from '#q-app/wrappers';
import { fileURLToPath } from 'node:url';

export default defineConfig((ctx) => {
  return {
    // Boot files to run before the root Vue app loads
    boot: ['i18n', 'axios'],

    // Global CSS/SCSS files to include
    css: ['app.scss'],

    // Additional font/icon libraries to bundle
    extras: ['roboto-font', 'material-icons'],

    build: {
      // Target environments for browser and Node builds
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20'
      },

      // TypeScript options
      typescript: {
        strict: true,
        vueShim: true
      },

      // Vue router mode: 'hash' for Electron
      vueRouterMode: 'hash',

      // Vite plugins used during build
      vitePlugins: [
        // Vue I18n plugin with SSR support
        ['@intlify/unplugin-vue-i18n/vite', {
          ssr: ctx.modeName === 'ssr',
          include: [fileURLToPath(new URL('./src/i18n', import.meta.url))]
        }],

        // Type and lint checker plugin
        ['vite-plugin-checker', {
          vueTsc: true,
          eslint: {
            lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{ts,js,mjs,cjs,vue}"',
            useFlatConfig: true
          }
        }, { server: false }]
      ]
    },

    // Dev server options
    devServer: {
      https: false,
      port: 8080,
      open: true
    },

    // Quasar framework configuration
    framework: {
      config: {},
      plugins: ['Notify'] // Quasar plugin for notifications
    },

    // Animations used globally (empty = none)
    animations: [],

    // Progressive Web App (PWA) configuration
    pwa: {
      workboxMode: 'GenerateSW' // Use Workbox to generate a service worker
    },

    // Electron app configuration
    electron: {
      preloadScripts: ['electron-preload'], // Preload script entry
      inspectPort: 5858, // Port for debugging Electron
      bundler: 'packager', // Use Electron Packager
      builder: {
        appId: 'quasar-project' // App identifier for electron-builder
      }
    },

    // Capacitor (mobile) configuration
    capacitor: {
      hideSplashscreen: true
    },

    // Browser Extension (BEX) configuration
    bex: {
      extraScripts: [] // Extra scripts to include in BEX
    }
  };
});
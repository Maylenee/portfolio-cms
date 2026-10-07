const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', '.edgeone/*'],
  },
  {
    // Node Functions berjalan di Node.js (EdgeOne Pages), bukan di browser.
    files: ['node-functions/**/*.js', 'scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        Response: 'readonly',
        Request: 'readonly',
        Headers: 'readonly',
        URL: 'readonly',
        crypto: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        console: 'readonly',
        process: 'readonly',
        globalThis: 'readonly',
      },
    },
  },
]);

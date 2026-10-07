const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', '.edgeone/*'],
  },
  {
    // Edge Functions berjalan di runtime EdgeOne (Web API), bukan di browser/Node.
    files: ['edge-functions/**/*.js', 'scripts/**/*.mjs'],
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

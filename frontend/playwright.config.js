const { defineConfig, devices } = require('@playwright/test');

// Sezione 53 del brief: test end-to-end reali in un browser vero.
// Non eseguibili nella sandbox di sviluppo (il dominio dei binari di
// Chromium non è raggiungibile lì), ma pensati per girare in locale o
// in CI normalmente — vedi docs/E2E_TESTING.md per le istruzioni.
module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] }
    }
  ]
});

import { defineConfig, devices } from '@playwright/test'

/**
 * Port dédié aux tests de bout en bout : jamais celui du serveur de
 * développement (3000), pour qu'une session `npm run dev` ouverte ne fausse
 * pas une exécution.
 */
const port = Number(process.env.E2E_PORT ?? 4320)
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './tests',
  // `fullyParallel` et un seul serveur : les specs ne partagent aucun état
  // côté serveur, le site est statique.
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

  expect: { timeout: 5_000 },

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  /**
   * Le build de production est servi tel quel, jamais `nuxt dev` : le rendu de
   * développement masquerait les écarts entre les deux modes, qui sont
   * précisément ce que ces tests doivent attraper.
   */
  webServer: {
    command: 'npm run build --prefix .. && node ../.output/server/index.mjs',
    url: baseURL,
    env: { PORT: String(port), HOST: '127.0.0.1' },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})

const { expect } = require('@playwright/test');

function uniqueEmail(prefix = 'e2e') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@esempio.it`;
}

// Ogni test parte da un account nuovo di zecca, così i test sono
// indipendenti tra loro e ripetibili senza dati residui dell'ultima run.
async function registerFreshUser(page) {
  await page.goto('/');
  await page.getByText('Non hai un account? Registrati').click();
  await page.getByLabel('Email').fill(uniqueEmail());
  await page.getByLabel('Password').fill('passwordsicura123');
  await page.getByRole('button', { name: 'Crea account' }).click();
  await expect(page.getByPlaceholder('Cerca un prodotto…')).toBeVisible({ timeout: 10000 });
}

module.exports = { registerFreshUser, uniqueEmail };

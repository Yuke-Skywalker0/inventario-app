const { test, expect } = require('@playwright/test');

// Ogni run usa un'email unica: altrimenti il secondo tentativo fallirebbe
// con "esiste già un account" invece di testare davvero la registrazione.
function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 10000)}@esempio.it`;
}

test.describe('Autenticazione', () => {
  test('registrazione crea un account e porta alla home', async ({ page }) => {
    await page.goto('/');

    await page.getByText('Non hai un account? Registrati').click();

    await page.getByLabel('Email').fill(uniqueEmail());
    await page.getByLabel('Password').fill('passwordsicura123');
    await page.getByRole('button', { name: 'Crea account' }).click();

    await expect(page.getByPlaceholder('Cerca un prodotto…')).toBeVisible({ timeout: 10000 });
  });

  test('logout riporta alla schermata di login', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Non hai un account? Registrati').click();
    await page.getByLabel('Email').fill(uniqueEmail());
    await page.getByLabel('Password').fill('passwordsicura123');
    await page.getByRole('button', { name: 'Crea account' }).click();
    await expect(page.getByPlaceholder('Cerca un prodotto…')).toBeVisible({ timeout: 10000 });

    await page.getByText('Profilo').click();
    await page.getByRole('button', { name: 'Esci' }).click();

    await expect(page.getByRole('button', { name: 'Accedi' })).toBeVisible({ timeout: 10000 });
  });

  test('login con credenziali sbagliate mostra un errore chiaro', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Email').fill('nonesiste@esempio.it');
    await page.getByLabel('Password').fill('passwordsbagliata');
    await page.getByRole('button', { name: 'Accedi' }).click();

    await expect(page.getByText('Credenziali non valide')).toBeVisible({ timeout: 10000 });
  });
});

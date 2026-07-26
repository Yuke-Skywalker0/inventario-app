const { test, expect } = require('@playwright/test');
const { registerFreshUser } = require('./helpers');

async function createLocation(page, name) {
  await page.getByText('Ubicazioni').click();
  await page.getByRole('button', { name: 'Nuova ubicazione' }).click();
  await page.getByPlaceholder('Es. Magazzino principale').fill(name);
  await page.getByRole('button', { name: 'Crea ubicazione' }).click();
  await expect(page.getByText(name)).toBeVisible({ timeout: 10000 });
  await page.getByText('Cerca').click();
}

test.describe('Prodotti', () => {
  test('crea un prodotto con quantità e lo trova nella ricerca', async ({ page }) => {
    await registerFreshUser(page);
    const locationName = `Magazzino ${Date.now()}`;
    await createLocation(page, locationName);

    await page.getByRole('button', { name: 'Nuovo prodotto' }).click();

    const titolo = `Raccordo Test ${Date.now()}`;
    await page.getByPlaceholder('Es. Raccordo multistrato 20mm').fill(titolo);
    await page.getByPlaceholder('0').fill('10');
    await page.getByLabel(/Ubicazione/).selectOption({ label: locationName });
    await page.getByRole('button', { name: 'Crea prodotto' }).click();

    await expect(page.getByText(titolo)).toBeVisible({ timeout: 10000 });
  });

  test('il pulsante +1 rapido aumenta la quantità mostrata', async ({ page }) => {
    await registerFreshUser(page);
    const locationName = `Magazzino ${Date.now()}`;
    await createLocation(page, locationName);

    await page.getByRole('button', { name: 'Nuovo prodotto' }).click();
    const titolo = `Vite Test ${Date.now()}`;
    await page.getByPlaceholder('Es. Raccordo multistrato 20mm').fill(titolo);
    await page.getByPlaceholder('0').fill('5');
    await page.getByLabel(/Ubicazione/).selectOption({ label: locationName });
    await page.getByRole('button', { name: 'Crea prodotto' }).click();
    await expect(page.getByText(titolo)).toBeVisible({ timeout: 10000 });

    const card = page.locator('.product-card', { hasText: titolo });
    await expect(card.getByText('5')).toBeVisible();

    await card.getByRole('button', { name: 'Aggiungi 1' }).click();
    await expect(card.getByText('6')).toBeVisible({ timeout: 5000 });
  });

  test('apre la scheda prodotto e vede la quantità per ubicazione', async ({ page }) => {
    await registerFreshUser(page);
    const locationName = `Magazzino ${Date.now()}`;
    await createLocation(page, locationName);

    await page.getByRole('button', { name: 'Nuovo prodotto' }).click();
    const titolo = `Guarnizione Test ${Date.now()}`;
    await page.getByPlaceholder('Es. Raccordo multistrato 20mm').fill(titolo);
    await page.getByPlaceholder('0').fill('3');
    await page.getByLabel(/Ubicazione/).selectOption({ label: locationName });
    await page.getByRole('button', { name: 'Crea prodotto' }).click();
    await expect(page.getByText(titolo)).toBeVisible({ timeout: 10000 });

    await page.getByText(titolo).click();
    await expect(page.getByRole('heading', { name: titolo })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(locationName)).toBeVisible();
  });
});

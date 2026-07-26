const { test, expect } = require('@playwright/test');
const { registerFreshUser } = require('./helpers');

test.describe('Ubicazioni', () => {
  test('crea una ubicazione e la trova nella lista', async ({ page }) => {
    await registerFreshUser(page);

    await page.getByText('Ubicazioni').click();
    await expect(page.getByRole('heading', { name: 'Ubicazioni' })).toBeVisible();

    await page.getByRole('button', { name: 'Nuova ubicazione' }).click();

    const nome = `Magazzino Test ${Date.now()}`;
    await page.getByPlaceholder('Es. Magazzino principale').fill(nome);
    await page.getByRole('button', { name: 'Crea ubicazione' }).click();

    await expect(page.getByText(nome)).toBeVisible({ timeout: 10000 });
  });

  test('archivia una ubicazione e la nasconde dalla vista di default', async ({ page }) => {
    await registerFreshUser(page);
    await page.getByText('Ubicazioni').click();
    await page.getByRole('button', { name: 'Nuova ubicazione' }).click();

    const nome = `Da archiviare ${Date.now()}`;
    await page.getByPlaceholder('Es. Magazzino principale').fill(nome);
    await page.getByRole('button', { name: 'Crea ubicazione' }).click();
    await expect(page.getByText(nome)).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Archivia' }).click();
    await expect(page.getByText(nome)).not.toBeVisible();

    await page.getByRole('button', { name: 'Mostra archiviate' }).click();
    await expect(page.getByText(nome)).toBeVisible();
  });
});

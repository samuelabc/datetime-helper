import { expect, test } from '@playwright/test';

async function waitForAppReady(page: import('@playwright/test').Page) {
  await expect(page.getByRole('button', { name: /Copy Unix Timestamp value/ })).toBeVisible();
  await expect(page.getByLabel('Start Date Input')).toHaveValue('now');
}

test.describe('url state behavior', () => {
  test('hydrates calculator from URL query on first load', async ({ page }) => {
    await page.goto('/?o0=add%3A1%3Amonths&o1=subtract%3A3%3Adays&s=2026-01-31');
    await expect(page.getByRole('button', { name: /Copy Unix Timestamp value/ })).toBeVisible();

    await expect(page.getByLabel('Start Date Input')).toHaveValue('2026-01-31');
    await expect(page.getByLabel('Direction').first()).toHaveValue('add');
    await expect(page.getByLabel('Amount').first()).toHaveValue('1');
    await expect(page.getByLabel('Unit').first()).toHaveValue('months');
    await expect(page.getByLabel('Amount').nth(1)).toHaveValue('3');
    await expect(page.getByLabel('Unit').nth(1)).toHaveValue('days');
  });

  test('falls back with inline feedback on malformed url state', async ({ page }) => {
    await page.goto('/?o0=add%3A-5%3Adays&s=now');
    await waitForAppReady(page);

    await expect(page.getByText('Invalid amount in URL state.')).toBeVisible();
    await expect(page.getByLabel('Start Date Input')).toHaveValue('now');
    await expect(page.getByLabel('Amount').first()).toHaveValue('0');
  });

  test('live input changes synchronize canonical URL', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    const startDateInput = page.getByLabel('Start Date Input');
    await startDateInput.click();
    await startDateInput.fill('2026-01-31');
    await page
      .getByLabel('Direction')
      .first()
      .evaluate((element) => {
        const select = element as HTMLSelectElement;
        select.value = 'add';
        select.dispatchEvent(new Event('input', { bubbles: true }));
      });
    await page.getByLabel('Amount').first().fill('1');
    await page
      .getByLabel('Unit')
      .first()
      .evaluate((element) => {
        const select = element as HTMLSelectElement;
        select.value = 'months';
        select.dispatchEvent(new Event('input', { bubbles: true }));
      });

    await expect(page.getByLabel('Start Date Input')).toHaveValue('2026-01-31');
    await expect(page.getByLabel('Direction').first()).toHaveValue('add');
    await expect(page.getByLabel('Amount').first()).toHaveValue('1');
    await expect(page.getByLabel('Unit').first()).toHaveValue('months');

    await expect
      .poll(async () => new URL(page.url()).search)
      .toContain('?o0=add%3A1%3Amonths&s=2026-01-31');
  });

  test('snap operation is represented in canonical URL state', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    await page
      .getByLabel('Direction')
      .first()
      .evaluate((element) => {
        const select = element as HTMLSelectElement;
        select.value = 'snap';
        select.dispatchEvent(new Event('input', { bubbles: true }));
      });
    await page
      .getByLabel('Unit')
      .first()
      .evaluate((element) => {
        const select = element as HTMLSelectElement;
        select.value = 'endOfMonth';
        select.dispatchEvent(new Event('input', { bubbles: true }));
      });
    await expect(page.getByLabel('Direction').first()).toHaveValue('snap');
    await expect(page.getByLabel('Unit').first()).toHaveValue('endOfMonth');

    await expect
      .poll(async () => new URL(page.url()).search)
      .toContain('?o0=snap%3A0%3AendOfMonth&s=now');
  });

  test('copied share link reproduces state in a fresh page', async ({ page, context }) => {
    await page.goto('/');
    await waitForAppReady(page);

    await page.getByLabel('Start Date Input').fill('2026-01-31');
    await page
      .getByLabel('Direction')
      .first()
      .evaluate((element) => {
        const select = element as HTMLSelectElement;
        select.value = 'add';
        select.dispatchEvent(new Event('input', { bubbles: true }));
      });
    await page.getByLabel('Amount').first().fill('1');
    await page
      .getByLabel('Unit')
      .first()
      .evaluate((element) => {
        const select = element as HTMLSelectElement;
        select.value = 'months';
        select.dispatchEvent(new Event('input', { bubbles: true }));
      });

    await expect
      .poll(async () => new URL(page.url()).search)
      .toContain('?o0=add%3A1%3Amonths&s=2026-01-31');

    const shareUrl = page.url();
    const freshPage = await context.newPage();
    await freshPage.goto(shareUrl);
    await expect(freshPage.getByLabel('Start Date Input')).toHaveValue('2026-01-31');
    await expect(freshPage.getByLabel('Direction').first()).toHaveValue('add');
    await expect(freshPage.getByLabel('Amount').first()).toHaveValue('1');
    await expect(freshPage.getByLabel('Unit').first()).toHaveValue('months');
  });
});

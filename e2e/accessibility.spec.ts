import { expect, test } from '@playwright/test';

test.describe('keyboard and screen-reader support', () => {
  test('tab order reaches controls in logical sequence', async ({ page }) => {
    await page.goto('/');

    // Ensure remove and reset controls are visible for full-order validation.
    await page.getByRole('button', { name: 'Add operation' }).click();
    await expect(page.getByLabel('Direction')).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'Remove operation' })).toHaveCount(2);
    await page.getByLabel('Amount').first().fill('1');
    await page.getByRole('heading', { name: 'datetime-helper' }).click();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Start Date Input')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Direction').first()).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Amount').first()).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Unit').first()).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Remove operation' }).first()).toBeFocused();

    for (let i = 0; i < 5; i += 1) {
      if (await page.getByRole('button', { name: 'Add operation' }).evaluate((element) => element === document.activeElement)) {
        break;
      }
      await page.keyboard.press('Tab');
    }
    await expect(page.getByRole('button', { name: 'Add operation' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Reset calculator' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /Copy Unix Timestamp value/ })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /Copy ISO 8601 value/ })).toBeFocused();
  });

  test('uses polite and assertive live regions', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[aria-live="polite"]').filter({ hasText: 'Unix Timestamp' })).toBeVisible();

    const copyButton = page.getByRole('button', { name: /Copy Unix Timestamp value/ });
    await copyButton.click();
    await expect(copyButton.locator('xpath=following-sibling::div[@aria-live="assertive"]')).toContainText('Copied to clipboard');
  });
});

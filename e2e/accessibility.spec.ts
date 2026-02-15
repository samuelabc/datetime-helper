import { expect, test } from '@playwright/test';

test.describe('keyboard and screen-reader support', () => {
  test('tab order reaches core controls in logical sequence', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('heading', { name: 'datetime-helper' }).click();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Use calculator mode' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Use reverse decode mode' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Start Date Input')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Direction').first()).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Amount').first()).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Unit').first()).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Add operation' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Timezone mode')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Open command palette' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Copy share link' })).toBeFocused();
  });

  test('uses polite and assertive live regions', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[aria-live="polite"]').filter({ hasText: 'Unix Timestamp' })).toBeVisible();

    const copyButton = page.getByRole('button', { name: /Copy Unix Timestamp value/ });
    await copyButton.click();
    await expect(copyButton.locator('xpath=following-sibling::div[@aria-live="assertive"]')).toContainText('Copied to clipboard');
  });

  test('opens and closes command palette with focus return', async ({ page }) => {
    await page.goto('/');

    const launcher = page.getByRole('button', { name: 'Open command palette' });
    await launcher.focus();
    await expect(launcher).toBeFocused();

    const dialog = page.getByRole('dialog', { name: 'AI command palette' });
    await launcher.click();
    await expect(dialog).toBeVisible();
    await expect(page.getByLabel('Command palette prompt')).toBeFocused();
    await expect(dialog.getByText(/AI unavailable|AI ready/)).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(launcher).toBeFocused();
  });
});

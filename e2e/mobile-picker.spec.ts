import { devices, expect, test } from '@playwright/test';

test.use({ ...devices['Pixel 5'] });

test.describe('mobile native picker fallback', () => {
  test('touch-target datetime picker updates Start Date input', async ({ page }) => {
    await page.goto('/');

    const nativePickerInput = page.getByLabel('Choose start date and time');
    await expect(nativePickerInput).toBeVisible();

    await nativePickerInput.fill('2026-03-01T10:30');

    const startDateInput = page.getByLabel('Start Date Input');
    await expect(startDateInput).not.toHaveValue('now');
    await expect(startDateInput).toHaveValue(/Z$/);
  });
});

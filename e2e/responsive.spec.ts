import { expect, test } from '@playwright/test';

test.describe('responsive layout', () => {
  test('desktop keeps side-by-side layout', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const input = page.locator('section[aria-label="Input"]');
    const results = page.locator('section[aria-label="Results"]');
    await expect(input).toBeVisible();
    await expect(results).toBeVisible();

    const inputBox = await input.boundingBox();
    const resultsBox = await results.boundingBox();
    expect(inputBox && resultsBox ? resultsBox.x > inputBox.x : false).toBe(true);
  });

  test('tablet keeps side-by-side layout with compact spacing', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await page.goto('/');

    const input = page.locator('section[aria-label="Input"]');
    const results = page.locator('section[aria-label="Results"]');
    await expect(input).toBeVisible();
    await expect(results).toBeVisible();

    const inputBox = await input.boundingBox();
    const resultsBox = await results.boundingBox();
    expect(inputBox && resultsBox ? resultsBox.x > inputBox.x : false).toBe(true);
  });

  test('mobile stacks and avoids horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const input = page.locator('section[aria-label="Input"]');
    const results = page.locator('section[aria-label="Results"]');
    await expect(input).toBeVisible();
    await expect(results).toBeVisible();

    const inputBox = await input.boundingBox();
    const resultsBox = await results.boundingBox();
    expect(inputBox && resultsBox ? resultsBox.y > inputBox.y : false).toBe(true);

    // Exercise core interactions in narrow viewport.
    await page.getByLabel('Start Date Input').fill('2026-01-31');
    await page.getByLabel('Direction').first().selectOption('add');
    await page.getByLabel('Amount').first().fill('1');
    await page.getByLabel('Unit').first().selectOption('months');

    await page.getByRole('button', { name: 'Add operation' }).click();
    await expect(page.getByLabel('Direction')).toHaveCount(2);
    await page.getByRole('button', { name: 'Remove operation' }).first().click();
    await expect(page.getByLabel('Direction')).toHaveCount(1);

    await expect(page.getByRole('button', { name: 'Reset calculator' })).toBeVisible();
    await page.getByRole('button', { name: 'Reset calculator' }).click();
    await expect(page.getByRole('button', { name: 'Reset calculator' })).toBeHidden();

    const copyButton = page.getByRole('button', { name: /Copy Unix Timestamp value/ });
    await copyButton.click();
    await expect(copyButton).toContainText('Copied!');

    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasOverflow).toBe(false);
  });
});

import { expect, test } from '@playwright/test';

test.describe('theme parity', () => {
  test('captures dark mode visual baselines for app and docs', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('theme', 'dark');
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/');
    await page.addStyleTag({ content: '[data-theme-toggle] { display: none !important; }' });
    const startDateInput = page.getByLabel('Start Date Input');
    await startDateInput.fill('2026-02-21');
    await expect(page).toHaveScreenshot('dark-home.png', { fullPage: true });

    await page.goto('/docs');
    await page.addStyleTag({ content: '[data-theme-toggle] { display: none !important; }' });
    await expect(page).toHaveScreenshot('dark-docs-index.png', { fullPage: true });

    await page.goto('/docs/developer-workflows');
    await page.addStyleTag({ content: '[data-theme-toggle] { display: none !important; }' });
    await expect(page).toHaveScreenshot('dark-docs-workflows.png', { fullPage: true });
  });

  test('renders dark mode with visible copied-state signals', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('theme', 'dark');
    });
    await page.goto('/');

    const inputZone = page.locator('section[aria-label="Input"]');
    const bgColor = await inputZone.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(bgColor).not.toBe('rgb(249, 250, 251)');

    const copyButton = page.getByRole('button', { name: /Copy Unix Timestamp value/ });
    await expect(copyButton).toBeVisible();
    await expect(copyButton).toContainText('Copy');

    await copyButton.click();
    await expect(copyButton).toContainText('Copied!');
    await expect(copyButton.locator('svg')).toBeVisible();
  });

  test('light mode keeps key accent text at accessible contrast', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('theme', 'light');
    });
    await page.goto('/');

    const startDateInput = page.getByLabel('Start Date Input');
    const addOperation = page.getByRole('button', { name: 'Add operation' });
    const liveIndicator = page.locator('section[aria-label="Results"] span', { hasText: 'live' });

    const ratio = async (selector: string) =>
      page.evaluate((nodeSelector) => {
        type Rgb = [number, number, number];
        const toRgb = (value: string) => {
          const matches = value.match(/\d+/g);
          if (!matches || matches.length < 3) return [0, 0, 0] as Rgb;
          return [Number(matches[0] ?? 0), Number(matches[1] ?? 0), Number(matches[2] ?? 0)] as Rgb;
        };
        const relativeLuminance = ([r, g, b]: Rgb) => {
          const normalize = (channel: number) => {
            const c = channel / 255;
            return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          };
          const [rs, gs, bs] = [normalize(r), normalize(g), normalize(b)];
          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        };
        const contrast = (fg: Rgb, bg: Rgb) => {
          const [l1, l2] = [relativeLuminance(fg), relativeLuminance(bg)].sort((a, b) => b - a);
          return (l1 + 0.05) / (l2 + 0.05);
        };
        const resolveBackground = (element: Element): Rgb => {
          let current: Element | null = element;
          while (current) {
            const bg = getComputedStyle(current).backgroundColor;
            if (bg && !bg.includes('rgba(0, 0, 0, 0)') && bg !== 'transparent') {
              return toRgb(bg);
            }
            current = current.parentElement;
          }
          return [255, 255, 255];
        };

        const element = document.querySelector(nodeSelector);
        if (!element) return 0;
        const fg = toRgb(getComputedStyle(element).color);
        const bg = resolveBackground(element);
        return contrast(fg, bg);
      }, selector);

    await expect(startDateInput).toBeVisible();
    await expect(addOperation).toBeVisible();
    await expect(liveIndicator).toBeVisible();

    expect(await ratio('input[aria-label="Start Date Input"]')).toBeGreaterThanOrEqual(4.5);
    expect(await ratio('button[aria-label="Add operation"]')).toBeGreaterThanOrEqual(4.5);
    expect(await ratio('section[aria-label="Results"] > div span.flex.items-center.gap-1')).toBeGreaterThanOrEqual(4.5);
  });
});

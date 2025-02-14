// @ts-check
import { test, expect } from '@playwright/test';

test('Success', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.fill('input', 'https://aljazeera.com/xml/rss/all.xml');
  await page.locator('button[type="submit"]').click();

  const feedback = page.locator('.feedback');
  await expect(feedback).toHaveText('RSS успешно загружен');
});

test('Show modal post', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.fill('input', 'https://aljazeera.com/xml/rss/all.xml');
  await page.locator('button[type="submit"]').click();

  await page.waitForSelector('.feedback:has-text("RSS успешно загружен")');

  const preview = page.locator('button[data-id="2"]');
  await expect(preview).toHaveText('Просмотр');
});

test('Has URL', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.fill('input', 'https://aljazeera.com/xml/rss/all.xml');
  await page.locator('button[type="submit"]').click();

  await page.waitForSelector('.feedback:has-text("RSS успешно загружен")');

  await page.fill('input', 'https://aljazeera.com/xml/rss/all.xml');
  await page.locator('button[type="submit"]').click();

  const feedback = page.locator('.feedback');
  await expect(feedback).toHaveText('RSS уже существует');
});

test('Not be empty', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.locator('button[type="submit"]').click();

  const feedback = page.locator('.feedback');
  await expect(feedback).toHaveText('Не должно быть пустым');
});

test('Not valid URL', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.fill('input', 'notLink');
  await page.locator('button[type="submit"]').click();

  const feedback = page.locator('.feedback');
  await expect(feedback).toHaveText('Ссылка должна быть валидным URL');
});

test('Not valid RSS', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.fill('input', 'https://aljazeera.com/xml/rss/all.xm');
  await page.locator('button[type="submit"]').click();

  const feedback = page.locator('.feedback');
  await expect(feedback).toHaveText('Ресурс не содержит валидный RSS');
});

test('Network error', async ({ page }) => {
  await page.goto('http://localhost:8080/');

  await page.route('**/*', (route) => {
    route.abort('failed');
  });

  await page.fill('input', 'https://aljazeera.com/xml/rss/all.xml');
  await page.locator('button[type="submit"]').click();

  const feedback = page.locator('.feedback');
  await expect(feedback).toHaveText('Ошибка сети');
});

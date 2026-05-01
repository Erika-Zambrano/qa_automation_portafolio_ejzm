import { Page, Locator } from '@playwright/test';

export async function waitForNetworkIdle(page: Page, timeout = 5_000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

export async function getTextContent(locator: Locator): Promise<string> {
  const text = await locator.textContent();
  return text?.trim() ?? '';
}

export function generateTestEmail(prefix = 'qa'): string {
  return `${prefix}+${Date.now()}@example.com`;
}

export async function countVisibleElements(page: Page, testId: string): Promise<number> {
  return page.getByTestId(testId).count();
}

import { test, expect } from '@playwright/test';
import { CvPage } from '../../../pages/portfolio/CvPage';

test.describe('CV page', () => {
  let cvPage: CvPage;

  test.beforeEach(async ({ page }) => {
    cvPage = new CvPage(page);
    await cvPage.goto('es');
  });

  // ── Smoke ─────────────────────────────────────────────────────────────────

  test('@smoke topbar and all 4 nav links are visible', async () => {
    await Promise.all([
      expect.soft(cvPage.topbar).toBeVisible(),
      expect.soft(cvPage.navHome).toBeVisible(),
      expect.soft(cvPage.navCv).toBeVisible(),
      expect.soft(cvPage.navContact).toBeVisible(),
      expect.soft(cvPage.navReports).toBeVisible(),
    ]);
  });

  test('@smoke all 6 CV sections are visible in Spanish', async () => {
    await Promise.all(
      cvPage.allSections.map(s => expect.soft(s).toBeVisible())
    );
  });

  test('@smoke nav links navigate to correct pages', async ({ page }) => {
    await cvPage.navContact.click();
    await expect(page).toHaveURL(/\/contact/);

    await cvPage.goto('es');
    await cvPage.navReports.click();
    await expect(page).toHaveURL(/\/reports/);

    await cvPage.goto('es');
    await cvPage.navHome.click();
    await expect(page).toHaveURL(/\/$|\/\?/);
  });

  // ── Regression ────────────────────────────────────────────────────────────

  test('@regression language switches to English via UI', async () => {
    await cvPage.switchLangViaUI('en');

    await Promise.all([
      expect.soft(cvPage.sectionProfile).toContainText('Professional Profile'),
      expect.soft(cvPage.sectionExperience).toContainText('Professional Experience'),
      expect.soft(cvPage.sectionProjects).toContainText('Personal Projects'),
      expect.soft(cvPage.sectionSkills).toContainText('Technical Skills'),
      expect.soft(cvPage.sectionEducation).toContainText('Education'),
      expect.soft(cvPage.sectionLanguages).toContainText('Languages'),
    ]);
  });

  test('@regression language persists after page reload', async ({ page }) => {
    await cvPage.switchLangViaUI('en');
    await page.reload();
    await page.waitForLoadState('networkidle');

    await Promise.all([
      expect.soft(cvPage.langBtn).toContainText('EN'),
      expect.soft(cvPage.sectionProfile).toContainText('Professional Profile'),
      expect.soft(cvPage.sectionExperience).toContainText('Professional Experience'),
    ]);
  });

  test('@regression html lang attribute updates when language changes', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await cvPage.switchLangViaUI('en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

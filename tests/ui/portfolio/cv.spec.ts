import { test, expect } from '../fixtures/pomBuilder';

test.describe('CV page', () => {
  test.beforeEach(async ({ pom }) => {
    await pom.cv.goto();
  });

  test('Should display the topbar and all 4 nav links', { tag: '@smoke' }, async ({ pom }) => {
    const { cv } = pom;

    await Promise.all([
      expect.soft(cv.topbar).toBeVisible(),
      expect.soft(cv.navHome).toBeVisible(),
      expect.soft(cv.navCv).toBeVisible(),
      expect.soft(cv.navContact).toBeVisible(),
      expect.soft(cv.navReports).toBeVisible(),
    ]);
  });

  test('Should display all 6 CV sections in Spanish', { tag: '@smoke' }, async ({ pom }) => {
    await Promise.all(pom.cv.allSections.map((section) => expect.soft(section).toBeVisible()));
  });

  test('Should navigate to the right page from each nav link', { tag: '@smoke' }, async ({ page, pom }) => {
    const { cv } = pom;

    await cv.navContact.click();
    await expect(page).toHaveURL(/\/contact/);

    await cv.goto();
    await cv.navReports.click();
    await expect(page).toHaveURL(/\/reports/);

    await cv.goto();
    await cv.navHome.click();
    await expect(page).toHaveURL(/\/$|\/\?/);
  });

  test('Should switch the language to English via the UI', { tag: '@regression' }, async ({ pom }) => {
    const { cv } = pom;
    await cv.switchLangViaUI('en');

    await Promise.all([
      expect.soft(cv.sectionProfile).toContainText('Professional Profile'),
      expect.soft(cv.sectionExperience).toContainText('Professional Experience'),
      expect.soft(cv.sectionProjects).toContainText('Selected AI Project'),
      expect.soft(cv.sectionSkills).toContainText('Technical Skills'),
      expect.soft(cv.sectionEducation).toContainText('Education'),
      expect.soft(cv.sectionLanguages).toContainText('Languages'),
    ]);
  });

  test('Should validate that the language persists after a page reload', { tag: '@regression' }, async ({ page, pom }) => {
    const { cv } = pom;
    await cv.switchLangViaUI('en');
    await page.reload();
    await expect(cv.topbar).toBeVisible();

    await Promise.all([
      expect.soft(cv.langBtn).toContainText('EN'),
      expect.soft(cv.sectionProfile).toContainText('Professional Profile'),
      expect.soft(cv.sectionExperience).toContainText('Professional Experience'),
    ]);
  });

  test('Should validate that the html lang attribute follows the selected language', { tag: '@regression' }, async ({ page, pom }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await pom.cv.switchLangViaUI('en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

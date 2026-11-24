import { test, expect } from '../fixtures/pomBuilder';

test.describe('CV page', () => {
  test.beforeEach(async ({ guestPages }) => {
    await guestPages.cvPage.goto();
  });

  test('Should display the topbar and all 4 nav links', { tag: '@smoke' }, async ({ guestPages }) => {
    await Promise.all([
      expect.soft(guestPages.cvPage.topbar).toBeVisible(),
      expect.soft(guestPages.cvPage.navHome).toBeVisible(),
      expect.soft(guestPages.cvPage.navCv).toBeVisible(),
      expect.soft(guestPages.cvPage.navContact).toBeVisible(),
      expect.soft(guestPages.cvPage.navReports).toBeVisible(),
    ]);
  });

  test('Should display all 6 CV sections in Spanish', { tag: '@smoke' }, async ({ guestPages }) => {
    await Promise.all(guestPages.cvPage.allSections.map((section) => expect.soft(section).toBeVisible()));
  });

  test('Should navigate to the right page from each nav link', { tag: '@smoke' }, async ({ page, guestPages }) => {
    await guestPages.cvPage.navContact.click();
    await expect.soft(page).toHaveURL(/\/contact/);

    await guestPages.cvPage.goto();
    await guestPages.cvPage.navReports.click();
    await expect.soft(page).toHaveURL(/\/reports/);

    await guestPages.cvPage.goto();
    await guestPages.cvPage.navHome.click();
    await expect(page).toHaveURL(/\/$|\/\?/);
  });

  test('Should switch the language to English via the UI', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.cvPage.switchLangViaUI('en');

    await Promise.all([
      expect.soft(guestPages.cvPage.sectionProfile).toContainText('Professional Profile'),
      expect.soft(guestPages.cvPage.sectionExperience).toContainText('Professional Experience'),
      expect.soft(guestPages.cvPage.sectionProjects).toContainText('Selected AI Project'),
      expect.soft(guestPages.cvPage.sectionSkills).toContainText('Technical Skills'),
      expect.soft(guestPages.cvPage.sectionEducation).toContainText('Education'),
      expect.soft(guestPages.cvPage.sectionLanguages).toContainText('Languages'),
    ]);
  });

  test('Should validate that the language persists after a page reload', { tag: '@regression' }, async ({ page, guestPages }) => {
    await guestPages.cvPage.switchLangViaUI('en');
    await page.reload();
    await expect.soft(guestPages.cvPage.topbar).toBeVisible();

    await Promise.all([
      expect.soft(guestPages.cvPage.langBtn).toContainText('EN'),
      expect.soft(guestPages.cvPage.sectionProfile).toContainText('Professional Profile'),
      expect.soft(guestPages.cvPage.sectionExperience).toContainText('Professional Experience'),
    ]);
  });

  test('Should validate that the html lang attribute follows the selected language', { tag: '@regression' }, async ({ page, guestPages }) => {
    await expect.soft(page.locator('html')).toHaveAttribute('lang', 'es');
    await guestPages.cvPage.switchLangViaUI('en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

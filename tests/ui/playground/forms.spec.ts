import { test, expect } from '../fixtures/pomBuilder';

const valid = {
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  country: 'ES',
  gender: 'female',
  interests: ['appraisal', 'framing'],
  birthDate: '1990-05-17',
  collectingYears: '5',
  message: 'Quisiera una tasación.',
  newsletter: true,
};

test.describe('Gallery request form', () => {
  test('Should create a request when every field is valid', { tag: '@smoke' }, async ({ guestPages }) => {
    await guestPages.formsPage.goto();
    await guestPages.formsPage.fill(valid);
    await guestPages.formsPage.terms.check();
    await guestPages.formsPage.submit.click();
    await Promise.all([
      expect.soft(guestPages.formsPage.success).toBeVisible(),
      expect.soft(guestPages.formsPage.receiptId).not.toBeEmpty(),
    ]);
  });

  test('Should validate the empty form shows the required errors', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.formsPage.goto();
    await guestPages.formsPage.submit.click();
    for (const name of ['fullName', 'email', 'country', 'birthDate']) await expect.soft(guestPages.formsPage.fieldError(name)).toBeVisible();
    await expect(guestPages.formsPage.termsError).toBeVisible();
  });

  test('Should validate the terms are mandatory', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.formsPage.goto();
    await guestPages.formsPage.fill(valid);
    await guestPages.formsPage.submit.click();
    await Promise.all([
      expect.soft(guestPages.formsPage.termsError).toBeVisible(),
      expect.soft(guestPages.formsPage.success).toBeHidden(),
    ]);
  });

  test('Should validate an invalid email is rejected', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.formsPage.goto();
    await guestPages.formsPage.fill({ ...valid, email: 'not-an-email' });
    await guestPages.formsPage.terms.check();
    await guestPages.formsPage.submit.click();
    await expect(guestPages.formsPage.fieldError('email')).toBeVisible();
  });

  test('Should validate an underage birth date is rejected', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.formsPage.goto();
    const year = new Date().getFullYear() - 10;
    await guestPages.formsPage.fill({ ...valid, birthDate: `${year}-01-01` });
    await guestPages.formsPage.terms.check();
    await guestPages.formsPage.submit.click();
    await expect(guestPages.formsPage.fieldError('birthDate')).toBeVisible();
  });

  test('Should validate a too long message is rejected', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.formsPage.goto();
    await guestPages.formsPage.fill({ ...valid, message: 'x'.repeat(1200) });
    await guestPages.formsPage.terms.check();
    await guestPages.formsPage.submit.click();
    await expect(guestPages.formsPage.fieldError('message')).toBeVisible();
  });

  test('Should validate interests are multi-select and gender is single-select', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.formsPage.goto();
    await guestPages.formsPage.interest('appraisal').check();
    await guestPages.formsPage.interest('framing').check();
    await Promise.all([
      expect.soft(guestPages.formsPage.interest('appraisal')).toBeChecked(),
      expect.soft(guestPages.formsPage.interest('framing')).toBeChecked(),
    ]);
    await guestPages.formsPage.gender('female').check();
    await guestPages.formsPage.gender('male').check();
    await expect(guestPages.formsPage.gender('female')).not.toBeChecked();
  });

  test('Should create a request with an attached file', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.formsPage.goto();
    await guestPages.formsPage.fill(valid);
    await guestPages.formsPage.attachment.setInputFiles({ name: 'reference.png', mimeType: 'image/png', buffer: Buffer.from('png-bytes') });
    await guestPages.formsPage.terms.check();
    await guestPages.formsPage.submit.click();
    await expect(guestPages.formsPage.success).toBeVisible();
  });

  test('Should validate a disallowed attachment type is rejected', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.formsPage.goto();
    await guestPages.formsPage.fill(valid);
    await guestPages.formsPage.attachment.setInputFiles({ name: 'run.exe', mimeType: 'application/x-msdownload', buffer: Buffer.from('MZ') });
    await guestPages.formsPage.terms.check();
    await guestPages.formsPage.submit.click();
    await expect(guestPages.formsPage.fieldError('attachment')).toBeVisible();
  });

  test('Should display the terms when expanding the link', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.formsPage.goto();
    await guestPages.formsPage.termsToggle.click();
    await expect(guestPages.formsPage.termsPanel).toBeVisible();
  });

  test('Should create a new request after resetting the form', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.formsPage.goto();
    await guestPages.formsPage.fill(valid);
    await guestPages.formsPage.terms.check();
    await guestPages.formsPage.submit.click();
    await guestPages.formsPage.reset.click();
    await Promise.all([
      expect.soft(guestPages.formsPage.field('fullName')).toHaveValue(''),
      expect.soft(guestPages.formsPage.terms).not.toBeChecked(),
    ]);
  });

  test('Should validate the form values are sent in the request payload', { tag: '@regression' }, async ({ page, guestPages }) => {
    await guestPages.formsPage.goto();
    await guestPages.formsPage.fill(valid);
    await guestPages.formsPage.terms.check();
    const request = page.waitForRequest('**/api/forms/submit');
    await guestPages.formsPage.submit.click();
    const payload = (await request).postDataJSON() as Record<string, unknown>;
    expect(payload).toMatchObject({ fullName: 'Ada Lovelace', country: 'ES', interests: ['appraisal', 'framing'], acceptTerms: true, collectingYears: 5 });
  });

  test('Should display an error with the request id when the server fails', { tag: '@regression' }, async ({ page, guestPages }) => {
    await page.route('**/api/forms/submit', (route) =>
      route.fulfill({ status: 503, json: { error: { code: 'CHAOS_FAILURE', message: 'down', requestId: 'req_503' } } }),
    );
    await guestPages.formsPage.goto();
    await guestPages.formsPage.fill(valid);
    await guestPages.formsPage.terms.check();
    await guestPages.formsPage.submit.click();
    await expect(guestPages.formsPage.error).toContainText('req_503');
  });

  test('Should display an error when the response is malformed', { tag: '@regression' }, async ({ page, guestPages }) => {
    await page.route('**/api/forms/submit', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"data": [1, 2,' }),
    );
    await guestPages.formsPage.goto();
    await guestPages.formsPage.fill(valid);
    await guestPages.formsPage.terms.check();
    await guestPages.formsPage.submit.click();
    await Promise.all([
      expect.soft(guestPages.formsPage.success).toBeHidden(),
      expect.soft(guestPages.formsPage.error).toBeVisible(),
    ]);
  });

  test('Should validate the submit button is disabled while the request is in flight', { tag: '@regression' }, async ({ page, guestPages }) => {
    await page.route('**/api/forms/submit', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.continue();
    });
    await guestPages.formsPage.goto();
    await guestPages.formsPage.fill(valid);
    await guestPages.formsPage.terms.check();
    await guestPages.formsPage.submit.click();
    await Promise.all([
      expect.soft(guestPages.formsPage.submit).toBeDisabled(),
      expect.soft(guestPages.formsPage.success).toBeVisible(),
    ]);
  });
});

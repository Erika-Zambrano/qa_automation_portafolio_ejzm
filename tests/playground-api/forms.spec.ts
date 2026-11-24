import { test, expect, type APIRequestContext } from '@playwright/test';
import { expectError, expectFieldError, formBody, json, without, type FormReceipt } from '../../utils/playground-api';

const submit = (request: APIRequestContext, data: unknown) => request.post('/api/forms/submit', { data });

const utcDate = (offsetYears: number, offsetDays = 0) => {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() + offsetYears);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

test.describe('Forms: successful submission', () => {
  test('@smoke a complete request is accepted with 201', async ({ request }) => {
    const response = await submit(request, formBody());
    expect(response.status()).toBe(201);
    const body = await json<FormReceipt>(response);
    expect(body.id).toMatch(/^sub_[0-9a-f]{8}$/);
    expect(new Date(body.receivedAt).getTime()).toBeLessThanOrEqual(Date.now() + 1000);
  });

  test('@sanity the response echoes the normalized data', async ({ request }) => {
    const body = await json<FormReceipt>(await submit(request, formBody()));
    expect(body.data).toEqual({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      country: 'AR',
      gender: 'female',
      interests: ['appraisal', 'framing'],
      birthDate: '1990-05-20',
      collectingYears: 5,
      message: 'Quiero tasar un cuadro.',
      newsletter: true,
      attachment: null,
    });
  });

  test('@regression optional fields get their defaults', async ({ request }) => {
    const data = without(without(formBody(), 'message'), 'newsletter');
    const body = await json<FormReceipt>(await submit(request, data));
    expect(body.data).toMatchObject({ message: null, newsletter: false, attachment: null });
  });

  test('@regression every submission gets a different id', async ({ request }) => {
    const ids = await Promise.all([1, 2, 3, 4].map(async () => (await json<FormReceipt>(await submit(request, formBody()))).id));
    expect(new Set(ids).size).toBe(4);
  });

  test('@regression names are trimmed', async ({ request }) => {
    const body = await json<FormReceipt>(await submit(request, formBody({ fullName: '   Ada Lovelace  ' })));
    expect(body.data.fullName).toBe('Ada Lovelace');
  });

  for (const name of ['José Ángel Núñez', '李小龍', 'Zoë 🎨 Ñandú', 'O\'Brien-Smith']) {
    test(`@regression unicode names are accepted: ${name}`, async ({ request }) => {
      const body = await json<FormReceipt>(await submit(request, formBody({ fullName: name })));
      expect(body.data.fullName).toBe(name);
    });
  }

  for (const [label, value] of [
    ['HTML', '<script>alert(1)</script>'],
    ['SQL', "Robert'); DROP TABLE users;--"],
    ['template', '${7*7} {{7*7}}'],
    ['null byte', 'a\u0000b'],
  ] as const) {
    test(`@regression ${label} payloads in message are stored as inert text`, async ({ request }) => {
      const response = await submit(request, formBody({ message: value }));
      expect(response.status()).toBe(201);
      expect(response.headers()['content-type']).toContain('application/json');
      expect((await json<FormReceipt>(response)).data.message).toBe(value);
    });
  }

  test('@regression a message of exactly 500 characters is accepted', async ({ request }) => {
    expect((await submit(request, formBody({ message: 'm'.repeat(500) }))).status()).toBe(201);
  });

  test('@regression a name of exactly 80 characters is accepted', async ({ request }) => {
    expect((await submit(request, formBody({ fullName: 'n'.repeat(80) }))).status()).toBe(201);
  });

  test('@regression every valid interest and every combination size is accepted', async ({ request }) => {
    const all = ['information', 'appraisal', 'commission', 'framing', 'shipping'];
    for (let size = 1; size <= 5; size += 1) {
      const response = await submit(request, formBody({ interests: all.slice(0, size) }));
      expect(response.status(), `size ${size}`).toBe(201);
    }
  });

  for (const country of ['AR', 'BR', 'CL', 'CO', 'MX', 'US', 'ES']) {
    test(`@regression country ${country} is accepted`, async ({ request }) => {
      expect((await submit(request, formBody({ country }))).status()).toBe(201);
    });
  }

  for (const gender of ['female', 'male', 'nonbinary', 'undisclosed']) {
    test(`@regression gender ${gender} is accepted`, async ({ request }) => {
      expect((await submit(request, formBody({ gender }))).status()).toBe(201);
    });
  }

  test('@regression collectingYears boundaries 0 and 60 are accepted', async ({ request }) => {
    expect((await submit(request, formBody({ collectingYears: 0 }))).status()).toBe(201);
    expect((await submit(request, formBody({ collectingYears: 60 }))).status()).toBe(201);
  });

  test('@regression a leap day birth date is accepted', async ({ request }) => {
    expect((await submit(request, formBody({ birthDate: '1992-02-29' }))).status()).toBe(201);
  });

  test('@regression a person who turns 18 today is accepted and one who turns 18 tomorrow is not', async ({ request }) => {
    expect((await submit(request, formBody({ birthDate: utcDate(-18) }))).status()).toBe(201);
    await expectFieldError(await submit(request, formBody({ birthDate: utcDate(-18, 1) })), 422, 'birthDate', 'UNDERAGE');
  });
});

test.describe('Forms: validation', () => {
  const cases: Array<[string, Record<string, unknown>, string, string]> = [
    ['missing fullName', without(formBody(), 'fullName'), 'fullName', 'REQUIRED'],
    ['blank fullName', formBody({ fullName: '   ' }), 'fullName', 'REQUIRED'],
    ['one-letter fullName', formBody({ fullName: 'A' }), 'fullName', 'TOO_SHORT'],
    ['81-char fullName', formBody({ fullName: 'n'.repeat(81) }), 'fullName', 'TOO_LONG'],
    ['fullName as number', formBody({ fullName: 123 }), 'fullName', 'INVALID_TYPE'],
    ['missing email', without(formBody(), 'email'), 'email', 'REQUIRED'],
    ['email without at', formBody({ email: 'ada.example.com' }), 'email', 'INVALID_FORMAT'],
    ['email without domain dot', formBody({ email: 'ada@example' }), 'email', 'INVALID_FORMAT'],
    ['email with spaces', formBody({ email: 'ada lovelace@example.com' }), 'email', 'INVALID_FORMAT'],
    ['email with one-letter tld', formBody({ email: 'ada@example.c' }), 'email', 'INVALID_FORMAT'],
    ['email too long', formBody({ email: `${'a'.repeat(115)}@x.com` }), 'email', 'TOO_LONG'],
    ['missing country', without(formBody(), 'country'), 'country', 'REQUIRED'],
    ['unknown country', formBody({ country: 'FR' }), 'country', 'INVALID_OPTION'],
    ['lowercase country', formBody({ country: 'ar' }), 'country', 'INVALID_OPTION'],
    ['missing gender', without(formBody(), 'gender'), 'gender', 'REQUIRED'],
    ['unknown gender', formBody({ gender: 'other' }), 'gender', 'INVALID_OPTION'],
    ['missing interests', without(formBody(), 'interests'), 'interests', 'REQUIRED'],
    ['empty interests', formBody({ interests: [] }), 'interests', 'OUT_OF_RANGE'],
    ['interests as string', formBody({ interests: 'appraisal' }), 'interests', 'INVALID_TYPE'],
    ['interests with numbers', formBody({ interests: [1, 2] }), 'interests', 'INVALID_TYPE'],
    ['unknown interest', formBody({ interests: ['sculpture'] }), 'interests', 'INVALID_OPTION'],
    ['duplicate interests', formBody({ interests: ['framing', 'framing'] }), 'interests', 'DUPLICATE_ITEM'],
    ['six interests', formBody({ interests: ['information', 'appraisal', 'commission', 'framing', 'shipping', 'information'] }), 'interests', 'OUT_OF_RANGE'],
    ['missing birthDate', without(formBody(), 'birthDate'), 'birthDate', 'REQUIRED'],
    ['birthDate in DD-MM-YYYY', formBody({ birthDate: '20-05-1990' }), 'birthDate', 'INVALID_FORMAT'],
    ['birthDate with slashes', formBody({ birthDate: '1990/05/20' }), 'birthDate', 'INVALID_FORMAT'],
    ['birthDate text', formBody({ birthDate: 'yesterday' }), 'birthDate', 'INVALID_FORMAT'],
    ['birthDate with time', formBody({ birthDate: '1990-05-20T00:00:00Z' }), 'birthDate', 'INVALID_FORMAT'],
    ['birthDate month 13', formBody({ birthDate: '1990-13-01' }), 'birthDate', 'INVALID_DATE'],
    ['birthDate February 30', formBody({ birthDate: '1990-02-30' }), 'birthDate', 'INVALID_DATE'],
    ['birthDate February 29 on a non-leap year', formBody({ birthDate: '1993-02-29' }), 'birthDate', 'INVALID_DATE'],
    ['birthDate day 00', formBody({ birthDate: '1990-05-00' }), 'birthDate', 'INVALID_DATE'],
    ['birthDate in the future', formBody({ birthDate: '2999-01-01' }), 'birthDate', 'UNDERAGE'],
    ['birthDate 10 years ago', formBody({ birthDate: utcDate(-10) }), 'birthDate', 'UNDERAGE'],
    ['missing collectingYears', without(formBody(), 'collectingYears'), 'collectingYears', 'REQUIRED'],
    ['collectingYears negative', formBody({ collectingYears: -1 }), 'collectingYears', 'OUT_OF_RANGE'],
    ['collectingYears above 60', formBody({ collectingYears: 61 }), 'collectingYears', 'OUT_OF_RANGE'],
    ['collectingYears as string', formBody({ collectingYears: '5' }), 'collectingYears', 'INVALID_TYPE'],
    ['collectingYears float', formBody({ collectingYears: 5.5 }), 'collectingYears', 'INVALID_TYPE'],
    ['message too long', formBody({ message: 'm'.repeat(501) }), 'message', 'TOO_LONG'],
    ['message as number', formBody({ message: 5 }), 'message', 'INVALID_TYPE'],
    ['newsletter as string', formBody({ newsletter: 'yes' }), 'newsletter', 'INVALID_TYPE'],
    ['newsletter as number', formBody({ newsletter: 1 }), 'newsletter', 'INVALID_TYPE'],
    ['missing acceptTerms', without(formBody(), 'acceptTerms'), 'acceptTerms', 'REQUIRED'],
    ['acceptTerms false', formBody({ acceptTerms: false }), 'acceptTerms', 'TERMS_NOT_ACCEPTED'],
    ['acceptTerms as string', formBody({ acceptTerms: 'true' }), 'acceptTerms', 'INVALID_TYPE'],
    ['acceptTerms as number', formBody({ acceptTerms: 1 }), 'acceptTerms', 'INVALID_TYPE'],
    ['unknown field', formBody({ role: 'admin' }), 'role', 'UNKNOWN_FIELD'],
    ['legacy experienceYears field', formBody({ experienceYears: 5 }), 'experienceYears', 'UNKNOWN_FIELD'],
  ];

  for (const [label, data, field, code] of cases) {
    test(`@regression ${label} returns 422 ${field}:${code}`, async ({ request }) => {
      await expectFieldError(await submit(request, data), 422, field, code);
    });
  }

  test('@regression an empty object reports every required field at once', async ({ request }) => {
    const error = await expectError(await submit(request, {}), 422, 'VALIDATION_ERROR');
    const fields = error.details?.map((d) => d.field) ?? [];
    expect(fields).toEqual(expect.arrayContaining(['fullName', 'email', 'country', 'gender', 'interests', 'birthDate', 'collectingYears', 'acceptTerms']));
    expect(error.details?.every((d) => d.code === 'REQUIRED')).toBe(true);
  });

  test('@regression a rejected submission does not return an id', async ({ request }) => {
    const body = await json<{ id?: string; error: { code: string } }>(await submit(request, formBody({ acceptTerms: false })));
    expect(body.id).toBeUndefined();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  test('@regression a non-object body returns 400', async ({ request }) => {
    const response = await request.post('/api/forms/submit', { headers: { 'Content-Type': 'application/json' }, data: Buffer.from('"hello"') });
    await expectFieldError(response, 400, 'body', 'INVALID_TYPE');
  });
});

test.describe('Forms: attachment', () => {
  const file = (overrides: Record<string, unknown> = {}) => ({ name: 'reference.png', size: 1024, type: 'image/png', ...overrides });

  for (const type of ['image/png', 'image/jpeg', 'application/pdf']) {
    test(`@regression a ${type} attachment is accepted and echoed`, async ({ request }) => {
      const response = await submit(request, formBody({ attachment: file({ type }) }));
      expect(response.status()).toBe(201);
      expect((await json<FormReceipt>(response)).data.attachment).toEqual(file({ type }));
    });
  }

  test('@regression size boundaries: 1 byte and exactly 2 MB are accepted', async ({ request }) => {
    expect((await submit(request, formBody({ attachment: file({ size: 1 }) }))).status()).toBe(201);
    expect((await submit(request, formBody({ attachment: file({ size: 2 * 1024 * 1024 }) }))).status()).toBe(201);
  });

  const cases: Array<[string, unknown, string, string]> = [
    ['size above 2 MB', file({ size: 2 * 1024 * 1024 + 1 }), 'attachment.size', 'OUT_OF_RANGE'],
    ['size zero', file({ size: 0 }), 'attachment.size', 'OUT_OF_RANGE'],
    ['negative size', file({ size: -1 }), 'attachment.size', 'OUT_OF_RANGE'],
    ['size as string', file({ size: '10' }), 'attachment.size', 'INVALID_TYPE'],
    ['size as float', file({ size: 10.5 }), 'attachment.size', 'INVALID_TYPE'],
    ['gif type', file({ type: 'image/gif' }), 'attachment.type', 'INVALID_OPTION'],
    ['executable type', file({ type: 'application/x-msdownload' }), 'attachment.type', 'INVALID_OPTION'],
    ['uppercase type', file({ type: 'IMAGE/PNG' }), 'attachment.type', 'INVALID_OPTION'],
    ['path traversal name', file({ name: '../../etc/passwd' }), 'attachment.name', 'INVALID_FORMAT'],
    ['name with slash', file({ name: 'folder/file.png' }), 'attachment.name', 'INVALID_FORMAT'],
    ['name with backslash', file({ name: 'folder\\file.png' }), 'attachment.name', 'INVALID_FORMAT'],
    ['name too long', file({ name: `${'a'.repeat(121)}.png` }), 'attachment.name', 'TOO_LONG'],
    ['missing name', without(file(), 'name'), 'attachment.name', 'REQUIRED'],
    ['missing size', without(file(), 'size'), 'attachment.size', 'REQUIRED'],
    ['missing type', without(file(), 'type'), 'attachment.type', 'REQUIRED'],
    ['unknown attachment field', file({ path: '/tmp/x' }), 'attachment.path', 'UNKNOWN_FIELD'],
    ['attachment as string', 'reference.png', 'attachment', 'INVALID_TYPE'],
    ['attachment as array', [file()], 'attachment', 'INVALID_TYPE'],
  ];
  for (const [label, attachment, field, code] of cases) {
    test(`@regression attachment ${label} returns 422 ${field}:${code}`, async ({ request }) => {
      await expectFieldError(await submit(request, formBody({ attachment })), 422, field, code);
    });
  }
});

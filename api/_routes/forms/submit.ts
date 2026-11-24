import { randomUUID } from 'node:crypto';
import { COUNTRIES, GENDERS, INTERESTS } from '../../_lib/data';
import { Issues } from '../../_lib/errors';
import { route } from '../../_lib/http';
import { EMAIL_PATTERN, asObject, bool, int, isObj, rejectUnknown, str } from '../../_lib/validate';

const ATTACHMENT_TYPES = ['image/png', 'image/jpeg', 'application/pdf'] as const;
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;

function validBirthDate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? undefined : date;
}

export default route({
  POST: (ctx) => {
    const issues = new Issues();
    const body = asObject(ctx.body, issues);
    rejectUnknown(body, ['fullName', 'email', 'country', 'gender', 'interests', 'birthDate', 'collectingYears', 'message', 'newsletter', 'acceptTerms', 'attachment'], issues);
    const fullName = str(body, 'fullName', issues, { min: 2, max: 80 });
    const email = str(body, 'email', issues, { max: 120, pattern: EMAIL_PATTERN });
    const country = str(body, 'country', issues, { oneOf: COUNTRIES });
    const gender = str(body, 'gender', issues, { oneOf: GENDERS });
    const collectingYears = int(body, 'collectingYears', issues, { min: 0, max: 60 });
    const message = str(body, 'message', issues, { required: false, max: 500 });
    const newsletter = bool(body, 'newsletter', issues, false);
    const accepted = bool(body, 'acceptTerms', issues);
    if (accepted === false) issues.add('acceptTerms', 'TERMS_NOT_ACCEPTED', 'You must accept the terms and conditions');

    const birthDateRaw = str(body, 'birthDate', issues, { pattern: /^\d{4}-\d{2}-\d{2}$/ });
    if (birthDateRaw && /^\d{4}-\d{2}-\d{2}$/.test(birthDateRaw)) {
      const birth = validBirthDate(birthDateRaw);
      if (!birth) {
        issues.add('birthDate', 'INVALID_DATE', 'birthDate is not a real calendar date');
      } else {
        const adult = new Date();
        adult.setUTCFullYear(adult.getUTCFullYear() - 18);
        if (birth > adult) issues.add('birthDate', 'UNDERAGE', 'You must be at least 18 years old');
      }
    }

    let interests: string[] = [];
    if (body.interests === undefined) {
      issues.add('interests', 'REQUIRED', 'interests is required');
    } else if (!Array.isArray(body.interests) || body.interests.some((i) => typeof i !== 'string')) {
      issues.add('interests', 'INVALID_TYPE', 'interests must be an array of strings');
    } else {
      interests = body.interests as string[];
      if (interests.length < 1 || interests.length > 5) issues.add('interests', 'OUT_OF_RANGE', 'Select between 1 and 5 interests');
      if (new Set(interests).size !== interests.length) issues.add('interests', 'DUPLICATE_ITEM', 'interests must not contain duplicates');
      for (const interest of interests) {
        if (!(INTERESTS as readonly string[]).includes(interest)) issues.add('interests', 'INVALID_OPTION', `Unknown interest "${interest}"`);
      }
    }

    let attachment: { name: string; size: number; type: string } | undefined;
    if (body.attachment !== undefined) {
      if (!isObj(body.attachment)) {
        issues.add('attachment', 'INVALID_TYPE', 'attachment must be an object');
      } else {
        const a = body.attachment;
        rejectUnknown(a, ['name', 'size', 'type'], issues, 'attachment.');
        const name = str(a, 'name', issues, { max: 120, pattern: /^[^/\\]+$/ }, 'attachment.');
        const size = int(a, 'size', issues, { min: 1, max: MAX_ATTACHMENT_BYTES }, 'attachment.');
        const type = str(a, 'type', issues, { oneOf: ATTACHMENT_TYPES }, 'attachment.');
        if (name && size !== undefined && type) attachment = { name, size, type };
      }
    }

    issues.throwIfAny(422);
    return {
      status: 201,
      body: {
        id: `sub_${randomUUID().slice(0, 8)}`,
        receivedAt: new Date().toISOString(),
        data: { fullName, email: email!.toLowerCase(), country, gender, interests, birthDate: birthDateRaw, collectingYears, message: message ?? null, newsletter: newsletter ?? false, attachment: attachment ?? null },
      },
    };
  },
});

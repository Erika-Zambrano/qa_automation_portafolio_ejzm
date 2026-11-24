import { USERS, userId } from '../_lib/data';
import { ApiError, Issues } from '../_lib/errors';
import { route } from '../_lib/http';
import { DEFAULT_TTL_SECONDS, signToken } from '../_lib/jwt';
import { rateLimit } from '../_lib/ratelimit';
import { EMAIL_PATTERN, asObject, bool, rejectUnknown, str } from '../_lib/validate';

const PASSWORD_RULES: Array<[RegExp, string]> = [
  [/[a-z]/, 'a lowercase letter'],
  [/[A-Z]/, 'an uppercase letter'],
  [/\d/, 'a digit'],
  [/[^A-Za-z0-9]/, 'a symbol'],
];

export default route({
  POST: (ctx) => {
    const limitHeaders = rateLimit(ctx, 'register', 10);
    const issues = new Issues();
    const body = asObject(ctx.body, issues);
    rejectUnknown(body, ['name', 'email', 'password', 'confirmPassword', 'acceptTerms', 'termsVersion'], issues);
    const name = str(body, 'name', issues, { min: 2, max: 60 });
    const email = str(body, 'email', issues, { max: 120, pattern: EMAIL_PATTERN });
    const password = str(body, 'password', issues, { min: 8, max: 72, trim: false });
    const confirm = str(body, 'confirmPassword', issues, { trim: false });
    const accepted = bool(body, 'acceptTerms', issues);
    str(body, 'termsVersion', issues, { required: false, max: 16 });
    if (password) {
      for (const [rule, label] of PASSWORD_RULES) {
        if (!rule.test(password)) issues.add('password', 'WEAK_PASSWORD', `password must contain ${label}`);
      }
      if (confirm !== undefined && confirm !== password) issues.add('confirmPassword', 'MISMATCH', 'confirmPassword does not match password');
    }
    if (accepted === false) issues.add('acceptTerms', 'TERMS_NOT_ACCEPTED', 'You must accept the terms and conditions');
    issues.throwIfAny();
    if (USERS.some((u) => u.email.toLowerCase() === email!.toLowerCase())) {
      throw new ApiError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
    }
    const user = { id: userId(email!), name: name!, email: email!.toLowerCase(), role: 'user' as const };
    const token = signToken({ sub: user.id, email: user.email, name: user.name, role: user.role });
    return { status: 201, body: { user, token, expiresIn: DEFAULT_TTL_SECONDS }, headers: { ...limitHeaders, Location: '/api/auth/me' } };
  },
});

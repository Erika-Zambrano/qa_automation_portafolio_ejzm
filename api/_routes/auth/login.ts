import { USERS } from '../../_lib/data';
import { ApiError, Issues } from '../../_lib/errors';
import { route } from '../../_lib/http';
import { DEFAULT_TTL_SECONDS, signToken } from '../../_lib/jwt';
import { rateLimit } from '../../_lib/ratelimit';
import { asObject, int, rejectUnknown, str } from '../../_lib/validate';

export default route({
  POST: (ctx) => {
    const limitHeaders = rateLimit(ctx, 'login', 5);
    const issues = new Issues();
    const body = asObject(ctx.body, issues);
    rejectUnknown(body, ['email', 'password', 'ttl'], issues);
    const email = str(body, 'email', issues, { max: 120 });
    const password = str(body, 'password', issues, { max: 72, trim: false });
    const ttl = int(body, 'ttl', issues, { required: false, min: 1, max: 3600 });
    issues.throwIfAny();
    const user = USERS.find((u) => u.email === email!.toLowerCase());
    if (!user || user.password !== password) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password', undefined, limitHeaders);
    }
    if (user.locked) throw new ApiError(423, 'ACCOUNT_LOCKED', 'This account is locked', undefined, limitHeaders);
    const expiresIn = ttl ?? DEFAULT_TTL_SECONDS;
    const token = signToken({ sub: user.id, email: user.email, name: user.name, role: user.role }, expiresIn);
    return {
      status: 200,
      body: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token, expiresIn },
      headers: limitHeaders,
    };
  },
});

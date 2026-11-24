import { route } from '../../_lib/http';
import { requireAuth } from '../../_lib/jwt';

export default route({
  GET: (ctx) => {
    const auth = requireAuth(ctx);
    return {
      status: 200,
      body: { user: { id: auth.sub, name: auth.name, email: auth.email, role: auth.role }, expiresAt: new Date(auth.exp * 1000).toISOString() },
    };
  },
});

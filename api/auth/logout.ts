import { route } from '../_lib/http';
import { requireAuth } from '../_lib/jwt';

export default route({
  POST: (ctx) => {
    requireAuth(ctx);
    return { status: 204 };
  },
});

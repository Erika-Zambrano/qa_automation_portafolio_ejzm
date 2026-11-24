import { ApiError } from '../../_lib/errors';
import { route } from '../../_lib/http';
import { requireAuth } from '../../_lib/jwt';
import { decodeOrderId } from '../../_lib/orders';

export default route({
  GET: (ctx) => {
    const auth = requireAuth(ctx);
    const id = ctx.query.id ?? '';
    const order = decodeOrderId(id);
    if (order.userId !== auth.sub && auth.role !== 'admin') {
      throw new ApiError(403, 'FORBIDDEN', 'You do not have access to this order');
    }
    return { status: 200, body: { data: { id, ...order, userId: undefined } } };
  },
});

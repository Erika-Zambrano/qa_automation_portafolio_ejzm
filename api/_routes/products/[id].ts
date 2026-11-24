import { ApiError } from '../../_lib/errors';
import { route } from '../../_lib/http';
import { findProduct } from '../../_lib/inventory';

export default route({
  GET: (ctx) => {
    if (!/^\d+$/.test(ctx.query.id ?? '')) throw new ApiError(400, 'INVALID_ID', 'Product id must be a positive integer');
    const product = findProduct(Number(ctx.query.id));
    if (!product) throw new ApiError(404, 'PRODUCT_NOT_FOUND', `Product ${ctx.query.id} does not exist`);
    return { status: 200, body: { data: product } };
  },
});

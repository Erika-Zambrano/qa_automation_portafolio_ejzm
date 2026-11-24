import { Issues } from '../../_lib/errors';
import { route } from '../../_lib/http';
import { parseCoupon, parseItems, parseShipping, price } from '../../_lib/pricing';
import { asObject, rejectUnknown } from '../../_lib/validate';

export default route({
  POST: (ctx) => {
    const issues = new Issues();
    const body = asObject(ctx.body, issues);
    rejectUnknown(body, ['items', 'coupon', 'shippingMethod'], issues);
    const items = parseItems(body.items, issues);
    const coupon = parseCoupon(body, issues);
    const method = parseShipping(body, issues);
    issues.throwIfAny();
    return { status: 200, body: price(items, coupon, method) };
  },
});

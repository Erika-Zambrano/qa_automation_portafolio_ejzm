import { route } from '../_lib/http';
import { resetRateLimits } from '../_lib/ratelimit';
import { resetIdempotency } from '../_lib/idempotency';
import { resetInventory } from '../_lib/inventory';

export default route({
  POST: () => {
    resetRateLimits();
    resetIdempotency();
    resetInventory();
    return { status: 204 };
  },
});

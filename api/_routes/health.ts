import { route } from '../_lib/http';

export default route({
  GET: () => ({
    status: 200,
    body: { status: 'ok', service: 'qa-playground', time: new Date().toISOString() },
  }),
});

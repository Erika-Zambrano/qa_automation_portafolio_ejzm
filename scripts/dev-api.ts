import { createServer } from 'node:http';
import { dispatch } from '../api/_lib/router';

const PORT = Number(process.env.PORT ?? 3100);

createServer((req, res) => {
  void dispatch(req, res);
}).listen(PORT, () => {
  console.log(`qa-playground api listening on http://localhost:${PORT}`);
});

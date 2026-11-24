import { createServer } from 'node:http';
import { readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

type Entry = { regex: RegExp; keys: string[]; file: string; dynamic: number };

const API_DIR = resolve(__dirname, '..', 'api');
const PORT = Number(process.env.PORT ?? 3100);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name.startsWith('_') ? [] : walk(full);
    return full.endsWith('.ts') ? [full] : [];
  });
}

const routes: Entry[] = walk(API_DIR)
  .map((file) => {
    const segments = relative(API_DIR, file).replace(/\.ts$/, '').split(sep);
    if (segments[segments.length - 1] === 'index') segments.pop();
    const keys: string[] = [];
    const pattern = segments
      .map((segment) => {
        const match = /^\[(.+)\]$/.exec(segment);
        if (!match) return segment.replace(/[.*+?^${}()|\\]/g, '\\$&');
        keys.push(match[1]);
        return '([^/]+)';
      })
      .join('/');
    return { regex: new RegExp(`^/api/${pattern}/?$`), keys, file, dynamic: keys.length };
  })
  .sort((a, b) => a.dynamic - b.dynamic);

createServer(async (req, res) => {
  const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
  for (const entry of routes) {
    const match = entry.regex.exec(pathname);
    if (!match) continue;
    const query: Record<string, string> = {};
    entry.keys.forEach((key, index) => {
      query[key] = decodeURIComponent(match[index + 1]);
    });
    (req as typeof req & { query: Record<string, string> }).query = query;
    const mod = await import(entry.file);
    await mod.default(req, res);
    return;
  }
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: `No route for ${pathname}` } }));
}).listen(PORT, () => {
  console.log(`qa-playground api listening on http://localhost:${PORT}`);
});

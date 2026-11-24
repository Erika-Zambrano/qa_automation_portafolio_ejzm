import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

type PwTest = { status: string; results: Array<{ duration: number; status: string }>; projectName: string };
type PwSpec = { title: string; tests: PwTest[] };
type PwSuite = { title: string; file?: string; specs?: PwSpec[]; suites?: PwSuite[] };

const INPUT = resolve(__dirname, '../playwright-results.json');
const OUTPUT = resolve(__dirname, '../web/src/data/ci-results.json');
const HISTORY_LIMIT = 30;

if (!existsSync(INPUT)) {
  console.error(`No existe ${INPUT}. Ejecuta primero: npx playwright test`);
  process.exit(1);
}

const report = JSON.parse(readFileSync(INPUT, 'utf8')) as { suites: PwSuite[]; stats: { duration: number; startTime: string } };

type Row = { file: string; title: string; project: string; status: string; duration: number; tags: string[] };
const rows: Row[] = [];

function walk(suite: PwSuite, file: string): void {
  const current = suite.file ?? file;
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests) {
      const last = test.results[test.results.length - 1];
      rows.push({
        file: current,
        title: spec.title.replace(/@\w+\s*/g, '').trim(),
        project: test.projectName,
        status: test.status === 'expected' ? 'passed' : test.status === 'flaky' ? 'flaky' : test.status === 'skipped' ? 'skipped' : 'failed',
        duration: last?.duration ?? 0,
        tags: spec.title.match(/@\w+/g) ?? [],
      });
    }
  }
  for (const child of suite.suites ?? []) walk(child, current);
}

report.suites.forEach((s) => walk(s, s.file ?? ''));

const count = (status: string): number => rows.filter((r) => r.status === status).length;
const files = [...new Set(rows.map((r) => r.file))].map((file) => {
  const own = rows.filter((r) => r.file === file);
  return {
    file,
    total: own.length,
    passed: own.filter((r) => r.status === 'passed').length,
    failed: own.filter((r) => r.status === 'failed').length,
    flaky: own.filter((r) => r.status === 'flaky').length,
    duration: own.reduce((s, r) => s + r.duration, 0),
    tags: [...new Set(own.flatMap((r) => r.tags))],
  };
});

const run = {
  generatedAt: new Date().toISOString(),
  commit: process.env.GITHUB_SHA?.slice(0, 7) ?? null,
  total: rows.length,
  passed: count('passed'),
  failed: count('failed'),
  flaky: count('flaky'),
  skipped: count('skipped'),
  wallDuration: Math.round(report.stats.duration),
};

let history: typeof run[] = [];
if (existsSync(OUTPUT)) {
  history = (JSON.parse(readFileSync(OUTPUT, 'utf8')).history ?? []) as typeof run[];
}
history = [...history, run].slice(-HISTORY_LIMIT);

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, JSON.stringify({ latest: run, files, tests: rows, history }, null, 2));
console.log(`Resumen guardado: ${run.passed}/${run.total} passed, ${run.failed} failed, ${run.flaky} flaky`);

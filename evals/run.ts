import Anthropic from '@anthropic-ai/sdk';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { CASES, SYSTEM_PROMPT, type EvalCase } from './cases';
import type { CheckResult } from './checks';

const SUBJECT_MODEL = process.env.EVAL_SUBJECT_MODEL ?? 'claude-haiku-5-5';
const JUDGE_MODEL = process.env.EVAL_JUDGE_MODEL ?? 'claude-sonnet-5-5';
const RUNS = Number(process.env.EVAL_RUNS ?? 3);
const JUDGE_PASS_SCORE = 4;
const OUTPUT = resolve(__dirname, '../web/src/data/eval-results.json');

type Judge = { score: number; reason: string };
type Run = { output: string; checks: CheckResult[]; judge: Judge; pass: boolean };

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY no está definida. Exporta la variable y vuelve a ejecutar.');
  process.exit(1);
}

const client = new Anthropic();

async function ask(model: string, system: string, content: string, maxTokens: number): Promise<string> {
  const res = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content }],
  });
  return res.content.map((block) => (block.type === 'text' ? block.text : '')).join('').trim();
}

async function judge(testCase: EvalCase, output: string): Promise<Judge> {
  const system = 'You are a strict QA evaluator of an English-tutor LLM. Reply ONLY with JSON: {"score": 1-5, "reason": "<one short sentence>"}.';
  const prompt = `Rubric:\n${testCase.rubric}\n\nLearner input:\n${testCase.input}\n\nTutor output:\n${output}`;
  const raw = await ask(JUDGE_MODEL, system, prompt, 200);
  try {
    const parsed = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)) as { score: unknown; reason: unknown };
    return { score: Number(parsed.score), reason: String(parsed.reason) };
  } catch {
    return { score: 1, reason: 'Respuesta del juez no parseable' };
  }
}

async function runCase(testCase: EvalCase): Promise<Run[]> {
  const runs: Run[] = [];
  for (let i = 0; i < RUNS; i++) {
    const output = await ask(SUBJECT_MODEL, SYSTEM_PROMPT, testCase.input, 400);
    const checks = testCase.checks.map((check) => check(output));
    const verdict = await judge(testCase, output);
    const pass = checks.every((c) => c.pass) && verdict.score >= JUDGE_PASS_SCORE;
    runs.push({ output, checks, judge: verdict, pass });
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${testCase.id}  run ${i + 1}/${RUNS}  judge=${verdict.score}`);
  }
  return runs;
}

async function main(): Promise<void> {
  const cases = [];
  for (const testCase of CASES) {
    const runs = await runCase(testCase);
    const passRate = runs.filter((r) => r.pass).length / runs.length;
    cases.push({
      id: testCase.id,
      title: testCase.title,
      category: testCase.category,
      input: testCase.input,
      passRate,
      avgJudge: runs.reduce((s, r) => s + r.judge.score, 0) / runs.length,
      runs,
    });
  }

  const allRuns = cases.flatMap((c) => c.runs);
  const result = {
    generatedAt: new Date().toISOString(),
    subjectModel: SUBJECT_MODEL,
    judgeModel: JUDGE_MODEL,
    runsPerCase: RUNS,
    judgePassScore: JUDGE_PASS_SCORE,
    summary: {
      cases: cases.length,
      totalRuns: allRuns.length,
      passRate: allRuns.filter((r) => r.pass).length / allRuns.length,
      avgJudge: allRuns.reduce((s, r) => s + r.judge.score, 0) / allRuns.length,
      deterministicChecks: allRuns.reduce((s, r) => s + r.checks.length, 0),
      deterministicPassed: allRuns.reduce((s, r) => s + r.checks.filter((c) => c.pass).length, 0),
    },
    cases,
  };

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(result, null, 2));
  console.log(`\nResultados guardados en ${OUTPUT}`);
  console.log(`Pass rate global: ${(result.summary.passRate * 100).toFixed(1)}%`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

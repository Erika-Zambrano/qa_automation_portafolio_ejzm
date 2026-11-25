import { useMemo, useState } from 'react';
import {
  Accordion,
  Alert,
  Badge,
  Box,
  Card,
  Code,
  Heading,
  HStack,
  Input,
  Link,
  Progress,
  SimpleGrid,
  Span,
  Stack,
  Stat,
  Table,
  Tabs,
  Text,
} from '@chakra-ui/react';

type CheckResult = { id: string; pass: boolean; detail: string };
type EvalRun = { output: string; checks: CheckResult[]; judge: { score: number; reason: string }; pass: boolean };
type EvalCase = { id: string; title: string; category: string; input: string; passRate: number; avgJudge: number; runs: EvalRun[] };
export type EvalData = {
  generatedAt: string;
  subjectModel: string;
  judgeModel: string;
  runsPerCase: number;
  judgePassScore: number;
  summary: { cases: number; totalRuns: number; passRate: number; avgJudge: number; deterministicChecks: number; deterministicPassed: number };
  cases: EvalCase[];
};

type CiRun = { generatedAt: string; commit: string | null; trigger?: string; runUrl?: string | null; total: number; passed: number; failed: number; flaky: number; skipped: number; wallDuration: number };
type CiFile = { file: string; total: number; passed: number; failed: number; flaky: number; duration: number; tags: string[] };
type CiTest = { file: string; title: string; project: string; status: string; duration: number; tags: string[] };
type CiProject = { name: string; total: number; passed: number; failed: number; flaky: number; duration: number };
export type CiData = { latest: CiRun; projects?: CiProject[]; files: CiFile[]; tests: CiTest[]; history: CiRun[] };

type Props = { lang: 'es' | 'en'; evalData: EvalData | null; ciData: CiData | null };

const copy = {
  es: {
    tabEval: 'Evaluación de IA',
    tabCi: 'Tests en CI',
    recorded: 'Resultados grabados',
    recordedDesc: 'Las ejecuciones se corren en CI o en local y se guardan como JSON versionado. Esta página solo los lee: sin llamadas a la API en vivo.',
    passRate: 'Pass rate',
    judge: 'Puntaje del juez',
    cases: 'Casos',
    runs: 'Ejecuciones',
    checks: 'Checks deterministas',
    subject: 'Modelo evaluado',
    judgeModel: 'Modelo juez',
    generated: 'Generado',
    input: 'Entrada',
    output: 'Salida del modelo',
    verdict: 'Veredicto del juez',
    emptyEvalTitle: 'Resultados de evaluación próximamente',
    emptyEvalDesc: 'El arnés evalúa un tutor conversacional con casos golden, checks deterministas y un juez LLM. El código está en la carpeta evals/ del repositorio; los resultados aparecerán aquí cuando se grabe una ejecución.',
    emptyCi: 'Aún no hay resultados de CI. Ejecuta npx playwright test y npm run report:summarize.',
    total: 'Total',
    passed: 'Pasaron',
    failed: 'Fallaron',
    flaky: 'Flaky',
    duration: 'Duración',
    suite: 'Suite',
    tests: 'Tests',
    status: 'Estado',
    test: 'Test',
    project: 'Proyecto',
    byProject: 'Por proyecto',
    allTests: 'Todos los tests',
    searchTests: 'Buscar por nombre…',
    allProjects: 'Todos los proyectos',
    allStatuses: 'Todos los estados',
    showing: 'Mostrando',
    of: 'de',
    noMatches: 'Ningún test coincide con los filtros.',
    lastRun: 'Última corrida',
    nextRun: 'Próxima corrida programada',
    scheduleNote: 'Corre automáticamente dos veces al día (06:00 y 18:00 UTC) en GitHub Actions.',
    viewRun: 'Ver corrida en GitHub',
    triggerSchedule: 'programada',
    triggerManual: 'manual',
    triggerOther: 'automática',
    tags: 'Tags',
    failing: 'Tests que fallan',
    noFailing: 'Ningún test falla en la última ejecución.',
    category: { correction: 'Corrección', 'no-op': 'Sin error', interference: 'Interferencia', guardrail: 'Guardarraíl' } as Record<string, string>,
  },
  en: {
    tabEval: 'AI evaluation',
    tabCi: 'CI tests',
    recorded: 'Recorded results',
    recordedDesc: 'Runs happen in CI or locally and are saved as versioned JSON. This page only reads them: no live API calls.',
    passRate: 'Pass rate',
    judge: 'Judge score',
    cases: 'Cases',
    runs: 'Runs',
    checks: 'Deterministic checks',
    subject: 'Evaluated model',
    judgeModel: 'Judge model',
    generated: 'Generated',
    input: 'Input',
    output: 'Model output',
    verdict: 'Judge verdict',
    emptyEvalTitle: 'Evaluation results coming soon',
    emptyEvalDesc: 'The harness evaluates a conversational tutor with golden cases, deterministic checks and an LLM judge. The code lives in the repository evals/ folder; results will appear here once a run is recorded.',
    emptyCi: 'No CI results yet. Run npx playwright test and npm run report:summarize.',
    total: 'Total',
    passed: 'Passed',
    failed: 'Failed',
    flaky: 'Flaky',
    duration: 'Duration',
    suite: 'Suite',
    tests: 'Tests',
    status: 'Status',
    test: 'Test',
    project: 'Project',
    byProject: 'By project',
    allTests: 'All tests',
    searchTests: 'Search by name…',
    allProjects: 'All projects',
    allStatuses: 'All statuses',
    showing: 'Showing',
    of: 'of',
    noMatches: 'No tests match the filters.',
    lastRun: 'Last run',
    nextRun: 'Next scheduled run',
    scheduleNote: 'Runs automatically twice a day (06:00 and 18:00 UTC) on GitHub Actions.',
    viewRun: 'View run on GitHub',
    triggerSchedule: 'scheduled',
    triggerManual: 'manual',
    triggerOther: 'automatic',
    tags: 'Tags',
    failing: 'Failing tests',
    noFailing: 'No tests failing in the latest run.',
    category: { correction: 'Correction', 'no-op': 'No error', interference: 'Interference', guardrail: 'Guardrail' } as Record<string, string>,
  },
};

type Copy = typeof copy.es;

const pct = (n: number): string => `${Math.round(n * 100)}%`;
const secs = (ms: number): string => `${(ms / 1000).toFixed(1)}s`;
const palette = (rate: number): string => (rate >= 0.9 ? 'green' : rate >= 0.6 ? 'orange' : 'red');

function Kpi({ label, value, help, color }: { label: string; value: string; help?: string; color?: string }) {
  return (
    <Card.Root variant="outline" bg="white">
      <Card.Body p="4">
        <Stat.Root>
          <Stat.Label>{label}</Stat.Label>
          <Stat.ValueText color={color}>{value}</Stat.ValueText>
          {help ? <Stat.HelpText>{help}</Stat.HelpText> : null}
        </Stat.Root>
      </Card.Body>
    </Card.Root>
  );
}

function EvalPanel({ data, t, lang }: { data: EvalData | null; t: Copy; lang: string }) {
  if (!data) {
    return (
      <Alert.Root status="neutral" variant="surface" mt="4">
        <Alert.Content>
          <Alert.Title>{t.emptyEvalTitle}</Alert.Title>
          <Alert.Description>{t.emptyEvalDesc}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }
  const s = data.summary;
  return (
    <Stack gap="6" mt="4">
      <SimpleGrid columns={{ base: 2, md: 4 }} gap="3">
        <Kpi label={t.passRate} value={pct(s.passRate)} color={`${palette(s.passRate)}.600`} />
        <Kpi label={t.judge} value={`${s.avgJudge.toFixed(1)} / 5`} />
        <Kpi label={t.cases} value={String(s.cases)} help={`${s.totalRuns} ${t.runs.toLowerCase()}`} />
        <Kpi label={t.checks} value={`${s.deterministicPassed}/${s.deterministicChecks}`} />
      </SimpleGrid>
      <HStack gap="2" wrap="wrap" fontSize="sm" color="gray.600">
        <Span>{t.subject}: <Code>{data.subjectModel}</Code></Span>
        <Span>· {t.judgeModel}: <Code>{data.judgeModel}</Code></Span>
        <Span>· {t.generated}: {new Date(data.generatedAt).toLocaleString(lang)}</Span>
      </HStack>
      <Accordion.Root collapsible multiple>
        {data.cases.map((c) => (
          <Accordion.Item key={c.id} value={c.id} bg="white" borderWidth="1px" borderRadius="md" mb="2">
            <Accordion.ItemTrigger px="4" py="3">
              <HStack flex="1" gap="3" wrap="wrap">
                <Text fontWeight="600">{c.title}</Text>
                <Badge variant="subtle">{t.category[c.category] ?? c.category}</Badge>
                <Badge colorPalette={palette(c.passRate)}>{pct(c.passRate)}</Badge>
                <Text fontSize="sm" color="gray.500">{t.judge}: {c.avgJudge.toFixed(1)}</Text>
              </HStack>
              <Accordion.ItemIndicator />
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Accordion.ItemBody px="4" pb="4">
                <Stack gap="4">
                  <Box>
                    <Text fontSize="xs" textTransform="uppercase" color="gray.500">{t.input}</Text>
                    <Code>{c.input}</Code>
                  </Box>
                  {c.runs.map((r, i) => (
                    <Box key={i} borderWidth="1px" borderRadius="md" p="3">
                      <HStack mb="2" gap="2" wrap="wrap">
                        <Badge colorPalette={r.pass ? 'green' : 'red'}>{r.pass ? 'PASS' : 'FAIL'}</Badge>
                        <Text fontSize="sm">#{i + 1}</Text>
                        {r.checks.map((ch) => (
                          <Badge key={ch.id} colorPalette={ch.pass ? 'green' : 'red'} variant="outline" title={ch.detail}>{ch.id}</Badge>
                        ))}
                      </HStack>
                      <Text fontSize="xs" textTransform="uppercase" color="gray.500">{t.output}</Text>
                      <Code display="block" whiteSpace="pre-wrap" p="2" mb="2">{r.output}</Code>
                      <Text fontSize="sm"><b>{t.verdict}:</b> {r.judge.score}/5 — {r.judge.reason}</Text>
                    </Box>
                  ))}
                </Stack>
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </Stack>
  );
}

const SCHEDULE_HOURS_UTC = [6, 18];

function nextScheduledRun(from: Date): Date {
  for (let dayOffset = 0; dayOffset < 2; dayOffset += 1) {
    for (const hour of SCHEDULE_HOURS_UTC) {
      const candidate = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + dayOffset, hour));
      if (candidate > from) return candidate;
    }
  }
  return from;
}

const STATUS_COLOR: Record<string, string> = { passed: 'green', failed: 'red', flaky: 'orange', skipped: 'gray' };

function AllTests({ tests, t }: { tests: CiTest[]; t: Copy }) {
  const [query, setQuery] = useState('');
  const [project, setProject] = useState('');
  const [status, setStatus] = useState('');
  const projects = useMemo(() => [...new Set(tests.map((x) => x.project))].sort(), [tests]);
  const statuses = useMemo(() => [...new Set(tests.map((x) => x.status))].sort(), [tests]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return tests.filter((x) => (!project || x.project === project) && (!status || x.status === status) && (!needle || x.title.toLowerCase().includes(needle)));
  }, [tests, query, project, status]);
  const byFile = useMemo(() => {
    const groups = new Map<string, CiTest[]>();
    for (const test of filtered) groups.set(test.file, [...(groups.get(test.file) ?? []), test]);
    return [...groups.entries()];
  }, [filtered]);

  return (
    <Box data-testid="all-tests">
      <Heading size="md" mb="2">{t.allTests}</Heading>
      <HStack gap="2" wrap="wrap" mb="3">
        <Input bg="white" maxW="280px" size="sm" placeholder={t.searchTests} value={query} data-testid="all-tests-search" onChange={(event) => setQuery(event.target.value)} />
        <select className="reports-select" value={project} data-testid="all-tests-project" onChange={(event) => setProject(event.target.value)}>
          <option value="">{t.allProjects}</option>
          {projects.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
        <select className="reports-select" value={status} data-testid="all-tests-status" onChange={(event) => setStatus(event.target.value)}>
          <option value="">{t.allStatuses}</option>
          {statuses.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
        <Text fontSize="sm" color="gray.600" data-testid="all-tests-count">{t.showing} {filtered.length} {t.of} {tests.length}</Text>
      </HStack>
      {byFile.length === 0 ? (
        <Text color="gray.600">{t.noMatches}</Text>
      ) : (
        <Accordion.Root collapsible multiple lazyMount unmountOnExit>
          {byFile.map(([file, own]) => (
            <Accordion.Item key={file} value={file} bg="white" borderWidth="1px" borderRadius="md" mb="2">
              <Accordion.ItemTrigger px="4" py="2">
                <HStack flex="1" gap="3" wrap="wrap">
                  <Code>{file}</Code>
                  <Text fontSize="sm" color="gray.600">{own.filter((x) => x.status === 'passed').length}/{own.length}</Text>
                </HStack>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody px="4" pb="3">
                  <Stack gap="1">
                    {own.map((x, index) => (
                      <HStack key={`${x.title}:${x.project}:${index}`} gap="3" wrap="wrap">
                        <Badge colorPalette={STATUS_COLOR[x.status] ?? 'gray'}>{x.status}</Badge>
                        <Text fontSize="sm" flex="1" minW="200px">{x.title}</Text>
                        {x.tags.map((tag) => <Badge key={tag} variant="subtle">{tag}</Badge>)}
                        <Code fontSize="xs">{x.project}</Code>
                        <Text fontSize="xs" color="gray.600">{secs(x.duration)}</Text>
                      </HStack>
                    ))}
                  </Stack>
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      )}
    </Box>
  );
}

function CiPanel({ data, t, lang }: { data: CiData | null; t: Copy; lang: string }) {
  if (!data) {
    return (
      <Alert.Root status="neutral" variant="surface" mt="4">
        <Alert.Content>
          <Alert.Description>{t.emptyCi}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }
  const l = data.latest;
  const rate = l.total ? l.passed / l.total : 0;
  const failing = data.tests.filter((x) => x.status === 'failed');
  return (
    <Stack gap="6" mt="4">
      <SimpleGrid columns={{ base: 2, md: 4 }} gap="3">
        <Kpi label={t.passRate} value={pct(rate)} color={`${palette(rate)}.600`} help={`${l.passed}/${l.total}`} />
        <Kpi label={t.failed} value={String(l.failed)} color={l.failed ? 'red.600' : 'green.600'} />
        <Kpi label={t.flaky} value={String(l.flaky)} />
        <Kpi label={t.duration} value={secs(l.wallDuration)} />
      </SimpleGrid>
      <Box bg="white" borderWidth="1px" borderRadius="md" px="4" py="3">
        <Stack gap="1" fontSize="sm">
          <HStack gap="2" wrap="wrap">
            <Text fontWeight="semibold">{t.lastRun}:</Text>
            <Text>{new Date(l.generatedAt).toLocaleString(lang)}</Text>
            {l.trigger && <Badge variant="subtle">{l.trigger === 'schedule' ? t.triggerSchedule : l.trigger === 'workflow_dispatch' ? t.triggerManual : t.triggerOther}</Badge>}
            {l.commit && <Code>{l.commit}</Code>}
            {l.runUrl && <Link href={l.runUrl} target="_blank" rel="noreferrer">{t.viewRun}</Link>}
          </HStack>
          <HStack gap="2" wrap="wrap">
            <Text fontWeight="semibold">{t.nextRun}:</Text>
            <Text>{nextScheduledRun(new Date()).toLocaleString(lang)}</Text>
          </HStack>
          <Text color="gray.600">{t.scheduleNote}</Text>
        </Stack>
      </Box>

      {data.projects && data.projects.length > 0 && (
        <Box>
          <Heading size="md" mb="2">{t.byProject}</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="3">
            {data.projects.map((p) => {
              const r = p.total ? p.passed / p.total : 0;
              return (
                <Box key={p.name} bg="white" borderWidth="1px" borderRadius="md" px="4" py="3">
                  <HStack justify="space-between">
                    <Code>{p.name}</Code>
                    <Text fontSize="sm" color="gray.600">{secs(p.duration)}</Text>
                  </HStack>
                  <Progress.Root value={r * 100} colorPalette={palette(r)} size="sm" mt="2">
                    <Progress.Track><Progress.Range /></Progress.Track>
                  </Progress.Root>
                  <Text fontSize="xs" color="gray.600">{p.passed}/{p.total}{p.failed ? ` · ${p.failed} ${t.failed.toLowerCase()}` : ''}{p.flaky ? ` · ${p.flaky} ${t.flaky.toLowerCase()}` : ''}</Text>
                </Box>
              );
            })}
          </SimpleGrid>
        </Box>
      )}

      <Box bg="white" borderWidth="1px" borderRadius="md" overflowX="auto">
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>{t.suite}</Table.ColumnHeader>
              <Table.ColumnHeader>{t.tags}</Table.ColumnHeader>
              <Table.ColumnHeader minW="140px">{t.tests}</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">{t.duration}</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.files.map((f) => {
              const r = f.total ? f.passed / f.total : 0;
              return (
                <Table.Row key={f.file}>
                  <Table.Cell><Code>{f.file}</Code></Table.Cell>
                  <Table.Cell>
                    <HStack gap="1" wrap="wrap">{f.tags.map((tag) => <Badge key={tag} variant="subtle">{tag}</Badge>)}</HStack>
                  </Table.Cell>
                  <Table.Cell>
                    <Progress.Root value={r * 100} colorPalette={palette(r)} size="sm">
                      <Progress.Track><Progress.Range /></Progress.Track>
                    </Progress.Root>
                    <Text fontSize="xs" color="gray.600">{f.passed}/{f.total}</Text>
                  </Table.Cell>
                  <Table.Cell textAlign="end">{secs(f.duration)}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      </Box>

      <AllTests tests={data.tests} t={t} />

      <Box>
        <Heading size="md" mb="2">{t.failing}</Heading>
        {failing.length === 0 ? (
          <Text color="gray.600">{t.noFailing}</Text>
        ) : (
          <Stack gap="2">
            {failing.map((x) => (
              <HStack key={`${x.file}:${x.title}`} bg="white" borderWidth="1px" borderRadius="md" px="3" py="2" gap="3" wrap="wrap">
                <Badge colorPalette="red">{x.project}</Badge>
                <Text fontSize="sm" flex="1">{x.title}</Text>
                <Code fontSize="xs">{x.file}</Code>
              </HStack>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

export default function ReportsDashboard({ lang, evalData, ciData }: Props) {
  const t = copy[lang];
  return (
      <Box className="chakra-scope" data-testid="reports-dashboard">
        <Alert.Root status="neutral" variant="surface" mb="6">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{t.recorded}</Alert.Title>
            <Alert.Description>{t.recordedDesc}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
        <Tabs.Root defaultValue={evalData ? 'eval' : 'ci'} variant="line" colorPalette="teal">
          <Tabs.List>
            {evalData ? (
              <>
                <Tabs.Trigger value="eval" data-testid="tab-eval">{t.tabEval}</Tabs.Trigger>
                <Tabs.Trigger value="ci" data-testid="tab-ci">{t.tabCi}</Tabs.Trigger>
              </>
            ) : (
              <>
                <Tabs.Trigger value="ci" data-testid="tab-ci">{t.tabCi}</Tabs.Trigger>
                <Tabs.Trigger value="eval" data-testid="tab-eval">{t.tabEval}</Tabs.Trigger>
              </>
            )}
          </Tabs.List>
          <Tabs.Content value="eval"><EvalPanel data={evalData} t={t} lang={lang} /></Tabs.Content>
          <Tabs.Content value="ci"><CiPanel data={ciData} t={t} lang={lang} /></Tabs.Content>
        </Tabs.Root>
      </Box>
  );
}

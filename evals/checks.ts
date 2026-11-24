export type CheckResult = { id: string; pass: boolean; detail: string };

export type TutorReply = {
  correction: string;
  explanation_es: string;
  example_en: string;
};

const ES_WORDS = ['el', 'la', 'los', 'las', 'de', 'que', 'en', 'es', 'un', 'una', 'se', 'por', 'con', 'para', 'no', 'del', 'al', 'se', 'su', 'lo'];
const EN_WORDS = ['the', 'a', 'an', 'is', 'are', 'i', 'you', 'we', 'he', 'she', 'it', 'to', 'of', 'in', 'on', 'my', 'and', 'like', 'have', 'go'];

const tokens = (text: string): string[] =>
  text.toLowerCase().replace(/[^a-záéíóúñü\s']/gi, ' ').split(/\s+/).filter(Boolean);

const countHits = (words: string[], dictionary: string[]): number =>
  words.filter((w) => dictionary.includes(w)).length;

export function extractJson(raw: string): unknown | null {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

export function parseReply(raw: string): TutorReply | null {
  const data = extractJson(raw) as Partial<TutorReply> | null;
  if (!data) return null;
  const { correction, explanation_es, example_en } = data;
  if ([correction, explanation_es, example_en].some((v) => typeof v !== 'string' || !v.trim())) return null;
  return { correction, explanation_es, example_en } as TutorReply;
}

export function checkStructure(raw: string): CheckResult {
  const reply = parseReply(raw);
  return {
    id: 'structure',
    pass: reply !== null,
    detail: reply ? 'JSON válido con las 3 claves' : 'JSON inválido o claves faltantes',
  };
}

export function checkBilingual(raw: string): CheckResult {
  const reply = parseReply(raw);
  if (!reply) return { id: 'bilingual', pass: false, detail: 'sin estructura' };
  const es = countHits(tokens(reply.explanation_es), ES_WORDS);
  const en = countHits(tokens(reply.example_en), EN_WORDS);
  const pass = es >= 3 && en >= 2;
  return { id: 'bilingual', pass, detail: `stopwords ES=${es} (≥3), EN=${en} (≥2)` };
}

export function checkLevelA2(raw: string): CheckResult {
  const reply = parseReply(raw);
  if (!reply) return { id: 'level-a2', pass: false, detail: 'sin estructura' };
  const words = tokens(reply.example_en);
  const avg = words.reduce((sum, w) => sum + w.length, 0) / Math.max(words.length, 1);
  const longest = Math.max(...words.map((w) => w.length), 0);
  const pass = words.length <= 14 && avg <= 5.5 && longest <= 10;
  return { id: 'level-a2', pass, detail: `palabras=${words.length} (≤14), media=${avg.toFixed(1)} (≤5.5), máx=${longest} (≤10)` };
}

export const contains = (id: string, needle: string) => (raw: string): CheckResult => {
  const reply = parseReply(raw);
  const pass = !!reply && reply.correction.toLowerCase().includes(needle.toLowerCase());
  return { id, pass, detail: `correction ${pass ? 'contiene' : 'no contiene'} "${needle}"` };
};

export const notContains = (id: string, needle: string) => (raw: string): CheckResult => {
  const pass = !raw.toLowerCase().includes(needle.toLowerCase());
  return { id, pass, detail: `salida ${pass ? 'no contiene' : 'contiene'} "${needle}"` };
};

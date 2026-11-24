import { isPgKey } from '../i18n/playground';
import type { Translations } from '../i18n/translations';

export type FieldIssue = { field: string; code: string; message: string };

export class ApiFailure extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
    public requestId?: string,
    public retryAfter?: number,
  ) {
    super(message);
  }

  get issues(): FieldIssue[] {
    return Array.isArray(this.details) ? (this.details as FieldIssue[]) : [];
  }
}

type Options = { method?: string; body?: unknown; token?: string | null; headers?: Record<string, string>; signal?: AbortSignal };

export async function api<T>(path: string, options: Options = {}): Promise<{ data: T; status: number; headers: Headers }> {
  const headers: Record<string, string> = { Accept: 'application/json', ...(options.headers ?? {}) };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiFailure(0, 'NETWORK_ERROR', 'Network error');
  }
  const text = await response.text();
  let json: unknown;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      throw new ApiFailure(response.status, 'INVALID_RESPONSE', 'The server returned an invalid response');
    }
  }
  if (!response.ok) {
    const error = (json as { error?: { code?: string; message?: string; details?: unknown; requestId?: string } } | undefined)?.error;
    const retry = response.headers.get('Retry-After');
    throw new ApiFailure(
      response.status,
      error?.code ?? 'HTTP_ERROR',
      error?.message ?? `HTTP ${response.status}`,
      error?.details,
      error?.requestId ?? response.headers.get('X-Request-Id') ?? undefined,
      retry ? Number(retry) : undefined,
    );
  }
  return { data: json as T, status: response.status, headers: response.headers };
}

type T = (key: keyof Translations) => string;

const AUTH_CODES = ['UNAUTHORIZED', 'TOKEN_INVALID', 'TOKEN_EXPIRED'];

export function errorMessage(failure: unknown, t: T): string {
  if (!(failure instanceof ApiFailure)) return t('pg-unexpected');
  if (failure.code === 'NETWORK_ERROR') return t('pg-network-error');
  if (AUTH_CODES.includes(failure.code)) return t('pg-err-AUTH');
  if (failure.code === 'RATE_LIMITED') {
    return `${t('pg-err-RATE_LIMITED')} ${failure.retryAfter ?? 60} ${t('pg-err-seconds')}.`;
  }
  const key = `pg-err-${failure.code}`;
  if (isPgKey(key)) return t(key);
  return failure.status >= 500 ? t('pg-unexpected') : failure.message;
}

export function fieldErrors(failure: unknown, t: T): Record<string, string> {
  const out: Record<string, string> = {};
  if (!(failure instanceof ApiFailure)) return out;
  for (const issue of failure.issues) {
    const field = issue.field.split(/[.[]/)[0] === 'attachment' ? 'attachment' : issue.field;
    if (out[field]) continue;
    const key = `pg-vf-${issue.code}`;
    out[field] = isPgKey(key) ? t(key) : issue.message;
  }
  return out;
}

export const formatMoney = (cents: number, lang: string) =>
  new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

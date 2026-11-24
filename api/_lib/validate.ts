import { Issues } from './errors';

export type Obj = Record<string, unknown>;

export const isObj = (value: unknown): value is Obj =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function asObject(body: unknown, issues: Issues): Obj {
  if (!isObj(body)) {
    issues.add('body', 'INVALID_TYPE', 'Body must be a JSON object');
    issues.throwIfAny();
  }
  return body as Obj;
}

export function rejectUnknown(body: Obj, allowed: string[], issues: Issues, prefix = '') {
  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) issues.add(`${prefix}${key}`, 'UNKNOWN_FIELD', `Unknown field "${key}"`);
  }
}

type StrOpts = { min?: number; max?: number; pattern?: RegExp; required?: boolean; oneOf?: readonly string[]; trim?: boolean };

export function str(body: Obj, field: string, issues: Issues, opts: StrOpts = {}, prefix = ''): string | undefined {
  const name = `${prefix}${field}`;
  const raw = body[field];
  const required = opts.required ?? true;
  if (raw === undefined || raw === null) {
    if (required) issues.add(name, 'REQUIRED', `${field} is required`);
    return undefined;
  }
  if (typeof raw !== 'string') {
    issues.add(name, 'INVALID_TYPE', `${field} must be a string`);
    return undefined;
  }
  const value = opts.trim === false ? raw : raw.trim();
  if (required && value.length === 0) {
    issues.add(name, 'REQUIRED', `${field} is required`);
    return undefined;
  }
  if (opts.min !== undefined && value.length < opts.min) issues.add(name, 'TOO_SHORT', `${field} must have at least ${opts.min} characters`);
  if (opts.max !== undefined && value.length > opts.max) issues.add(name, 'TOO_LONG', `${field} must have at most ${opts.max} characters`);
  if (opts.pattern && !opts.pattern.test(value)) issues.add(name, 'INVALID_FORMAT', `${field} has an invalid format`);
  if (opts.oneOf && !opts.oneOf.includes(value)) issues.add(name, 'INVALID_OPTION', `${field} must be one of: ${opts.oneOf.join(', ')}`);
  return value;
}

type IntOpts = { min?: number; max?: number; required?: boolean };

export function int(body: Obj, field: string, issues: Issues, opts: IntOpts = {}, prefix = ''): number | undefined {
  const name = `${prefix}${field}`;
  const raw = body[field];
  if (raw === undefined || raw === null) {
    if (opts.required ?? true) issues.add(name, 'REQUIRED', `${field} is required`);
    return undefined;
  }
  if (typeof raw !== 'number' || !Number.isInteger(raw)) {
    issues.add(name, 'INVALID_TYPE', `${field} must be an integer`);
    return undefined;
  }
  if (opts.min !== undefined && raw < opts.min) issues.add(name, 'OUT_OF_RANGE', `${field} must be >= ${opts.min}`);
  if (opts.max !== undefined && raw > opts.max) issues.add(name, 'OUT_OF_RANGE', `${field} must be <= ${opts.max}`);
  return raw;
}

export function bool(body: Obj, field: string, issues: Issues, required = true, prefix = ''): boolean | undefined {
  const name = `${prefix}${field}`;
  const raw = body[field];
  if (raw === undefined || raw === null) {
    if (required) issues.add(name, 'REQUIRED', `${field} is required`);
    return undefined;
  }
  if (typeof raw !== 'boolean') {
    issues.add(name, 'INVALID_TYPE', `${field} must be a boolean`);
    return undefined;
  }
  return raw;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function queryInt(query: Record<string, string>, field: string, issues: Issues, opts: { min: number; max: number; fallback: number }): number {
  const raw = query[field];
  if (raw === undefined) return opts.fallback;
  if (!/^-?\d+$/.test(raw)) {
    issues.add(field, 'INVALID_TYPE', `${field} must be an integer`);
    return opts.fallback;
  }
  const value = Number(raw);
  if (value < opts.min || value > opts.max) issues.add(field, 'OUT_OF_RANGE', `${field} must be between ${opts.min} and ${opts.max}`);
  return value;
}

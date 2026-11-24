export type Issue = { field: string; code: string; message: string };

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
    public headers?: Record<string, string>,
  ) {
    super(message);
  }
}

export class Issues {
  list: Issue[] = [];
  add(field: string, code: string, message: string) {
    this.list.push({ field, code, message });
  }
  get ok() {
    return this.list.length === 0;
  }
  throwIfAny(status = 400) {
    if (!this.ok) throw new ApiError(status, 'VALIDATION_ERROR', 'Request validation failed', this.list);
  }
}

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
  'http://16.170.163.62/api/v1';

const AUTH_STORAGE_KEY = 'stroyopttorg_auth_v1';

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  email: string;
}

export function loadAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (!parsed.accessToken) return null;
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      email: parsed.email ?? '',
    };
  } catch {
    return null;
  }
}

export function saveAuthSession(session: AuthSession | null): void {
  try {
    if (!session) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    }
  } catch {
    // Ignore storage errors
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function extractErrorMessage(data: unknown, fallback: string): string {
  if (!data) return fallback;
  if (typeof data === 'string') return data || fallback;
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (typeof obj.detail === 'string') return obj.detail;
    if (typeof obj.error === 'string') return obj.error;
    if (typeof obj.message === 'string') return obj.message;
    const fieldMsgs: string[] = [];
    for (const [k, v] of Object.entries(obj)) {
      if (Array.isArray(v) && v.length > 0) {
        fieldMsgs.push(`${k}: ${v.join(', ')}`);
      } else if (typeof v === 'string') {
        fieldMsgs.push(`${k}: ${v}`);
      }
    }
    if (fieldMsgs.length > 0) return fieldMsgs.join('; ');
  }
  return fallback;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL}${cleanPath}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const session = loadAuthSession();
    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    const msg = extractErrorMessage(parsed, `HTTP ${res.status} ${res.statusText}`);
    throw new ApiError(res.status, msg, parsed);
  }

  return parsed as T;
}

export interface PaginatedResponse<T> {
  count: number;
  pages?: number;
  results: T[];
}

export async function fetchAllPages<T>(path: string, pageSize = 100): Promise<{ count: number; results: T[] }> {
  const sep = path.includes('?') ? '&' : '?';
  const first = await apiRequest<PaginatedResponse<T>>(`${path}${sep}page=1&page_size=${pageSize}`);
  const all = [...first.results];
  const totalPages = first.pages ?? Math.ceil(first.count / pageSize);

  for (let p = 2; p <= totalPages; p++) {
    const next = await apiRequest<PaginatedResponse<T>>(`${path}${sep}page=${p}&page_size=${pageSize}`);
    all.push(...next.results);
  }

  return { count: first.count, results: all };
}

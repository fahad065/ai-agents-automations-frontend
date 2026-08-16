const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

function getLang(): string {
  if (typeof window === 'undefined') return 'en';
  return localStorage.getItem('lm_lang') || 'en';
}

function getCountry(): string {
  if (typeof window === 'undefined') return 'UAE';
  return localStorage.getItem('lm_country') || 'UAE';
}

function buildUrl(path: string, params: Record<string, string | undefined> = {}): string {
  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set('lang', getLang());
  url.searchParams.set('country', getCountry());
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') url.searchParams.set(k, v);
  });
  return url.toString();
}

async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string | undefined> } = {},
): Promise<T> {
  const { params, ...fetchOptions } = options;
  const url = buildUrl(path, params);

  const token = typeof window !== 'undefined' ? localStorage.getItem('lm_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...fetchOptions, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export const apiClient = {
  get: <T>(path: string, params?: Record<string, string | undefined>) =>
    request<T>(path, { method: 'GET', params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
};

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  raw?: boolean;
}

export async function apiFetch<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
  const { body, raw, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = { ...customHeaders as Record<string, string> };
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...rest,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data.message) message = data.message;
    } catch {
      // Response not JSON
    }
    throw new Error(message);
  }

  if (raw) return res as unknown as T;
  return res.json();
}

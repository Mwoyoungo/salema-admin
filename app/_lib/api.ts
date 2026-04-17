const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://salema-server-production.up.railway.app';

export function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/admin_token=([^;]+)/);
  return match ? match[1] : '';
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (res.status === 401) {
    document.cookie = 'admin_token=; path=/; max-age=0';
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  return res.json();
}

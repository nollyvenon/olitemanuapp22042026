export async function apiCall(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<Response> {
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(options.headers ? (options.headers instanceof Headers ? Object.fromEntries(options.headers) : options.headers) : {}),
  } as Record<string, string>);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
  return fetch(url, { ...options, headers });
}

export async function apiGet(endpoint: string, token?: string) {
  const res = await apiCall(endpoint, { method: 'GET' }, token);
  return res.json();
}

export async function apiPost(endpoint: string, body: any, token?: string) {
  const res = await apiCall(endpoint, { method: 'POST', body: JSON.stringify(body) }, token);
  return res.json();
}

export async function apiPatch(endpoint: string, body: any, token?: string) {
  const res = await apiCall(endpoint, { method: 'PATCH', body: JSON.stringify(body) }, token);
  return res.json();
}

export async function apiDelete(endpoint: string, token?: string) {
  const res = await apiCall(endpoint, { method: 'DELETE' }, token);
  return res.json();
}

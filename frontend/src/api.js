const API_URL = 'http://localhost:3000';

export async function get(path) {
  const res = await fetch(API_URL + path);
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || `Error ${res.status}`);
  }
  return res.json();
}

export async function post(path, body) {
  const res = await fetch(API_URL + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

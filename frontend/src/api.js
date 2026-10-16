const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function handle(res) {
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    // Los errores de validación llegan como lista de mensajes.
    const message = Array.isArray(error?.message) ? error.message.join(', ') : error?.message;
    throw new Error(message || `Error ${res.status}`);
  }
  return res.json();
}

export async function get(path) {
  return handle(await fetch(API_URL + path));
}

export async function post(path, body) {
  return handle(
    await fetch(API_URL + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  );
}

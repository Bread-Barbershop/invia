type SessionResponse = { isLoggedIn: boolean };

export async function fetchSessionState() {
  const res = await fetch('/api/auth/session', {
    method: 'GET',
    cache: 'no-store',
  });

  if (res.status === 401) {
    return false;
  }

  if (!res.ok) {
    throw new Error(`session check failed: ${res.status}`);
  }

  const session = (await res.json()) as SessionResponse;
  return session.isLoggedIn;
}

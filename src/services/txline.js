/**
 * txline.js
 * Base TxLINE API client — handles auth (guest JWT + API token),
 * HTTP requests, and exposes base URL constants.
 */

const BASE_URL = "https://txline.txodds.com";

let _jwt = null;
let _apiToken = null;

/**
 * Retrieve or refresh the guest JWT from environment or localStorage.
 * In production the JWT + apiToken are set via env vars on Vercel.
 */
export function setCredentials(jwt, apiToken) {
  _jwt = jwt;
  _apiToken = apiToken;
}

export function getCredentials() {
  // Prefer env vars (Vercel), fall back to localStorage for local dev
  const jwt = _jwt || import.meta.env.VITE_TXLINE_JWT || localStorage.getItem("txline_jwt");
  const apiToken =
    _apiToken ||
    import.meta.env.VITE_TXLINE_API_TOKEN ||
    localStorage.getItem("txline_api_token");
  return { jwt, apiToken };
}

export function authHeaders() {
  const { jwt, apiToken } = getCredentials();
  return {
    Authorization: `Bearer ${jwt}`,
    "X-Api-Token": apiToken,
    "Content-Type": "application/json",
  };
}

/**
 * Start a guest session — returns a short-lived JWT for unauthenticated use.
 * Only needed for token activation flow; not for SSE streams.
 */
export async function startGuestSession() {
  const res = await fetch(`${BASE_URL}/auth/guest/start`, { method: "POST" });
  if (!res.ok) throw new Error(`Guest session failed: ${res.status}`);
  const data = await res.json();
  return data.token;
}

/**
 * Generic GET helper with auth headers.
 */
export async function txlineGet(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) throw new Error(`TxLINE ${path} → ${res.status}`);
  return res.json();
}

export { BASE_URL };

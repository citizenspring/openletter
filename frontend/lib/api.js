import fetch from 'node-fetch';

const DEFAULT_TIMEOUT_MS = 5000;
const BODY_SNIPPET_LENGTH = 200;

// The API is not always well behaved: while it restarts it refuses connections,
// and a proxy in front of it can answer with an HTML error page or an empty
// body. Any of those used to throw straight out of getServerSideProps, which
// Next.js does not catch — it killed the whole server process, taking every
// concurrent request down with it.
//
// fetchJson never throws and never returns undefined. It always resolves to
// { data, error }, so callers can return props and render a degraded page.
export async function fetchJson(apiCall, { timeout = DEFAULT_TIMEOUT_MS, ...options } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(apiCall, { ...options, signal: controller.signal });
    // Read as text first: res.json() throws on an empty or non-JSON body and
    // discards the payload, which is exactly what made this hard to debug.
    const body = await res.text();

    if (!res.ok) {
      console.error(`API responded ${res.status} for ${apiCall}: ${snippet(body)}`);
      return { data: null, error: { message: `The server responded with an error (${res.status})` } };
    }

    let data;
    try {
      data = JSON.parse(body);
    } catch (e) {
      console.error(`API returned invalid JSON for ${apiCall}: ${snippet(body)}`);
      return { data: null, error: { message: 'The server returned an invalid response' } };
    }

    // `null`, a bare number or a string all parse cleanly but would throw the
    // moment a caller reads a property off them. Every endpoint here returns an
    // object or an array, so anything else is a failure.
    if (data === null || typeof data !== 'object') {
      console.error(`API returned an unexpected payload for ${apiCall}: ${snippet(body)}`);
      return { data: null, error: { message: 'The server returned an unexpected response' } };
    }

    return { data, error: null };
  } catch (e) {
    if (e.name === 'AbortError') {
      console.error(`API request timed out after ${timeout}ms for ${apiCall}`);
      return { data: null, error: { message: 'The server took too long to respond' } };
    }
    console.error(`API request failed for ${apiCall}: ${e.message}`);
    return { data: null, error: { message: 'Unable to reach the server' } };
  } finally {
    clearTimeout(timeoutId);
  }
}

// Logs what the API actually sent back — an empty body and an HTML error page
// are indistinguishable from "invalid JSON" without it.
function snippet(body) {
  if (!body) return '<empty body>';
  const collapsed = body.replace(/\s+/g, ' ').trim();
  return collapsed.length > BODY_SNIPPET_LENGTH ? `${collapsed.slice(0, BODY_SNIPPET_LENGTH)}…` : collapsed;
}

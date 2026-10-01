import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { createStore, handleApiRequest, Store } from '../../server/api.ts';

const store: Store = createStore();
let blobsStore: ReturnType<typeof getStore> | null = null;
let initialized = false;

async function initStore() {
  if (initialized) return;
  try {
    blobsStore = getStore('simbiz-games');
    const saved = await blobsStore.get('games', { type: 'json' });
    if (saved && typeof saved === 'object') {
      Object.assign(store.games, saved);
    }
  } catch {
    // If Netlify Blobs is not enabled on the site, fallback gracefully to memory
    blobsStore = null;
  }
  initialized = true;
}

const persist = async () => {
  if (!blobsStore) return;
  try {
    await blobsStore.setJSON('games', store.games);
  } catch {
    // Fallback gracefully
  }
};

const configuredOrigin = process.env.CORS_ORIGIN;

export const handler: Handler = async event => {
  await initStore();

  const origin = event.headers.origin || event.headers.Origin;
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'access-control-allow-headers': 'Content-Type',
    'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
  };
  if (configuredOrigin && origin === configuredOrigin) {
    headers['access-control-allow-origin'] = configuredOrigin;
    headers.vary = 'Origin';
  } else if (!configuredOrigin) {
    headers['access-control-allow-origin'] = '*';
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };

  let body: unknown;
  try {
    body = event.body ? JSON.parse(event.body) : undefined;
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
  }

  const response = await handleApiRequest({
    method: event.httpMethod,
    path: event.path,
    body,
  }, store, persist);

  return { statusCode: response.status, headers, body: JSON.stringify(response.body) };
};

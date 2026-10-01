import type { Handler } from '@netlify/functions';
import { createStore, handleApiRequest } from '../../server/api.js';

const store = createStore();
const configuredOrigin = process.env.CORS_ORIGIN;

export const handler: Handler = async event => {
  const origin = event.headers.origin || event.headers.Origin;
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'access-control-allow-headers': 'Content-Type',
    'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
  };
  if (configuredOrigin && origin === configuredOrigin) {
    headers['access-control-allow-origin'] = configuredOrigin;
    headers.vary = 'Origin';
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
  }, store);
  return { statusCode: response.status, headers, body: JSON.stringify(response.body) };
};

import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStore, handleApiRequest, Store } from './api.js';

const configuredOrigin = process.env.CORS_ORIGIN
  || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000');
const dataDir = process.env.SIMBIZ_DATA_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');
const storePath = path.join(dataDir, 'games.json');
const store: Store = createStore();

const ready = fs.mkdir(dataDir, { recursive: true })
  .then(() => fs.readFile(storePath, 'utf8'))
  .then(raw => Object.assign(store, JSON.parse(raw)))
  .catch(() => undefined);

const persist = async () => {
  await ready;
  const temporary = `${storePath}.tmp`;
  await fs.writeFile(temporary, JSON.stringify(store, null, 2), 'utf8');
  await fs.rename(temporary, storePath);
};

export const createApp = () => {
  if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
    throw new Error('CORS_ORIGIN doit être configurée en production');
  }
  const app = express();
  app.use(express.json({ limit: '2mb' }));
  app.use((req, res, next) => {
    const requestOrigin = req.headers.origin;
    if (configuredOrigin && requestOrigin === configuredOrigin) {
      res.setHeader('Access-Control-Allow-Origin', configuredOrigin);
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });
  app.use(async (req, res) => {
    await ready;
    const response = await handleApiRequest({ method: req.method, path: req.path, body: req.body }, store, persist);
    res.status(response.status).json(response.body);
  });
  return app;
};

if (process.env.NODE_ENV !== 'test' && /server\.(ts|js)$/.test(process.argv[1] || '')) {
  const port = Number(process.env.PORT || 8787);
  createApp().listen(port, '0.0.0.0', () => console.log(`SimBiz API listening on ${port}`));
}

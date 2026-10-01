import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createStore, handleApiRequest, Store } from './server/api.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const HOST = '0.0.0.0';

const configuredOrigin = process.env.CORS_ORIGIN || '*';
const dataDir = process.env.SIMBIZ_DATA_DIR || path.join(__dirname, 'server', 'data');
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

export async function createFullStackApp() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // CORS middleware for API routes
  app.use('/api', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', configuredOrigin);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  // Handle all API requests
  app.all('/api*', async (req, res) => {
    await ready;
    const requestPath = req.path || req.url.split('?')[0];
    const response = await handleApiRequest(
      { method: req.method, path: requestPath, body: req.body },
      store,
      persist
    );
    res.status(response.status).json(response.body);
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  createFullStackApp().then(app => {
    app.listen(PORT, HOST, () => {
      console.log(`SimBiz Executive server listening on http://${HOST}:${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

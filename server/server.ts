import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const app = express();
app.use(express.json({ limit: '2mb' }));
const configuredOrigin = process.env.CORS_ORIGIN
  || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000');
const storageMode = process.env.SIMBIZ_STORAGE_MODE || 'filesystem';

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  if (configuredOrigin && (!requestOrigin || requestOrigin === configuredOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', configuredOrigin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

type StoredGame = { gameCode: string; deviceId: string; state: Record<string, unknown>; updatedAt: string; score: number };
type Store = { games: Record<string, StoredGame> };
const dataDir = process.env.SIMBIZ_DATA_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');
const storePath = path.join(dataDir, 'games.json');
let store: Store = { games: {} };
let ready: Promise<void> = fs.mkdir(dataDir, { recursive: true }).then(() => fs.readFile(storePath, 'utf8').then(raw => { store = JSON.parse(raw); }).catch(() => undefined));

const persist = async () => {
  await ready;
  const temporary = `${storePath}.tmp`;
  await fs.writeFile(temporary, JSON.stringify(store, null, 2), 'utf8');
  await fs.rename(temporary, storePath);
};
const code = () => crypto.randomBytes(4).toString('hex').toUpperCase();
const scoreOf = (state: Record<string, unknown>) => {
  const latest = (state.snapshots as Record<string, { firmsResults?: Record<string, { incomeStatement?: { netProfit?: number } }> }> | undefined);
  return latest ? Math.max(0, ...Object.values(latest).map(s => s.firmsResults?.['1']?.incomeStatement?.netProfit || 0)) : 0;
};
const safeState = (input: unknown) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('État de partie invalide');
  return input as Record<string, unknown>;
};

export const createApp = () => {
  if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
    throw new Error('CORS_ORIGIN doit être configurée en production');
  }
  if (process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL est configurée mais aucun adaptateur de base de données n’est installé; utilisez un stockage persistant ou implémentez le repository');
  }
  app.get('/api/health', (_req, res) => res.json({
    ok: true,
    service: 'simbiz-api',
    storage: storageMode,
    time: new Date().toISOString(),
  }));
  app.post('/api/games', async (req, res) => {
    try {
      await ready;
      const gameCode = code();
      const state = safeState(req.body);
      const game: StoredGame = { gameCode, deviceId: String(req.body.deviceId || 'guest'), state, updatedAt: new Date().toISOString(), score: scoreOf(state) };
      store.games[gameCode] = game;
      await persist();
      res.status(201).json({ gameCode, state: { ...state, gameCode } });
    } catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : 'Création impossible' }); }
  });
  app.get('/api/games/:gameCode', async (req, res) => {
    await ready;
    const game = store.games[req.params.gameCode.toUpperCase()];
    if (!game) return res.status(404).json({ error: 'Code de partie introuvable' });
    res.json({ state: { ...game.state, gameCode: game.gameCode } });
  });
  app.put('/api/games/:gameCode', async (req, res) => {
    try {
      await ready;
      const key = req.params.gameCode.toUpperCase();
      const game = store.games[key];
      if (!game) return res.status(404).json({ error: 'Code de partie introuvable' });
      const state = safeState(req.body.state);
      store.games[key] = { ...game, state, updatedAt: new Date().toISOString(), score: scoreOf(state) };
      await persist();
      res.json({ savedAt: store.games[key].updatedAt });
    } catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : 'Sauvegarde impossible' }); }
  });
  app.post('/api/games/:gameCode/turn', async (req, res) => {
    res.status(501).json({ error: 'Le calcul de tour est exécuté par le moteur partagé du client; envoyez le nouvel état avec PUT.' });
  });
  app.get('/api/leaderboard', async (_req, res) => {
    await ready;
    const entries = Object.values(store.games).sort((a, b) => b.score - a.score).slice(0, 50)
      .map(game => ({ gameCode: game.gameCode, companyName: String((game.state.companySettings as { companyName?: string } | undefined)?.companyName || 'Entreprise invitée'), score: game.score }));
    res.json({ entries });
  });
  return app;
};

if (process.env.NODE_ENV !== 'test' && /server\.(ts|js)$/.test(process.argv[1] || '')) {
  const port = Number(process.env.PORT || 8787);
  createApp().listen(port, '0.0.0.0', () => console.log(`SimBiz API listening on ${port}`));
}

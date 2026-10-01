import crypto from 'node:crypto';

export type StoredGame = {
  gameCode: string;
  deviceId: string;
  state: Record<string, unknown>;
  updatedAt: string;
  score: number;
};

export type Store = { games: Record<string, StoredGame> };

export type ApiRequest = {
  method: string;
  path: string;
  body?: unknown;
};

export type ApiResponse = {
  status: number;
  body: Record<string, unknown>;
};

export const createStore = (): Store => ({ games: {} });

const code = () => crypto.randomBytes(4).toString('hex').toUpperCase();

const scoreOf = (state: Record<string, unknown>) => {
  const snapshots = state.snapshots as Record<string, {
    firmsResults?: Record<string, { incomeStatement?: { netProfit?: number } }>;
  }> | undefined;
  return snapshots
    ? Math.max(0, ...Object.values(snapshots).map(snapshot => snapshot.firmsResults?.['1']?.incomeStatement?.netProfit || 0))
    : 0;
};

const safeState = (input: unknown) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('État de partie invalide');
  }
  return input as Record<string, unknown>;
};

const jsonError = (status: number, error: string): ApiResponse => ({ status, body: { error } });

export async function handleApiRequest(
  request: ApiRequest,
  store: Store,
  persist?: () => Promise<void>,
): Promise<ApiResponse> {
  const path = request.path.replace(/^\/(?:\.netlify\/functions\/api\/)?/, '/').replace(/\/+$/, '') || '/';
  const gameMatch = path.match(/^\/api\/games\/([^/]+)$/);
  const turnMatch = path.match(/^\/api\/games\/([^/]+)\/turn$/);

  try {
    if (request.method === 'GET' && path === '/api/health') {
      return { status: 200, body: { ok: true, service: 'simbiz-api', storage: process.env.SIMBIZ_STORAGE_MODE || 'memory', time: new Date().toISOString() } };
    }
    if (request.method === 'POST' && path === '/api/games') {
      const input = safeState(request.body);
      const gameCode = code();
      const state = safeState({ ...input });
      const game: StoredGame = {
        gameCode,
        deviceId: String(input.deviceId || 'guest'),
        state,
        updatedAt: new Date().toISOString(),
        score: scoreOf(state),
      };
      store.games[gameCode] = game;
      await persist?.();
      return { status: 201, body: { gameCode, state: { ...state, gameCode } } };
    }
    if (gameMatch && request.method === 'GET') {
      const game = store.games[gameMatch[1].toUpperCase()];
      return game
        ? { status: 200, body: { state: { ...game.state, gameCode: game.gameCode } } }
        : jsonError(404, 'Code de partie introuvable');
    }
    if (gameMatch && request.method === 'PUT') {
      const gameCode = gameMatch[1].toUpperCase();
      const game = store.games[gameCode];
      if (!game) return jsonError(404, 'Code de partie introuvable');
      const input = safeState(request.body);
      const state = safeState(input.state);
      const updatedAt = new Date().toISOString();
      store.games[gameCode] = { ...game, state, updatedAt, score: scoreOf(state) };
      await persist?.();
      return { status: 200, body: { savedAt: updatedAt } };
    }
    if (turnMatch && request.method === 'POST') {
      return jsonError(501, 'Le calcul de tour est exécuté par le moteur partagé du client; envoyez le nouvel état avec PUT.');
    }
    if (request.method === 'GET' && path === '/api/leaderboard') {
      const entries = Object.values(store.games)
        .sort((a, b) => b.score - a.score)
        .slice(0, 50)
        .map(game => ({
          gameCode: game.gameCode,
          companyName: String((game.state.companySettings as { companyName?: string } | undefined)?.companyName || 'Entreprise invitée'),
          score: game.score,
        }));
      return { status: 200, body: { entries } };
    }
    return jsonError(404, 'Route introuvable');
  } catch (error) {
    return jsonError(400, error instanceof Error ? error.message : 'Requête impossible');
  }
}

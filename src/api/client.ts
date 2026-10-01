import { CompanySettings, FirmDecisions, PeriodSnapshot } from '../types/simulation';

export type SyncState = 'local' | 'online' | 'offline';
export interface GameState {
  gameCode: string;
  deviceId: string;
  snapshots: Record<number, PeriodSnapshot>;
  currentPeriod: number;
  latestPeriod: number;
  companySettings: CompanySettings;
  pendingDecisions: FirmDecisions;
  messages: unknown[];
  objectives?: unknown[];
  crises?: Record<number, unknown>;
  techPatents?: unknown[];
  events?: unknown[];
  periodStatus?: string;
}

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const DEVICE_KEY = 'simbiz_device_id';
const GAME_KEY = 'simbiz_game_code';

export const getDeviceId = () => {
  const current = localStorage.getItem(DEVICE_KEY);
  if (current) return current;
  const id = crypto.randomUUID();
  localStorage.setItem(DEVICE_KEY, id);
  return id;
};

export const getGameCode = () => localStorage.getItem(GAME_KEY) || '';
export const setGameCode = (code: string) => localStorage.setItem(GAME_KEY, code);

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL || '/api'}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || `API ${response.status}`);
  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<{ ok: boolean }>('/health'),
  createGame: (state: Partial<GameState>) => request<{ gameCode: string; state: GameState }>('/games', {
    method: 'POST', body: JSON.stringify({ deviceId: getDeviceId(), ...state }),
  }),
  loadGame: (gameCode: string) => request<{ state: GameState }>(`/games/${encodeURIComponent(gameCode)}`),
  saveGame: (gameCode: string, state: GameState) => request<{ savedAt: string }>(`/games/${encodeURIComponent(gameCode)}`, {
    method: 'PUT', body: JSON.stringify({ deviceId: getDeviceId(), state }),
  }),
  leaderboard: () => request<{ entries: Array<{ gameCode: string; companyName: string; score: number }> }>('/leaderboard'),
};

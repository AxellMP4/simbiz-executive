import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './server';

test('API exposes health and guest game persistence', async () => {
  const server = createApp().listen(0);
  await new Promise<void>(resolve => server.once('listening', () => resolve()));
  const port = (server.address() as { port: number }).port;
  const health = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.equal(health.status, 200);
  const created = await fetch(`http://127.0.0.1:${port}/api/games`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ deviceId: 'test-device', companySettings: { companyName: 'Test' }, snapshots: {} }) });
  assert.equal(created.status, 201);
  const body = await created.json() as { gameCode: string };
  const loaded = await fetch(`http://127.0.0.1:${port}/api/games/${body.gameCode}`);
  assert.equal(loaded.status, 200);
  server.close();
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { getHistoricalSnapshots, INITIAL_DECISIONS_P1 } from '../src/data/initialData';
import { simulateNextPeriod } from '../src/engine/simulationEngine';

test('simulation is deterministic for the same period and decisions', () => {
  const snapshot = getHistoricalSnapshots()[0];
  const first = simulateNextPeriod(snapshot, INITIAL_DECISIONS_P1);
  const second = simulateNextPeriod(snapshot, INITIAL_DECISIONS_P1);
  assert.deepEqual(first.nextSnapshot, second.nextSnapshot);
});

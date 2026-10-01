import test from 'node:test';
import assert from 'node:assert/strict';
import { getHistoricalSnapshots, INITIAL_DECISIONS_P1 } from '../data/initialData';
import { commitPeriod, createPreview, toCsv, validateBackupState, validateDecisions } from './simulationLifecycle';

test('preview is deterministic and does not mutate the official snapshot', () => {
  const snapshots = getHistoricalSnapshots();
  const before = structuredClone(snapshots);
  const preview = createPreview(snapshots[0], INITIAL_DECISIONS_P1);
  assert.equal(preview.period, 1);
  assert.deepEqual(snapshots, before);
});

test('period commit is idempotent', () => {
  const snapshots = getHistoricalSnapshots();
  const preview = createPreview(snapshots[0], INITIAL_DECISIONS_P1);
  const once = commitPeriod(snapshots, { ...snapshots[1], period: preview.period });
  const twice = commitPeriod(once, { ...snapshots[1], period: preview.period });
  assert.equal(Object.keys(once).length, Object.keys(twice).length);
  assert.deepEqual(once, twice);
});

test('validation reports capacity violations as blocking', () => {
  const snapshots = getHistoricalSnapshots();
  const decisions = { ...INITIAL_DECISIONS_P1, productionA: 10000, productionB: 10000 };
  const issues = validateDecisions(decisions, snapshots[0].firmsResults['1']);
  assert.ok(issues.some(issue => issue.severity === 'error' && issue.field === 'productionA'));
});

test('backup validation rejects inconsistent periods and CSV escapes values', () => {
  const snapshots = getHistoricalSnapshots();
  assert.throws(() => validateBackupState({
    snapshots,
    pendingDecisions: INITIAL_DECISIONS_P1,
    currentPeriod: 4,
    latestPeriod: 0,
  }), /période active/i);
  assert.match(toCsv([{ label: 'Résultat; net', value: 12 }]), /"Résultat; net";12/);
});

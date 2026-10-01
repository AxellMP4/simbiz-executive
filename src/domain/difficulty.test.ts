import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAIDecisions, simulateNextPeriod } from '../engine/simulationEngine';
import { getHistoricalSnapshots, INITIAL_DECISIONS_P1 } from '../data/initialData';
import { CompanySettings } from '../types/simulation';

test('competitor decisions are deterministic but evolve by period and difficulty', () => {
  const previous = getHistoricalSnapshots()[0].firmsResults['2'];
  const first = generateAIDecisions('2', 1, previous, 'hard');
  const replay = generateAIDecisions('2', 1, previous, 'hard');
  const next = generateAIDecisions('2', 2, previous, 'hard');
  const easy = generateAIDecisions('2', 1, previous, 'easy');
  assert.deepEqual(first, replay);
  assert.notDeepEqual(first, next);
  assert.notEqual(first.adSpend_local, easy.adSpend_local);
});

test('difficulty changes the deterministic market path', () => {
  const baseline = getHistoricalSnapshots()[0];
  const easy = simulateNextPeriod(baseline, INITIAL_DECISIONS_P1, { difficulty: 'easy' } as CompanySettings).nextSnapshot;
  const expert = simulateNextPeriod(baseline, INITIAL_DECISIONS_P1, { difficulty: 'expert' } as CompanySettings).nextSnapshot;
  assert.notDeepEqual(easy.marketEnvironment, expert.marketEnvironment);
  assert.notEqual(easy.competitorsBenchmark[1].priceLocalA, expert.competitorsBenchmark[1].priceLocalA);
});

test('firms keep distinct autonomous trajectories across periods', () => {
  const baseline = getHistoricalSnapshots()[0];
  const periodOne = simulateNextPeriod(baseline, INITIAL_DECISIONS_P1, { difficulty: 'normal' } as CompanySettings).nextSnapshot;
  const periodTwo = simulateNextPeriod(periodOne, INITIAL_DECISIONS_P1, { difficulty: 'normal' } as CompanySettings).nextSnapshot;
  const volta = periodTwo.firmsResults['2'].decisions;
  const zenith = periodTwo.firmsResults['3'].decisions;
  const atlas = periodTwo.firmsResults['4'].decisions;

  assert.ok(volta.priceA_local < periodOne.firmsResults['2'].decisions.priceA_local);
  assert.ok(zenith.priceB_local > periodOne.firmsResults['3'].decisions.priceB_local);
  assert.ok(atlas.sellersCount_export > periodOne.firmsResults['4'].decisions.sellersCount_export);
  assert.notEqual(volta.productionA, zenith.productionA);
  assert.notEqual(zenith.productionB, atlas.productionB);
});

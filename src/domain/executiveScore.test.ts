import test from 'node:test';
import assert from 'node:assert/strict';
import { getHistoricalSnapshots } from '../data/initialData';
import { computeExecutiveScore } from './executiveScore';

test('executive score computes valid grade and pillars on initial snapshot', () => {
  const snapshots = getHistoricalSnapshots();
  const firm1 = snapshots[0].firmsResults['1'];
  const evalResult = computeExecutiveScore(firm1, undefined, snapshots[0].competitorsBenchmark, snapshots[0].marketEnvironment);

  assert.ok(evalResult.overallScore >= 0 && evalResult.overallScore <= 100);
  assert.ok(['A+', 'A', 'B', 'C', 'D', 'E'].includes(evalResult.grade));
  assert.equal(typeof evalResult.gradeTitle, 'string');
  assert.ok(evalResult.pillars.financial.score >= 0);
  assert.ok(evalResult.pillars.market.score >= 0);
  assert.ok(evalResult.pillars.resilience.score >= 0);
  assert.ok(evalResult.pillars.humanEsg.score >= 0);
  assert.ok(evalResult.strengths.length > 0);
  assert.ok(evalResult.boardVerdict.length > 0);
});

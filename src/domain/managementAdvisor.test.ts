import test from 'node:test';
import assert from 'node:assert/strict';
import { getHistoricalSnapshots, INITIAL_DECISIONS_P1 } from '../data/initialData';
import { getManagementRecommendations } from './managementAdvisor';

test('advisor is deterministic and prioritizes cash risk', () => {
  const snapshot = structuredClone(getHistoricalSnapshots()[0]);
  const firm = snapshot.firmsResults['1'];
  firm.cashFlow.closingCash = 0;
  firm.cashFlow.closingOverdraft = 10_000;
  const recommendations = getManagementRecommendations({
    snapshot,
    pendingDecisions: INITIAL_DECISIONS_P1,
    periodStatus: 'draft',
  });
  assert.equal(recommendations[0].id, 'cash-runway');
  assert.deepEqual(recommendations, getManagementRecommendations({
    snapshot,
    pendingDecisions: INITIAL_DECISIONS_P1,
    periodStatus: 'draft',
  }));
});

test('advisor points to people and ESG actions from measurable thresholds', () => {
  const snapshot = structuredClone(getHistoricalSnapshots()[0]);
  const firm = snapshot.firmsResults['1'];
  firm.hrReport.metrics.turnoverRate = 18;
  firm.balanceSheet.ratios.esgScore = 40;
  const ids = getManagementRecommendations({
    snapshot,
    pendingDecisions: INITIAL_DECISIONS_P1,
    periodStatus: 'closed',
  }).map(recommendation => recommendation.id);
  assert.ok(ids.includes('people-retention'));
  assert.ok(ids.includes('esg-risk'));
});

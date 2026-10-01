import test from 'node:test';
import assert from 'node:assert/strict';
import { evolveMarketStocks } from './marketEvolution';
import { MarketEnvironment, CompetitorMarketData, FirmPeriodResult } from '../types/simulation';

const environment: MarketEnvironment = {
  period: 2, annualInterestRate: 4, inflationRate: 2, rawMaterialSpotPrice: 18,
  rawMaterialContractPrice: 15, overallMarketDemandA: 24000, overallMarketDemandB: 4500,
  overallExportDemandA: 4800, overallExportDemandB: 900, economicOutlook: 'stable',
  headlineNews: 'test', specialEventTitle: 'test',
};

const firms = ['1', '2'].map((firmId): CompetitorMarketData => ({
  firmId, firmName: firmId, salesRevenue: 1000000, netProfit: firmId === '1' ? 100000 : 20000,
  cash: 100000, marketShareOverall: 50, marketShareLocalA: 50, marketShareLocalB: 50,
  marketShareExportA: 50, marketShareExportB: 50, priceLocalA: 90, priceLocalB: 170,
  priceExportA: 90, priceExportB: 170, salesVolumeA: 100, salesVolumeB: 100,
  salesVolumeExportA: 100, salesVolumeExportB: 100, adSpend: 10000, sellersCount: 4,
  sharePrice: 50,
}));

const results = Object.fromEntries(firms.map(firm => [firm.firmId, {
  incomeStatement: { netProfit: firm.firmId === '1' ? 100000 : 20000, revenue: 1000000 },
} as FirmPeriodResult]));

test('market evolution is deterministic for the same period and inputs', () => {
  assert.deepEqual(evolveMarketStocks(2, environment, firms, results), evolveMarketStocks(2, environment, firms, results));
});

test('market evolution gives firms distinct paths and bounded volume', () => {
  const stocks = evolveMarketStocks(2, environment, firms, results);
  assert.notEqual(stocks['1'].price, stocks['2'].price);
  assert.ok(stocks['1'].volume > 0);
  assert.equal(stocks['1'].history.length, 2);
});

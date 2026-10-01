import test from 'node:test';
import assert from 'node:assert/strict';
import { createFinancialMarketState, executeOrder, instrumentsFromSnapshot, validateOrder, portfolioValue, quoteChangePercent } from './financialMarket';
import { getHistoricalSnapshots } from '../data/initialData';
import { PeriodSnapshot } from '../types/simulation';

const snapshot = {
  period: 1,
  marketStocks: {
    '1': { firmId: '1', symbol: 'APULSE', price: 100, previousClose: 98, change: 2, changePercent: 2, volume: 1000, history: [98, 100], driver: 'test' },
    '2': { firmId: '2', symbol: 'VOLTA', price: 50, previousClose: 49, change: 1, changePercent: 2, volume: 2000, history: [49, 50], driver: 'test' },
  },
} as unknown as PeriodSnapshot;

test('market state starts with deterministic cash and watchlist', () => {
  const state = createFinancialMarketState(snapshot);
  assert.equal(state.cash, 25_000);
  assert.deepEqual(state.watchlist, ['1', '2']);
});

test('buy then sell accounts for fees and realized P&L', () => {
  const instruments = instrumentsFromSnapshot(snapshot);
  const bought = executeOrder(createFinancialMarketState(snapshot), instruments, { side: 'buy', firmId: '1', quantity: 10 }, 1);
  assert.equal(bought.cash, 23_998.5);
  assert.equal(bought.positions[0].quantity, 10);
  const sold = executeOrder(bought, instruments, { side: 'sell', firmId: '1', quantity: 4 }, 1);
  assert.equal(sold.positions[0].quantity, 6);
  assert.equal(sold.transactions[0].realizedPnl, -1.2);
});

test('order validation rejects insufficient cash and inventory', () => {
  const instruments = instrumentsFromSnapshot(snapshot);
  const state = createFinancialMarketState(snapshot);
  assert.equal(validateOrder(state, instruments, { side: 'buy', firmId: '1', quantity: 1000 }).valid, false);
  assert.equal(validateOrder(state, instruments, { side: 'sell', firmId: '1', quantity: 1 }).valid, false);
});

test('portfolio value and cash reconcile after a complete round trip', () => {
  const instruments = instrumentsFromSnapshot(snapshot);
  const initial = createFinancialMarketState(snapshot);
  const bought = executeOrder(initial, instruments, { side: 'buy', firmId: '1', quantity: 10 }, 1);
  const sold = executeOrder(bought, instruments, { side: 'sell', firmId: '1', quantity: 10 }, 1);
  assert.equal(sold.positions.length, 0);
  assert.equal(portfolioValue(sold, instruments), 0);
  assert.equal(sold.cash, 24997);
  assert.equal(sold.transactions.length, 2);
});

test('invalid portfolio state is rejected before execution', () => {
  const instruments = instrumentsFromSnapshot(snapshot);
  const state = { ...createFinancialMarketState(snapshot), cash: -1 };
  assert.equal(validateOrder(state, instruments, { side: 'buy', firmId: '1', quantity: 1 }).valid, false);
});

test('the initial market gives every firm the same nominal level', () => {
  const initial = getHistoricalSnapshots()[0];
  const prices = initial.competitorsBenchmark.map(firm => firm.sharePrice);
  assert.deepEqual(prices, [50, 50, 50, 50, 50, 50]);
  assert.deepEqual(Object.values(initial.marketStocks || {}).map(quote => quote.price), [50, 50, 50, 50, 50, 50]);
});

test('ticker and volatility use the same quote change', () => {
  const initial = getHistoricalSnapshots()[0];
  const next = { ...initial, period: 1, marketStocks: {
    ...initial.marketStocks,
    '1': { ...initial.marketStocks!['1'], price: 40, previousClose: 50, change: -10, changePercent: -20 },
  } };
  assert.equal(quoteChangePercent(next, initial, '1'), -20);
});

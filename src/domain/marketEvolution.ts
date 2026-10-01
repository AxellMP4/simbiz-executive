import { CompetitorMarketData, MarketEnvironment, MarketStock, FirmPeriodResult, CompanySettings } from '../types/simulation';
import { DIFFICULTY_PROFILES, effectiveDifficulty } from './difficulty';

const hash = (value: string) => {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) result = Math.imul(result ^ value.charCodeAt(index), 16777619);
  return result >>> 0;
};

const random = (seed: number) => {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
};

const round = (value: number) => Math.round(value * 100) / 100;

const stockNames: Record<string, { symbol: string; name: string }> = {
  '1': { symbol: 'APULSE', name: 'innovation produit' },
  '2': { symbol: 'VOLTA', name: 'volume et prix' },
  '3': { symbol: 'ZENITH', name: 'prime premium' },
  '4': { symbol: 'ATLAS', name: 'demande export' },
  '5': { symbol: 'HELIOS', name: 'performance ESG' },
  '6': { symbol: 'TITAN', name: 'capacité industrielle' },
};

/**
 * Produces one reproducible quote per firm and period. The quote combines
 * fundamentals, market conditions and a bounded seeded shock; no wall-clock
 * randomness is used, so replaying a game gives the same market.
 */
export function evolveMarketStocks(
  period: number,
  environment: MarketEnvironment,
  competitors: CompetitorMarketData[],
  results: Record<string, FirmPeriodResult>,
  previous?: Record<string, MarketStock>,
  settings?: CompanySettings,
): Record<string, MarketStock> {
  const compCount = Math.max(1, competitors.length);
  const avgNetMargin = competitors.reduce((acc, c) => {
    const r = results[c.firmId];
    const rev = Math.max(1, r?.incomeStatement.revenue || c.salesRevenue || 1);
    const prof = r?.incomeStatement.netProfit ?? c.netProfit ?? 0;
    return acc + (prof / rev);
  }, 0) / compCount;

  const avgEsg = competitors.reduce((acc, c) => {
    const r = results[c.firmId];
    return acc + (c.esgScore ?? r?.balanceSheet?.ratios?.esgScore ?? 68);
  }, 0) / compCount;

  const avgCash = competitors.reduce((acc, c) => {
    const r = results[c.firmId];
    return acc + (c.cash || r?.cashFlow?.closingCash || 400000);
  }, 0) / compCount;

  const marketPulse = ((environment.overallMarketDemandA + environment.overallMarketDemandB) / 28500 - 1) * 0.12;
  const sectorPulse = (settings?.sectorEconomics?.demandGrowth ?? 0.02) * 0.5;

  return Object.fromEntries(competitors.map((firm) => {
    const previousStock = previous?.[firm.firmId];
    const previousClose = previousStock?.price ?? firm.sharePrice ?? 50;
    const result = results[firm.firmId];
    const revenue = Math.max(1, result?.incomeStatement.revenue || firm.salesRevenue || 1);
    const netProfit = result?.incomeStatement.netProfit ?? firm.netProfit ?? 0;
    const netMargin = netProfit / revenue;

    // Relative performance vs competitors benchmark in this period
    const relativeMarginEffect = (netMargin - avgNetMargin) * 0.55;
    const marketShare = firm.marketShareOverall || (100 / compCount);
    const shareEffect = ((marketShare - (100 / compCount)) / (100 / compCount)) * 0.045;

    const esg = firm.esgScore ?? result?.balanceSheet?.ratios?.esgScore ?? 68;
    const relativeEsgEffect = ((esg - avgEsg) / 100) * 0.06;

    const cash = firm.cash || result?.cashFlow?.closingCash || 400000;
    const liquidityEffect = Math.min(0.02, Math.max(-0.02, (cash - avgCash) / 2500000));

    const firmMultipliers: Record<string, number> = {
      '1': ((result?.decisions?.rdBudget || 18000) / 20000 - 1) * 0.015,
      '2': ((firm.salesVolumeA / 3600) - 1) * 0.02,
      '3': (((result?.incomeStatement.grossMargin || 550000) / revenue - 0.40)) * 0.04,
      '4': (((firm.marketShareExportA + firm.marketShareExportB) / 2 - 17) / 17) * 0.02,
      '5': ((esg - 75) / 100) * 0.03,
      '6': (((result?.decisions?.automationBudget || 10000) / 12000) - 1) * 0.015,
    };
    const strategyEffect = firmMultipliers[firm.firmId] || 0;

    const rng = random(hash(`${period}:${firm.firmId}:${environment.specialEventTitle ?? ''}`));
    const difficulty = DIFFICULTY_PROFILES[effectiveDifficulty(settings?.difficulty)];
    const shock = (rng() - 0.49) * (0.02 + (settings?.sectorEconomics?.demandVolatility ?? 0.12) * 0.05) * difficulty.marketVolatility;

    const changePercent = Math.max(-0.25, Math.min(0.25, relativeMarginEffect + shareEffect + relativeEsgEffect + liquidityEffect + marketPulse + sectorPulse + strategyEffect + shock));
    const price = round(Math.max(12, previousClose * (1 + changePercent)));
    const history = [...(previousStock?.history ?? [previousClose]), price].slice(-12);
    const info = stockNames[firm.firmId] ?? { symbol: `F${firm.firmId}`, name: 'résultats opérationnels' };

    let driver = `Évolution neutre alignée sur le secteur`;
    if (changePercent >= 0.04) {
      driver = `Forte surperformance portée par ${info.name} et les marges`;
    } else if (changePercent > 0) {
      driver = `Légère appréciation soutenue par ${info.name}`;
    } else if (changePercent <= -0.04) {
      driver = `Correction sous pression concurrentielle et coût du capital`;
    } else if (changePercent < 0) {
      driver = `Léger repli sous tension relative sur ${info.name}`;
    }

    return [firm.firmId, {
      firmId: firm.firmId,
      symbol: firm.firmId === '1' && settings?.tickerSymbol ? settings.tickerSymbol : info.symbol,
      price,
      previousClose: round(previousClose),
      change: round(price - previousClose),
      changePercent: round(changePercent * 100),
      volume: Math.round(22000 + rng() * 58000 + Math.abs(changePercent) * 95000),
      history,
      driver,
    } satisfies MarketStock];
  }));
}

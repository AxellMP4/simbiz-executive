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
  return Object.fromEntries(competitors.map((firm) => {
    const previousStock = previous?.[firm.firmId];
    const previousClose = previousStock?.price ?? firm.sharePrice ?? 50;
    const result = results[firm.firmId];
    const fundamentals = result ? (result.incomeStatement.netProfit / Math.max(1, result.incomeStatement.revenue)) * 8 : 0;
    const marketPulse = ((environment.overallMarketDemandA + environment.overallMarketDemandB) / 28500 - 1) * 0.45;
    const sectorPulse = settings?.sectorEconomics?.demandGrowth ?? 0.03;
    const rng = random(hash(`${period}:${firm.firmId}:${environment.specialEventTitle ?? ''}`));
    const difficulty = DIFFICULTY_PROFILES[effectiveDifficulty(settings?.difficulty)];
    const shock = (rng() - 0.5) * (0.025 + (settings?.sectorEconomics?.demandVolatility ?? 0.12) * 0.08) * difficulty.marketVolatility;
    const changePercent = Math.max(-0.22, Math.min(0.22, fundamentals + marketPulse + sectorPulse + shock));
    const price = round(Math.max(12, previousClose * (1 + changePercent)));
    const history = [...(previousStock?.history ?? [previousClose]), price].slice(-12);
    const info = stockNames[firm.firmId] ?? { symbol: `F${firm.firmId}`, name: 'résultats opérationnels' };
    const driver = changePercent >= 0 ? `Hausse portée par ${info.name}` : `Repli lié à ${info.name} et au choc macro`;
    return [firm.firmId, {
      firmId: firm.firmId,
      symbol: firm.firmId === '1' && settings?.tickerSymbol ? settings.tickerSymbol : info.symbol,
      price,
      previousClose: round(previousClose),
      change: round(price - previousClose),
      changePercent: round(changePercent * 100),
      volume: Math.round(24000 + rng() * 68000 + Math.abs(changePercent) * 120000),
      history,
      driver,
    } satisfies MarketStock];
  }));
}

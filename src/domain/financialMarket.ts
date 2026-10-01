import { CompanySettings, MarketStock, PeriodSnapshot } from '../types/simulation';

export type MarketSide = 'buy' | 'sell';

export interface MarketInstrument extends MarketStock {
  name: string;
  sector: string;
  history: number[];
}

export interface MarketPosition {
  firmId: string;
  symbol: string;
  quantity: number;
  averageCost: number;
}

export interface MarketTransaction {
  id: string;
  period: number;
  at: string;
  side: MarketSide;
  firmId: string;
  symbol: string;
  quantity: number;
  price: number;
  fees: number;
  total: number;
  realizedPnl: number;
}

export interface MarketAlert {
  id: string;
  firmId: string;
  symbol: string;
  target: number;
  direction: 'above' | 'below';
  enabled: boolean;
}

export interface FinancialMarketState {
  cash: number;
  initialCash: number;
  positions: MarketPosition[];
  transactions: MarketTransaction[];
  watchlist: string[];
  alerts: MarketAlert[];
  lastPeriod: number;
}

export interface OrderRequest {
  side: MarketSide;
  firmId: string;
  quantity: number;
}

export interface OrderValidation {
  valid: boolean;
  message?: string;
  estimatedTotal: number;
  fees: number;
}

export const quoteChangePercent = (
  snapshot: PeriodSnapshot,
  previousSnapshot: PeriodSnapshot | undefined,
  firmId: string,
): number => {
  const quote = snapshot.marketStocks?.[firmId];
  if (quote) return quote.changePercent;
  if (!previousSnapshot) return 0;
  const current = snapshot.firmsResults[firmId]?.balanceSheet.ratios.sharePrice ?? snapshot.competitorsBenchmark.find(firm => firm.firmId === firmId)?.sharePrice ?? 50;
  const previous = previousSnapshot.firmsResults[firmId]?.balanceSheet.ratios.sharePrice ?? previousSnapshot.competitorsBenchmark.find(firm => firm.firmId === firmId)?.sharePrice ?? 50;
  return previous > 0 ? round(((current - previous) / previous) * 100) : 0;
};

const FEE_RATE = 0.0015;
const MIN_ORDER_QUANTITY = 1;
const INITIAL_CASH = 25_000;
const sectorByFirm: Record<string, string> = {
  '1': 'Technologies',
  '2': 'Industrie',
  '3': 'Aéronautique',
  '4': 'Export',
  '5': 'Climat',
  '6': 'Robotique',
};

const namesByFirm: Record<string, string> = {
  '1': 'AeroPulse Technologies',
  '2': 'VoltaCore Systems',
  '3': 'Zenith Avionics',
  '4': 'Atlas Global',
  '5': 'Helios GreenTech',
  '6': 'Titan Robotics',
};

const round = (value: number) => Math.round(value * 100) / 100;

export function instrumentsFromSnapshot(snapshot: PeriodSnapshot, settings?: CompanySettings): MarketInstrument[] {
  return Object.values(snapshot.marketStocks || {}).map((quote) => ({
    ...quote,
    symbol: quote.firmId === '1' && settings?.tickerSymbol ? settings.tickerSymbol : quote.symbol,
    name: quote.firmId === '1' && settings?.companyName ? settings.companyName : (namesByFirm[quote.firmId] || quote.symbol),
    sector: sectorByFirm[quote.firmId] || 'Diversifié',
    history: quote.history.length > 1 ? quote.history : [quote.previousClose, quote.price],
  }));
}

export function createFinancialMarketState(snapshot: PeriodSnapshot): FinancialMarketState {
  const instruments = instrumentsFromSnapshot(snapshot);
  return {
    cash: INITIAL_CASH,
    initialCash: INITIAL_CASH,
    positions: [],
    transactions: [],
    watchlist: instruments.slice(0, 3).map((instrument) => instrument.firmId),
    alerts: [],
    lastPeriod: snapshot.period,
  };
}

export function evolveFinancialMarket(
  state: FinancialMarketState,
  snapshot: PeriodSnapshot,
): FinancialMarketState {
  if (snapshot.period <= state.lastPeriod) return state;
  return { ...state, lastPeriod: snapshot.period };
}

export function validateOrder(
  state: FinancialMarketState,
  instruments: MarketInstrument[],
  request: OrderRequest,
): OrderValidation {
  const instrument = instruments.find((item) => item.firmId === request.firmId);
  if (!instrument) return { valid: false, message: 'Valeur inconnue pour cette période.', estimatedTotal: 0, fees: 0 };
  if (!Number.isFinite(instrument.price) || instrument.price <= 0) {
    return { valid: false, message: 'Cours indisponible : ordre temporairement bloqué.', estimatedTotal: 0, fees: 0 };
  }
  if (!Number.isInteger(request.quantity) || request.quantity < MIN_ORDER_QUANTITY) {
    return { valid: false, message: 'La quantité doit être un entier supérieur ou égal à 1.', estimatedTotal: 0, fees: 0 };
  }
  if (!Number.isFinite(state.cash) || state.cash < 0 || state.positions.some(position => !Number.isInteger(position.quantity) || position.quantity < 0 || !Number.isFinite(position.averageCost) || position.averageCost < 0)) {
    return { valid: false, message: 'Portefeuille incohérent : restauration ou nouvelle partie requise.', estimatedTotal: 0, fees: 0 };
  }
  const gross = round(instrument.price * request.quantity);
  const fees = round(gross * FEE_RATE);
  const total = round(gross + fees);
  const position = state.positions.find((item) => item.firmId === request.firmId);
  if (request.side === 'buy' && total > state.cash) {
    return { valid: false, message: 'Trésorerie de marché insuffisante, frais inclus.', estimatedTotal: total, fees };
  }
  if (request.side === 'sell' && (!position || position.quantity < request.quantity)) {
    return { valid: false, message: 'Position insuffisante pour cette vente.', estimatedTotal: total, fees };
  }
  return { valid: true, estimatedTotal: total, fees };
}

export function executeOrder(
  state: FinancialMarketState,
  instruments: MarketInstrument[],
  request: OrderRequest,
  period: number,
  at = `P${period}`,
): FinancialMarketState {
  const validation = validateOrder(state, instruments, request);
  if (!validation.valid) throw new Error(validation.message || 'Ordre invalide.');
  const instrument = instruments.find((item) => item.firmId === request.firmId)!;
  const gross = round(instrument.price * request.quantity);
  const signedCash = request.side === 'buy' ? -(gross + validation.fees) : gross - validation.fees;
  const existing = state.positions.find((item) => item.firmId === request.firmId);
  const previousQuantity = existing?.quantity || 0;
  const previousCost = existing ? existing.averageCost * previousQuantity : 0;
  const nextQuantity = request.side === 'buy' ? previousQuantity + request.quantity : previousQuantity - request.quantity;
  const averageCost = request.side === 'buy'
    ? round((previousCost + gross + validation.fees) / nextQuantity)
    : (nextQuantity > 0 ? existing!.averageCost : 0);
  const realizedPnl = request.side === 'sell'
    ? round((gross - validation.fees) - existing!.averageCost * request.quantity)
    : 0;
  const positions = state.positions
    .filter((position) => position.firmId !== request.firmId)
    .concat(nextQuantity > 0 ? [{
      firmId: request.firmId,
      symbol: instrument.symbol,
      quantity: nextQuantity,
      averageCost,
    }] : []);
  const transaction: MarketTransaction = {
    id: `trade-${period}-${state.transactions.length + 1}`,
    period,
    at,
    side: request.side,
    firmId: request.firmId,
    symbol: instrument.symbol,
    quantity: request.quantity,
    price: instrument.price,
    fees: validation.fees,
    total: round(request.side === 'buy' ? gross + validation.fees : gross - validation.fees),
    realizedPnl,
  };
  const nextCash = round(state.cash + signedCash);
  if (nextCash < 0 || !Number.isFinite(nextCash)) throw new Error('Ordre refusé : la trésorerie deviendrait incohérente.');
  return {
    ...state,
    cash: nextCash,
    positions,
    transactions: [transaction, ...state.transactions].slice(0, 100),
  };
}

export function portfolioValue(state: FinancialMarketState, instruments: MarketInstrument[]): number {
  return round(state.positions.reduce((total, position) => {
    const instrument = instruments.find((item) => item.firmId === position.firmId);
    return total + (instrument?.price || position.averageCost) * position.quantity;
  }, 0));
}

export function unrealizedPnl(state: FinancialMarketState, instruments: MarketInstrument[]): number {
  return round(state.positions.reduce((total, position) => {
    const instrument = instruments.find((item) => item.firmId === position.firmId);
    return total + ((instrument?.price || position.averageCost) - position.averageCost) * position.quantity;
  }, 0));
}

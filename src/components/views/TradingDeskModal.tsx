import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ShieldCheck, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { PeriodSnapshot, CompanySettings } from '../../types/simulation';
import { FinancialMarketState, MarketInstrument, instrumentsFromSnapshot } from '../../domain/financialMarket';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  snapshot: PeriodSnapshot;
  companySettings: CompanySettings;
  marketState: FinancialMarketState;
  onExecuteTrade: (firmId: string, quantity: number, side: 'buy' | 'sell', stopLoss?: number, takeProfit?: number) => void;
}

export const TradingDeskModal: React.FC<Props> = ({
  isOpen,
  onClose,
  snapshot,
  companySettings,
  marketState,
  onExecuteTrade,
}) => {
  const instruments = instrumentsFromSnapshot(snapshot, companySettings);
  const [selectedFirmId, setSelectedFirmId] = useState<string>(instruments[0]?.firmId || '1');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<number>(50);
  const [stopLoss, setStopLoss] = useState<number>(45);
  const [takeProfit, setTakeProfit] = useState<number>(65);
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop_bracket'>('stop_bracket');

  if (!isOpen) return null;

  const currentInstrument = instruments.find(i => i.firmId === selectedFirmId) || instruments[0];
  const price = currentInstrument?.price || 50;
  const existingPosition = marketState.positions.find(p => p.firmId === selectedFirmId);

  const grossTotal = Math.round(price * quantity * 100) / 100;
  const fees = Math.round(grossTotal * 0.0015 * 100) / 100;
  const totalCost = orderSide === 'buy' ? grossTotal + fees : grossTotal - fees;

  const canAfford = orderSide === 'buy' ? marketState.cash >= totalCost : (existingPosition?.quantity || 0) >= quantity;

  // Chart data with history + current price
  const chartData = (currentInstrument?.history || [price]).map((val, idx) => ({
    period: `P${idx}`,
    price: val,
  }));

  const handleExecute = () => {
    onExecuteTrade(
      selectedFirmId,
      quantity,
      orderSide,
      orderType === 'stop_bracket' ? stopLoss : undefined,
      orderType === 'stop_bracket' ? takeProfit : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-white">Trading Desk Pro · Ordres Avancés</h2>
                <span className="rounded-full bg-amber-950 border border-amber-800 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                  Stop-Loss & Take-Profit
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Arbitrage de marché · Trésorerie disponible : <strong className="text-emerald-400 font-mono">{marketState.cash.toLocaleString('fr-FR')} {companySettings.currency}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Instrument Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {instruments.map(inst => {
              const isSelected = inst.firmId === selectedFirmId;
              const isPositive = inst.changePercent >= 0;
              return (
                <button
                  key={inst.firmId}
                  onClick={() => {
                    setSelectedFirmId(inst.firmId);
                    setStopLoss(Math.round(inst.price * 0.90 * 10) / 10);
                    setTakeProfit(Math.round(inst.price * 1.15 * 10) / 10);
                  }}
                  className={`flex flex-col p-2.5 rounded-xl border text-left min-w-[130px] transition-all ${isSelected ? 'border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-950/40' : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'}`}
                >
                  <span className="text-[11px] font-mono text-slate-400">{inst.symbol}</span>
                  <strong className="text-sm font-mono text-white mt-0.5">{inst.price} €</strong>
                  <span className={`text-[10px] font-mono font-bold mt-1 flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {isPositive ? `+${inst.changePercent}%` : `${inst.changePercent}%`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Chart & Execution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart Area */}
            <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Trajectoire de Cours · {currentInstrument.name}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">Driver : <strong className="text-white">{currentInstrument.driver}</strong></span>
                </div>
                <div className="h-48 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="period" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} domain={['auto', 'auto']} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      />
                      {orderType === 'stop_bracket' && (
                        <>
                          <ReferenceLine y={takeProfit} stroke="#10b981" strokeDasharray="3 3" label={{ value: `TP ${takeProfit}€`, fill: '#10b981', fontSize: 10 }} />
                          <ReferenceLine y={stopLoss} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: `SL ${stopLoss}€`, fill: '#f43f5e', fontSize: 10 }} />
                        </>
                      )}
                      <Area type="monotone" dataKey="price" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#priceGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800/80 pt-2">
                <span>Dernier Clôture : <strong className="text-white">{currentInstrument.previousClose} €</strong></span>
                <span>Volume échangé : <strong className="text-white">{currentInstrument.volume.toLocaleString('fr-FR')}</strong></span>
              </div>
            </div>

            {/* Order Execution Form */}
            <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4">
              {/* Buy / Sell toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-slate-900 border border-slate-800">
                <button
                  onClick={() => setOrderSide('buy')}
                  className={`py-1.5 rounded text-xs font-mono font-bold transition-all ${orderSide === 'buy' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Acheter (Long)
                </button>
                <button
                  onClick={() => setOrderSide('sell')}
                  className={`py-1.5 rounded text-xs font-mono font-bold transition-all ${orderSide === 'sell' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Vendre (Position : {existingPosition?.quantity || 0})
                </button>
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Quantité d'actions</span>
                  <span className="text-slate-400">Total : <strong className="text-white">{grossTotal} €</strong></span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-mono text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Stop-Loss & Take-Profit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-rose-400 block">Stop-Loss (€)</span>
                  <input
                    type="number"
                    step="0.5"
                    value={stopLoss}
                    onChange={e => setStopLoss(Number(e.target.value))}
                    className="w-full rounded-lg border border-rose-900/60 bg-rose-950/20 px-2.5 py-1.5 text-xs font-mono text-rose-300 focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-emerald-400 block">Take-Profit (€)</span>
                  <input
                    type="number"
                    step="0.5"
                    value={takeProfit}
                    onChange={e => setTakeProfit(Number(e.target.value))}
                    className="w-full rounded-lg border border-emerald-900/60 bg-emerald-950/20 px-2.5 py-1.5 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Summary and execute */}
              <div className="rounded-lg bg-slate-900 p-2.5 text-[11px] font-mono space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Frais de courtage (0.15%) :</span>
                  <span className="text-white">{fees} €</span>
                </div>
                <div className="flex justify-between font-bold text-white border-t border-slate-800 pt-1">
                  <span>Débours total :</span>
                  <span className="text-amber-400">{totalCost.toLocaleString('fr-FR')} €</span>
                </div>
              </div>

              {!canAfford && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-mono">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{orderSide === 'buy' ? 'Trésorerie de trading insuffisante' : 'Quantité détenue insuffisante'}</span>
                </div>
              )}

              <button
                disabled={!canAfford}
                onClick={handleExecute}
                className={`w-full py-2.5 rounded-lg text-xs font-bold font-mono transition-all ${orderSide === 'buy' ? 'bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50' : 'bg-rose-500 text-white hover:bg-rose-400 disabled:opacity-50'}`}
              >
                Valider l'ordre {orderSide === 'buy' ? 'd\'Achat' : 'de Vente'} ({quantity} titres)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

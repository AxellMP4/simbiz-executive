import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { PeriodSnapshot, CompanySettings } from '../../types/simulation';

interface NeonExecutiveChartsProps {
  snapshots: Record<number, PeriodSnapshot>;
  currentPeriod: number;
  selectedFirmId: string;
  companySettings: CompanySettings;
}

export const NeonExecutiveCharts: React.FC<NeonExecutiveChartsProps> = ({
  snapshots,
  currentPeriod,
  selectedFirmId,
  companySettings,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'financials' | 'marketShare' | 'stockEvolution'>('financials');
  const currency = companySettings.currency || '€';

  // Periods array up to currentPeriod
  const periodNums = Object.keys(snapshots)
    .map(Number)
    .filter(p => p <= currentPeriod)
    .sort((a, b) => a - b);

  const activeSnapshot = snapshots[currentPeriod] || snapshots[0];
  const userResult = activeSnapshot?.firmsResults['1'] || Object.values(activeSnapshot?.firmsResults || {})[0];

  // 1. Data for financial evolution
  const financialData = periodNums.map(p => {
    const snap = snapshots[p];
    const res = snap?.firmsResults['1'] || Object.values(snap?.firmsResults || {})[0];
    return {
      period: p,
      revenue: res?.incomeStatement.revenue || 0,
      grossMargin: res?.incomeStatement.grossMargin || 0,
      netProfit: res?.incomeStatement.netProfit || 0,
      cash: res?.cashFlow.closingCash || 0,
    };
  });

  const maxRevenue = Math.max(100000, ...financialData.map(d => d.revenue)) * 1.15;

  // 2. Data for market share donut / bars
  const competitors = activeSnapshot?.competitorsBenchmark || [];
  const totalMarketRev = competitors.reduce((acc, c) => acc + c.salesRevenue, 0);

  const marketColors: Record<string, string> = {
    '1': '#00f5ff', // Cyan fluo (Vous)
    '2': '#00ff88', // Émeraude fluo (Volta)
    '3': '#b026ff', // Violet fluo (Zenith)
    '4': '#ffaa00', // Ambre fluo (Atlas)
    '5': '#38bdf8', // Bleu ciel (Helios)
    '6': '#ff0055', // Rouge/rose fluo (Titan)
  };

  // 3. Stock price evolution
  const stockHistory = periodNums.map(p => {
    const snap = snapshots[p];
    const stockMap: Record<string, number> = {};
    competitors.forEach(c => {
      const fid = c.firmId;
      const quote = snap?.marketStocks?.[fid];
      const pRes = snap?.firmsResults[fid];
      stockMap[fid] = quote?.price || pRes?.balanceSheet.ratios.sharePrice || c.sharePrice || 50;
    });
    return {
      period: p,
      stocks: stockMap,
    };
  });

  const allStockPrices = stockHistory.flatMap(h => Object.values(h.stocks));
  const minStock = Math.max(0, Math.min(30, ...allStockPrices) * 0.9);
  const maxStock = Math.max(70, ...allStockPrices) * 1.1;
  const stockRange = maxStock - minStock || 1;

  return (
    <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-5 md:p-6 shadow-2xl space-y-5">
      {/* Header and Chart Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="font-display font-bold text-base text-white tracking-tight flex items-center gap-2">
              <span>Cockpit Analytique & Graphiques Stratégiques</span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualisations dynamiques multi-périodes de votre performance et du marché
          </p>
        </div>

        {/* Chart Selector Pills with Neon Accents */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveChartTab('financials')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer ${
              activeChartTab === 'financials'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/80 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rentabilité & CA</span>
          </button>

          <button
            onClick={() => setActiveChartTab('marketShare')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer ${
              activeChartTab === 'marketShare'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/80 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-purple-400" />
            <span>Parts de Marché</span>
          </button>

          <button
            onClick={() => setActiveChartTab('stockEvolution')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer ${
              activeChartTab === 'stockEvolution'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-400/80 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            <span>Bourse Bêta</span>
          </button>
        </div>
      </div>

      {/* 1. Tab Financials: Curves for CA, Marge, Résultat Net */}
      {activeChartTab === 'financials' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm" style={{ boxShadow: '0 0 8px #00f5ff' }} />
                <span className="text-cyan-300 font-bold">Chiffre d'Affaires</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-400 shadow-sm" style={{ boxShadow: '0 0 8px #b026ff' }} />
                <span className="text-purple-300 font-bold">Marge Brute</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm" style={{ boxShadow: '0 0 8px #00ff88' }} />
                <span className="text-emerald-300 font-bold">Résultat Net</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-500">Périodes P.0 à P.{currentPeriod}</span>
          </div>

          <div className="relative w-full h-64 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 overflow-hidden">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cyanArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00f5ff" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b026ff" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#b026ff" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Horizontal Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={200 - pct * 180 - 10}
                  x2="600"
                  y2={200 - pct * 180 - 10}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Coordinates Mapping */}
              {(() => {
                const getX = (i: number) => {
                  if (financialData.length <= 1) return 300;
                  return 40 + (i / (financialData.length - 1)) * 520;
                };
                const getY = (val: number) => {
                  const clamped = Math.max(0, val);
                  return 190 - (clamped / maxRevenue) * 170;
                };

                const revPoints = financialData.map((d, i) => `${getX(i)},${getY(d.revenue)}`);
                const marginPoints = financialData.map((d, i) => `${getX(i)},${getY(d.grossMargin)}`);
                const profitPoints = financialData.map((d, i) => `${getX(i)},${getY(d.netProfit)}`);

                const revAreaPoints = [
                  `${getX(0)},190`,
                  ...revPoints,
                  `${getX(financialData.length - 1)},190`,
                ].join(' ');

                const marginAreaPoints = [
                  `${getX(0)},190`,
                  ...marginPoints,
                  `${getX(financialData.length - 1)},190`,
                ].join(' ');

                return (
                  <>
                    {/* Areas */}
                    <polygon points={revAreaPoints} fill="url(#cyanArea)" />
                    <polygon points={marginAreaPoints} fill="url(#purpleArea)" />

                    {/* Lines */}
                    <polyline
                      points={revPoints.join(' ')}
                      fill="none"
                      stroke="#00f5ff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(0, 245, 255, 0.8))' }}
                    />
                    <polyline
                      points={marginPoints.join(' ')}
                      fill="none"
                      stroke="#b026ff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(176, 38, 255, 0.8))' }}
                    />
                    <polyline
                      points={profitPoints.join(' ')}
                      fill="none"
                      stroke="#00ff88"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(0, 255, 136, 0.8))' }}
                    />

                    {/* Dots with values */}
                    {financialData.map((d, i) => {
                      const cx = getX(i);
                      const cyRev = getY(d.revenue);
                      const cyProfit = getY(d.netProfit);
                      return (
                        <g key={i}>
                          {/* Dot CA */}
                          <circle cx={cx} cy={cyRev} r="5" fill="#00f5ff" stroke="#030712" strokeWidth="2" />
                          {/* Dot Profit */}
                          <circle cx={cx} cy={cyProfit} r="4.5" fill="#00ff88" stroke="#030712" strokeWidth="2" />
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>

            {/* X-Axis labels at bottom */}
            <div className="absolute bottom-1 left-0 right-0 flex justify-between px-10 text-[10px] font-mono text-slate-400">
              {financialData.map((d, i) => (
                <div key={i} className="text-center">
                  <span className="font-bold text-slate-200">P.{d.period}</span>
                  <span className="block text-[9px] text-cyan-300 font-mono">
                    {Math.round(d.revenue / 1000)}k€
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Tab Market Share: Donut & Comparison Bars */}
      {activeChartTab === 'marketShare' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Horizontal Comparison Bars */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-display uppercase tracking-wider text-purple-300">
              Répartition des Parts de Marché Globales
            </h4>
            <div className="space-y-2.5">
              {competitors.map(comp => {
                const color = marketColors[comp.firmId] || '#94a3b8';
                const isUser = comp.firmId === selectedFirmId;
                const share = comp.marketShareOverall || 0;

                return (
                  <div key={comp.firmId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className={isUser ? 'font-bold text-white' : 'text-slate-300'}>
                          {comp.firmName} {isUser && '(Vous)'}
                        </span>
                      </span>
                      <span className="font-bold" style={{ color }}>
                        {share.toFixed(1)} %
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.max(2, share)}%`,
                          backgroundColor: color,
                          boxShadow: isUser ? `0 0 10px ${color}` : undefined,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Donut representation */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {(() => {
                  let accumulated = 0;
                  return competitors.map(comp => {
                    const share = comp.marketShareOverall || 16.7;
                    const strokeDasharray = `${share} ${100 - share}`;
                    const strokeDashoffset = -accumulated;
                    accumulated += share;
                    const color = marketColors[comp.firmId] || '#94a3b8';

                    return (
                      <circle
                        key={comp.firmId}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke={color}
                        strokeWidth="15"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        pathLength="100"
                        className="transition-all duration-500 hover:opacity-80"
                        style={{
                          filter: comp.firmId === selectedFirmId ? `drop-shadow(0 0 6px ${color})` : undefined,
                        }}
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-display">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Part Leader</span>
                <span className="text-xl font-bold text-white font-mono">
                  {(competitors.find(c => c.firmId === selectedFirmId)?.marketShareOverall || 16.7).toFixed(1)}%
                </span>
                <span className="text-[9px] text-cyan-300 font-mono font-bold">APULSE</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 font-mono">
              Volume total du marché : {Math.round(totalMarketRev).toLocaleString('fr-FR')} {currency}
            </p>
          </div>
        </div>
      )}

      {/* 3. Tab Stock Evolution: Multi-firm Share Price Lines */}
      {activeChartTab === 'stockEvolution' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-3">
              {competitors.map(c => {
                const color = marketColors[c.firmId] || '#94a3b8';
                return (
                  <span key={c.firmId} className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className={c.firmId === selectedFirmId ? 'font-bold text-white' : 'text-slate-400'}>
                      {c.firmName.split(' ')[0]}
                    </span>
                  </span>
                );
              })}
            </div>
            <span className="text-[11px] text-slate-500">Cotation officielle Bourse (€)</span>
          </div>

          <div className="relative w-full h-64 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 overflow-hidden">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
              {/* Horizontal Guides */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={200 - pct * 180 - 10}
                  x2="600"
                  y2={200 - pct * 180 - 10}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}

              {competitors.map(comp => {
                const fid = comp.firmId;
                const color = marketColors[fid] || '#94a3b8';
                const isUser = fid === selectedFirmId;

                const getX = (i: number) => {
                  if (stockHistory.length <= 1) return 300;
                  return 40 + (i / (stockHistory.length - 1)) * 520;
                };
                const getY = (val: number) => {
                  return 190 - ((val - minStock) / stockRange) * 170;
                };

                const points = stockHistory.map((h, i) => `${getX(i)},${getY(h.stocks[fid] || 50)}`);

                return (
                  <g key={fid}>
                    <polyline
                      points={points.join(' ')}
                      fill="none"
                      stroke={color}
                      strokeWidth={isUser ? '3.5' : '1.8'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={isUser ? 1 : 0.7}
                      style={{
                        filter: isUser ? `drop-shadow(0 0 8px ${color})` : undefined,
                      }}
                    />
                    {stockHistory.map((h, i) => (
                      <circle
                        key={i}
                        cx={getX(i)}
                        cy={getY(h.stocks[fid] || 50)}
                        r={isUser ? 4.5 : 2.5}
                        fill={color}
                        stroke="#030712"
                        strokeWidth="1.5"
                      />
                    ))}
                  </g>
                );
              })}
            </svg>

            {/* X-Axis labels at bottom */}
            <div className="absolute bottom-1 left-0 right-0 flex justify-between px-10 text-[10px] font-mono text-slate-400">
              {stockHistory.map((h, i) => (
                <div key={i} className="text-center font-bold text-slate-200">
                  P.{h.period}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { PeriodSnapshot, CompanySettings } from '../../types/simulation';
import { quoteChangePercent } from '../../domain/financialMarket';
import {
  Flame,
  Zap,
  TrendingUp,
  TrendingDown,
  X,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';

export interface VolatilityData {
  firmId: string;
  name: string;
  symbol: string;
  currentPrice: number;
  prevPrice: number;
  diff: number;
  pctChange: number;
  isVolatile: boolean;
  isUser: boolean;
  color: string;
  marketCap: number;
  netProfit: number;
  revenue: number;
  diagnostic: string;
}

interface VolatilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: PeriodSnapshot;
  prevSnapshot?: PeriodSnapshot;
  companySettings?: CompanySettings;
  selectedFirmId: string;
  onSelectFirm: (firmId: string) => void;
}

export const VolatilityModal: React.FC<VolatilityModalProps> = ({
  isOpen,
  onClose,
  snapshot,
  prevSnapshot,
  companySettings,
  selectedFirmId,
  onSelectFirm,
}) => {
  if (!isOpen) return null;

  const currency = companySettings?.currency || '€';
  const period = snapshot.period;
  const prevPeriod = prevSnapshot?.period ?? Math.max(0, period - 1);

  // Compute volatility data for all firms
  const competitors = snapshot.competitorsBenchmark || [];

  const volatilityItems: VolatilityData[] = competitors.map(comp => {
    const fid = comp.firmId;
    const isUser = fid === '1';
    const firmRes = snapshot.firmsResults[fid];
    const currentPrice = snapshot.marketStocks?.[fid]?.price || firmRes?.balanceSheet.ratios.sharePrice || comp.sharePrice || 50;
    const pctChange = quoteChangePercent(snapshot, prevSnapshot, fid);
    const previousPrice = snapshot.marketStocks?.[fid]?.previousClose || 50;
    const diff = currentPrice - previousPrice;
    const isVolatile = Math.abs(pctChange) >= 15.0;

    let symbol = `F${fid}`;
    let name = comp.firmName;
    let color = '#94a3b8';

    if (fid === '1') {
      symbol = companySettings?.tickerSymbol || 'APULSE';
      name = companySettings?.companyName ? `${companySettings.companyName} (Vous)` : 'AeroPulse Tech (Vous)';
      color = companySettings?.brandColor || '#6366f1';
    } else if (fid === '2') {
      symbol = 'VOLTA';
      name = 'VoltaCore Systems';
      color = '#10b981';
    } else if (fid === '3') {
      symbol = 'ZENITH';
      name = 'Zenith Avionics';
      color = '#8b5cf6';
    } else if (fid === '4') {
      symbol = 'ATLAS';
      name = 'Atlas Global';
      color = '#f59e0b';
    } else if (fid === '5') {
      symbol = 'HELIOS';
      name = 'Helios GreenTech';
      color = '#06b6d4';
    } else if (fid === '6') {
      symbol = 'TITAN';
      name = 'Titan Robotics';
      color = '#ec4899';
    }

    const netProfit = firmRes?.incomeStatement.netProfit || comp.netProfit || 0;
    const revenue = firmRes?.incomeStatement.revenue || comp.salesRevenue || 0;
    const marketCap = Math.round(currentPrice * 50000); // 50,000 actions en circulation

    // Diagnostic generator
    let diagnostic = "Fluctuations régulières conformes à la tendance sectorielle.";
    if (pctChange >= 25.0) {
      diagnostic = "Envolée boursière majeure : surperformance de la marge brute et rentabilité exceptionnelle.";
    } else if (pctChange >= 15.0) {
      diagnostic = "Hausse explosive (> 15%) tirée par les bénéfices nets solides et les perspectives de croissance.";
    } else if (pctChange <= -25.0) {
      diagnostic = "Chute sévère : dégradation abrupte des marges ou pertes d'exploitation cumulées.";
    } else if (pctChange <= -15.0) {
      diagnostic = "Correction baissière marquée (> 15%) causée par une baisse de rentabilité ou trésorerie tendue.";
    }

    return {
      firmId: fid,
      name,
      symbol,
      currentPrice,
      prevPrice: previousPrice,
      diff,
      pctChange,
      isVolatile,
      isUser,
      color,
      marketCap,
      netProfit,
      revenue,
      diagnostic,
    };
  });

  const volatileFirms = volatilityItems.filter(f => f.isVolatile);
  const volatileCount = volatileFirms.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-white">
                  Radar de Volatilité Boursière
                </h2>
                <span className="text-xs bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-mono font-bold">
                  Seuil critique : ±15,0%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Surveillance en temps réel des variations inter-périodes (P.{prevPeriod} → P.{period})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert Banner */}
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${volatileCount > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${volatileCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="text-sm font-semibold text-slate-200 font-display">
                {volatileCount > 0
                  ? `⚡ Alerte déclenchée : ${volatileCount} entreprise${volatileCount > 1 ? 's affichent' : ' affiche'} une variation supérieure à 15%`
                  : '✅ Marché stable : aucune entreprise ne dépasse le seuil de 15% de variation'}
              </span>
            </div>

            <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              Règle : <strong className="text-amber-300">|Δ Cours| ≥ 15.0%</strong>
            </div>
          </div>
        </div>

        {/* Table of all 6 firms */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {volatilityItems.map(item => {
              const isSelected = item.firmId === selectedFirmId;
              const isPositive = item.diff >= 0;

              return (
                <div
                  key={item.firmId}
                  className={`p-4 rounded-xl border transition-all ${
                    item.isVolatile
                      ? isPositive
                        ? 'bg-amber-950/20 border-amber-500/60 shadow-xs shadow-amber-950/30'
                        : 'bg-rose-950/20 border-rose-500/60 shadow-xs shadow-rose-950/30'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  } ${isSelected ? 'ring-2 ring-indigo-500/60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm font-display">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                            {item.symbol}
                          </span>
                          {item.isUser && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-700">
                              VOUS
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Cap. Boursière : {item.marketCap.toLocaleString('fr-FR')} {currency}
                        </span>
                      </div>
                    </div>

                    {/* Volatility Badge */}
                    {item.isVolatile ? (
                      <span
                        className={`flex items-center gap-1 text-[11px] font-tech font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                          isPositive
                            ? 'bg-amber-950 text-amber-300 border border-amber-500 shadow-xs animate-pulse'
                            : 'bg-rose-950 text-rose-300 border border-rose-500 shadow-xs animate-pulse'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span>Haute Volatilité</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 shrink-0">
                        Volatilité Modérée
                      </span>
                    )}
                  </div>

                  {/* Price Movement Stats */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs font-mono my-2.5">
                    <div>
                      <span className="text-[10px] text-slate-400 block">P.{prevPeriod}</span>
                      <span className="text-slate-300 font-medium">{item.prevPrice.toFixed(2)} {currency}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">P.{period} (Actuel)</span>
                      <span className="text-white font-bold">{item.currentPrice.toFixed(2)} {currency}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Variation</span>
                      <span
                        className={`font-bold flex items-center ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                        )}
                        {isPositive ? '+' : ''}{item.pctChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Diagnostic Explanation */}
                  <p className="text-[11px] text-slate-400 leading-snug mb-3">
                    {item.diagnostic}
                  </p>

                  {/* Action to examine firm */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] font-mono text-slate-500">
                      Résultat net : {item.netProfit >= 0 ? '+' : ''}{item.netProfit.toLocaleString('fr-FR')} {currency}
                    </span>
                    <button
                      onClick={() => {
                        onSelectFirm(item.firmId);
                        onClose();
                      }}
                      className={`text-xs font-display px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      <span>{isSelected ? 'Firme sélectionnée' : 'Examiner'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-sans">
            La valorisation boursière s'ajuste dynamiquement à chaque clôture selon les bénéfices, dividendes et ratios de solvabilité.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-display transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

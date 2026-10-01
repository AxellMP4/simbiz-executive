import React, { useState } from 'react';
import { Play, Printer, RotateCcw, TrendingUp, Sparkles, ShieldCheck, Settings, Flame, Zap } from 'lucide-react';
import { PeriodSnapshot, CompanySettings } from '../../types/simulation';
import { StockTicker } from '../ui/StockTicker';
import { VolatilityModal } from '../ui/VolatilityModal';

interface TopBarProps {
  periods: number[];
  activePeriod: number;
  latestPeriod: number;
  onSelectPeriod: (period: number) => void;
  onSimulateNext: () => void;
  onResetSimulation: () => void;
  snapshot: PeriodSnapshot;
  prevSnapshot?: PeriodSnapshot;
  selectedFirmId: string;
  companySettings?: CompanySettings;
  onOpenCustomization?: () => void;
  onSelectFirm?: (firmId: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  periods,
  activePeriod,
  latestPeriod,
  onSelectPeriod,
  onSimulateNext,
  onResetSimulation,
  snapshot,
  prevSnapshot,
  selectedFirmId,
  companySettings,
  onOpenCustomization,
  onSelectFirm,
}) => {
  const [isVolatilityModalOpen, setIsVolatilityModalOpen] = useState<boolean>(false);

  const firmResult = snapshot.firmsResults[selectedFirmId] || snapshot.firmsResults['1'] || Object.values(snapshot.firmsResults)[0];
  const prevFirmResult = prevSnapshot?.firmsResults[selectedFirmId] || prevSnapshot?.firmsResults['1'];

  const netProfit = firmResult?.incomeStatement.netProfit || 0;
  const revenue = firmResult?.incomeStatement.revenue || 0;
  const cash = firmResult?.cashFlow.closingCash || 0;
  const overdraft = firmResult?.cashFlow.closingOverdraft || 0;
  const sharePrice = firmResult?.balanceSheet.ratios.sharePrice || 50;
  const prevSharePrice = prevFirmResult?.balanceSheet.ratios.sharePrice || 50;
  const esgScore = firmResult?.balanceSheet.ratios.esgScore || 70;
  const currency = companySettings?.currency || '€';

  // Calculate selected firm price change between periods
  const priceDiff = sharePrice - prevSharePrice;
  const pctChange = prevSharePrice > 0 ? (priceDiff / prevSharePrice) * 100 : 0;
  const isSelectedFirmVolatile = Math.abs(pctChange) >= 15.0;

  // Check if ANY firm in the benchmark is volatile
  const anyFirmVolatile = (snapshot.competitorsBenchmark || []).some(comp => {
    const fid = comp.firmId;
    const cur = snapshot.firmsResults[fid]?.balanceSheet.ratios.sharePrice || comp.sharePrice || 50;
    const prev = prevSnapshot?.firmsResults[fid]?.balanceSheet.ratios.sharePrice || (fid === '1' ? 50 : (comp.sharePrice ? comp.sharePrice * 0.98 : 50));
    const deltaPct = prev > 0 ? Math.abs((cur - prev) / prev) * 100 : 0;
    return deltaPct >= 15.0;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="shrink-0 flex flex-col z-10 shadow-sm">
      {/* Top Main Navigation Row */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 select-none">
        {/* Zone 1: Period Navigator starting at P0 */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-indigo-950/70 border border-indigo-700/60 px-2.5 py-1 rounded text-xs font-tech font-bold uppercase tracking-wider text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>PÉRIODE</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
            {periods.map(p => {
              const isActive = p === activePeriod;
              const isLatest = p === latestPeriod;
              return (
                <button
                  key={p}
                  onClick={() => onSelectPeriod(p)}
                  className={`min-w-7 h-7 px-2 flex items-center justify-center text-xs font-mono font-bold rounded transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : isLatest
                      ? 'text-amber-400 hover:bg-slate-800'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={`Consulter Période ${p}${isLatest ? ' (Dernière période clôturée)' : ''}`}
                >
                  P{p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Zone 2: Real-time Corporate KPIs for Selected Firm */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 mr-1.5 text-[11px]">Chiffre d'Affaires</span>
            <span className="font-semibold text-slate-100">
              {revenue.toLocaleString('fr-FR')} {currency}
            </span>
          </div>
          <div className="w-px h-4 bg-slate-800" />
          <div>
            <span className="text-slate-400 mr-1.5 text-[11px]">Résultat Net</span>
            <span
              className={`font-semibold ${
                netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {netProfit >= 0 ? '+' : ''}
              {netProfit.toLocaleString('fr-FR')} {currency}
            </span>
          </div>
          <div className="w-px h-4 bg-slate-800" />
          <div>
            <span className="text-slate-400 mr-1.5 text-[11px]">Trésorerie</span>
            <span
              className={`font-semibold ${
                overdraft > 0 ? 'text-rose-400' : 'text-sky-400'
              }`}
            >
              {overdraft > 0
                ? `Découvert: ${overdraft.toLocaleString('fr-FR')} ${currency}`
                : `${cash.toLocaleString('fr-FR')} ${currency}`}
            </span>
          </div>
          <div className="w-px h-4 bg-slate-800" />
          
          {/* Share price & Haute Volatilité Badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Action</span>
            <span className="font-bold text-amber-400">
              {sharePrice.toFixed(2)} {currency}
            </span>

            {/* Haute Volatilité Badge on the selected firm */}
            {isSelectedFirmVolatile && (
              <button
                onClick={() => setIsVolatilityModalOpen(true)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-tech font-bold uppercase tracking-wider animate-pulse transition-all cursor-pointer ${
                  pctChange >= 0
                    ? 'bg-amber-950 text-amber-300 border border-amber-500 shadow-xs'
                    : 'bg-rose-950 text-rose-300 border border-rose-500 shadow-xs'
                }`}
                title={`Cours en Haute Volatilité (${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(1)}%). Cliquez pour afficher le radar.`}
              >
                <Flame className="w-3 h-3 fill-current" />
                <span>Haute Volatilité ({pctChange >= 0 ? '+' : ''}{pctChange.toFixed(1)}%)</span>
              </button>
            )}
          </div>

          <div className="w-px h-4 bg-slate-800" />
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 text-[11px]">ESG</span>
            <span className="font-bold text-emerald-300">
              {esgScore}/100
            </span>
          </div>
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          {/* General Market Volatility Pill if other competitors are volatile and selected firm is not already showing it */}
          {anyFirmVolatile && !isSelectedFirmVolatile && (
            <button
              onClick={() => setIsVolatilityModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-950 border border-amber-600/70 text-amber-300 text-xs font-tech font-bold transition-all shadow-xs animate-pulse no-print"
              title="Alerte Bourse : Des entreprises subissent une variation de cours > 15%"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span className="hidden sm:inline">Haute Volatilité Marché</span>
              <span className="sm:hidden">&gt;15%</span>
            </button>
          )}

          {onOpenCustomization && (
            <button
              onClick={onOpenCustomization}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs font-display text-slate-200 transition-colors shadow-xs no-print"
              title="Personnaliser l'entreprise, le secteur et le logo"
            >
              <Settings className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Personnaliser</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors no-print"
            title="Imprimer l'état financier actif"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={onResetSimulation}
            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors no-print"
            title="Réinitialiser la simulation à P0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onSimulateNext}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-display tracking-wide transition-all shadow-md active:scale-95 no-print"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Clôturer & Simuler P.{latestPeriod + 1}</span>
          </button>
        </div>
      </header>

      {/* Dynamic Animated Stock Ticker Row with Volatility Support */}
      <StockTicker
        snapshot={snapshot}
        prevSnapshot={prevSnapshot}
        companySettings={companySettings}
        selectedFirmId={selectedFirmId}
        onSelectFirm={onSelectFirm}
        onOpenVolatilityModal={() => setIsVolatilityModalOpen(true)}
      />

      {/* High Volatility Radar Modal */}
      <VolatilityModal
        isOpen={isVolatilityModalOpen}
        onClose={() => setIsVolatilityModalOpen(false)}
        snapshot={snapshot}
        prevSnapshot={prevSnapshot}
        companySettings={companySettings}
        selectedFirmId={selectedFirmId}
        onSelectFirm={(fid) => {
          if (onSelectFirm) onSelectFirm(fid);
          setIsVolatilityModalOpen(false);
        }}
      />
    </div>
  );
};

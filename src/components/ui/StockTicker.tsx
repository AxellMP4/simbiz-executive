import React, { useMemo } from 'react';
import { PeriodSnapshot, CompanySettings } from '../../types/simulation';
import { TrendingUp, TrendingDown, Activity, Sparkles, Flame, Zap } from 'lucide-react';
import { quoteChangePercent } from '../../domain/financialMarket';

interface StockTickerProps {
  snapshot: PeriodSnapshot;
  prevSnapshot?: PeriodSnapshot;
  companySettings?: CompanySettings;
  selectedFirmId: string;
  onSelectFirm?: (firmId: string) => void;
  onOpenVolatilityModal?: () => void;
  onSelectCompetitor?: (firmId: string) => void;
}

interface TickerItem {
  id: string;
  symbol: string;
  name: string;
  basePrice: number;
  prevPrice: number;
  isUser: boolean;
  color: string;
  pctInterPeriod: number;
  isHighVolatility: boolean;
}

export const StockTicker: React.FC<StockTickerProps> = ({
  snapshot,
  prevSnapshot,
  companySettings,
  selectedFirmId,
  onSelectFirm,
  onOpenVolatilityModal,
  onSelectCompetitor,
}) => {
  const currency = companySettings?.currency || '€';

  const tickerList: TickerItem[] = useMemo(() => {
    const list: TickerItem[] = [];
    const competitors = snapshot.competitorsBenchmark || [];

    competitors.forEach(comp => {
      const fid = comp.firmId;
      const isUser = fid === '1'; // Firm 1 is user
      const firmRes = snapshot.firmsResults[fid];
      const prevFirmRes = prevSnapshot?.firmsResults[fid];

      const quote = snapshot.marketStocks?.[fid];
      const currentPrice = quote?.price || firmRes?.balanceSheet.ratios.sharePrice || comp.sharePrice || 50;
      // If no prevSnapshot (e.g. period 0), reference nominal IPO par value 50.00
      const previousPrice = prevFirmRes?.balanceSheet.ratios.sharePrice || 50;

      const pctInterPeriod = quoteChangePercent(snapshot, prevSnapshot, fid);
      const isHighVolatility = Math.abs(pctInterPeriod) >= 15.0;

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

      list.push({
        id: fid,
        symbol,
        name,
        basePrice: currentPrice,
        prevPrice: previousPrice,
        isUser,
        color,
        pctInterPeriod,
        isHighVolatility,
      });
    });

    return list;
  }, [snapshot, prevSnapshot, companySettings]);

  // Market index calculation (SIMBIX-6)
  const averageChangePct = useMemo(() => {
    if (tickerList.length === 0) return 0;
    const totalChange = tickerList.reduce((acc, t) => {
      return acc + t.pctInterPeriod;
    }, 0);
    return totalChange / tickerList.length;
  }, [tickerList]);
  const marketIndex = useMemo(() => {
    if (tickerList.length === 0) return 0;
    return tickerList.reduce((total, ticker) => total + ticker.basePrice, 0) / tickerList.length * 50;
  }, [tickerList]);

  // Check if any firm has high volatility (>= 15%)
  const volatileFirms = useMemo(() => {
    return tickerList.filter(t => t.isHighVolatility);
  }, [tickerList]);

  return (
    <div className="h-8 bg-slate-950 border-b border-slate-800/80 flex items-center overflow-hidden select-none text-xs font-mono relative z-0">
      {/* Live Badge Fixed on the Left */}
      <div className="h-full px-3 bg-slate-900 border-r border-slate-800 flex items-center gap-2 shrink-0 z-10 shadow-xs">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] font-tech font-bold uppercase tracking-wider text-slate-300">
          BOURSE SIMBIX
        </span>
        <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
          P.{snapshot.period}
        </span>
      </div>

      {/* Haute Volatilité Market Warning Badge if detected */}
      {volatileFirms.length > 0 && (
        <button
          onClick={onOpenVolatilityModal}
          className="h-full px-2.5 bg-amber-950/80 hover:bg-amber-900/80 border-r border-amber-700/60 flex items-center gap-1.5 shrink-0 z-10 cursor-pointer text-amber-300 font-tech font-bold text-[10px] uppercase tracking-wider transition-colors shadow-xs animate-pulse"
          title={`${volatileFirms.length} entreprise(s) affichent une variation > 15%. Cliquez pour ouvrir le radar.`}
        >
          <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
          <span>Haute Volatilité ({volatileFirms.length})</span>
        </button>
      )}

      {/* Market Composite Index Pill */}
      <div className="hidden md:flex items-center gap-2 px-3 py-0.5 bg-slate-900/60 border-r border-slate-800/80 shrink-0 z-10 text-[11px]">
        <span className="text-slate-400 font-semibold font-tech">SIMBIX-6</span>
        <span className="font-bold text-white">{marketIndex.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pts</span>
        <span className={`flex items-center text-[10px] font-bold ${averageChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {averageChangePct >= 0 ? (
            <TrendingUp className="w-3 h-3 mr-0.5" />
          ) : (
            <TrendingDown className="w-3 h-3 mr-0.5" />
          )}
          {averageChangePct >= 0 ? '+' : ''}
          {averageChangePct.toFixed(2)}%
        </span>
      </div>

      {/* Infinite Scrolling Ticker Track */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div className="animate-ticker items-center flex gap-6 px-4" tabIndex={0} aria-label="Cours boursiers défilants">
          {/* Render 2 sets for continuous seamless 360 loop */}
          {[1, 2].map(iteration => (
            <React.Fragment key={iteration}>
              {tickerList.map(ticker => {
                const livePrice = ticker.basePrice;
                const pctDiff = ticker.pctInterPeriod;
                const isPositive = pctDiff >= 0;
                const isSelected = selectedFirmId === ticker.id;
                const isVolatile = ticker.isHighVolatility;

                return (
                  <div
                    key={`${iteration}-${ticker.id}`}
                    onClick={() => {
                      if (ticker.id === '1') {
                        if (onSelectFirm) onSelectFirm('1');
                      } else {
                        if (onSelectCompetitor) {
                          onSelectCompetitor(ticker.id);
                        } else if (onSelectFirm) {
                          onSelectFirm(ticker.id);
                        }
                      }
                    }}
                    className={`flex items-center gap-2 px-2.5 py-0.5 rounded transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-850 ring-1 ring-slate-700'
                        : 'hover:bg-slate-900'
                    } ${
                      isVolatile
                        ? 'border border-amber-500/40 bg-amber-950/20'
                        : ''
                    }`}
                    title={`${ticker.name} - Cours: ${livePrice.toFixed(2)} ${currency} (${pctDiff >= 0 ? '+' : ''}${pctDiff.toFixed(1)}%)${ticker.isUser ? ' · Votre Entreprise' : ' · Cliquez pour ouvrir le dossier concurrent'}${isVolatile ? ' - HAUTE VOLATILITÉ (>15%)' : ''}`}
                  >
                    {/* Ticker Symbol & Badge */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: ticker.color }}
                      />
                      <span className={`font-bold font-tech text-[11px] ${ticker.isUser ? 'text-indigo-300' : 'text-slate-300'}`}>
                        {ticker.symbol}
                      </span>
                      {ticker.isUser && (
                        <span className="text-[8px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-1 py-0.2 rounded font-bold">
                          VOUS
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <span className="font-bold text-white text-[11px]">
                      {livePrice.toFixed(2)} {currency}
                    </span>

                    {/* Delta Percentage */}
                    <span
                      className={`flex items-center text-[10px] font-bold ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                      )}
                      {isPositive ? '+' : ''}
                      {pctDiff.toFixed(2)}%
                    </span>

                    {/* High Volatility Badge */}
                    {isVolatile && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenVolatilityModal) onOpenVolatilityModal();
                        }}
                        className="text-[9px] font-tech font-bold px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-600 flex items-center gap-0.5 hover:bg-amber-900 transition-colors"
                        title="Variation > 15% entre deux périodes"
                      >
                        <Flame className="w-2.5 h-2.5 fill-current" />
                        <span>&gt;15%</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

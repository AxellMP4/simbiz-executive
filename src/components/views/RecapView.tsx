import React from 'react';
import { PeriodSnapshot, CompanySettings } from '../../types/simulation';
import { SimpleBarChart } from '../ui/ChartComponents';
import {
  Building2,
  TrendingUp,
  AlertCircle,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  Award,
  Sparkles,
  Activity,
  Flame,
  Zap,
  Coins
} from 'lucide-react';

interface RecapViewProps {
  snapshot: PeriodSnapshot;
  prevSnapshot?: PeriodSnapshot;
  selectedFirmId: string;
  companySettings?: CompanySettings;
  onGoToDecisions: () => void;
  onSelectFirm: (firmId: string) => void;
}

export const RecapView: React.FC<RecapViewProps> = ({
  snapshot,
  prevSnapshot,
  selectedFirmId,
  companySettings,
  onGoToDecisions,
  onSelectFirm,
}) => {
  const { period, marketEnvironment, competitorsBenchmark, firmsResults } = snapshot;
  const myFirm = firmsResults[selectedFirmId] || firmsResults['1'] || Object.values(firmsResults)[0];
  const prevFirm = prevSnapshot?.firmsResults[selectedFirmId] || prevSnapshot?.firmsResults['1'];

  const borrowingLT = myFirm?.cashFlow.borrowingCapacityLT || 0;
  const borrowingST = myFirm?.cashFlow.borrowingCapacityST || 0;
  const sharePrice = myFirm?.balanceSheet.ratios.sharePrice || 50;
  const prevSharePrice = prevFirm?.balanceSheet.ratios.sharePrice || 50;
  const esgScore = myFirm?.balanceSheet.ratios.esgScore || 72;
  const altmanZ = myFirm?.balanceSheet.ratios.altmanZScore || 3.4;
  const enterpriseVal = myFirm?.balanceSheet.ratios.enterpriseValue || Math.round(sharePrice * 50000);
  const marketCap = Math.round(sharePrice * 50000); // 50,000 actions
  const currency = companySettings?.currency || '€';

  // Volatility calculation for selected firm
  const priceDiff = sharePrice - prevSharePrice;
  const pctChange = prevSharePrice > 0 ? (priceDiff / prevSharePrice) * 100 : 0;
  const isSelectedFirmVolatile = Math.abs(pctChange) >= 15.0;

  // Chart data for right column
  const salesChartData = competitorsBenchmark.map(c => {
    const isUser = c.firmId === '1';
    const label = isUser && companySettings?.tickerSymbol ? companySettings.tickerSymbol : `F${c.firmId}`;
    return {
      label,
      value: c.salesRevenue,
      highlight: c.firmId === selectedFirmId,
      color: c.firmId === selectedFirmId ? (companySettings?.brandColor || '#6366f1') : '#475569',
    };
  });

  const profitChartData = competitorsBenchmark.map(c => {
    const isUser = c.firmId === '1';
    const label = isUser && companySettings?.tickerSymbol ? companySettings.tickerSymbol : `F${c.firmId}`;
    return {
      label,
      value: c.netProfit,
      highlight: c.firmId === selectedFirmId,
      color: c.netProfit < 0 ? '#ef4444' : (c.firmId === selectedFirmId ? '#10b981' : '#475569'),
    };
  });

  const capChartData = competitorsBenchmark.map(c => {
    const fid = c.firmId;
    const isUser = fid === '1';
    const label = isUser && companySettings?.tickerSymbol ? companySettings.tickerSymbol : `F${fid}`;
    const p = firmsResults[fid]?.balanceSheet.ratios.sharePrice || c.sharePrice || 50;
    const mCap = Math.round(p * 50000);
    return {
      label,
      value: mCap,
      highlight: fid === selectedFirmId,
      color: fid === selectedFirmId ? '#f59e0b' : '#475569',
    };
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col xl:flex-row gap-6">
      {/* Central Content Area */}
      <div className="flex-1 flex flex-col space-y-6">
        {/* Title Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800/80 px-2.5 py-0.5 rounded font-mono font-bold">
                Période {period}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white font-display">
                Tableau de Bord Exécutif · {selectedFirmId === '1' && companySettings?.companyName ? companySettings.companyName : `Firme ${selectedFirmId}`}
              </h2>
              {selectedFirmId === '1' && (
                <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-700 px-2 py-0.5 rounded font-bold">
                  VOUS
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Synthèse trimestrielle des performances industrielles, valorisations boursières et positionnement sectoriel
            </p>
          </div>

          <button
            onClick={onGoToDecisions}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-display transition-all shadow-md active:scale-95"
          >
            <span>Préparer les Décisions P.{period + 1}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Executive KPI Cards with Market Cap & Volatility */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium">Chiffre d'Affaires</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {(myFirm?.incomeStatement.revenue || 0).toLocaleString('fr-FR')} {currency}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Total ventes P.{period}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium">Résultat Net</span>
            <div className={`text-xl font-bold font-mono mt-1 ${myFirm?.incomeStatement.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {myFirm?.incomeStatement.netProfit >= 0 ? '+' : ''}
              {(myFirm?.incomeStatement.netProfit || 0).toLocaleString('fr-FR')} {currency}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Bénéfice trimestriel</span>
          </div>

          {/* Action & Volatilité Badge */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Cours de l'Action</span>
              {isSelectedFirmVolatile && (
                <span className="flex items-center text-[9px] font-tech font-bold px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-600 animate-pulse">
                  <Flame className="w-2.5 h-2.5 mr-0.5 fill-current" />
                  &gt;15%
                </span>
              )}
            </div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              {sharePrice.toFixed(2)} {currency}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] font-mono font-semibold ${pctChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {pctChange >= 0 ? '+' : ''}{pctChange.toFixed(1)}% vs P.{Math.max(0, period - 1)}
              </span>
              {isSelectedFirmVolatile && (
                <span className="text-[9px] text-amber-300 font-bold uppercase font-tech">Volatile</span>
              )}
            </div>
          </div>

          {/* Capitalisation Boursière */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium">Capitalisation Boursière</span>
            <div className="text-xl font-bold font-mono text-sky-400 mt-1">
              {marketCap.toLocaleString('fr-FR')} {currency}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">50 000 actions émises</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium">Score RSE & Altman Z</span>
            <div className="text-xl font-bold font-mono text-indigo-400 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>{esgScore}/100</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Z-Score: {altmanZ} (Sûr)</span>
          </div>
        </div>

        {/* Benchmark Table With Volatility and Capitalization */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-200 font-display">
                Benchmark Sectoriel & Valorisations Boursières des 6 Concurrents
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Période {period} · Bourse SIMBIX</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Firme & Stratégie</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Ventes ({currency})</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Résultat Net</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Caisse</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Part Marché</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action ({currency})</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Cap. Boursière</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Score ESG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {competitorsBenchmark.map(comp => {
                  const fid = comp.firmId;
                  const isSelected = fid === selectedFirmId;
                  const isUser = fid === '1';

                  const firmRes = firmsResults[fid];
                  const prevFirmRes = prevSnapshot?.firmsResults[fid];
                  const curPrice = firmRes?.balanceSheet.ratios.sharePrice || comp.sharePrice || 50;
                  const oldPrice = prevFirmRes?.balanceSheet.ratios.sharePrice || (isUser ? 50 : (comp.sharePrice ? comp.sharePrice * 0.98 : 50));
                  const dPrice = curPrice - oldPrice;
                  const pct = oldPrice > 0 ? (dPrice / oldPrice) * 100 : 0;
                  const isVolatile = Math.abs(pct) >= 15.0;
                  const firmMarketCap = Math.round(curPrice * 50000);

                  const displayName = isUser && companySettings?.companyName
                    ? `${companySettings.companyName} (Vous)`
                    : comp.firmName;

                  return (
                    <tr
                      key={fid}
                      onClick={() => onSelectFirm(fid)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-950/50 text-indigo-200 font-semibold border-l-4 border-l-indigo-500'
                          : 'hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 px-4 flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isSelected ? 'ring-2 ring-indigo-400/40' : ''
                          }`}
                          style={{
                            backgroundColor: isUser && companySettings?.brandColor ? companySettings.brandColor : undefined
                          }}
                        />
                        <span className="font-sans font-medium">{displayName}</span>
                        {isUser && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-700 font-bold">
                            VOUS
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {comp.salesRevenue.toLocaleString('fr-FR')} {currency}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right ${
                          comp.netProfit < 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-semibold'
                        }`}
                      >
                        {comp.netProfit < 0 ? '-' : '+'}
                        {Math.abs(comp.netProfit).toLocaleString('fr-FR')} {currency}
                      </td>
                      <td className="py-2.5 px-3 text-right text-sky-400 font-semibold">
                        {comp.cash.toLocaleString('fr-FR')} {currency}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">
                        {comp.marketShareOverall.toFixed(1)} %
                      </td>

                      {/* Stock Price with Volatility Indicator */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-amber-400 font-semibold">
                            {curPrice.toFixed(2)} {currency}
                          </span>
                          {isVolatile && (
                            <span
                              className="text-[9px] font-tech font-bold px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-600 flex items-center gap-0.5 animate-pulse"
                              title={`Haute Volatilité : ${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`}
                            >
                              <Flame className="w-2.5 h-2.5 fill-current" />
                              <span>&gt;15%</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Market Cap */}
                      <td className="py-2.5 px-3 text-right text-sky-300 font-semibold">
                        {firmMarketCap.toLocaleString('fr-FR')} {currency}
                      </td>

                      <td className="py-2.5 px-4 text-right text-emerald-400">
                        {comp.esgScore || 70}/100
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Macro Conjoncture & Financial Capacity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* General Macroeconomic Environment */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <span className="font-display">Conjoncture Macro-économique</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Taux d'intérêt annuel période T+1 :</span>
                  <span className="font-mono font-semibold text-white">
                    {marketEnvironment.annualInterestRate.toFixed(2)} %
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Inflation prévisionnelle :</span>
                  <span className="font-mono font-semibold text-white">
                    {marketEnvironment.inflationRate.toFixed(2)} %
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Prix matières premières (Spot / Contrat) :</span>
                  <span className="font-mono font-semibold text-amber-400">
                    {marketEnvironment.rawMaterialSpotPrice.toFixed(2)} {currency} (Spot) / {marketEnvironment.rawMaterialContractPrice.toFixed(2)} {currency} (Cadre)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Taxe carbone en vigueur :</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {marketEnvironment.carbonTaxPerTon || 45} {currency} / tonne CO2
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">
                Dernière Dépêche Économique
              </span>
              <p className="text-xs text-slate-300 italic">
                "{marketEnvironment.headlineNews}"
              </p>
            </div>
          </div>

          {/* Corporate Financial Health & Capacities */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="font-display">Capacité Financière & Endettement (Firme {selectedFirmId})</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Capacité d'emprunt Moyen/Long Terme :</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {borrowingLT.toLocaleString('fr-FR')} {currency}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Ligne de crédit Court Terme :</span>
                  <span className="font-mono font-semibold text-sky-400">
                    {borrowingST.toLocaleString('fr-FR')} {currency}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Valeur d'Entreprise (Enterprise Value) :</span>
                  <span className="font-mono font-semibold text-indigo-300">
                    {enterpriseVal.toLocaleString('fr-FR')} {currency}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Score de Santé Financière (Altman Z) :</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {altmanZ} / 5.0 (Zone Sûre)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                  Trésorerie Disponible
                </span>
                <span className="text-sm font-bold font-mono text-sky-400">
                  {(myFirm?.cashFlow.closingCash || 0).toLocaleString('fr-FR')} {currency}
                </span>
              </div>
              <button
                onClick={onGoToDecisions}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Arbitrer P.{period + 1}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Comparative Charts */}
      <div className="w-full xl:w-80 flex flex-col space-y-4 shrink-0">
        <SimpleBarChart
          title={`Capitalisations Boursières (${currency})`}
          data={capChartData}
          height={170}
          unit={` ${currency}`}
        />

        <SimpleBarChart
          title={`Chiffres d'Affaires (${currency})`}
          data={salesChartData}
          height={170}
          unit={` ${currency}`}
        />

        <SimpleBarChart
          title={`Bénéfices Nets (${currency})`}
          data={profitChartData}
          height={170}
          unit={` ${currency}`}
        />
      </div>
    </div>
  );
};

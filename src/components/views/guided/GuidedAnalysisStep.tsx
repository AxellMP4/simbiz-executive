import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  Wallet,
  Users,
  Factory,
  ShieldCheck,
  Flame,
  ArrowRight,
  Sparkles,
  BarChart3,
  Globe2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass
} from 'lucide-react';
import { PeriodSnapshot, CompanySettings } from '../../../types/simulation';
import { kpisFor } from '../../../domain/simulationLifecycle';
import { AdvisorRecommendation } from '../../../domain/managementAdvisor';

interface GuidedAnalysisStepProps {
  snapshot: PeriodSnapshot;
  prevSnapshot?: PeriodSnapshot;
  companySettings: CompanySettings;
  selectedFirmId: string;
  onNextStep: () => void;
  advisorRecommendations: AdvisorRecommendation[];
  onOpenAdvisor?: () => void;
}

const money = (val: number, cur: string) => `${Math.round(val).toLocaleString('fr-FR')} ${cur}`;

export const GuidedAnalysisStep: React.FC<GuidedAnalysisStepProps> = ({
  snapshot,
  prevSnapshot,
  companySettings,
  selectedFirmId,
  onNextStep,
  advisorRecommendations,
  onOpenAdvisor,
}) => {
  const currentResult = snapshot.firmsResults[selectedFirmId] || snapshot.firmsResults['1'] || Object.values(snapshot.firmsResults)[0];
  const prevResult = prevSnapshot?.firmsResults[selectedFirmId] || prevSnapshot?.firmsResults['1'];

  const currentKPIs = kpisFor(currentResult);
  const priorKPIs = prevResult ? kpisFor(prevResult) : undefined;
  const delta = (k: keyof typeof currentKPIs) => (priorKPIs ? currentKPIs[k] - priorKPIs[k] : 0);

  const currency = companySettings.currency || '€';
  const myBenchmark = snapshot.competitorsBenchmark.find(c => c.firmId === selectedFirmId) || snapshot.competitorsBenchmark[0];
  const sortedBenchmark = [...snapshot.competitorsBenchmark].sort((a, b) => b.salesRevenue - a.salesRevenue);
  const myRank = sortedBenchmark.findIndex(c => c.firmId === selectedFirmId) + 1;

  const env = snapshot.marketEnvironment;
  const criticalAdvisories = advisorRecommendations.filter(r => r.critical || r.severity === 'critical');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Step Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-900/60 rounded-2xl p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                ÉTAPE 1 / 4
              </span>
              <span className="text-xs font-mono text-slate-400">
                Clôture Période {snapshot.period}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2.5">
              <span>Diagnostic Stratégique & Météo de Marché</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Analysez la rentabilité, votre rang concurrentiel face aux 5 firmes rivales et les signaux de marché avant de calibrer vos arbitrages pour le trimestre suivant.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={onNextStep}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs md:text-sm font-display tracking-wide shadow-lg shadow-indigo-950/60 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Étape 2 : Décisions Stratégiques</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <section aria-label="Indicateurs de performance">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Chiffre d'Affaires */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Chiffre d'Affaires</span>
              <Briefcase className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-2">
              <span className="text-base md:text-lg font-mono font-bold text-white block">
                {money(currentKPIs.revenue, currency)}
              </span>
              {priorKPIs && (
                <span className={`text-[10px] font-mono flex items-center gap-0.5 mt-0.5 ${delta('revenue') >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {delta('revenue') >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {delta('revenue') >= 0 ? '+' : ''}{money(delta('revenue'), currency)}
                </span>
              )}
            </div>
          </div>

          {/* Marge Brute */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Marge Brute</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2">
              <span className="text-base md:text-lg font-mono font-bold text-emerald-300 block">
                {money(currentKPIs.grossMargin, currency)}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Taux : {currentKPIs.revenue > 0 ? ((currentKPIs.grossMargin / currentKPIs.revenue) * 100).toFixed(1) : 0} %
              </span>
            </div>
          </div>

          {/* Résultat Net */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Résultat Net</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2">
              <span className={`text-base md:text-lg font-mono font-bold block ${currentKPIs.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currentKPIs.netProfit >= 0 ? '+' : ''}{money(currentKPIs.netProfit, currency)}
              </span>
              {priorKPIs && (
                <span className={`text-[10px] font-mono flex items-center gap-0.5 mt-0.5 ${delta('netProfit') >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {delta('netProfit') >= 0 ? '+' : ''}{money(delta('netProfit'), currency)} vs P.{snapshot.period - 1}
                </span>
              )}
            </div>
          </div>

          {/* Trésorerie Clôture */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Trésorerie</span>
              <Wallet className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-2">
              <span className={`text-base md:text-lg font-mono font-bold block ${currentKPIs.cash >= 0 ? 'text-sky-300' : 'text-rose-400'}`}>
                {money(currentKPIs.cash, currency)}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {currentResult.cashFlow.closingOverdraft > 0 ? `Découvert : ${money(currentResult.cashFlow.closingOverdraft, currency)}` : 'Solde bancaire sain'}
              </span>
            </div>
          </div>

          {/* Part de Marché & Rang */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Part de Marché</span>
              <BarChart3 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-2">
              <span className="text-base md:text-lg font-mono font-bold text-white block">
                {myBenchmark?.marketShareOverall?.toFixed(1) || '16.7'} %
              </span>
              <span className="text-[10px] font-mono text-indigo-300">
                Rang {myRank} sur {sortedBenchmark.length} firmes
              </span>
            </div>
          </div>

          {/* Climat Social & RH */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Climat Social</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2">
              <span className={`text-base md:text-lg font-mono font-bold block ${(currentResult.hrReport.metrics.socialClimateScore || 70) >= 65 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {currentResult.hrReport.metrics.socialClimateScore || 70}/100
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {currentKPIs.headcount} salariés · ESG {currentResult.balanceSheet.ratios.esgScore || 70}/100
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Analysis Body: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Benchmark & Radar Concurrentiel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Benchmark Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-indigo-400" />
                <h3 className="font-display font-bold text-sm text-white">
                  Positionnement Concurrentiel Sectoriel (Période {snapshot.period})
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                6 firmes en compétition
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Rang</th>
                    <th className="py-2.5 px-3">Entreprise</th>
                    <th className="py-2.5 px-3 text-right">CA Total</th>
                    <th className="py-2.5 px-3 text-right">PDM</th>
                    <th className="py-2.5 px-3 text-right">Résultat Net</th>
                    <th className="py-2.5 px-3 text-right">Cours Action</th>
                    <th className="py-2.5 px-3 text-right">ESG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sortedBenchmark.map((comp, idx) => {
                    const isUser = comp.firmId === selectedFirmId;
                    const res = snapshot.firmsResults[comp.firmId];
                    const profit = res?.incomeStatement.netProfit ?? 0;
                    return (
                      <tr
                        key={comp.firmId}
                        className={`transition-colors ${
                          isUser
                            ? 'bg-indigo-950/40 text-white font-bold border-l-4 border-indigo-500'
                            : 'hover:bg-slate-850 text-slate-300'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                            idx === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                            idx === 1 ? 'bg-slate-400/20 text-slate-200 border border-slate-400/40' :
                            idx === 2 ? 'bg-amber-700/20 text-amber-400 border border-amber-700/40' :
                            'text-slate-500'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="flex items-center gap-1.5 font-display text-xs">
                            <span>{comp.firmName}</span>
                            {isUser && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-600 text-white font-mono">
                                VOUS
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold">
                          {money(comp.salesRevenue, currency)}
                        </td>
                        <td className="py-3 px-3 text-right text-indigo-300">
                          {comp.marketShareOverall.toFixed(1)} %
                        </td>
                        <td className={`py-3 px-3 text-right ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {profit >= 0 ? '+' : ''}{money(profit, currency)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-amber-400">
                          {comp.sharePrice ? `${comp.sharePrice.toFixed(2)} ${currency}` : '-'}
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-400">
                          {comp.esgScore || 70}/100
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational Health Checks */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
            <h3 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Factory className="w-4 h-4 text-emerald-400" />
              <span>Santé Industrielle & Stocks finaux</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Stock Matières Premières</span>
                <strong className="text-white text-base block mt-1">
                  {currentResult.productionReport.rawMaterials.finalStock.toLocaleString('fr-FR')} U
                </strong>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Valeur : {money(currentResult.productionReport.rawMaterials.totalStockValue, currency)}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Stock Produits Finis Alpha</span>
                <strong className="text-white text-base block mt-1">
                  {currentResult.productionReport.productA.finalStockUnits.toLocaleString('fr-FR')} U
                </strong>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Rebuts usine : ~{Math.round(currentResult.productionReport.productA.produced * ((currentResult.hrReport.metrics.defectRate || 2.5) / 100))} U ({currentResult.hrReport.metrics.defectRate}%)
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Stock Produits Finis Apex</span>
                <strong className="text-white text-base block mt-1">
                  {currentResult.productionReport.productB.finalStockUnits.toLocaleString('fr-FR')} U
                </strong>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Capacité usine : {(currentResult.decisions.activeMachines || 5) * 1000} U/trimestre
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Market Weather & Advisor Alerts */}
        <div className="space-y-6">
          {/* Market Environment */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Compass className="w-4 h-4 text-amber-400" />
              <h3 className="font-display font-bold text-sm text-white">
                Météo de Marché P.{snapshot.period + 1}
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Demande Globale France A</span>
                <span className="font-mono font-bold text-emerald-400">
                  {(env.overallMarketDemandA || 24000).toLocaleString('fr-FR')} U
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Demande Globale France B</span>
                <span className="font-mono font-bold text-indigo-400">
                  {(env.overallMarketDemandB || 7000).toLocaleString('fr-FR')} U
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Prix Matière Première Spot</span>
                <span className="font-mono font-bold text-amber-300">
                  {env.rawMaterialSpotPrice || 2.45} {currency} / unité
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Taux d'Intérêt Annuel</span>
                <span className="font-mono font-bold text-slate-300">
                  {env.annualInterestRate || 5.5} %
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-200">
              <span className="font-bold block mb-1">Indice de Conjoncture :</span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Le marché est porteur pour les produits à forte valeur ajoutée. Veillez à maintenir une cadence d'approvisionnement stable pour éviter les surcoûts d'achat au spot.
              </p>
            </div>
          </div>

          {/* Strategic Advisories */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="font-display font-bold text-sm text-white">
                  Recommandations du Comité
                </h3>
              </div>
              {onOpenAdvisor && (
                <button
                  onClick={onOpenAdvisor}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono"
                >
                  Tout voir
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {advisorRecommendations.slice(0, 3).map(rec => (
                <div
                  key={rec.id}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    rec.critical
                      ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                      : rec.severity === 'warning'
                      ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{rec.title}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/40 font-mono">
                      {rec.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {rec.rationale}
                  </p>
                </div>
              ))}

              {advisorRecommendations.length === 0 && (
                <p className="text-xs text-slate-500 py-3 text-center">
                  Aucune alerte critique. L'entreprise est sur une trajectoire équilibrée.
                </p>
              )}
            </div>

            <button
              onClick={onNextStep}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-display flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <span>Continuer vers les Décisions (Étape 2)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

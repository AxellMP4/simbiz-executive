import React from 'react';
import {
  Trophy,
  Award,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Scale,
  Users,
  Compass,
  FileSpreadsheet
} from 'lucide-react';
import { PeriodSnapshot, CompanySettings } from '../../../types/simulation';
import { computeExecutiveScore, PerformanceGrade } from '../../../domain/executiveScore';

interface GuidedDebriefingStepProps {
  snapshot: PeriodSnapshot;
  prevSnapshot?: PeriodSnapshot;
  companySettings: CompanySettings;
  selectedFirmId: string;
  onStartNextPeriodTour: () => void;
  onGoToResultsView: () => void;
  onGoToMarketView: () => void;
}

const money = (val: number, cur: string) => `${Math.round(val).toLocaleString('fr-FR')} ${cur}`;

const gradeColors: Record<PerformanceGrade, { bg: string; text: string; border: string; glow: string }> = {
  'A+': { bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-500', glow: 'shadow-emerald-500/30' },
  'A':  { bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-600', glow: 'shadow-emerald-600/20' },
  'B':  { bg: 'bg-indigo-950/70',  text: 'text-indigo-300',  border: 'border-indigo-500',  glow: 'shadow-indigo-500/20' },
  'C':  { bg: 'bg-amber-950/70',   text: 'text-amber-300',   border: 'border-amber-500',   glow: 'shadow-amber-500/20' },
  'D':  { bg: 'bg-orange-950/70',  text: 'text-orange-300',  border: 'border-orange-500',  glow: 'shadow-orange-500/20' },
  'E':  { bg: 'bg-rose-950/80',    text: 'text-rose-300',    border: 'border-rose-500',    glow: 'shadow-rose-500/30' },
};

export const GuidedDebriefingStep: React.FC<GuidedDebriefingStepProps> = ({
  snapshot,
  prevSnapshot,
  companySettings,
  selectedFirmId,
  onStartNextPeriodTour,
  onGoToResultsView,
  onGoToMarketView,
}) => {
  const firmCurrent = snapshot.firmsResults[selectedFirmId] || snapshot.firmsResults['1'];
  const prevFirm = prevSnapshot?.firmsResults[selectedFirmId] || prevSnapshot?.firmsResults['1'];
  const currency = companySettings.currency || '€';

  const evaluation = computeExecutiveScore(
    firmCurrent,
    prevFirm,
    snapshot.competitorsBenchmark,
    snapshot.marketEnvironment
  );

  const colors = gradeColors[evaluation.grade] || gradeColors['C'];
  const is = firmCurrent.incomeStatement;
  const cf = firmCurrent.cashFlow;
  const sharePrice = firmCurrent.balanceSheet.ratios.sharePrice || 50;
  const prevSharePrice = prevFirm?.balanceSheet.ratios.sharePrice || 50;
  const shareDiff = sharePrice - prevSharePrice;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-900/60 rounded-2xl p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ÉTAPE 4 / 4
              </span>
              <span className="text-xs font-mono text-slate-400">
                Bilan Officiel Période {snapshot.period}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Débriefing & Évaluation de Performance du Dirigeant</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Consultez la notation attribuée par le Conseil d'Administration, les points de succès et les vulnérabilités de ce trimestre.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={onStartNextPeriodTour}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs md:text-sm font-display tracking-wide shadow-lg shadow-amber-950/60 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Démarrer la Période P.{snapshot.period + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Score & Board Feedback Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Executive Grade Card */}
        <div className={`p-6 rounded-2xl border ${colors.bg} ${colors.border} shadow-xl flex flex-col justify-between items-center text-center relative overflow-hidden`}>
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
              Note Globale de Gestion
            </span>
            <div className={`w-28 h-28 mx-auto rounded-3xl border-2 ${colors.border} flex items-center justify-center shadow-2xl bg-black/40`}>
              <span className={`text-6xl font-black font-display tracking-tight ${colors.text}`}>
                {evaluation.grade}
              </span>
            </div>
            <h3 className="font-display font-bold text-base text-white mt-3">
              {evaluation.gradeTitle}
            </h3>
            <span className="inline-block text-xs font-mono font-bold px-3 py-1 rounded-full bg-black/40 text-slate-200">
              Score : {evaluation.overallScore} / 100
            </span>
          </div>

          <div className="w-full mt-6 pt-4 border-t border-slate-700/60 text-xs text-slate-300 space-y-1">
            <div className="flex justify-between font-mono">
              <span className="text-slate-400">Action APULSE :</span>
              <span className="font-bold text-amber-300">
                {sharePrice.toFixed(2)} {currency} ({shareDiff >= 0 ? '+' : ''}{shareDiff.toFixed(2)} {currency})
              </span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-slate-400">Résultat Net :</span>
              <span className={`font-bold ${is.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {money(is.netProfit, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Pillars Breakdown */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Notation par Piliers Stratégiques</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Pondération équilibrée</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.values(evaluation.pillars).map(pillar => {
              const statusColor =
                pillar.status === 'excellent'
                  ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/80'
                  : pillar.status === 'good'
                  ? 'text-indigo-400 bg-indigo-950/40 border-indigo-800/80'
                  : pillar.status === 'warning'
                  ? 'text-amber-400 bg-amber-950/40 border-amber-800/80'
                  : 'text-rose-400 bg-rose-950/40 border-rose-800/80';

              return (
                <div key={pillar.name} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-xs text-white">
                      {pillar.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${statusColor}`}>
                      {pillar.score} / 100
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pillar.score >= 80 ? 'bg-emerald-500' : pillar.score >= 60 ? 'bg-indigo-500' : pillar.score >= 45 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pillar.score}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{pillar.summary}</span>
                    <span className="text-slate-500">Poids {pillar.weight}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Board of directors verdict */}
          <div className="mt-4 p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/60 text-xs space-y-1">
            <span className="font-bold text-indigo-300 font-display block">
              Avis du Conseil d'Administration :
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              "{evaluation.boardVerdict}"
            </p>
          </div>
        </div>
      </div>

      {/* Strengths & Vulnerabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Points Forts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Points Forts & Victoires du Trimestre</span>
          </h4>
          <ul className="space-y-2 text-xs">
            {evaluation.strengths.map((str, i) => (
              <li key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Points de Vigilance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Points de Vigilance & Risques</span>
          </h4>
          <ul className="space-y-2 text-xs">
            {evaluation.vulnerabilities.map((vul, i) => (
              <li key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-start gap-2">
                <span className="text-amber-400 font-bold">!</span>
                <span>{vul}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed Exploration & Next Cycle Call-to-action */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onGoToResultsView}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold font-display transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Consulter les États Financiers Complets</span>
          </button>

          <button
            onClick={onGoToMarketView}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold font-display transition-colors cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>Analyse Marché & Bourse</span>
          </button>
        </div>

        <button
          onClick={onStartNextPeriodTour}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs md:text-sm font-display tracking-wide shadow-lg shadow-amber-950/60 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Ouvrir et Piloter la Période P.{snapshot.period + 1}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

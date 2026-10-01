import React, { useState } from 'react';
import {
  Play,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Building2,
  FileCheck,
  Zap,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { FirmDecisions, PeriodSnapshot, CompanySettings, CrisisEvent } from '../../../types/simulation';
import { DecisionValidation } from '../../../domain/simulationLifecycle';

interface GuidedSimulationStepProps {
  currentPeriod: number;
  pendingDecisions: FirmDecisions;
  snapshot: PeriodSnapshot;
  companySettings: CompanySettings;
  selectedFirmId: string;
  onPrevStep: () => void;
  onExecuteSimulation: () => void;
  validation: DecisionValidation[];
  currentCrisis?: CrisisEvent;
  onSelectCrisisChoice?: (choiceId: string) => void;
}

const money = (val: number, cur: string) => `${Math.round(val).toLocaleString('fr-FR')} ${cur}`;

export const GuidedSimulationStep: React.FC<GuidedSimulationStepProps> = ({
  currentPeriod,
  pendingDecisions,
  snapshot,
  companySettings,
  selectedFirmId,
  onPrevStep,
  onExecuteSimulation,
  validation,
  currentCrisis,
  onSelectCrisisChoice,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const nextPeriod = currentPeriod + 1;
  const currency = companySettings.currency || '€';
  const firmCurrent = snapshot.firmsResults[selectedFirmId] || snapshot.firmsResults['1'];

  const errors = validation.filter(v => v.severity === 'error');
  const warnings = validation.filter(v => v.severity === 'warning');
  const hasErrors = errors.length > 0;

  const handleCommit = () => {
    if (hasErrors || isSimulating) return;
    setIsSimulating(true);
    // Give a smooth solemn pause for executive feel
    setTimeout(() => {
      onExecuteSimulation();
      setIsSimulating(false);
    }, 600);
  };

  const totalProd = (pendingDecisions.productionA || 0) + (pendingDecisions.productionB || 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Step Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-900/50 rounded-2xl p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ÉTAPE 3 / 4
              </span>
              <span className="text-xs font-mono text-slate-400">
                Conseil d'Administration & Exécution P.{nextPeriod}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-display text-white tracking-tight">
              Clôture & Exécution de la Simulation
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Vérifiez la conformité de vos arbitrages avec la gouvernance d'entreprise. Une fois le trimestre engagé, le marché calculera les résultats face aux 5 concurrents.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onPrevStep}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold font-display transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Modifier les Décisions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compliance / Governance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Compliance Status */}
        <div className={`p-5 rounded-2xl border ${
          hasErrors
            ? 'bg-rose-950/40 border-rose-800/80'
            : warnings.length > 0
            ? 'bg-amber-950/30 border-amber-800/80'
            : 'bg-emerald-950/30 border-emerald-800/80'
        }`}>
          <div className="flex items-center gap-2 mb-2 font-display font-bold text-sm">
            {hasErrors ? (
              <>
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span className="text-rose-200">Gouvernance Bloquante ({errors.length})</span>
              </>
            ) : warnings.length > 0 ? (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="text-amber-200">Conforme avec réserves ({warnings.length})</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-200">Conformité Validée à 100%</span>
              </>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {hasErrors
              ? 'Certains arbitrages dépassent les capacités légales ou physiques de l’entreprise.'
              : warnings.length > 0
              ? 'Toutes les décisions respectent les plafonds, mais certains arbitrages génèrent des surcoûts.'
              : 'Tous les leviers soumis sont conformes et validés par le comité de direction.'}
          </p>

          <div className="space-y-2">
            {errors.map((err, i) => (
              <div key={i} className="text-xs text-rose-300 bg-rose-950/60 p-2 rounded-lg border border-rose-800">
                • {err.message}
              </div>
            ))}
            {warnings.map((warn, i) => (
              <div key={i} className="text-xs text-amber-300 bg-amber-950/60 p-2 rounded-lg border border-amber-800">
                • {warn.message}
              </div>
            ))}
          </div>

          {hasErrors && (
            <button
              onClick={onPrevStep}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Corriger les erreurs à l'Étape 2
            </button>
          )}
        </div>

        {/* Executive Arbitrage Summary */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-400" />
              <span>Synthèse des Arbitrages Soumis pour P.{nextPeriod}</span>
            </h3>
            <span className="text-[11px] font-mono text-indigo-300">
              {companySettings.companyName}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Production Totale</span>
              <strong className="text-white text-sm block mt-0.5">{totalProd.toLocaleString('fr-FR')} U</strong>
              <span className="text-[10px] text-slate-500">Alpha: {pendingDecisions.productionA} / Apex: {pendingDecisions.productionB}</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Prix Moyens</span>
              <strong className="text-white text-sm block mt-0.5">
                {pendingDecisions.priceA_local} € / {pendingDecisions.priceB_local} €
              </strong>
              <span className="text-[10px] text-slate-500">Export: {pendingDecisions.priceA_export} € / {pendingDecisions.priceB_export} €</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Investissement R&D</span>
              <strong className="text-white text-sm block mt-0.5">
                {money(pendingDecisions.rdBudget || 0, currency)}
              </strong>
              <span className="text-[10px] text-slate-500">Éco-conception: {money(pendingDecisions.ecoDesignBudget || 0, currency)}</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Endettement Demandé</span>
              <strong className="text-white text-sm block mt-0.5">
                {money((pendingDecisions.mediumTermLoan || 0) + (pendingDecisions.greenLoanRequested || 0), currency)}
              </strong>
              <span className="text-[10px] text-slate-500">Emprunt MT + Prêt Vert</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Crisis Alert if any */}
      {currentCrisis && (
        <div className="bg-amber-950/40 border border-amber-700/80 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold font-display text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Événement Exceptionnel de Trimestre : {currentCrisis.title}</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">
            {currentCrisis.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {currentCrisis.choices.map(choice => {
              const isSelected = currentCrisis.chosenOptionId === choice.id;
              return (
                <button
                  key={choice.id}
                  onClick={() => onSelectCrisisChoice && onSelectCrisisChoice(choice.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs block font-bold mb-1">{choice.label}</span>
                  <span className="text-[11px] block opacity-90">{choice.description}</span>
                  <div className="mt-2 text-[10px] font-mono space-y-0.5">
                    {choice.cashImpact !== 0 && (
                      <span className="block">Cash : {choice.cashImpact > 0 ? '+' : ''}{money(choice.cashImpact, currency)}</span>
                    )}
                    {choice.profitImpact !== 0 && (
                      <span className="block">Résultat : {choice.profitImpact > 0 ? '+' : ''}{money(choice.profitImpact, currency)}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Execution Action */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 text-center space-y-4 shadow-2xl">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
          <Play className="w-7 h-7 fill-current ml-0.5" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg md:text-xl font-bold font-display text-white">
            Prêt à Simuler le Trimestre P.{nextPeriod} ?
          </h3>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">
            Le moteur de simulation calculera de manière déterministe les parts de marché, les ventes réalisées et le compte de résultat de votre entreprise face aux 5 concurrents.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onPrevStep}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold font-display transition-colors cursor-pointer"
          >
            Ajuster encore mes décisions
          </button>

          <button
            onClick={handleCommit}
            disabled={hasErrors || isSimulating}
            className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold font-display text-sm tracking-wide shadow-xl transition-all cursor-pointer ${
              hasErrors
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : isSimulating
                ? 'bg-amber-600 text-slate-900 animate-pulse'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:scale-105 active:scale-95 shadow-amber-950/80'
            }`}
          >
            {isSimulating ? (
              <>
                <RotateCcw className="w-5 h-5 animate-spin" />
                <span>Simulation en cours...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Clôturer & Exécuter la Période P.{nextPeriod}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

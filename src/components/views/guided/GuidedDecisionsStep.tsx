import React, { useState } from 'react';
import {
  ShoppingBag,
  Factory,
  Users,
  Landmark,
  ArrowRight,
  ArrowLeft,
  Zap,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Plus,
  Minus,
  Sliders,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { FirmDecisions, PeriodSnapshot, CompanySettings } from '../../../types/simulation';
import { DecisionValidation } from '../../../domain/simulationLifecycle';

interface GuidedDecisionsStepProps {
  currentPeriod: number;
  pendingDecisions: FirmDecisions;
  onUpdateDecisions: (updated: Partial<FirmDecisions>) => void;
  snapshot: PeriodSnapshot;
  companySettings: CompanySettings;
  selectedFirmId: string;
  onPrevStep: () => void;
  onNextStep: () => void;
  validation: DecisionValidation[];
}

type DecisionTab = 'sales' | 'production' | 'hr' | 'finance';

const money = (val: number, cur: string) => `${Math.round(val).toLocaleString('fr-FR')} ${cur}`;

export const GuidedDecisionsStep: React.FC<GuidedDecisionsStepProps> = ({
  currentPeriod,
  pendingDecisions,
  onUpdateDecisions,
  snapshot,
  companySettings,
  selectedFirmId,
  onPrevStep,
  onNextStep,
  validation,
}) => {
  const [activeTab, setActiveTab] = useState<DecisionTab>('sales');
  const currency = companySettings.currency || '€';
  const prodAName = companySettings.productAName || 'Produit Alpha';
  const prodBName = companySettings.productBName || 'Produit Apex';

  const nextPeriod = currentPeriod + 1;
  const firmCurrent = snapshot.firmsResults[selectedFirmId] || snapshot.firmsResults['1'];

  // Calculations for real-time sandbox
  const machineCapacity = Math.max(0, pendingDecisions.activeMachines * 1000 * (pendingDecisions.laborUtilizationRate || 1.0));
  const totalProduction = (pendingDecisions.productionA || 0) + (pendingDecisions.productionB || 0);
  const isOverMachineCapacity = totalProduction > machineCapacity;
  const capacityUsagePct = machineCapacity > 0 ? Math.round((totalProduction / machineCapacity) * 100) : 0;

  const rawStock = firmCurrent?.productionReport.rawMaterials.finalStock || 0;
  const neededMP = (pendingDecisions.productionA || 0) * 3.0 + (pendingDecisions.productionB || 0) * 4.0;
  const availableMP = rawStock + (pendingDecisions.rawMaterialOrder || 0);
  const isLackingMP = availableMP < neededMP;
  const deficitMP = isLackingMP ? Math.round(neededMP - availableMP) : 0;

  const maxLTLoan = firmCurrent?.cashFlow.borrowingCapacityLT || 850000;
  const isOverLoanLimit = (pendingDecisions.mediumTermLoan || 0) > maxLTLoan;

  // Real-time What-If Preflight Estimations
  const estimatedSalesVolumeA = Math.round(pendingDecisions.productionA * 0.95);
  const estimatedSalesVolumeB = Math.round(pendingDecisions.productionB * 0.95);
  const projectedRevenue = Math.round(
    estimatedSalesVolumeA * (pendingDecisions.priceA_local || 96) +
    estimatedSalesVolumeB * (pendingDecisions.priceB_local || 175)
  );
  const projectedGrossMargin = Math.round(projectedRevenue * 0.42);
  const projectedCashEnding = Math.round(
    (firmCurrent?.cashFlow.closingCash || 400000) +
    projectedRevenue * (pendingDecisions.clientPaymentTerms === 90 ? 0.5 : pendingDecisions.clientPaymentTerms === 60 ? 0.68 : 0.82) -
    (projectedRevenue * 0.65) +
    (pendingDecisions.mediumTermLoan || 0) +
    (pendingDecisions.greenLoanRequested || 0) +
    (pendingDecisions.equityRaise || 0) -
    (pendingDecisions.loanRepayment || 25000)
  );

  const numIssues = validation.filter(v => v.severity === 'error').length;

  const handleNumChange = (field: keyof FirmDecisions, val: number) => {
    onUpdateDecisions({ [field]: val });
  };

  const handleStep = (field: keyof FirmDecisions, delta: number, min = 0, max = Number.POSITIVE_INFINITY) => {
    const currentVal = Number(pendingDecisions[field]) || 0;
    const nextVal = Math.max(min, Math.min(max, currentVal + delta));
    onUpdateDecisions({ [field]: nextVal });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-900/60 rounded-2xl p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ÉTAPE 2 / 4
              </span>
              <span className="text-xs font-mono text-slate-400">
                Arbitrages pour Période {nextPeriod}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-display text-white tracking-tight">
              Décisions Stratégiques & Leviers Opérationnels
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Ajustez vos 4 départements clés. L'impact prévisionnel est recalculé en temps réel dans le bandeau de bord.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onPrevStep}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold font-display transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Diagnostic</span>
            </button>
            <button
              onClick={onNextStep}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs md:text-sm font-bold font-display tracking-wide shadow-lg shadow-amber-950/60 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Étape 3 : Clôture & Simulation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Sandbox Pre-flight Cockpit */}
      <div className="bg-slate-900/90 border border-indigo-900/50 rounded-2xl p-4 shadow-lg backdrop-blur-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold font-display uppercase tracking-wider text-indigo-300">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Simulateur Prévisionnel d'Impact en Direct</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Période {nextPeriod} (Scénario)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          {/* Revenue */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Chiffre d'Affaires Projeté</span>
            <strong className="text-white text-base block mt-0.5 font-bold">
              {money(projectedRevenue, currency)}
            </strong>
            <span className="text-[10px] text-emerald-400 block mt-0.5">
              Marge brute ~{money(projectedGrossMargin, currency)}
            </span>
          </div>

          {/* Cash */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Trésorerie Projetée</span>
            <strong className={`text-base block mt-0.5 font-bold ${projectedCashEnding >= 0 ? 'text-sky-300' : 'text-rose-400'}`}>
              {money(projectedCashEnding, currency)}
            </strong>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {projectedCashEnding >= 0 ? 'Trésorerie équilibrée' : '⚠️ Risque de découvert'}
            </span>
          </div>

          {/* Usine */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Charge Usine</span>
            <strong className={`text-base block mt-0.5 font-bold ${isOverMachineCapacity ? 'text-rose-400' : 'text-emerald-400'}`}>
              {capacityUsagePct} %
            </strong>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {totalProduction.toLocaleString('fr-FR')} U / {Math.round(machineCapacity).toLocaleString('fr-FR')} U max
            </span>
          </div>

          {/* Matières */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Stocks Matières</span>
            <strong className={`text-base block mt-0.5 font-bold ${isLackingMP ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isLackingMP ? `Déficit ${deficitMP} U` : 'Couvert à 100%'}
            </strong>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {availableMP.toLocaleString('fr-FR')} U dispo / {Math.round(neededMP).toLocaleString('fr-FR')} U
            </span>
          </div>
        </div>

        {/* Real-time Warnings bar */}
        {(isOverMachineCapacity || isLackingMP || isOverLoanLimit || numIssues > 0) && (
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap items-center gap-3 text-xs">
            {isOverMachineCapacity && (
              <span className="text-rose-400 flex items-center gap-1 font-semibold bg-rose-950/40 px-2 py-1 rounded border border-rose-800/60">
                <AlertTriangle className="w-3.5 h-3.5" /> Surcharge de production au-delà de la capacité usine !
              </span>
            )}
            {isLackingMP && (
              <span className="text-amber-400 flex items-center gap-1 font-semibold bg-amber-950/40 px-2 py-1 rounded border border-amber-800/60">
                <AlertTriangle className="w-3.5 h-3.5" /> Matières insuffisantes : achat d'urgence au cours spot appliqué.
              </span>
            )}
            {isOverLoanLimit && (
              <span className="text-rose-400 flex items-center gap-1 font-semibold bg-rose-950/40 px-2 py-1 rounded border border-rose-800/60">
                <AlertTriangle className="w-3.5 h-3.5" /> Emprunt supérieur à la capacité d'endettement autorisée !
              </span>
            )}
          </div>
        )}
      </div>

      {/* Sectoral Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs md:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'sales'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-sky-300" />
          <span>1. Ventes & Marketing</span>
        </button>

        <button
          onClick={() => setActiveTab('production')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs md:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'production'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Factory className="w-4 h-4 text-emerald-300" />
          <span>2. Production & Achats</span>
        </button>

        <button
          onClick={() => setActiveTab('hr')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs md:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'hr'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-amber-300" />
          <span>3. Ressources Humaines</span>
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs md:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'finance'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Landmark className="w-4 h-4 text-purple-300" />
          <span>4. Finance & R&D</span>
        </button>
      </div>

      {/* Tab 1: Commercial & Marketing */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Marché France */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold font-display text-white flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  <span>Marché National (France)</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">Canal principal</span>
              </h3>

              {/* Prix A Local */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">Prix {prodAName} (France)</label>
                  <span className="font-mono font-bold text-white">{pendingDecisions.priceA_local} {currency}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStep('priceA_local', -1, 40, 200)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="40"
                    max="180"
                    step="1"
                    value={pendingDecisions.priceA_local}
                    onChange={e => handleNumChange('priceA_local', parseFloat(e.target.value))}
                    className="flex-1 accent-indigo-500 cursor-pointer"
                  />
                  <button
                    onClick={() => handleStep('priceA_local', 1, 40, 200)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Prix B Local */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">Prix {prodBName} (France - Haut de gamme)</label>
                  <span className="font-mono font-bold text-white">{pendingDecisions.priceB_local} {currency}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStep('priceB_local', -2, 80, 350)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="80"
                    max="350"
                    step="2"
                    value={pendingDecisions.priceB_local}
                    onChange={e => handleNumChange('priceB_local', parseFloat(e.target.value))}
                    className="flex-1 accent-indigo-500 cursor-pointer"
                  />
                  <button
                    onClick={() => handleStep('priceB_local', 2, 80, 350)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Force de Vente & Pub */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Commerciaux France</label>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    value={pendingDecisions.sellersCount_local}
                    onChange={e => handleNumChange('sellersCount_local', parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Budget Pub France ({currency})</label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={pendingDecisions.adSpend_local}
                    onChange={e => handleNumChange('adSpend_local', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Marché Export */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold font-display text-white flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span>Marché Export (International)</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">Croissance rapide</span>
              </h3>

              {/* Prix A Export */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">Prix {prodAName} (Export)</label>
                  <span className="font-mono font-bold text-white">{pendingDecisions.priceA_export} {currency}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStep('priceA_export', -1, 40, 200)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="40"
                    max="180"
                    step="1"
                    value={pendingDecisions.priceA_export}
                    onChange={e => handleNumChange('priceA_export', parseFloat(e.target.value))}
                    className="flex-1 accent-indigo-500 cursor-pointer"
                  />
                  <button
                    onClick={() => handleStep('priceA_export', 1, 40, 200)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Prix B Export */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">Prix {prodBName} (Export)</label>
                  <span className="font-mono font-bold text-white">{pendingDecisions.priceB_export} {currency}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStep('priceB_export', -2, 80, 350)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="80"
                    max="350"
                    step="2"
                    value={pendingDecisions.priceB_export}
                    onChange={e => handleNumChange('priceB_export', parseFloat(e.target.value))}
                    className="flex-1 accent-indigo-500 cursor-pointer"
                  />
                  <button
                    onClick={() => handleStep('priceB_export', 2, 80, 350)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Force Export & Pub */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Commerciaux Export</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={pendingDecisions.sellersCount_export}
                    onChange={e => handleNumChange('sellersCount_export', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Budget Pub Export ({currency})</label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={pendingDecisions.adSpend_export}
                    onChange={e => handleNumChange('adSpend_export', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Conditions Clients & Poids Apex */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-white block mb-1">
                Délai de paiement accordé aux clients
              </label>
              <p className="text-[11px] text-slate-400 mb-3">
                Un délai plus long stimule les commandes mais immobilise de la trésorerie en créances clients (BFR).
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[30, 60, 90].map(terms => (
                  <button
                    key={terms}
                    onClick={() => handleNumChange('clientPaymentTerms', terms)}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                      pendingDecisions.clientPaymentTerms === terms
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {terms} jours
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="font-bold text-white">Effort Marketing Apex B</label>
                <span className="font-mono font-bold text-amber-400">
                  {Math.round((pendingDecisions.marketingEffortB || 0.5) * 100)} %
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Répartition des efforts publicitaires et commerciaux entre Alpha (entrée de gamme) et Apex (marge forte).
              </p>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={pendingDecisions.marketingEffortB}
                onChange={e => handleNumChange('marketingEffortB', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Production & Stocks */}
      {activeTab === 'production' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cadence de Fabrication */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold font-display text-white flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="flex items-center gap-2">
                  <Factory className="w-4 h-4 text-emerald-400" />
                  <span>Cadence de Production Usine</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Capacité : {Math.round(machineCapacity).toLocaleString('fr-FR')} U
                </span>
              </h3>

              {/* Production Alpha */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">Production {prodAName} (unités)</label>
                  <span className="font-mono font-bold text-white">{pendingDecisions.productionA.toLocaleString('fr-FR')} U</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStep('productionA', -100, 0, 10000)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="500"
                    max="6000"
                    step="50"
                    value={pendingDecisions.productionA}
                    onChange={e => handleNumChange('productionA', parseInt(e.target.value) || 0)}
                    className="flex-1 accent-emerald-500 cursor-pointer"
                  />
                  <button
                    onClick={() => handleStep('productionA', 100, 0, 10000)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Production Apex */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">Production {prodBName} (unités)</label>
                  <span className="font-mono font-bold text-white">{pendingDecisions.productionB.toLocaleString('fr-FR')} U</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStep('productionB', -50, 0, 5000)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="3000"
                    step="25"
                    value={pendingDecisions.productionB}
                    onChange={e => handleNumChange('productionB', parseInt(e.target.value) || 0)}
                    className="flex-1 accent-emerald-500 cursor-pointer"
                  />
                  <button
                    onClick={() => handleStep('productionB', 50, 0, 5000)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Taux Utilisation Ouvriers */}
              <div className="pt-2 space-y-1.5 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">Taux d'utilisation / Heures supplémentaires</label>
                  <span className="font-mono font-bold text-amber-300">
                    {Math.round((pendingDecisions.laborUtilizationRate || 1.0) * 100)} %
                  </span>
                </div>
                <input
                  type="range"
                  min="0.80"
                  max="1.25"
                  step="0.05"
                  value={pendingDecisions.laborUtilizationRate || 1.0}
                  onChange={e => handleNumChange('laborUtilizationRate', parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  &gt;100% augmente la cadence via heures supp, mais dégrade le climat social si prolongé.
                </span>
              </div>
            </div>

            {/* Approvisionnement & Machines */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold font-display text-white flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-sky-400" />
                  <span>Approvisionnements & Maintenance</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Stock initial : {rawStock.toLocaleString('fr-FR')} U
                </span>
              </h3>

              {/* Commande Matières Premières */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">Commande Matières Premières (U)</label>
                  <span className="font-mono font-bold text-white">
                    {pendingDecisions.rawMaterialOrder.toLocaleString('fr-FR')} U
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStep('rawMaterialOrder', -500, 0, 50000)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="5000"
                    max="35000"
                    step="500"
                    value={pendingDecisions.rawMaterialOrder}
                    onChange={e => handleNumChange('rawMaterialOrder', parseInt(e.target.value) || 0)}
                    className="flex-1 accent-sky-500 cursor-pointer"
                  />
                  <button
                    onClick={() => handleStep('rawMaterialOrder', 500, 0, 50000)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Besoin calculé : {Math.round(neededMP).toLocaleString('fr-FR')} U (3 U par Alpha, 4 U par Apex).
                </span>
              </div>

              {/* Contrat Fournisseur */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Type de contrat fournisseur</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateDecisions({ supplierContractType: 'contract' })}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition-colors cursor-pointer ${
                      pendingDecisions.supplierContractType === 'contract'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold block">Contrat Cadre</span>
                    <span className="text-[10px] opacity-80">Prix garanti négocié</span>
                  </button>
                  <button
                    onClick={() => onUpdateDecisions({ supplierContractType: 'spot' })}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition-colors cursor-pointer ${
                      pendingDecisions.supplierContractType === 'spot'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold block">Cours Spot</span>
                    <span className="text-[10px] opacity-80">Fluctue selon le marché</span>
                  </button>
                </div>
              </div>

              {/* Maintenance Préventive */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">Budget Maintenance Préventive</label>
                  <span className="font-mono font-bold text-white">
                    {money(pendingDecisions.preventiveMaintenanceBudget || 8000, currency)}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="25000"
                  step="1000"
                  value={pendingDecisions.preventiveMaintenanceBudget || 8000}
                  onChange={e => handleNumChange('preventiveMaintenanceBudget', parseFloat(e.target.value) || 0)}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  Réduit les pannes de machines et le taux de rebuts usine.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Ressources Humaines */}
      {activeTab === 'hr' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold font-display text-white flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Rémunérations & Climat Social</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Climat actuel : {firmCurrent?.hrReport.metrics.socialClimateScore || 70}/100
                </span>
              </h3>

              {/* Salaire de base commerciaux */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">Salaire fixe commercial ({currency}/trimestre)</label>
                  <span className="font-mono font-bold text-white">
                    {pendingDecisions.sellerSalary_local} {currency}
                  </span>
                </div>
                <input
                  type="range"
                  min="2500"
                  max="5000"
                  step="100"
                  value={pendingDecisions.sellerSalary_local}
                  onChange={e => handleNumChange('sellerSalary_local', parseFloat(e.target.value) || 0)}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Commission par unité */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">Commission par unité vendue</label>
                  <span className="font-mono font-bold text-white">
                    {pendingDecisions.commissionPerUnit_local} {currency} / unité
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="6.0"
                  step="0.25"
                  value={pendingDecisions.commissionPerUnit_local}
                  onChange={e => handleNumChange('commissionPerUnit_local', parseFloat(e.target.value) || 0)}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Intéressement / Participation aux bénéfices */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">Prime de participation aux résultats</label>
                  <span className="font-mono font-bold text-emerald-400">
                    {pendingDecisions.profitSharingRate || 4} % du bénéfice
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={pendingDecisions.profitSharingRate || 4}
                  onChange={e => handleNumChange('profitSharingRate', parseInt(e.target.value) || 0)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  Motive l'ensemble des équipes et réduit les tensions syndicales.
                </span>
              </div>
            </div>

            {/* Formation & QVT */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold font-display text-white flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Investissements Capital Humain & QVT</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {firmCurrent?.hrReport.workforce.totalEmployees} collaborateurs
                </span>
              </h3>

              {/* Budget Formation */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">Budget Formation Continue</label>
                  <span className="font-mono font-bold text-white">
                    {money(pendingDecisions.trainingBudget || 15000, currency)}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="40000"
                  step="2000"
                  value={pendingDecisions.trainingBudget || 15000}
                  onChange={e => handleNumChange('trainingBudget', parseFloat(e.target.value) || 0)}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  Augmente la productivité des ouvriers et diminue les erreurs d'assemblage.
                </span>
              </div>

              {/* Budget QVT */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">Budget Qualité de Vie au Travail (QVT)</label>
                  <span className="font-mono font-bold text-white">
                    {money(pendingDecisions.qvtBudget || 9000, currency)}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="30000"
                  step="1000"
                  value={pendingDecisions.qvtBudget || 9000}
                  onChange={e => handleNumChange('qvtBudget', parseFloat(e.target.value) || 0)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  Réduit le taux d'absentéisme et bonifie le score social de la firme.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Finance & R&D */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financement & Dette */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold font-display text-white flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-purple-400" />
                  <span>Trésorerie & Emprunts Bancaires</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Capacité emprunt : {money(maxLTLoan, currency)}
                </span>
              </h3>

              {/* Nouvel Emprunt Moyen Terme */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">Nouvel Emprunt Bancaire Moyen Terme</label>
                  <span className="font-mono font-bold text-white">
                    {money(pendingDecisions.mediumTermLoan || 0, currency)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.min(maxLTLoan, 500000)}
                  step="25000"
                  value={pendingDecisions.mediumTermLoan || 0}
                  onChange={e => handleNumChange('mediumTermLoan', parseFloat(e.target.value) || 0)}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  Injecte immédiatement du cash mais engendre des intérêts financiers au taux du marché.
                </span>
              </div>

              {/* Prêt Vert ESG */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">Prêt Vert à Taux Bonifié (Transition Écologique)</label>
                  <span className="font-mono font-bold text-emerald-400">
                    {money(pendingDecisions.greenLoanRequested || 0, currency)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150000"
                  step="10000"
                  value={pendingDecisions.greenLoanRequested || 0}
                  onChange={e => handleNumChange('greenLoanRequested', parseFloat(e.target.value) || 0)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Dividendes */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">Taux de distribution de dividendes</label>
                  <span className="font-mono font-bold text-amber-300">
                    {pendingDecisions.dividendPayoutRate || 0} % du résultat net
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={pendingDecisions.dividendPayoutRate || 0}
                  onChange={e => handleNumChange('dividendPayoutRate', parseInt(e.target.value) || 0)}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  Plafonné à 50%. Ravit les actionnaires et soutient le cours de l'action.
                </span>
              </div>
            </div>

            {/* R&D & Investissement */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold font-display text-white flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <span>Recherche & Développement (R&D)</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">Innovation d'avenir</span>
              </h3>

              {/* Budget R&D */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">Budget R&D du trimestre</label>
                  <span className="font-mono font-bold text-white">
                    {money(pendingDecisions.rdBudget || 20000, currency)}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="60000"
                  step="2500"
                  value={pendingDecisions.rdBudget || 20000}
                  onChange={e => handleNumChange('rdBudget', parseFloat(e.target.value) || 0)}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  Débloque des brevets technologiques, accroît l'attrait produit et bonifie le score ESG.
                </span>
              </div>

              {/* Investissement Eco-conception */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-300 font-medium">Investissement Éco-conception & Recyclabilité</label>
                  <span className="font-mono font-bold text-emerald-400">
                    {money(pendingDecisions.ecoDesignBudget || 0, currency)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30000"
                  step="2000"
                  value={pendingDecisions.ecoDesignBudget || 0}
                  onChange={e => handleNumChange('ecoDesignBudget', parseFloat(e.target.value) || 0)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Vos arbitrages sont sauvegardés automatiquement dans votre session.</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onPrevStep}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold font-display transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Diagnostic</span>
          </button>
          <button
            onClick={onNextStep}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs md:text-sm font-display tracking-wide shadow-lg shadow-amber-950/60 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>Passer à la Clôture & Simulation (Étape 3)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

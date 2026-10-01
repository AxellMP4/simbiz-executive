import React, { useState } from 'react';
import { FirmDecisions, PeriodSnapshot, CompanySettings } from '../../types/simulation';
import { CheckCircle2, AlertTriangle, Info, Play, Save, Sparkles, Sliders, Calculator, Zap, ShieldCheck, HeartPulse } from 'lucide-react';

interface DecisionsViewProps {
  currentPeriod: number;
  pendingDecisions: FirmDecisions;
  allSnapshots: Record<number, PeriodSnapshot>;
  onUpdateDecisions: (updated: Partial<FirmDecisions>) => void;
  onSimulate: () => void;
  selectedFirmId: string;
  companySettings?: CompanySettings;
}

export const DecisionsView: React.FC<DecisionsViewProps> = ({
  currentPeriod,
  pendingDecisions,
  allSnapshots,
  onUpdateDecisions,
  onSimulate,
  selectedFirmId,
  companySettings,
}) => {
  const nextPeriod = currentPeriod + 1;
  const prodAName = companySettings?.productAName || 'Produit Alpha';
  const prodBName = companySettings?.productBName || 'Produit Apex';
  const currency = companySettings?.currency || '€';

  // Retrieve past historical periods up to currentPeriod
  const historicalPeriods = Object.keys(allSnapshots)
    .map(Number)
    .filter(p => p <= currentPeriod)
    .sort((a, b) => a - b);

  // Pre-flight checks
  const machineCapacity = pendingDecisions.activeMachines * 1000 * (pendingDecisions.laborUtilizationRate || 1.0);
  const totalProduction = (pendingDecisions.productionA || 0) + (pendingDecisions.productionB || 0);
  const isOverMachineCapacity = totalProduction > machineCapacity;

  const currentSnapshot = allSnapshots[currentPeriod];
  const firmCurrent = currentSnapshot?.firmsResults[selectedFirmId] || currentSnapshot?.firmsResults['1'] || Object.values(currentSnapshot?.firmsResults || {})[0];
  const rawStock = firmCurrent?.productionReport.rawMaterials.finalStock || 0;
  const neededMP = (pendingDecisions.productionA || 0) * 3.0 + (pendingDecisions.productionB || 0) * 4.0;
  const availableMP = rawStock + (pendingDecisions.rawMaterialOrder || 0);
  const isLackingMP = availableMP < neededMP;
  const spotMPNeeded = isLackingMP ? Math.round(neededMP - availableMP) : 0;

  const maxLTLoan = firmCurrent?.cashFlow.borrowingCapacityLT || 850000;
  const isOverLoanLimit = (pendingDecisions.mediumTermLoan || 0) > maxLTLoan;

  // Live sandbox estimations for pre-flight projection
  const estimatedSalesVolumeA = Math.round(pendingDecisions.productionA * 0.95);
  const estimatedSalesVolumeB = Math.round(pendingDecisions.productionB * 0.95);
  const projectedRevenue = Math.round(
    estimatedSalesVolumeA * (pendingDecisions.priceA_local || 96) +
    estimatedSalesVolumeB * (pendingDecisions.priceB_local || 175)
  );
  const projectedGrossMargin = Math.round(projectedRevenue * 0.42);
  const projectedEbitda = Math.round(projectedRevenue * 0.16);
  const projectedSocialScore = Math.min(98, Math.max(30, Math.round(
    75 + ((pendingDecisions.qvtBudget || 8000) / 1000) + ((pendingDecisions.profitSharingRate || 4) * 1.5) + ((pendingDecisions.trainingBudget || 12000) / 3000) - ((pendingDecisions.laborUtilizationRate || 1.0) > 1.15 ? 8 : 0)
  )));
  const projectedCashEnding = Math.round(
    (firmCurrent?.cashFlow.closingCash || 400000) +
    projectedRevenue * ((pendingDecisions.clientPaymentTerms === 90) ? 0.5 : (pendingDecisions.clientPaymentTerms === 60) ? 0.68 : 0.82) -
    (projectedRevenue * 0.65) +
    (pendingDecisions.mediumTermLoan || 0) +
    (pendingDecisions.greenLoanRequested || 0) +
    (pendingDecisions.equityRaise || 0) -
    (pendingDecisions.loanRepayment || 25000)
  );

  const handleInputChange = (field: keyof FirmDecisions, val: string) => {
    const num = parseFloat(val);
    onUpdateDecisions({ [field]: isNaN(num) ? 0 : num });
  };

  const handleSelectChange = (field: keyof FirmDecisions, val: any) => {
    onUpdateDecisions({ [field]: val });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 font-display">
            <span>Feuille de Décisions Stratégiques · Firme {selectedFirmId}</span>
            <span className="text-xs bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-mono font-bold">
              Période {nextPeriod} en arbitrage
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-amber-400 font-semibold">●</span>
            <span>Saisissez vos leviers pour la Période {nextPeriod}. Vos décisions seront confrontées aux 5 autres firmes lors de la simulation.</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSimulate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-display tracking-wide transition-all shadow-lg shadow-amber-950/40 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Valider & Clôturer pour Simuler P.{nextPeriod}</span>
          </button>
        </div>
      </div>

      {/* Real-time What-If Preflight Simulator Sandbox */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/60 rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3 border-b border-indigo-900/40 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300 font-display">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Simulateur Prévisionnel d'Impact en Temps Réel (Pre-Flight Engine)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Projections basées sur vos paramètres saisis</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs">
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Chiffre d'Affaires Estimé</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {projectedRevenue.toLocaleString('fr-FR')} €
            </span>
            <span className="text-[9px] text-slate-500">Marge brute ~{projectedGrossMargin.toLocaleString('fr-FR')} €</span>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Trésorerie Finale Estimée</span>
            <span className={`text-sm font-bold mt-0.5 block ${projectedCashEnding >= 0 ? 'text-sky-400' : 'text-rose-400'}`}>
              {projectedCashEnding.toLocaleString('fr-FR')} €
            </span>
            <span className="text-[9px] text-slate-500">Fin P.{nextPeriod}</span>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Charge Usine / Machines</span>
            <span className={`text-sm font-bold mt-0.5 block ${isOverMachineCapacity ? 'text-rose-400' : 'text-emerald-400'}`}>
              {Math.round((totalProduction / (machineCapacity > 0 ? machineCapacity : 1)) * 100)} %
            </span>
            <span className="text-[9px] text-slate-500">{totalProduction} U / {Math.round(machineCapacity)} max</span>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Climat Social Projeté</span>
            <span className="text-sm font-bold text-indigo-300 mt-0.5 block">
              {projectedSocialScore} / 100
            </span>
            <span className="text-[9px] text-emerald-400">Risque grève faible</span>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Stocks Matières</span>
            <span className={`text-sm font-bold mt-0.5 block ${isLackingMP ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isLackingMP ? `Déficit ${spotMPNeeded} U` : 'Couvert'}
            </span>
            <span className="text-[9px] text-slate-500">{availableMP} U dispo / {Math.round(neededMP)} U</span>
          </div>
        </div>

        {/* Live warnings */}
        {(isOverMachineCapacity || isLackingMP || isOverLoanLimit) && (
          <div className="mt-3 pt-2.5 border-t border-indigo-900/40 text-[11px] font-sans flex flex-wrap gap-4">
            {isOverMachineCapacity && (
              <span className="text-rose-400 flex items-center gap-1 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" /> Surcharge machines ! Réduisez la cadence ou activez les heures sup.
              </span>
            )}
            {isLackingMP && (
              <span className="text-amber-400 flex items-center gap-1 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" /> Stocks insuffisants : des achats d'urgence au cours spot seront engagés.
              </span>
            )}
            {isOverLoanLimit && (
              <span className="text-rose-400 flex items-center gap-1 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" /> Dépassement du plafond de crédit bancaire autorisé !
              </span>
            )}
          </div>
        )}
      </div>

      {/* Decision Entry Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-4 font-semibold w-80 font-display">Paramètres Stratégiques & Leviers</th>
              {historicalPeriods.map(p => (
                <th key={p} className="py-2.5 px-3 text-right font-semibold">
                  P. {p}
                </th>
              ))}
              <th className="py-2.5 px-4 text-right font-bold text-amber-400 bg-amber-950/40 border-l border-amber-800/60 font-display">
                P. {nextPeriod} (À Saisir)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">

            {/* STRATÉGIE COMMERCIALE & CONDITIONS CLIENTS */}
            <tr className="bg-slate-950/90 font-bold text-slate-200">
              <td colSpan={historicalPeriods.length + 2} className="py-2.5 px-4 uppercase text-[11px] tracking-wider text-sky-400 font-display">
                1. Stratégie Commerciale & Conditions Clients
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">
                <span>Délai de paiement accordé aux clients (jours)</span>
                <span className="block text-[10px] text-slate-500 font-sans">30j (standard), 60j (+5% ventes, BFR+), 90j (+9% ventes, BFR++)</span>
              </td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.clientPaymentTerms || 30} j
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <select
                  value={pendingDecisions.clientPaymentTerms || 30}
                  onChange={e => handleSelectChange('clientPaymentTerms', parseInt(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-bold focus:border-amber-400 focus:outline-hidden"
                >
                  <option value={30}>30 jours</option>
                  <option value={60}>60 jours (+5% dem.)</option>
                  <option value={90}>90 jours (+9% dem.)</option>
                </select>
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">Effort marketing sur Produit Apex B (0 à 1)</td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {(allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.marketingEffortB ?? 0.5).toFixed(2)}
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="1.0"
                  value={pendingDecisions.marketingEffortB}
                  onChange={e => handleInputChange('marketingEffortB', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-amber-300 font-bold focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>

            {/* MARCHÉ NATIONAL */}
            <tr className="bg-slate-950/90 font-bold text-slate-200">
              <td colSpan={historicalPeriods.length + 2} className="py-2.5 px-4 uppercase text-[11px] tracking-wider text-indigo-400 font-display">
                2. Marché National
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">Prix de vente {prodAName} ({currency})</td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.priceA_local.toFixed(2)} {currency}
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="1"
                  value={pendingDecisions.priceA_local}
                  onChange={e => handleInputChange('priceA_local', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-bold focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">Prix de vente {prodBName} ({currency})</td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.priceB_local.toFixed(2)} {currency}
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="1"
                  value={pendingDecisions.priceB_local}
                  onChange={e => handleInputChange('priceB_local', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-bold focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">Nombre de vendeurs marché national</td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.sellersCount_local}
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={pendingDecisions.sellersCount_local}
                  onChange={e => handleInputChange('sellersCount_local', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">Budget Publicité & Salons National (€)</td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.adSpend_local.toLocaleString('fr-FR')} €
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="1000"
                  value={pendingDecisions.adSpend_local}
                  onChange={e => handleInputChange('adSpend_local', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sky-400 font-bold focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>

            {/* MARCHÉ EXPORT */}
            <tr className="bg-slate-950/90 font-bold text-slate-200">
              <td colSpan={historicalPeriods.length + 2} className="py-2.5 px-4 uppercase text-[11px] tracking-wider text-amber-400 font-display">
                3. Marché Exportation (International)
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">Prix de vente Export A (€)</td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.priceA_export.toFixed(2)} €
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="1"
                  value={pendingDecisions.priceA_export}
                  onChange={e => handleInputChange('priceA_export', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">Prix de vente Export B (€)</td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.priceB_export.toFixed(2)} €
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="1"
                  value={pendingDecisions.priceB_export}
                  onChange={e => handleInputChange('priceB_export', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">Vendeurs Export</td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.sellersCount_export}
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  min="0"
                  max="8"
                  value={pendingDecisions.sellersCount_export}
                  onChange={e => handleInputChange('sellersCount_export', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">Budget Publicité Export (€)</td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.adSpend_export.toLocaleString('fr-FR')} €
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="1000"
                  value={pendingDecisions.adSpend_export}
                  onChange={e => handleInputChange('adSpend_export', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-amber-300 font-bold focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>

            {/* PRODUCTION & INDUSTRIE 4.0 */}
            <tr className="bg-slate-950/90 font-bold text-slate-200">
              <td colSpan={historicalPeriods.length + 2} className="py-2.5 px-4 uppercase text-[11px] tracking-wider text-emerald-400 font-display">
                4. Production, Maintenance & Industrie 4.0
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">Production Produit Alpha (Unités)</td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.productionA.toLocaleString('fr-FR')}
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="100"
                  value={pendingDecisions.productionA}
                  onChange={e => handleInputChange('productionA', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-emerald-400 font-bold focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">Production Produit Apex (Unités)</td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.productionB.toLocaleString('fr-FR')}
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="50"
                  value={pendingDecisions.productionB}
                  onChange={e => handleInputChange('productionB', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-purple-300 font-bold focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">Machines actives en usine (Unités)</td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.activeMachines}
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={pendingDecisions.activeMachines}
                  onChange={e => handleInputChange('activeMachines', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">Taux d'utilisation ouvriers / Heures Sup (1.00 à 1.25)</td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {(allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.laborUtilizationRate || 1.0).toFixed(2)}
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="1.25"
                  value={pendingDecisions.laborUtilizationRate}
                  onChange={e => handleInputChange('laborUtilizationRate', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">
                <span>Budget Maintenance Préventive Machines (€)</span>
                <span className="block text-[10px] text-slate-500 font-sans">Prévient les pannes d'usine, rendement accru jusqu'à 104%</span>
              </td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {(allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.preventiveMaintenanceBudget || 8000).toLocaleString('fr-FR')} €
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="1000"
                  value={pendingDecisions.preventiveMaintenanceBudget || 8000}
                  onChange={e => handleInputChange('preventiveMaintenanceBudget', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-emerald-400 font-bold focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">
                <span>Robotisation & Industrie 4.0 (€)</span>
                <span className="block text-[10px] text-slate-500 font-sans">Réduit le taux de rebuts usine et dope la productivité horaire</span>
              </td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {(allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.automationBudget || 12000).toLocaleString('fr-FR')} €
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="2000"
                  value={pendingDecisions.automationBudget || 12000}
                  onChange={e => handleInputChange('automationBudget', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-purple-300 font-bold focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>

            {/* SUPPLY CHAIN */}
            <tr className="bg-slate-950/90 font-bold text-slate-200">
              <td colSpan={historicalPeriods.length + 2} className="py-2.5 px-4 uppercase text-[11px] tracking-wider text-teal-400 font-display">
                5. Supply Chain & Approvisionnements
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">
                <span>Contrat Fournisseur Matières</span>
                <span className="block text-[10px] text-slate-500 font-sans">Contrat cadre (14,80 €/U garanti) vs Marché Spot (18,50 €/U)</span>
              </td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.supplierContractType === 'spot' ? 'Spot' : 'Contrat Cadre'}
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <select
                  value={pendingDecisions.supplierContractType || 'contract'}
                  onChange={e => handleSelectChange('supplierContractType', e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-bold focus:border-amber-400 focus:outline-hidden"
                >
                  <option value="contract">Contrat Cadre (14,80 €)</option>
                  <option value="spot">Marché Spot (18,50 €)</option>
                </select>
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">Commande Matières Premières (Unités)</td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.rawMaterialOrder.toLocaleString('fr-FR')}
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="1000"
                  value={pendingDecisions.rawMaterialOrder}
                  onChange={e => handleInputChange('rawMaterialOrder', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-teal-300 font-bold focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>

            {/* RESSOURCES HUMAINES & RSE */}
            <tr className="bg-slate-950/90 font-bold text-slate-200">
              <td colSpan={historicalPeriods.length + 2} className="py-2.5 px-4 uppercase text-[11px] tracking-wider text-purple-400 font-display">
                6. Ressources Humaines & Transition Écologique
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">Budget Formation Continue (€)</td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {(allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.trainingBudget || 15000).toLocaleString('fr-FR')} €
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="1000"
                  value={pendingDecisions.trainingBudget}
                  onChange={e => handleInputChange('trainingBudget', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-purple-300 font-bold focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">Qualité de Vie au Travail (QVT) & Sécurité (€)</td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {(allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.qvtBudget || 9000).toLocaleString('fr-FR')} €
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="1000"
                  value={pendingDecisions.qvtBudget}
                  onChange={e => handleInputChange('qvtBudget', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">
                <span>Intéressement aux bénéfices salariés (%)</span>
                <span className="block text-[10px] text-slate-500 font-sans">Réduit le turnover et supprime le risque de grève</span>
              </td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {(allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.profitSharingRate || 5)} %
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={pendingDecisions.profitSharingRate || 5}
                  onChange={e => handleInputChange('profitSharingRate', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-amber-300 font-bold focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">
                <span>Transition Écologique & Éco-conception (€)</span>
                <span className="block text-[10px] text-slate-500 font-sans">Réduit la taxe carbone et booste l'attractivité Export</span>
              </td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {(allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.ecoDesignBudget || 9000).toLocaleString('fr-FR')} €
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="1000"
                  value={pendingDecisions.ecoDesignBudget || 9000}
                  onChange={e => handleInputChange('ecoDesignBudget', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-emerald-400 font-bold focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">R&D & Amélioration Produits (€)</td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {(allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.rdBudget || 20000).toLocaleString('fr-FR')} €
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="2000"
                  value={pendingDecisions.rdBudget}
                  onChange={e => handleInputChange('rdBudget', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-purple-300 font-bold focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>

            {/* FINANCE & ACTIONNARIAT */}
            <tr className="bg-slate-950/90 font-bold text-slate-200">
              <td colSpan={historicalPeriods.length + 2} className="py-2.5 px-4 uppercase text-[11px] tracking-wider text-rose-400 font-display">
                7. Finance, Trésorerie & Actionnaires
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">Emprunt Moyen/Long Terme (€) (Plafond : {maxLTLoan.toLocaleString('fr-FR')} €)</td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.mediumTermLoan.toLocaleString('fr-FR')} €
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="50000"
                  value={pendingDecisions.mediumTermLoan}
                  onChange={e => handleInputChange('mediumTermLoan', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-emerald-400 font-bold focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">
                <span>Prêt Vert Bonifié (€)</span>
                <span className="block text-[10px] text-slate-500 font-sans">Taux préférentiel de 3,20% réservé à la transition bas-carbone</span>
              </td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {(allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.greenLoanRequested || 0).toLocaleString('fr-FR')} €
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="25000"
                  value={pendingDecisions.greenLoanRequested || 0}
                  onChange={e => handleInputChange('greenLoanRequested', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-emerald-300 font-bold focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">Remboursement Anticipé d'Emprunt (€)</td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.loanRepayment.toLocaleString('fr-FR')} €
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  step="10000"
                  value={pendingDecisions.loanRepayment}
                  onChange={e => handleInputChange('loanRepayment', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 text-slate-300">
                <span>Dividendes versés aux actionnaires (% du bénéfice net)</span>
                <span className="block text-[10px] text-slate-500 font-sans">Soutient le cours de bourse et la valorisation globale</span>
              </td>
              {historicalPeriods.map(p => (
                <td key={p} className="py-2 px-3 text-right text-slate-400">
                  {(allSnapshots[p]?.firmsResults[selectedFirmId]?.decisions.dividendPayoutRate || 20)} %
                </td>
              ))}
              <td className="py-1 px-3 text-right bg-amber-950/20 border-l border-amber-800/40">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={pendingDecisions.dividendPayoutRate || 20}
                  onChange={e => handleInputChange('dividendPayoutRate', e.target.value)}
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded px-2 py-1 text-amber-300 font-bold focus:border-amber-400 focus:outline-hidden"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

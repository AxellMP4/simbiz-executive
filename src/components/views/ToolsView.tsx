import React, { useState } from 'react';
import { PeriodSnapshot } from '../../types/simulation';
import { toCsv } from '../../domain/simulationLifecycle';
import { Calculator, Download, RefreshCw, BarChart2, DollarSign, Sliders } from 'lucide-react';

interface ToolsViewProps {
  snapshot: PeriodSnapshot;
  onResetToP0?: () => void;
  onFastForwardToP6?: () => void;
  selectedFirmId: string;
  onExportState?: () => void;
  onImportState?: (file: File) => void;
  allSnapshots?: Record<number, PeriodSnapshot>;
}

export const ToolsView: React.FC<ToolsViewProps> = ({
  snapshot,
  onResetToP0,
  onFastForwardToP6,
  selectedFirmId,
  onExportState,
  onImportState,
  allSnapshots,
}) => {
  const firmResult = snapshot.firmsResults['1'] || Object.values(snapshot.firmsResults)[0];

  // Break-even calculator states calibrated for realistic scale
  const [fixedCosts, setFixedCosts] = useState<number>(320000);
  const [sellingPrice, setSellingPrice] = useState<number>(96);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState<number>(55);

  const unitContributionMargin = Math.max(0.1, sellingPrice - variableCostPerUnit);
  const marginRatio = (unitContributionMargin / sellingPrice) * 100;
  const breakEvenUnits = Math.ceil(fixedCosts / unitContributionMargin);
  const breakEvenRevenue = Math.round(breakEvenUnits * sellingPrice);

  // Full Costing Simulator
  const [plannedProduction, setPlannedProduction] = useState<number>(3600);
  const [totalFixedOverhead, setTotalFixedOverhead] = useState<number>(180000);
  const [unitDirectCost, setUnitDirectCost] = useState<number>(54);
  const unitFullCost = +(unitDirectCost + totalFixedOverhead / Math.max(1, plannedProduction)).toFixed(2);

  // Export current simulation data
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `simbiz_periode_${snapshot.period}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCsv = () => {
    const rows = Object.values(allSnapshots || { [snapshot.period]: snapshot })
      .sort((a, b) => a.period - b.period)
      .map(periodSnapshot => {
        const result = periodSnapshot.firmsResults['1'] || Object.values(periodSnapshot.firmsResults)[0];
        return {
          periode: periodSnapshot.period,
          chiffre_affaires: result?.incomeStatement.revenue || 0,
          marge_brute: result?.incomeStatement.grossMargin || 0,
          resultat_net: result?.incomeStatement.netProfit || 0,
          tresorerie: result?.cashFlow.closingCash || 0,
          dette: (result?.balanceSheet.liabilities.mortgageLoan || 0) + (result?.balanceSheet.liabilities.otherLoans || 0) + (result?.balanceSheet.liabilities.bankOverdraft || 0),
          effectif: result?.hrReport.workforce.totalEmployees || 0,
        };
      });
    const anchor = document.createElement('a');
    anchor.href = `data:text/csv;charset=utf-8,${encodeURIComponent(toCsv(rows))}`;
    anchor.download = `simbiz-rapport-${selectedFirmId}.csv`;
    anchor.click();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Title */}
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-teal-400" />
          <span>Outils d'Aide à la Décision & Simulateurs Économiques</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Calculateur de seuil de rentabilité, analyseur de coût de revient unitaire et gestion des scénarios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3 lg:col-span-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2">
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Sauvegarde complète de la simulation</span>
          </div>
          <p className="text-xs text-slate-400">Exportez ou restaurez les décisions, résultats, objectifs, messages et journal d’activité. Le fichier ne contient aucun secret.</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={onExportState} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500">Exporter l’état JSON</button>
            <button onClick={handleExportCsv} className="rounded-lg border border-emerald-700 bg-emerald-950/50 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-900">Exporter le rapport CSV</button>
            <button onClick={() => window.print()} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800">Imprimer / PDF</button>
            <label className="cursor-pointer rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800">
              Importer un état JSON
              <input type="file" accept="application/json" className="sr-only" onChange={e => e.target.files?.[0] && onImportState?.(e.target.files[0])} />
            </label>
          </div>
        </div>
        {/* Tool 1: Seuil de Rentabilité (Break-even Point) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Calculateur de Seuil de Rentabilité (Point Mort)</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <label className="text-[11px] text-slate-400">Charges Fixes (€)</label>
              <input
                type="number"
                step="5000"
                value={fixedCosts}
                onChange={e => setFixedCosts(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Prix de Vente (€)</label>
              <input
                type="number"
                step="1"
                value={sellingPrice}
                onChange={e => setSellingPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Coût Var. Unitaire (€)</label>
              <input
                type="number"
                step="1"
                value={variableCostPerUnit}
                onChange={e => setVariableCostPerUnit(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white mt-1"
              />
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-4 text-xs font-mono space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Marge sur Coût Variable Unitaire (MCVU) :</span>
              <span className="font-bold text-sky-400">{unitContributionMargin.toFixed(2)} €/U ({marginRatio.toFixed(1)}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Seuil de Rentabilité en Volume :</span>
              <span className="font-bold text-amber-400">{breakEvenUnits.toLocaleString('fr-FR')} Unités</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm">
              <span className="text-white">Point Mort en Chiffre d'Affaires :</span>
              <span className="text-emerald-400">{breakEvenRevenue.toLocaleString('fr-FR')} €</span>
            </div>
          </div>
        </div>

        {/* Tool 2: Calculateur de Coût de Revient Complet (Full Costing) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span>Absorption des Charges Fixes & Coût de Revient Complet</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <label className="text-[11px] text-slate-400">Volume Produit (U)</label>
              <input
                type="number"
                step="250"
                value={plannedProduction}
                onChange={e => setPlannedProduction(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Total Charges Fixes (€)</label>
              <input
                type="number"
                step="5000"
                value={totalFixedOverhead}
                onChange={e => setTotalFixedOverhead(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Coût Direct (MP + MO)</label>
              <input
                type="number"
                step="1"
                value={unitDirectCost}
                onChange={e => setUnitDirectCost(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white mt-1"
              />
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-4 text-xs font-mono space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Quote-part fixe unitaire :</span>
              <span className="font-bold text-sky-400">
                {(totalFixedOverhead / Math.max(1, plannedProduction)).toFixed(2)} €/U
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm">
              <span className="text-white">Coût Unitaire de Fabrication Complet :</span>
              <span className="text-amber-400">{unitFullCost} €/U</span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans mt-1">
              * Révèle pourquoi la sous-production en P6 (850 unités) a fait grimper le coût unitaire à 131,23 € !
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Management & Exports */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 border-b border-slate-800 pb-2">
          Gestion des Scénarios & Sauvegarde
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onResetToP0}
            className="flex items-center gap-2 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded text-xs font-medium text-slate-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-sky-400" />
            <span>Réinitialiser à la Période 0 (Départ de rentrée)</span>
          </button>

          <button
            onClick={onFastForwardToP6}
            className="flex items-center gap-2 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded text-xs font-medium text-slate-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Positionner à la Période 6 (État des captures KEDGE)</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800 rounded text-xs font-medium text-emerald-300 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exporter les États Financiers (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

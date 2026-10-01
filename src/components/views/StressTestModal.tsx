import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, TrendingDown, RefreshCw, Flame, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { PeriodSnapshot, CompanySettings } from '../../types/simulation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  snapshot: PeriodSnapshot;
  companySettings: CompanySettings;
}

interface Scenario {
  id: string;
  name: string;
  category: string;
  description: string;
  impactRevenue: number; // multiplier, e.g. -0.15
  impactMaterials: number; // multiplier, e.g. +0.35
  impactInterest: number; // delta percentage, e.g. +3.0
  impactDisruptions: number; // weeks
}

const SCENARIOS: Scenario[] = [
  {
    id: 'supply_crisis',
    name: 'Choc Matières Premières & Pénurie',
    category: 'Supply Chain',
    description: 'Crise géopolitique sur les corridors logistiques : flambée du prix spot de +40% et retards d’approvisionnement.',
    impactRevenue: -0.08,
    impactMaterials: 0.40,
    impactInterest: 0.5,
    impactDisruptions: 2,
  },
  {
    id: 'monetary_tightening',
    name: 'Choc Monétaire & Hausse des Taux (+350 bps)',
    category: 'Finance & Trésorerie',
    description: 'Durcissement sévère des banques centrales : bond des frais financiers et arrêt des lignes de découvert non garanties.',
    impactRevenue: -0.05,
    impactMaterials: 0.05,
    impactInterest: 3.5,
    impactDisruptions: 0,
  },
  {
    id: 'carbon_shock',
    name: 'Durcissement Taxe Carbone & Normes ESG',
    category: 'Réglementaire',
    description: 'Doublement immédiat de la taxe carbone à 90 €/t et pénalités de déréférencement chez les grands comptes donneurs d’ordre.',
    impactRevenue: -0.12,
    impactMaterials: 0.15,
    impactInterest: 0.8,
    impactDisruptions: 1,
  },
  {
    id: 'cyber_attack',
    name: 'Cyberattaque & Arrêt Usine 3 Semaines',
    category: 'Opérationnel',
    description: 'Ransomware bloquant l’ERP de production et le réseau logistique. Pertes de commandes directes et frais de remédiation.',
    impactRevenue: -0.22,
    impactMaterials: 0.0,
    impactInterest: 1.0,
    impactDisruptions: 3,
  },
];

export const StressTestModal: React.FC<Props> = ({
  isOpen,
  onClose,
  snapshot,
  companySettings,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('supply_crisis');

  if (!isOpen) return null;

  const firmResult = snapshot.firmsResults['1'] || Object.values(snapshot.firmsResults)[0];
  const currentCash = firmResult?.cashFlow?.closingCash || 425000;
  const currentRevenue = firmResult?.incomeStatement?.revenue || 1385000;
  const currentProfit = firmResult?.incomeStatement?.netProfit || 82875;
  const currentEbitda = firmResult?.incomeStatement?.ebitda || 215000;
  const totalLiabilities = firmResult?.balanceSheet?.liabilities?.totalLiabilities || 3250000;

  const scenario = SCENARIOS.find(s => s.id === selectedScenarioId) || SCENARIOS[0];

  // Calculs du Stress Test
  const stressRevenue = Math.round(currentRevenue * (1 + scenario.impactRevenue));
  const additionalCost = Math.round(currentRevenue * 0.40 * scenario.impactMaterials);
  const additionalInterest = Math.round((totalLiabilities * 0.25) * (scenario.impactInterest / 100));
  const stressProfit = Math.round(currentProfit + (stressRevenue - currentRevenue) * 0.40 - additionalCost - additionalInterest);
  const stressCash = Math.round(currentCash + (stressProfit - currentProfit));
  const cashDelta = stressCash - currentCash;

  // Score de Résilience (Altman Z stressé)
  const isSolvent = stressCash > 50000 && stressProfit > -150000;
  const resilienceGrade = stressCash > 250000 ? 'Excellente (Grade AAA)' : stressCash > 100000 ? 'Résistante (Grade BBB)' : 'Vulnérable (Grade CCC)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-white">Simulateur de Stress Test & War Room</h2>
                <span className="rounded-full bg-rose-950 border border-rose-800 px-2 py-0.5 text-[10px] font-mono text-rose-300">
                  Résilience & Solvabilité
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Crash-test de votre modèle d'affaires face aux chocs exogènes extrêmes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Scenario Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SCENARIOS.map(sc => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <div
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${isSelected ? 'border-rose-500 bg-rose-950/20 shadow-lg shadow-rose-950/30' : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {sc.category}
                    </span>
                    {isSelected && <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />}
                  </div>
                  <h4 className="mt-2 text-xs font-bold text-white">{sc.name}</h4>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">{sc.description}</p>
                </div>
              );
            })}
          </div>

          {/* Active Scenario Impact Dashboard */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Activity className="h-4 w-4 text-rose-400" />
                Projection Post-Choc : {scenario.name}
              </h3>
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${isSolvent ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-rose-950 text-rose-400 border-rose-800'}`}>
                {resilienceGrade}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg bg-slate-900 p-3.5 border border-slate-800">
                <span className="text-xs text-slate-400">Trésorerie Projetée</span>
                <strong className={`mt-1 block text-xl font-mono ${stressCash >= 0 ? 'text-white' : 'text-rose-400 font-bold'}`}>
                  {stressCash.toLocaleString('fr-FR')} {companySettings.currency}
                </strong>
                <span className="text-[11px] font-mono text-rose-400">
                  {cashDelta.toLocaleString('fr-FR')} {companySettings.currency}
                </span>
              </div>

              <div className="rounded-lg bg-slate-900 p-3.5 border border-slate-800">
                <span className="text-xs text-slate-400">Résultat Net Stressé</span>
                <strong className={`mt-1 block text-xl font-mono ${stressProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stressProfit.toLocaleString('fr-FR')} {companySettings.currency}
                </strong>
                <span className="text-[11px] text-slate-500 font-mono">
                  Base : {currentProfit.toLocaleString('fr-FR')} {companySettings.currency}
                </span>
              </div>

              <div className="rounded-lg bg-slate-900 p-3.5 border border-slate-800">
                <span className="text-xs text-slate-400">Impact Chiffre d'Affaires</span>
                <strong className="mt-1 block text-xl font-mono text-white">
                  {stressRevenue.toLocaleString('fr-FR')} {companySettings.currency}
                </strong>
                <span className="text-[11px] font-mono text-amber-400">
                  {(scenario.impactRevenue * 100).toFixed(0)}% de demande
                </span>
              </div>
            </div>

            {/* Tactical Shield Recommendations */}
            <div className="rounded-lg bg-slate-900/80 p-4 border border-slate-800 text-xs space-y-2">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                🛡️ Recommandations de Parade & Mesures Conservatoires :
              </h4>
              <ul className="space-y-1.5 text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Maintenir une réserve minimale de cash de <strong>300 000 {companySettings.currency}</strong> avant de voter des dividendes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Souscrire un <strong>prêt vert ou moyen terme</strong> par anticipation pour sécuriser les lignes bancaires.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Diversifier les fournisseurs sous contrat cadre pour figer le coût des approvisionnements.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 px-6 py-4 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Le stress test est une simulation non engageante destinée aux comités des risques.
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 transition-colors"
          >
            Quitter la War Room
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Users, Award, TrendingUp, HeartHandshake, ShieldCheck, CheckCircle2, Coins, Sparkles } from 'lucide-react';
import { PeriodSnapshot, CompanySettings } from '../../types/simulation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  snapshot: PeriodSnapshot;
  companySettings: CompanySettings;
}

export const AdvancedHRModal: React.FC<Props> = ({
  isOpen,
  onClose,
  snapshot,
  companySettings,
}) => {
  const [stockOptionRate, setStockOptionRate] = useState<number>(3); // % capital réservé
  const [ppvBonusAmount, setPpvBonusAmount] = useState<number>(1200); // € par salarié
  const [academyEnabled, setAcademyEnabled] = useState<boolean>(true);

  if (!isOpen) return null;

  const firmResult = snapshot.firmsResults['1'] || Object.values(snapshot.firmsResults)[0];
  const headcount = firmResult?.hrReport?.workforce?.totalEmployees || 41;
  const currentTurnover = firmResult?.hrReport?.metrics?.turnoverRate || 3.8;
  const currentSatisfaction = firmResult?.hrReport?.metrics?.employeeSatisfaction || 84;
  const currentProductivity = firmResult?.hrReport?.metrics?.productivityIndex || 101.5;

  // Impact Calculations
  const simulatedTurnover = Math.max(1.2, +(currentTurnover * (1 - (stockOptionRate * 0.08) - (academyEnabled ? 0.15 : 0))).toFixed(1));
  const simulatedSatisfaction = Math.min(98, Math.round(currentSatisfaction + (stockOptionRate * 1.5) + (ppvBonusAmount / 400) + (academyEnabled ? 4 : 0)));
  const simulatedProductivity = +(currentProductivity * (1 + (stockOptionRate * 0.005) + (academyEnabled ? 0.02 : 0))).toFixed(1);
  const totalPpvCost = headcount * ppvBonusAmount;
  const academyCost = academyEnabled ? 15000 : 0;
  const totalCost = totalPpvCost + academyCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-white">Politique RH & Actionnariat Salarié</h2>
                <span className="rounded-full bg-purple-950 border border-purple-800 px-2 py-0.5 text-[10px] font-mono text-purple-300">
                  Talent Matrix & RSE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Fidélisation des {headcount} collaborateurs · Plans d'actionnariat & intéressement collectif
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
          {/* Top Metric Projections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                Satisfaction Collaborateurs
                <Sparkles className="h-4 w-4 text-purple-400" />
              </span>
              <strong className="mt-2 block text-2xl font-mono text-white">{simulatedSatisfaction} <span className="text-xs font-normal text-slate-400">/ 100</span></strong>
              <span className="text-[11px] font-mono text-emerald-400">
                +{simulatedSatisfaction - currentSatisfaction} pts d'engagement
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                Taux de Turnover
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </span>
              <strong className="mt-2 block text-2xl font-mono text-white">{simulatedTurnover}%</strong>
              <span className="text-[11px] font-mono text-emerald-400">
                -{(currentTurnover - simulatedTurnover).toFixed(1)} pt de démissions
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                Indice de Productivité
                <Award className="h-4 w-4 text-amber-400" />
              </span>
              <strong className="mt-2 block text-2xl font-mono text-white">{simulatedProductivity}</strong>
              <span className="text-[11px] font-mono text-emerald-400">
                Gain d'efficience opérationnelle
              </span>
            </div>
          </div>

          {/* Interactive Levers */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-5">
            <h3 className="text-sm font-bold text-white font-display">Paramétrage du Pacte Social</h3>

            {/* Slider Stock Options */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-2">
                  <Coins className="h-4 w-4 text-amber-400" />
                  Plan de Stock-Options / Actions Gratuites Salariés
                </span>
                <strong className="font-mono text-amber-400">{stockOptionRate}% du capital</strong>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={stockOptionRate}
                onChange={e => setStockOptionRate(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <p className="text-[11px] text-slate-400">
                Réservation de capital non dilutive immédiate. Aligne les intérêts des salariés sur la valeur de l’action.
              </p>
            </div>

            {/* Slider PPV */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-400" />
                  Prime de Partage de la Valeur (PPV annuelle)
                </span>
                <strong className="font-mono text-purple-400">{ppvBonusAmount.toLocaleString('fr-FR')} {companySettings.currency} / salarié</strong>
              </div>
              <input
                type="range"
                min="0"
                max="3000"
                step="200"
                value={ppvBonusAmount}
                onChange={e => setPpvBonusAmount(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>Coût total : {totalPpvCost.toLocaleString('fr-FR')} {companySettings.currency}</span>
                <span className="text-emerald-400">Exonéré de charges sociales</span>
              </div>
            </div>

            {/* Academy Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full ${academyEnabled ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Académie Interne & Formation Continue 4.0</h4>
                  <p className="text-[11px] text-slate-400">Programme certifiant de reconversion des opérateurs sur les machines automatisées.</p>
                </div>
              </div>
              <button
                onClick={() => setAcademyEnabled(!academyEnabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${academyEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                {academyEnabled ? 'Activée (15k €)' : 'Désactivée'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 px-6 py-4 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Coût net total simulé : <strong className="text-white font-mono">{totalCost.toLocaleString('fr-FR')} {companySettings.currency}</strong>
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 transition-colors"
          >
            Fermer le Module RH
          </button>
        </div>
      </div>
    </div>
  );
};

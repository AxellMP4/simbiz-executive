import React from 'react';
import { PeriodSnapshot, FirmDecisions } from '../../types/simulation';
import { SimpleBarChart, GroupedBarChart } from '../ui/ChartComponents';
import { Users2, Award, HeartHandshake, ShieldCheck, AlertCircle, ArrowUpRight, GraduationCap } from 'lucide-react';

interface HRManagementViewProps {
  snapshot: PeriodSnapshot;
  pendingDecisions: FirmDecisions;
  onUpdateDecisions: (updated: Partial<FirmDecisions>) => void;
  selectedFirmId: string;
}

export const HRManagementView: React.FC<HRManagementViewProps> = ({
  snapshot,
  pendingDecisions,
  onUpdateDecisions,
  selectedFirmId,
}) => {
  const firmResult = snapshot.firmsResults[selectedFirmId] || snapshot.firmsResults['1'] || Object.values(snapshot.firmsResults)[0];
  const hr = firmResult.hrReport;

  // Chart: Workforce distribution
  const workforceData = [
    { label: 'Ouvriers Prod.', value: hr.workforce.productionWorkers, color: '#38bdf8' },
    { label: 'Commerciaux Loc.', value: hr.workforce.salesRepsLocal, color: '#818cf8' },
    { label: 'Commerciaux Exp.', value: hr.workforce.salesRepsExport, color: '#a855f7' },
    { label: 'Ingénieurs R&D', value: hr.workforce.engineersRD, color: '#f59e0b' },
    { label: 'Support & Admin', value: hr.workforce.supportAdmin, color: '#10b981' },
  ];

  // Chart: Social Climate vs Defect Rate
  const kpisData = [
    { label: 'Productivité', value: hr.metrics.productivityIndex, color: '#10b981' },
    { label: 'Climat Social', value: hr.metrics.socialClimateScore, color: '#38bdf8' },
    { label: 'Turnover (%)', value: hr.metrics.turnoverRate, color: '#f59e0b' },
    { label: 'Absentéisme (%)', value: hr.metrics.absenteeismRate, color: '#f43f5e' },
    { label: 'Rebuts (%)', value: hr.metrics.defectRate, color: '#ef4444' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users2 className="w-5 h-5 text-purple-400" />
            <span>Gestion Avancée des Ressources Humaines (RH)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pilotage du capital humain, climat social, productivité industrielle et politique de rémunération
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded">
            Effectif total : <strong className="text-white">{hr.workforce.totalEmployees} salariés</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-400 font-medium">Indice de Productivité</span>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {hr.metrics.productivityIndex}%
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Base 100 atelier</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-400 font-medium">Climat Social</span>
          <div className={`text-lg font-bold font-mono mt-1 ${hr.metrics.socialClimateScore >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {hr.metrics.socialClimateScore} / 100
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Baromètre QVT</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-400 font-medium">Taux de Rebuts Usine</span>
          <div className={`text-lg font-bold font-mono mt-1 ${hr.metrics.defectRate > 3.0 ? 'text-rose-400' : 'text-sky-400'}`}>
            {hr.metrics.defectRate}%
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Défauts pièces finies</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-400 font-medium">Taux de Turnover</span>
          <div className="text-lg font-bold font-mono text-amber-400 mt-1">
            {hr.metrics.turnoverRate}%
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Départs / an</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <span className="text-[11px] text-slate-400 font-medium">Formation Moyenne</span>
          <div className="text-lg font-bold font-mono text-purple-400 mt-1">
            {hr.metrics.trainingHoursPerEmployee} h
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Par salarié / trim.</span>
        </div>
      </div>

      {/* Main HR Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Decision Sliders & Actions */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Politique RH & Décisions pour la Période {snapshot.period + 1}
            </h3>
            <span className="text-[11px] font-mono text-amber-400">Prise en compte immédiate</span>
          </div>

          <div className="space-y-5">
            {/* Training Budget */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                  <span>Budget Formation Continue & Compétences Industrielles</span>
                </span>
                <span className="font-mono font-bold text-purple-400">
                  {pendingDecisions.trainingBudget.toLocaleString('fr-FR')} €
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="25000"
                step="1000"
                value={pendingDecisions.trainingBudget}
                onChange={e => onUpdateDecisions({ trainingBudget: Number(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Min : 2 000 € (Maintien)</span>
                <span>Idéal Produit B : 12 000 € - 18 000 €</span>
                <span>Max : 25 000 €</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Impact : Réduit directement le taux de rebuts en atelier et accroît la productivité horaire sur les produits techniques comme le Produit B.
              </p>
            </div>

            {/* QVT Budget */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Budget Qualité de Vie au Travail (QVT) & Sécurité</span>
                </span>
                <span className="font-mono font-bold text-sky-400">
                  {pendingDecisions.qvtBudget.toLocaleString('fr-FR')} €
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="15000"
                step="500"
                value={pendingDecisions.qvtBudget}
                onChange={e => onUpdateDecisions({ qvtBudget: Number(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>1 000 €</span>
                <span>Recommandé : 6 000 € - 8 000 €</span>
                <span>15 000 €</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Impact : Améliore le score de climat social, prévient les tensions syndicales et divise par deux le taux d'absentéisme.
              </p>
            </div>

            {/* Profit Sharing Bonus */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Prime d'Intéressement Ouvriers sur Objectifs</span>
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {pendingDecisions.workerBonusRate} %
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={pendingDecisions.workerBonusRate}
                onChange={e => onUpdateDecisions({ workerBonusRate: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0 % (Fixe seul)</span>
                <span>5 % (Norme Kedge)</span>
                <span>15 % (Hyper-motivation)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Impact : Augmente la motivation des 22 ouvriers de production, permettant un taux d'utilisation de 1,20 sans dégradation de la qualité.
              </p>
            </div>

            {/* Commercial team compensation */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-200">Force Commerciale & Rétention des Talents</span>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[11px]">Fixe vendeur national : </span>
                  <span className="text-slate-200 font-semibold">{pendingDecisions.sellerSalary_local.toLocaleString('fr-FR')} €</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Commission unitaire : </span>
                  <span className="text-slate-200 font-semibold">{pendingDecisions.commissionPerUnit_local.toFixed(2)} €/U</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: HR Alerts & Department breakdown */}
        <div className="space-y-4">
          <SimpleBarChart
            title="Répartition des Effectifs"
            data={workforceData}
            height={180}
            isCurrency={false}
            unit="pers."
          />

          {/* Social Alerts box */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Remontées du Terrain & Climat Social</span>
            </h4>
            <div className="space-y-2.5">
              {hr.alerts.map((alert, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed font-sans"
                >
                  {alert}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

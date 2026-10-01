import React from 'react';
import {
  PeriodSnapshot,
  StrategicObjective,
  CrisisEvent,
  TechPatent,
  CompanySettings
} from '../../types/simulation';
import {
  Award,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Lock,
  Unlock,
  Coins,
  TrendingUp,
  FileCheck,
  Zap,
  Users
} from 'lucide-react';

interface BoardAndRndViewProps {
  snapshot: PeriodSnapshot;
  companySettings: CompanySettings;
  objectives: StrategicObjective[];
  currentCrisis?: CrisisEvent;
  techPatents: TechPatent[];
  selectedFirmId: string;
  onSelectCrisisChoice: (choiceId: string) => void;
  onUnlockPatent: (patentId: string) => void;
  onClaimObjectiveReward: (objId: string) => void;
}

export const BoardAndRndView: React.FC<BoardAndRndViewProps> = ({
  snapshot,
  companySettings,
  objectives,
  currentCrisis,
  techPatents,
  selectedFirmId,
  onSelectCrisisChoice,
  onUnlockPatent,
  onClaimObjectiveReward,
}) => {
  const firmResult = snapshot.firmsResults['1'] || Object.values(snapshot.firmsResults)[0];
  const { incomeStatement, balanceSheet, hrReport } = firmResult;
  const netProfit = incomeStatement.netProfit;
  const revenue = incomeStatement.revenue;
  const cash = balanceSheet.assets.cashAndEquivalents;
  const sharePrice = balanceSheet.ratios.sharePrice || 50;
  const esgScore = balanceSheet.ratios.esgScore || 74;

  // Board governance rating calculation
  const governanceScore = Math.min(100, Math.max(30, Math.round(
    (netProfit > 0 ? 35 : 10) +
    (cash > 200000 ? 25 : 10) +
    (esgScore * 0.25) +
    (sharePrice > 50 ? 15 : 5)
  )));

  const governanceGrade =
    governanceScore >= 90 ? 'AAA' :
    governanceScore >= 80 ? 'AA' :
    governanceScore >= 70 ? 'A' :
    governanceScore >= 60 ? 'BBB' :
    governanceScore >= 50 ? 'BB' : 'B (Sous Surveillance)';

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 font-display">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Gouvernance, Conseil d'Administration & Innovation R&D</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Supervision du Conseil, objectifs stratégiques rémunérés, gestion des dilemmes et brevets technologiques
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-slate-400">Notation Conseil :</span>
            <span className="font-bold text-emerald-400">{governanceGrade}</span>
            <span className="text-[10px] text-slate-500">({governanceScore}/100)</span>
          </div>
        </div>
      </div>

      {/* Section 1: Board Rating & Strategic Objectives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Board Overview Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 font-display border-b border-slate-800 pb-2">
            <Users className="w-4 h-4 text-sky-400" />
            <span>Avis du Conseil d'Administration</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between font-mono">
              <span className="text-slate-400">Satisfaction Actionnaires</span>
              <span className="font-bold text-amber-400">{governanceScore} %</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all"
                style={{ width: `${governanceScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-300 mt-2 font-sans leading-relaxed">
              {netProfit >= 0
                ? "Le Conseil salue la rentabilité de l'exercice et soutient les investissements de modernisation."
                : "Alerte du Conseil : La rentabilité est dégradée. Une discipline stricte sur les charges fixes est exigée."}
            </p>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">DG Mandataire :</span>
              <span className="text-white font-semibold">{companySettings.ceoName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Entreprise :</span>
              <span className="text-indigo-400 font-semibold">{companySettings.companyName} ({companySettings.tickerSymbol})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Secteur :</span>
              <span className="text-slate-200">{companySettings.sectorName}</span>
            </div>
          </div>
        </div>

        {/* Strategic Objectives List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Objectifs Stratégiques Assignés par le Conseil</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Primes de succès à la clé</span>
          </div>

          <div className="space-y-3">
            {objectives.map(obj => {
              // Check current progress
              let currentVal = 0;
              let isEligible = false;
              if (obj.targetMetric === 'revenue') {
                currentVal = revenue;
                isEligible = currentVal >= obj.targetValue;
              } else if (obj.targetMetric === 'esgScore') {
                currentVal = esgScore;
                isEligible = currentVal >= obj.targetValue;
              } else if (obj.targetMetric === 'defectRate') {
                currentVal = hrReport.metrics.defectRate;
                isEligible = currentVal <= obj.targetValue;
              } else if (obj.targetMetric === 'marketShare') {
                const comp = snapshot.competitorsBenchmark.find(c => c.firmId === selectedFirmId);
                currentVal = comp?.marketShareOverall || 16.5;
                isEligible = currentVal >= obj.targetValue;
              }

              return (
                <div
                  key={obj.id}
                  className={`p-3.5 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    obj.completed
                      ? 'bg-emerald-950/20 border-emerald-800/80 text-emerald-200'
                      : isEligible
                      ? 'bg-amber-950/30 border-amber-500 text-amber-200 ring-1 ring-amber-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {obj.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      )}
                      <span className="font-bold text-xs text-white font-display">
                        {obj.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 font-sans">
                      {obj.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-slate-400">
                      <span>
                        Cible : <strong className="text-white">{obj.targetValue.toLocaleString('fr-FR')}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Actuel : <strong className={isEligible ? 'text-emerald-400' : 'text-amber-400'}>{currentVal.toLocaleString('fr-FR')}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">
                        +{obj.rewardCash.toLocaleString('fr-FR')} {companySettings.currency} prime
                      </span>
                    </div>
                  </div>

                  <div>
                    {obj.completed ? (
                      <span className="px-3 py-1 bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 rounded text-xs font-mono font-bold">
                        Validé & Encaissé
                      </span>
                    ) : isEligible ? (
                      <button
                        onClick={() => onClaimObjectiveReward(obj.id)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-xs font-bold font-display shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <Coins className="w-3.5 h-3.5 fill-current" />
                        <span>Réclamer Prime</span>
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-900 text-slate-500 border border-slate-800 rounded text-[11px] font-mono">
                        En cours
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 2: Current Crisis / Strategic Dilemma */}
      {currentCrisis && (
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-900/60 rounded-xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 font-display">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Dilemme Stratégique de la Période {currentCrisis.period} : {currentCrisis.title}</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400/80 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80">
              Arbitrage Décisionnel
            </span>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {currentCrisis.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
            {currentCrisis.choices.map(choice => {
              const isChosen = currentCrisis.chosenOptionId === choice.id;
              return (
                <div
                  key={choice.id}
                  onClick={() => onSelectCrisisChoice(choice.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isChosen
                      ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                      : 'bg-slate-950/80 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-white font-display">
                        {choice.label}
                      </span>
                      {isChosen && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2">{choice.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                    <span className="text-amber-300 font-bold block">{choice.impactSummary}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 3: R&D Tech Tree / Brevets Industriels */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
            <Lightbulb className="w-4 h-4 text-purple-400" />
            <span>Centre de R&D & Brevets Technologiques Déblocables</span>
          </div>
          <span className="text-[11px] font-mono text-purple-400">
            Trésorerie disponible : {cash.toLocaleString('fr-FR')} {companySettings.currency}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {techPatents.map(pat => {
            const canAfford = cash >= pat.rdCost;
            return (
              <div
                key={pat.id}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  pat.unlocked
                    ? 'bg-purple-950/30 border-purple-800/80 text-purple-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-white font-display flex items-center gap-2">
                      {pat.unlocked ? (
                        <Unlock className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-500" />
                      )}
                      <span>{pat.name}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      Coût R&D : {pat.rdCost.toLocaleString('fr-FR')} {companySettings.currency}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mb-2">
                    {pat.description}
                  </p>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800/80 text-[11px] font-mono text-emerald-300">
                    Avantage : {pat.benefit}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800 flex justify-end">
                  {pat.unlocked ? (
                    <span className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Brevet Déposé & Actif
                    </span>
                  ) : (
                    <button
                      onClick={() => onUnlockPatent(pat.id)}
                      disabled={!canAfford}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold font-display transition-all ${
                        canAfford
                          ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? `Débloquer le Brevet (${pat.rdCost.toLocaleString('fr-FR')} ${companySettings.currency})` : 'Trésorerie insuffisante'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

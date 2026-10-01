import React, { useState } from 'react';
import {
  AlertTriangle, ArrowRight, Banknote, BriefcaseBusiness, CheckCircle2, Factory, Users,
  TrendingDown, TrendingUp, Leaf, ShieldCheck, Scale, Award, BarChart3, Crosshair,
  Flame, HeartHandshake, FileText, Activity, ChevronRight, Sparkles, Sliders
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Legend, Line
} from 'recharts';
import { CompanySettings, FirmDecisions, PeriodSnapshot } from '../../types/simulation';
import { kpisFor, DecisionEvent, DecisionValidation, PeriodStatus } from '../../domain/simulationLifecycle';
import { AdvisorPanel } from '../ui/AdvisorPanel';
import { AdvisorRecommendation } from '../../domain/managementAdvisor';
import { FinancialMarketState } from '../../domain/financialMarket';
import { CarbonHubModal } from './CarbonHubModal';
import { CompetitorIntelligenceModal } from './CompetitorIntelligenceModal';
import { StressTestModal } from './StressTestModal';
import { AdvancedHRModal } from './AdvancedHRModal';
import { TradingDeskModal } from './TradingDeskModal';
import { BoardDeckReportModal } from '../ui/BoardDeckReportModal';

interface Props {
  snapshot: PeriodSnapshot;
  previous?: PeriodSnapshot;
  snapshots?: Record<number, PeriodSnapshot>;
  companySettings: CompanySettings;
  pendingDecisions: FirmDecisions;
  periodStatus: PeriodStatus;
  events: DecisionEvent[];
  validation: DecisionValidation[];
  onDecisions: () => void;
  onPreview: () => void;
  advisorRecommendations: AdvisorRecommendation[];
  onToggleAdvisor: () => void;
  onAdvisorNavigate: (target: AdvisorRecommendation['targetTab']) => void;
  onDismissAdvisor: (id: string) => void;
  marketState?: FinancialMarketState;
  onExecuteTrade?: (firmId: string, quantity: number, side: 'buy' | 'sell', stopLoss?: number, takeProfit?: number) => void;
}

const money = (value: number, currency: string) => `${Math.round(value).toLocaleString('fr-FR')} ${currency}`;

export const ExecutiveCockpitView: React.FC<Props> = ({
  snapshot, previous, snapshots, companySettings, pendingDecisions, periodStatus, events, validation,
  onDecisions, onPreview, advisorRecommendations, onToggleAdvisor, onAdvisorNavigate, onDismissAdvisor,
  marketState, onExecuteTrade,
}) => {
  const [showDetailedEsg, setShowDetailedEsg] = useState(false);
  const [isCarbonModalOpen, setIsCarbonModalOpen] = useState(false);
  const [isCompetitorModalOpen, setIsCompetitorModalOpen] = useState(false);
  const [isStressModalOpen, setIsStressModalOpen] = useState(false);
  const [isHrModalOpen, setIsHrModalOpen] = useState(false);
  const [isTradingDeskOpen, setIsTradingDeskOpen] = useState(false);
  const [isBoardDeckOpen, setIsBoardDeckOpen] = useState(false);
  const result = snapshot.firmsResults['1'] || Object.values(snapshot.firmsResults)[0];
  const previousResult = previous?.firmsResults['1'];
  const current = kpisFor(result);
  const prior = previousResult ? kpisFor(previousResult) : undefined;
  const delta = (key: keyof typeof current) => prior ? current[key] - prior[key] : 0;
  const currency = companySettings.currency;
  const cards = [
    { label: 'Chiffre d’affaires', value: money(current.revenue, currency), delta: delta('revenue'), icon: BriefcaseBusiness },
    { label: 'Marge brute', value: money(current.grossMargin, currency), delta: delta('grossMargin'), icon: TrendingUp },
    { label: 'Résultat net', value: money(current.netProfit, currency), delta: delta('netProfit'), icon: Banknote },
    { label: 'Trésorerie', value: money(current.cash, currency), delta: delta('cash'), icon: Banknote },
    { label: 'Dette', value: money(current.debt, currency), delta: delta('debt'), icon: Factory },
    { label: 'Effectif', value: `${current.headcount} personnes`, delta: delta('headcount'), icon: Users },
  ];
  const statusLabel = { draft: 'Brouillon', preview: 'Prévisualisation', validated: 'Validée', closed: 'Clôturée' }[periodStatus];

  // Calculs scores ESG & Benchmark Marché
  const firmEsg = result?.balanceSheet.ratios.esgScore || 74;
  const envScore = Math.min(100, Math.max(40, Math.round(52 + ((result?.decisions?.ecoDesignBudget || 8000) / 380) + ((snapshot.marketEnvironment.greenDemandBonus || 0) * 1.5))));
  const socScore = Math.min(100, Math.max(40, Math.round(((result?.hrReport?.metrics?.socialClimateScore || 82) * 0.55) + ((result?.hrReport?.metrics?.employeeSatisfaction || 84) * 0.45))));
  const govScore = Math.min(100, Math.max(40, Math.round(56 + ((result?.decisions?.profitSharingRate || 5) * 3.6) + (result?.balanceSheet?.ratios?.solvencyRatio ? Math.min(22, result.balanceSheet.ratios.solvencyRatio / 2.8) : 16))));

  const competitors = snapshot.competitorsBenchmark || [];
  const marketAvgEsg = Math.round(competitors.reduce((sum, c) => sum + (c.esgScore || 65), 0) / Math.max(1, competitors.length));
  const esgDeltaVsMarket = firmEsg - marketAvgEsg;

  const sortedEsg = [...competitors].sort((a, b) => (b.esgScore || 65) - (a.esgScore || 65));
  const firmRank = sortedEsg.findIndex(c => c.firmId === '1') + 1;

  const esgPillars = [
    { name: 'Environnement (E)', score: envScore, marketAvg: 67, color: '#10b981', icon: Leaf, desc: 'Éco-conception, empreinte carbone et bonus vert' },
    { name: 'Social & Humain (S)', score: socScore, marketAvg: 70, color: '#6366f1', icon: Users, desc: 'QVT, dialogue social, satisfaction et formation' },
    { name: 'Gouvernance (G)', score: govScore, marketAvg: 68, color: '#f59e0b', icon: Scale, desc: 'Partage de valeur, solvabilité et transparence' },
  ];

  const chartData = esgPillars.map(p => ({
    name: p.name,
    value: p.score,
    color: p.color,
  }));

  // Données historiques pour la courbe de progression ESG
  const historicalEsgData = Object.values(snapshots || { [snapshot.period]: snapshot })
    .sort((a, b) => a.period - b.period)
    .filter(s => s.period <= snapshot.period)
    .map(s => {
      const fRes = s.firmsResults['1'] || Object.values(s.firmsResults)[0];
      const fScore = fRes?.balanceSheet?.ratios?.esgScore || 74;
      const comps = s.competitorsBenchmark || [];
      const mAvg = Math.round(comps.reduce((sum, c) => sum + (c.esgScore || 65), 0) / Math.max(1, comps.length));

      const ePillar = Math.min(100, Math.max(40, Math.round(52 + ((fRes?.decisions?.ecoDesignBudget || 8000) / 380) + ((s.marketEnvironment.greenDemandBonus || 0) * 1.5))));
      const sPillar = Math.min(100, Math.max(40, Math.round(((fRes?.hrReport?.metrics?.socialClimateScore || 82) * 0.55) + ((fRes?.hrReport?.metrics?.employeeSatisfaction || 84) * 0.45))));
      const gPillar = Math.min(100, Math.max(40, Math.round(56 + ((fRes?.decisions?.profitSharingRate || 5) * 3.6) + (fRes?.balanceSheet?.ratios?.solvencyRatio ? Math.min(22, fRes.balanceSheet.ratios.solvencyRatio / 2.8) : 16))));

      return {
        period: `P.${s.period}`,
        scoreEntreprise: fScore,
        moyenneMarche: mAvg,
        pilierEnvironnement: ePillar,
        pilierSocial: sPillar,
        pilierGouvernance: gPillar,
      };
    });

  // Projection pour P.+1 basée sur les décisions en cours
  const projectedEnv = Math.min(100, Math.max(40, Math.round(52 + ((pendingDecisions.ecoDesignBudget || 8000) / 380) + ((snapshot.marketEnvironment.greenDemandBonus || 0) * 1.5))));
  const projectedSoc = Math.min(100, Math.max(40, Math.round(socScore + (pendingDecisions.qvtBudget > 8500 ? 2 : 0))));
  const projectedGov = Math.min(100, Math.max(40, Math.round(56 + ((pendingDecisions.profitSharingRate || 5) * 3.6) + 18)));
  const projectedOverallEsg = Math.round((projectedEnv + projectedSoc + projectedGov) / 3);

  // Vue détaillée de suivi et pilotage ESG
  if (showDetailedEsg) {
    return (
      <div className="cockpit-shell flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-emerald-400">
              <span className="rounded-full bg-emerald-950 border border-emerald-800 px-2.5 py-1 font-bold">
                Pilotage Stratégique ESG
              </span>
              <span>Période {snapshot.period} · Trajectoire & Évolution</span>
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-bold font-display text-white">
              Suivi RSE & Courbe de Progression
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              Analyse longitudinale de la performance extra-financière de {companySettings.companyName} et projection des arbitrages futurs.
            </p>
          </div>
          <button
            onClick={() => setShowDetailedEsg(false)}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold font-mono text-white transition-colors"
          >
            ← Retour au Cockpit Exécutif
          </button>
        </header>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <span className="text-xs text-slate-400 flex items-center justify-between">
              Score Global Actuel
              <Leaf className="h-4 w-4 text-emerald-400" />
            </span>
            <strong className="mt-2 block text-3xl font-mono text-white">{firmEsg} <span className="text-xs font-normal text-slate-400">/ 100</span></strong>
            <span className="text-[11px] font-mono text-emerald-400">
              {esgDeltaVsMarket >= 0 ? `+${esgDeltaVsMarket}` : esgDeltaVsMarket} pts vs moyenne marché
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <span className="text-xs text-slate-400 flex items-center justify-between">
              Projection P.{snapshot.period + 1}
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </span>
            <strong className="mt-2 block text-3xl font-mono text-indigo-300">{projectedOverallEsg} <span className="text-xs font-normal text-slate-400">/ 100</span></strong>
            <span className="text-[11px] font-mono text-indigo-400">
              {projectedOverallEsg - firmEsg >= 0 ? `+${projectedOverallEsg - firmEsg}` : projectedOverallEsg - firmEsg} pts estimés avec décisions
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <span className="text-xs text-slate-400 flex items-center justify-between">
              Classement RSE
              <Award className="h-4 w-4 text-amber-400" />
            </span>
            <strong className="mt-2 block text-3xl font-mono text-white">#{firmRank} <span className="text-xs font-normal text-slate-400">/ {competitors.length}</span></strong>
            <span className="text-[11px] font-mono text-amber-400">Surperformance sectorielle</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <span className="text-xs text-slate-400 flex items-center justify-between">
              Bonus Demande Verte
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </span>
            <strong className="mt-2 block text-3xl font-mono text-emerald-400">+{snapshot.marketEnvironment.greenDemandBonus}%</strong>
            <span className="text-[11px] text-slate-400 font-mono">Taxonomie européenne</span>
          </div>
        </div>

        {/* Courbe de Progression Historique Recharts */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                Trajectoire Historique du Score ESG & Piliers
              </h2>
              <p className="text-xs text-slate-400">Évolution constatée depuis le lancement (P.0) vis-à-vis du benchmark concurrentiel</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-3 rounded-full bg-emerald-500" />
                Entreprise
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="h-2 w-3 rounded-full bg-slate-500" />
                Moyenne Marché
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalEsgData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFirm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[40, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" name="Score Entreprise" dataKey="scoreEntreprise" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorFirm)" />
                <Line type="monotone" name="Moyenne Marché" dataKey="moyenneMarche" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot />
                <Line type="monotone" name="Pilier Environnement" dataKey="pilierEnvironnement" stroke="#34d399" strokeWidth={1.5} dot={false} />
                <Line type="monotone" name="Pilier Social" dataKey="pilierSocial" stroke="#818cf8" strokeWidth={1.5} dot={false} />
                <Line type="monotone" name="Pilier Gouvernance" dataKey="pilierGouvernance" stroke="#fbbf24" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Arbitrage et Simulateur RSE P.+1 */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-400" />
              Pilotage des Arbitrages RSE · Préparation P.{snapshot.period + 1}
            </h3>
            <button
              onClick={onDecisions}
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              Modifier dans la grille de décisions →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">🍃 Éco-conception & Vert</span>
                <strong className="text-emerald-400 font-mono">{(pendingDecisions.ecoDesignBudget || 8000).toLocaleString('fr-FR')} €</strong>
              </div>
              <p className="text-[11px] text-slate-400">Impact : réduit l'empreinte carbone et active la prime de demande verte (+8%).</p>
              <div className="text-[10px] font-mono text-emerald-300 pt-1">Pilier Environnement projeté : {projectedEnv} / 100</div>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">👥 QVT, Sécurité & Climat</span>
                <strong className="text-indigo-400 font-mono">{(pendingDecisions.qvtBudget || 8500).toLocaleString('fr-FR')} €</strong>
              </div>
              <p className="text-[11px] text-slate-400">Impact : prévient les conflits sociaux, réduit le turnover et booste la motivation.</p>
              <div className="text-[10px] font-mono text-indigo-300 pt-1">Pilier Social projeté : {projectedSoc} / 100</div>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">⚖️ Partage de la Valeur</span>
                <strong className="text-amber-400 font-mono">{pendingDecisions.profitSharingRate || 5}%</strong>
              </div>
              <p className="text-[11px] text-slate-400">Impact : intéressement des équipes et fidélisation des compétences clés.</p>
              <div className="text-[10px] font-mono text-amber-300 pt-1">Pilier Gouvernance projeté : {projectedGov} / 100</div>
            </div>
          </div>
        </section>

        {/* CSRD Audit Matrix */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
            Conformité Directive CSRD & Standards Européens
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Bilan d'émissions Scope 1-2-3 audité conforme aux protocoles GHG</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Indice de satisfaction salarié supérieur à 80% (absence de risque grève)</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Transparence de la gouvernance et des rémunérations actionnaires/salariés</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Ratio de solvabilité bilanciel certifié supérieur au seuil prudentiel</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cockpit-shell flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      <header className="cockpit-header flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-indigo-300">
            <span className="eyebrow-pill rounded-full bg-indigo-950 border border-indigo-800 px-2 py-1 text-indigo-100">Cockpit exécutif</span>
            <span>Période {snapshot.period} · Réalisé</span>
          </div>
          <h1 className="mt-3 text-2xl md:text-3xl font-bold font-display text-white">Piloter {companySettings.companyName}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">Une vue unique pour arbitrer la prochaine période, suivre les écarts et comprendre les moteurs de performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs">
            <span className="text-slate-500 block">Workflow P.{snapshot.period + 1}</span>
            <strong className="text-white">{statusLabel}</strong>
          </div>
          <button onClick={onDecisions} className="primary-action flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-bold text-black hover:bg-amber-400">
            Préparer P.{snapshot.period + 1}<ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>
      <AdvisorPanel
        recommendations={advisorRecommendations}
        open={false}
        onToggle={onToggleAdvisor}
        onNavigate={onAdvisorNavigate}
        onDismiss={onDismissAdvisor}
      />

      <section aria-label="Indicateurs clés" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map(({ label, value, delta: change, icon: Icon }) => (
          <article key={label} className="metric-card rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center justify-between text-slate-400"><span className="text-xs">{label}</span><Icon className="h-4 w-4 text-indigo-400" /></div>
            <strong className="mt-3 block text-lg font-mono text-white">{value}</strong>
            {prior && <span className={`mt-1 flex items-center gap-1 text-[11px] font-mono ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{change >= 0 ? '+' : ''}{money(change, currency)} vs P.{snapshot.period - 1}
            </span>}
          </article>
        ))}
      </section>

      {/* Section Performance & Répartition ESG (Graphique Circulaire Recharts) */}
      <section aria-label="Performance RSE et ESG" className="surface-panel rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 px-5 py-4 bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Leaf className="h-3.5 w-3.5" />
              </span>
              <h2 className="font-display font-semibold text-white text-base">Répartition & Benchmark ESG (RSE)</h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Visualisation circulaire de vos piliers Environnement, Social et Gouvernance par rapport à la moyenne du marché.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetailedEsg(true)}
              className="flex items-center gap-1.5 rounded-full bg-emerald-950/90 border border-emerald-600/60 px-3 py-1 text-xs font-mono font-bold text-emerald-300 hover:bg-emerald-900/90 transition-all shadow"
            >
              Suivi Détaillé & Courbe <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-mono font-semibold ${esgDeltaVsMarket >= 0 ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'}`}>
              {esgDeltaVsMarket >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {esgDeltaVsMarket >= 0 ? `+${esgDeltaVsMarket}` : esgDeltaVsMarket} pts vs moyenne
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-1 text-xs font-mono text-indigo-300">
              <Award className="h-3 w-3 text-amber-400" />
              Rang #{firmRank} / {competitors.length}
            </span>
          </div>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-12 items-center">
          {/* 1. Graphique Circulaire Recharts Donut */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-800/80 pb-5 lg:pb-0 lg:pr-5">
            <div className="relative w-full max-w-[240px] aspect-square flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as { name: string; value: number; color: string };
                        return (
                          <div className="rounded-lg border border-slate-700 bg-slate-950 p-2.5 shadow-xl text-xs font-mono">
                            <p className="font-bold text-white mb-1">{data.name}</p>
                            <p className="text-slate-300 flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
                              Score : <strong className="text-white">{data.value} / 100</strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="rgba(15, 23, 42, 0.8)"
                    strokeWidth={2}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Centre du Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold font-mono text-white tracking-tight">{firmEsg}</span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">/ 100</span>
                <span className="text-[10px] font-medium text-emerald-400 mt-0.5">Score Global</span>
              </div>
            </div>

            {/* Légende du graphique circulaire */}
            <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
              {esgPillars.map(p => (
                <div key={p.name} className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.name.split(' ')[0]} : <strong>{p.score}</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Détail des 3 Piliers (Barres de progression & Écart Marché) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Piliers RSE vs Moyenne Marché</h3>
            {esgPillars.map(({ name, score, marketAvg, color, icon: Icon, desc }) => {
              const diff = score - marketAvg;
              return (
                <div key={name} className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-2 font-medium text-white">
                      <Icon className="h-3.5 w-3.5" style={{ color }} />
                      {name}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <strong className="text-white">{score}</strong>
                      <span className="text-slate-500">vs {marketAvg} moy.</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${diff >= 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-rose-950 text-rose-400 border border-rose-800/50'}`}>
                        {diff >= 0 ? `+${diff}` : diff}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    {/* Repère moyenne du marché */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                      style={{ left: `${marketAvg}%` }}
                      title={`Moyenne marché : ${marketAvg}/100`}
                    />
                    {/* Barre de l'entreprise */}
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${score}%`, backgroundColor: color }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">{desc}</p>
                </div>
              );
            })}
          </div>

          {/* 3. Classement RSE du Marché (Benchmark des 6 Firmes) */}
          <div className="lg:col-span-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3.5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Classement Marché</span>
              <span className="text-[11px] font-mono text-slate-400">Moy : <strong className="text-white">{marketAvgEsg}</strong></span>
            </div>
            <div className="space-y-2">
              {sortedEsg.map((comp, idx) => {
                const isUser = comp.firmId === '1';
                const score = comp.esgScore || 65;
                return (
                  <div
                    key={comp.firmId}
                    className={`flex items-center justify-between text-xs p-1.5 rounded transition-colors ${isUser ? 'bg-indigo-950/70 border border-indigo-700/60 text-white font-semibold' : 'text-slate-300 hover:bg-slate-900/60'}`}
                  >
                    <div className="flex items-center gap-2 truncate max-w-[130px]">
                      <span className={`text-[10px] font-mono w-4 text-center ${idx === 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                        #{idx + 1}
                      </span>
                      <span className="truncate">{isUser ? `${companySettings.companyName} (Vous)` : comp.firmName}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className={isUser ? 'text-emerald-400 font-bold' : 'text-slate-300'}>{score}</span>
                      <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isUser ? 'bg-indigo-400' : 'bg-slate-500'}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Critère Taxonomie / RSE</span>
              <span className="text-emerald-400 font-mono">Bonus vert +{snapshot.marketEnvironment.greenDemandBonus}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Barre d'outils Executive Suite · Pilotage Stratégique & Nouveautés */}
      <section aria-label="Executive Suite" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Executive Suite · Outils Stratégiques & Pilotage Avancé
          </h2>
          <span className="text-[11px] font-mono text-slate-500">6 Modules Opérationnels</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Board Deck Report */}
          <button
            onClick={() => setIsBoardDeckOpen(true)}
            className="flex flex-col items-start p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800/90 hover:border-blue-500/50 transition-all text-left group shadow-sm"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform mb-2">
              <FileText className="h-4 w-4" />
            </div>
            <strong className="text-xs font-bold text-white group-hover:text-blue-300">Rapport CA & PDF</strong>
            <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Board Deck imprimable</span>
          </button>

          {/* 2. Carbon Hub */}
          <button
            onClick={() => setIsCarbonModalOpen(true)}
            className="flex flex-col items-start p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800/90 hover:border-emerald-500/50 transition-all text-left group shadow-sm"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform mb-2">
              <Leaf className="h-4 w-4" />
            </div>
            <strong className="text-xs font-bold text-white group-hover:text-emerald-300">Bilan Carbone</strong>
            <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Scope 1, 2, 3 & Taxe</span>
          </button>

          {/* 3. Competitor Intelligence */}
          <button
            onClick={() => setIsCompetitorModalOpen(true)}
            className="flex flex-col items-start p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800/90 hover:border-indigo-500/50 transition-all text-left group shadow-sm"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform mb-2">
              <Crosshair className="h-4 w-4" />
            </div>
            <strong className="text-xs font-bold text-white group-hover:text-indigo-300">Fiches Rivaux</strong>
            <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">SWOT & Anticipation</span>
          </button>

          {/* 4. Stress Test */}
          <button
            onClick={() => setIsStressModalOpen(true)}
            className="flex flex-col items-start p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800/90 hover:border-rose-500/50 transition-all text-left group shadow-sm"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-105 transition-transform mb-2">
              <Flame className="h-4 w-4" />
            </div>
            <strong className="text-xs font-bold text-white group-hover:text-rose-300">War Room & Chocs</strong>
            <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Stress test solvabilité</span>
          </button>

          {/* 5. Advanced HR */}
          <button
            onClick={() => setIsHrModalOpen(true)}
            className="flex flex-col items-start p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800/90 hover:border-purple-500/50 transition-all text-left group shadow-sm"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform mb-2">
              <HeartHandshake className="h-4 w-4" />
            </div>
            <strong className="text-xs font-bold text-white group-hover:text-purple-300">Pacte Social & RH</strong>
            <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Actionnariat & PPV</span>
          </button>

          {/* 6. Trading Desk Pro */}
          <button
            onClick={() => setIsTradingDeskOpen(true)}
            className="flex flex-col items-start p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800/90 hover:border-amber-500/50 transition-all text-left group shadow-sm"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform mb-2">
              <Activity className="h-4 w-4" />
            </div>
            <strong className="text-xs font-bold text-white group-hover:text-amber-300">Trading Desk Pro</strong>
            <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Stop-Loss & Take-Profit</span>
          </button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="surface-panel rounded-xl border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3"><h2 className="font-display font-semibold text-white">Décisions à arbitrer</h2><span className="text-[11px] font-mono text-slate-500">Prévision · sans impact sur le réalisé</span></div>
          <div className="grid gap-3 p-4 md:grid-cols-3">
            <div className="rounded-lg bg-slate-950 p-3"><span className="text-xs text-slate-500">Production planifiée</span><strong className="mt-1 block font-mono text-white">{(pendingDecisions.productionA + pendingDecisions.productionB).toLocaleString('fr-FR')} unités</strong></div>
            <div className="rounded-lg bg-slate-950 p-3"><span className="text-xs text-slate-500">Prévision CA</span><strong className="mt-1 block font-mono text-white">{money(pendingDecisions.forecastRevenue, currency)}</strong></div>
            <div className="rounded-lg bg-slate-950 p-3"><span className="text-xs text-slate-500">Prévision résultat</span><strong className="mt-1 block font-mono text-emerald-400">{money(pendingDecisions.forecastProfit, currency)}</strong></div>
          </div>
          {validation.length > 0 && <div className="mx-4 mb-4 space-y-2">{validation.map(issue => <div key={issue.message} className={`flex gap-2 rounded-lg border p-3 text-xs ${issue.severity === 'error' ? 'border-rose-800 bg-rose-950/40 text-rose-200' : 'border-amber-800 bg-amber-950/40 text-amber-200'}`}><AlertTriangle className="h-4 w-4 shrink-0" />{issue.message}</div>)}</div>}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 px-4 py-3">
            <button onClick={onPreview} className="rounded-lg border border-indigo-700 bg-indigo-950 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-900">Générer une prévision</button>
            <span className="text-xs text-slate-500">Les simulations restent réversibles jusqu’à validation.</span>
          </div>
        </section>

        <section className="surface-panel rounded-xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-4 py-3"><h2 className="font-display font-semibold text-white">Activité récente</h2></div>
          <div className="divide-y divide-slate-800/80">
            {events.slice(0, 5).map(event => <div key={event.id} className="flex gap-3 px-4 py-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /><div><p className="text-xs text-slate-200">{event.message}</p><time className="text-[10px] font-mono text-slate-500">{new Date(event.at).toLocaleString('fr-FR')}</time></div></div>)}
            {events.length === 0 && <p className="p-4 text-xs text-slate-500">Aucune activité enregistrée.</p>}
          </div>
        </section>
      </div>

      {/* 6 Modals de l'Executive Suite */}
      <CarbonHubModal
        isOpen={isCarbonModalOpen}
        onClose={() => setIsCarbonModalOpen(false)}
        snapshot={snapshot}
        companySettings={companySettings}
      />
      <CompetitorIntelligenceModal
        isOpen={isCompetitorModalOpen}
        onClose={() => setIsCompetitorModalOpen(false)}
        snapshot={snapshot}
        companySettings={companySettings}
      />
      <StressTestModal
        isOpen={isStressModalOpen}
        onClose={() => setIsStressModalOpen(false)}
        snapshot={snapshot}
        companySettings={companySettings}
      />
      <AdvancedHRModal
        isOpen={isHrModalOpen}
        onClose={() => setIsHrModalOpen(false)}
        snapshot={snapshot}
        companySettings={companySettings}
      />
      <TradingDeskModal
        isOpen={isTradingDeskOpen}
        onClose={() => setIsTradingDeskOpen(false)}
        snapshot={snapshot}
        companySettings={companySettings}
        marketState={marketState || { cash: 25000, initialCash: 25000, positions: [], transactions: [], watchlist: [], alerts: [], lastPeriod: snapshot.period }}
        onExecuteTrade={onExecuteTrade || (() => {})}
      />
      <BoardDeckReportModal
        isOpen={isBoardDeckOpen}
        onClose={() => setIsBoardDeckOpen(false)}
        snapshot={snapshot}
        companySettings={companySettings}
      />
    </div>
  );
};

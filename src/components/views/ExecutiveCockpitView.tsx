import React from 'react';
import { AlertTriangle, ArrowRight, Banknote, BriefcaseBusiness, CheckCircle2, Factory, Users, TrendingDown, TrendingUp } from 'lucide-react';
import { CompanySettings, FirmDecisions, PeriodSnapshot } from '../../types/simulation';
import { kpisFor, DecisionEvent, DecisionValidation, PeriodStatus } from '../../domain/simulationLifecycle';

interface Props {
  snapshot: PeriodSnapshot;
  previous?: PeriodSnapshot;
  companySettings: CompanySettings;
  pendingDecisions: FirmDecisions;
  periodStatus: PeriodStatus;
  events: DecisionEvent[];
  validation: DecisionValidation[];
  onDecisions: () => void;
  onPreview: () => void;
}

const money = (value: number, currency: string) => `${Math.round(value).toLocaleString('fr-FR')} ${currency}`;

export const ExecutiveCockpitView: React.FC<Props> = ({
  snapshot, previous, companySettings, pendingDecisions, periodStatus, events, validation, onDecisions, onPreview,
}) => {
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

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-indigo-300">
            <span className="rounded-full bg-indigo-950 border border-indigo-800 px-2 py-1 text-indigo-100">Cockpit exécutif</span>
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
          <button onClick={onDecisions} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-bold text-black hover:bg-amber-400">
            Préparer P.{snapshot.period + 1}<ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <section aria-label="Indicateurs clés" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map(({ label, value, delta: change, icon: Icon }) => (
          <article key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center justify-between text-slate-400"><span className="text-xs">{label}</span><Icon className="h-4 w-4 text-indigo-400" /></div>
            <strong className="mt-3 block text-lg font-mono text-white">{value}</strong>
            {prior && <span className={`mt-1 flex items-center gap-1 text-[11px] font-mono ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{change >= 0 ? '+' : ''}{money(change, currency)} vs P.{snapshot.period - 1}
            </span>}
          </article>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-slate-800 bg-slate-900">
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

        <section className="rounded-xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-4 py-3"><h2 className="font-display font-semibold text-white">Activité récente</h2></div>
          <div className="divide-y divide-slate-800/80">
            {events.slice(0, 5).map(event => <div key={event.id} className="flex gap-3 px-4 py-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /><div><p className="text-xs text-slate-200">{event.message}</p><time className="text-[10px] font-mono text-slate-500">{new Date(event.at).toLocaleString('fr-FR')}</time></div></div>)}
            {events.length === 0 && <p className="p-4 text-xs text-slate-500">Aucune activité enregistrée.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

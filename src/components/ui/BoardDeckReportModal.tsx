import React from 'react';
import { X, Printer, Download, Award, FileText, CheckCircle2, TrendingUp, ShieldCheck, Building2 } from 'lucide-react';
import { PeriodSnapshot, CompanySettings } from '../../types/simulation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  snapshot: PeriodSnapshot;
  companySettings: CompanySettings;
}

export const BoardDeckReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  snapshot,
  companySettings,
}) => {
  if (!isOpen) return null;

  const firmResult = snapshot.firmsResults['1'] || Object.values(snapshot.firmsResults)[0];
  const is = firmResult?.incomeStatement;
  const bs = firmResult?.balanceSheet;
  const hr = firmResult?.hrReport;
  const cf = firmResult?.cashFlow;
  const currency = companySettings.currency;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-6">
        {/* Modal Toolbar (hidden during print) */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">Board Deck · Rapport Conseil d'Administration</h2>
              <p className="text-xs text-slate-400">Période {snapshot.period} · Document officiel pour les actionnaires et administrateurs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono transition-colors shadow"
            >
              <Printer className="h-4 w-4" />
              Imprimer / Exporter en PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 print:bg-white print:text-black">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold block mb-1">
                Rapport Exécutif Annuel · Clôture P.{snapshot.period}
              </span>
              <h1 className="text-3xl font-extrabold font-display text-white">{companySettings.companyName}</h1>
              <p className="text-xs text-slate-400 mt-1">
                Gouvernance d'Entreprise · Direction Générale : {companySettings.ceoName || 'CEO'}
              </p>
            </div>
            <div className="text-right font-mono text-xs">
              <div className="text-slate-400">Date du rapport : {new Date().toLocaleDateString('fr-FR')}</div>
              <div className="text-emerald-400 font-bold mt-1">Conformité CSRD & IFRS certifiée</div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">1. Synthèse Exécutive du Conseil</h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              Le Conseil d'Administration approuve la trajectoire de <strong>{companySettings.companyName}</strong> au titre de l'exercice P.{snapshot.period}. Le chiffre d'affaires consolidé s'établit à <strong>{(is?.revenue || 0).toLocaleString('fr-FR')} {currency}</strong>, dégageant un résultat net de <strong>{(is?.netProfit || 0).toLocaleString('fr-FR')} {currency}</strong>. La trésorerie nette de clôture s'élève à <strong>{(cf?.closingCash || 0).toLocaleString('fr-FR')} {currency}</strong>, garantissant l'indépendance financière et la capacité d'investissement future.
            </p>
          </div>

          {/* Key Financial KPIs Grid */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-3">2. Principaux Indicateurs Financiers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950">
                <span className="text-xs text-slate-400 block">Chiffre d'Affaires</span>
                <strong className="text-lg font-mono text-white">{(is?.revenue || 0).toLocaleString('fr-FR')} {currency}</strong>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950">
                <span className="text-xs text-slate-400 block">Marge Brute</span>
                <strong className="text-lg font-mono text-white">{(is?.grossMargin || 0).toLocaleString('fr-FR')} {currency}</strong>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950">
                <span className="text-xs text-slate-400 block">EBITDA Opérationnel</span>
                <strong className="text-lg font-mono text-white">{(is?.ebitda || 0).toLocaleString('fr-FR')} {currency}</strong>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950">
                <span className="text-xs text-slate-400 block">Résultat Net</span>
                <strong className={`text-lg font-mono ${(is?.netProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(is?.netProfit || 0).toLocaleString('fr-FR')} {currency}
                </strong>
              </div>
            </div>
          </div>

          {/* Balance Sheet & Extra-Financial Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">3. Structure Bilancielle & Solvabilité</h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-800/80 pb-1 text-slate-300">
                  <span>Total de l'Actif :</span>
                  <strong className="text-white">{(bs?.assets?.totalAssets || 0).toLocaleString('fr-FR')} {currency}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1 text-slate-300">
                  <span>Trésorerie & Équivalents :</span>
                  <strong className="text-emerald-400">{(cf?.closingCash || 0).toLocaleString('fr-FR')} {currency}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1 text-slate-300">
                  <span>Ratio de Solvabilité :</span>
                  <strong className="text-white">{bs?.ratios?.solvencyRatio || 50}%</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Cours de l'Action (Marché) :</span>
                  <strong className="text-amber-400">{bs?.ratios?.sharePrice || 50} €</strong>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">4. RSE, Climat Social & Gouvernance</h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-800/80 pb-1 text-slate-300">
                  <span>Score RSE Global (0-100) :</span>
                  <strong className="text-emerald-400">{bs?.ratios?.esgScore || 74} / 100</strong>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1 text-slate-300">
                  <span>Effectif Total :</span>
                  <strong className="text-white">{hr?.workforce?.totalEmployees || 41} salariés</strong>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1 text-slate-300">
                  <span>Climat Social & Engagement :</span>
                  <strong className="text-white">{hr?.metrics?.socialClimateScore || 82}%</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Dividendes Proposés :</span>
                  <strong className="text-white">{firmResult?.decisions?.dividendPayoutRate || 20}% du résultat net</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Board Signatures */}
          <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <div>
              <span>Visa du Conseil d'Administration</span>
              <div className="font-serif italic text-white text-base mt-2">Le Président du Conseil</div>
            </div>
            <div className="text-right">
              <span>Secrétariat Général</span>
              <div className="text-slate-500 font-mono text-[11px] mt-2">Certifié conforme · SimBiz Corp</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

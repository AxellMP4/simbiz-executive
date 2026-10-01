import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  SlidersHorizontal,
  Mail,
  BookOpen,
  Wrench,
  Users2,
  TrendingUp,
  FileText,
  Factory,
  Scale,
  Wallet,
  Globe2,
  Award,
  Settings,
  Cpu,
  Rocket,
  Shield,
  Zap,
  Bot,
  Leaf
  ,FlaskConical
} from 'lucide-react';
import { CompanySettings } from '../../types/simulation';

export type MainViewTab =
  | 'recap'
  | 'results'
  | 'hr'
  | 'market'
  | 'decisions'
  | 'board'
  | 'messaging'
  | 'documentation'
  | 'tools'
  | 'companyLab';

export type ResultsSubTab =
  | 'pnl'
  | 'production'
  | 'balance'
  | 'cashflow'
  | 'competitors';

interface SidebarProps {
  currentTab: MainViewTab;
  currentSubTab: ResultsSubTab;
  onSelectTab: (tab: MainViewTab) => void;
  onSelectSubTab: (subTab: ResultsSubTab) => void;
  unreadMessagesCount: number;
  companySettings?: CompanySettings;
  onOpenCustomization?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  currentSubTab,
  onSelectTab,
  onSelectSubTab,
  unreadMessagesCount,
  companySettings,
  onOpenCustomization,
}) => {
  const isResultsActive = currentTab === 'results';
  const brandColor = companySettings?.brandColor || '#6366f1';
  const companyName = companySettings?.companyName || 'AeroPulse Technologies';
  const ticker = companySettings?.tickerSymbol || 'APULSE';
  const logoIcon = companySettings?.logoIcon || 'cpu';

  return (
    <aside className="sidebar-shell w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0"
              style={{ backgroundColor: brandColor }}
            >
              {logoIcon === 'cpu' && <Cpu className="w-4 h-4" />}
              {logoIcon === 'rocket' && <Rocket className="w-4 h-4" />}
              {logoIcon === 'shield' && <Shield className="w-4 h-4" />}
              {logoIcon === 'zap' && <Zap className="w-4 h-4" />}
              {logoIcon === 'bot' && <Bot className="w-4 h-4" />}
              {logoIcon === 'leaf' && <Leaf className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <span className="font-bold tracking-tight text-white text-sm font-display block leading-tight truncate">
                {companyName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {ticker} · {companySettings?.sectorName?.split('&')[0] || 'Industriel'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Customization Button */}
        {onOpenCustomization && (
          <button
            onClick={onOpenCustomization}
            className="w-full py-1.5 px-2.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 font-display flex items-center justify-between transition-colors shadow-xs"
          >
            <span className="flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-indigo-400" />
              <span>Personnaliser l'Entreprise</span>
            </span>
            <span className="text-[9px] font-mono bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800/80">
              Éditer
            </span>
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {/* Recap */}
        <button
          onClick={() => onSelectTab('recap')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'recap'
              ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-950'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-indigo-400" />
          <span className="font-display">Tableau de Bord Global</span>
        </button>

        {/* Résultats with collapsible sub-items */}
        <div>
          <button
            onClick={() => onSelectTab('results')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isResultsActive
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="font-display">États Financiers</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">5 rapports</span>
          </button>

          {/* Sub menu */}
          {isResultsActive && (
            <div className="ml-4 pl-3 border-l border-slate-800 my-1 space-y-0.5">
              <button
                onClick={() => {
                  onSelectTab('results');
                  onSelectSubTab('pnl');
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-colors ${
                  currentSubTab === 'pnl'
                    ? 'bg-indigo-950 text-indigo-300 font-bold border border-indigo-800/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Compte de Résultat</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab('results');
                  onSelectSubTab('production');
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-colors ${
                  currentSubTab === 'production'
                    ? 'bg-indigo-950 text-indigo-300 font-bold border border-indigo-800/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Factory className="w-3.5 h-3.5" />
                <span>Rapport de Production</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab('results');
                  onSelectSubTab('balance');
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-colors ${
                  currentSubTab === 'balance'
                    ? 'bg-indigo-950 text-indigo-300 font-bold border border-indigo-800/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Bilan Actif / Passif</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab('results');
                  onSelectSubTab('cashflow');
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-colors ${
                  currentSubTab === 'cashflow'
                    ? 'bg-indigo-950 text-indigo-300 font-bold border border-indigo-800/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Tableau de Trésorerie</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab('results');
                  onSelectSubTab('competitors');
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-colors ${
                  currentSubTab === 'competitors'
                    ? 'bg-indigo-950 text-indigo-300 font-bold border border-indigo-800/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>Benchmark Marché</span>
              </button>
            </div>
          )}
        </div>

        {/* Décisions */}
        <button
          onClick={() => onSelectTab('decisions')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'decisions'
              ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-950'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className={`w-4 h-4 ${currentTab === 'decisions' ? 'text-black' : 'text-amber-400'}`} />
            <span className="font-display">Feuille de Décisions</span>
          </div>
          <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">
            Saisie
          </span>
        </button>

        {/* Board & R&D */}
        <button
          onClick={() => onSelectTab('board')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'board'
              ? 'bg-amber-600 text-white font-semibold shadow-md shadow-amber-950'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="font-display">Conseil & R&D</span>
          </div>
          <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded font-mono">
            Brevets
          </span>
        </button>

        <button
          onClick={() => onSelectTab('companyLab')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'companyLab'
              ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-950'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FlaskConical className="w-4 h-4 text-indigo-300" />
            <span className="font-display">Company Lab</span>
          </div>
          <span className="text-[10px] font-mono text-indigo-300">Profil</span>
        </button>

        {/* RH Management */}
        <button
          onClick={() => onSelectTab('hr')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'hr'
              ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-950'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Users2 className="w-4 h-4 text-purple-400" />
            <span className="font-display">Ressources Humaines</span>
          </div>
          <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded font-mono">
            Avancé
          </span>
        </button>

        {/* Market Analysis */}
        <button
          onClick={() => onSelectTab('market')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'market'
              ? 'bg-sky-600 text-white font-semibold shadow-md shadow-sky-950'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span className="font-display">Analyses de Marché</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Élasticité</span>
        </button>

        <div className="pt-2 border-t border-slate-800/60 my-2" />

        {/* Messaging */}
        <button
          onClick={() => onSelectTab('messaging')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'messaging'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-rose-400" />
            <span className="font-display">Messagerie & Alertes</span>
          </div>
          {unreadMessagesCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full font-mono">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {/* Tools */}
        <button
          onClick={() => onSelectTab('tools')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'tools'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Wrench className="w-4 h-4 text-emerald-400" />
          <span className="font-display">Calculateurs & Outils</span>
        </button>

        {/* Documentation */}
        <button
          onClick={() => onSelectTab('documentation')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'documentation'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span className="font-display">Manuel Stratégique</span>
        </button>
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-between">
        <span>Moteur V3.2</span>
        <span className="text-emerald-400">Simulation P0 OK</span>
      </div>
    </aside>
  );
};

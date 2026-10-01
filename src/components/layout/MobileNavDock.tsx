import React from 'react';
import {
  Compass,
  LayoutDashboard,
  SlidersHorizontal,
  FileSpreadsheet,
  LineChart,
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { MainViewTab } from './Sidebar';

interface MobileNavDockProps {
  currentTab: MainViewTab;
  onSelectTab: (tab: MainViewTab) => void;
  onToggleAdvisor: () => void;
  unreadAdvisorCount: number;
  unreadMessagesCount: number;
}

export const MobileNavDock: React.FC<MobileNavDockProps> = ({
  currentTab,
  onSelectTab,
  onToggleAdvisor,
  unreadAdvisorCount,
}) => {
  return (
    <nav
      aria-label="Navigation mobile rapide"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 px-3 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb"
    >
      {/* Parcours Guidé */}
      <button
        onClick={() => onSelectTab('guidedTour')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          currentTab === 'guidedTour'
            ? 'text-amber-400 font-bold bg-amber-950/40'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Compass className={`w-5 h-5 ${currentTab === 'guidedTour' ? 'text-amber-400 animate-pulse' : ''}`} />
        <span className="text-[10px] font-display mt-0.5">Guidé</span>
      </button>

      {/* Cockpit Global */}
      <button
        onClick={() => onSelectTab('recap')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          currentTab === 'recap'
            ? 'text-indigo-400 font-bold bg-indigo-950/40'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px] font-display mt-0.5">Cockpit</span>
      </button>

      {/* Décisions */}
      <button
        onClick={() => onSelectTab('decisions')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          currentTab === 'decisions'
            ? 'text-sky-400 font-bold bg-sky-950/40'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <SlidersHorizontal className="w-5 h-5" />
        <span className="text-[10px] font-display mt-0.5">Décisions</span>
      </button>

      {/* Résultats */}
      <button
        onClick={() => onSelectTab('results')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          currentTab === 'results'
            ? 'text-emerald-400 font-bold bg-emerald-950/40'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <FileSpreadsheet className="w-5 h-5" />
        <span className="text-[10px] font-display mt-0.5">États</span>
      </button>

      <button
        onClick={() => onSelectTab('financialMarket')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          currentTab === 'financialMarket'
            ? 'text-emerald-400 font-bold bg-emerald-950/40'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <LineChart className="w-5 h-5" />
        <span className="text-[10px] font-display mt-0.5">Marchés</span>
      </button>

      {/* Conseiller */}
      <button
        onClick={onToggleAdvisor}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all text-slate-400 hover:text-slate-200 relative cursor-pointer"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          {unreadAdvisorCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </div>
        <span className="text-[10px] font-display mt-0.5">Conseils</span>
      </button>
    </nav>
  );
};

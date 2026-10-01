import React, { useState, useEffect } from 'react';
import {
  PeriodSnapshot,
  FirmDecisions,
  CompanySettings,
  CrisisEvent
} from '../../../types/simulation';
import { DecisionValidation } from '../../../domain/simulationLifecycle';
import { AdvisorRecommendation } from '../../../domain/managementAdvisor';
import { GuidedAnalysisStep } from './GuidedAnalysisStep';
import { GuidedDecisionsStep } from './GuidedDecisionsStep';
import { GuidedSimulationStep } from './GuidedSimulationStep';
import { GuidedDebriefingStep } from './GuidedDebriefingStep';
import {
  Compass,
  Sliders,
  Play,
  Trophy,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export type GuidedStep = 'analysis' | 'decisions' | 'simulation' | 'debriefing';

interface GuidedTourViewProps {
  currentPeriod: number;
  latestPeriod: number;
  snapshot: PeriodSnapshot;
  prevSnapshot?: PeriodSnapshot;
  pendingDecisions: FirmDecisions;
  onUpdateDecisions: (updated: Partial<FirmDecisions>) => void;
  onExecuteSimulation: () => void;
  companySettings: CompanySettings;
  selectedFirmId: string;
  validation: DecisionValidation[];
  advisorRecommendations: AdvisorRecommendation[];
  onOpenAdvisor?: () => void;
  currentCrisis?: CrisisEvent;
  onSelectCrisisChoice?: (choiceId: string) => void;
  onGoToResultsView: () => void;
  onGoToMarketView: () => void;
}

export const GuidedTourView: React.FC<GuidedTourViewProps> = ({
  currentPeriod,
  latestPeriod,
  snapshot,
  prevSnapshot,
  pendingDecisions,
  onUpdateDecisions,
  onExecuteSimulation,
  companySettings,
  selectedFirmId,
  validation,
  advisorRecommendations,
  onOpenAdvisor,
  currentCrisis,
  onSelectCrisisChoice,
  onGoToResultsView,
  onGoToMarketView,
}) => {
  // If we just simulated a new period, we can show debriefing or start at analysis
  const [currentStep, setCurrentStep] = useState<GuidedStep>('analysis');

  // Steps definition
  const steps: { id: GuidedStep; label: string; icon: React.FC<{ className?: string }>; description: string }[] = [
    { id: 'analysis', label: '1. Diagnostic', icon: Compass, description: 'Analyse & Marché' },
    { id: 'decisions', label: '2. Décisions', icon: Sliders, description: 'Arbitrages sectoriels' },
    { id: 'simulation', label: '3. Clôture', icon: Play, description: 'Validation & Calcul' },
    { id: 'debriefing', label: '4. Débriefing', icon: Trophy, description: 'Score & Évaluation' },
  ];

  const currentIdx = steps.findIndex(s => s.id === currentStep);

  const handleSimulate = () => {
    onExecuteSimulation();
    // After simulation finishes, move directly to debriefing
    setCurrentStep('debriefing');
  };

  const handleStartNextPeriodTour = () => {
    // Moves to analysis for the newly opened period
    setCurrentStep('analysis');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      {/* Top Stepper Bar */}
      <div className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Label */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200">Parcours Guidé Exécutif</span>
            <span className="text-slate-600">|</span>
            <span className="text-indigo-300 font-semibold">Trimestre P.{currentPeriod}</span>
          </div>

          {/* Stepper Pills */}
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              const isActive = st.id === currentStep;
              const isPast = idx < currentIdx;

              return (
                <button
                  key={st.id}
                  onClick={() => setCurrentStep(st.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-display transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-950'
                      : isPast
                      ? 'bg-slate-900 text-emerald-300 border border-emerald-900/60 hover:bg-slate-850'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : isPast ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{st.label}</span>
                  {isPast && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Step Content Container */}
      <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {currentStep === 'analysis' && (
          <GuidedAnalysisStep
            snapshot={snapshot}
            prevSnapshot={prevSnapshot}
            companySettings={companySettings}
            selectedFirmId={selectedFirmId}
            onNextStep={() => setCurrentStep('decisions')}
            advisorRecommendations={advisorRecommendations}
            onOpenAdvisor={onOpenAdvisor}
          />
        )}

        {currentStep === 'decisions' && (
          <GuidedDecisionsStep
            currentPeriod={currentPeriod}
            pendingDecisions={pendingDecisions}
            onUpdateDecisions={onUpdateDecisions}
            snapshot={snapshot}
            companySettings={companySettings}
            selectedFirmId={selectedFirmId}
            onPrevStep={() => setCurrentStep('analysis')}
            onNextStep={() => setCurrentStep('simulation')}
            validation={validation}
          />
        )}

        {currentStep === 'simulation' && (
          <GuidedSimulationStep
            currentPeriod={currentPeriod}
            pendingDecisions={pendingDecisions}
            snapshot={snapshot}
            companySettings={companySettings}
            selectedFirmId={selectedFirmId}
            onPrevStep={() => setCurrentStep('decisions')}
            onExecuteSimulation={handleSimulate}
            validation={validation}
            currentCrisis={currentCrisis}
            onSelectCrisisChoice={onSelectCrisisChoice}
          />
        )}

        {currentStep === 'debriefing' && (
          <GuidedDebriefingStep
            snapshot={snapshot}
            prevSnapshot={prevSnapshot}
            companySettings={companySettings}
            selectedFirmId={selectedFirmId}
            onStartNextPeriodTour={handleStartNextPeriodTour}
            onGoToResultsView={onGoToResultsView}
            onGoToMarketView={onGoToMarketView}
          />
        )}
      </div>
    </div>
  );
};

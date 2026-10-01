import React, { useState, useEffect } from 'react';
import {
  PeriodSnapshot,
  FirmDecisions,
  SystemMessage,
  CompanySettings,
  StrategicObjective,
  CrisisEvent,
  TechPatent
} from './types/simulation';
import {
  getHistoricalSnapshots,
  INITIAL_DECISIONS_P1,
  INITIAL_MESSAGES,
  FIRMS_METADATA,
} from './data/initialData';
import {
  DEFAULT_COMPANY_SETTINGS,
  INITIAL_OBJECTIVES,
  CRISIS_SCENARIOS,
  TECH_PATENTS
} from './data/customizationData';
import { simulateNextPeriod } from './engine/simulationEngine';
import { commitPeriod, createPreview, DecisionEvent, PeriodStatus, validateBackupState, validateDecisions } from './domain/simulationLifecycle';
import { Sidebar, MainViewTab, ResultsSubTab } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { RecapView } from './components/views/RecapView';
import { ExecutiveCockpitView } from './components/views/ExecutiveCockpitView';
import { ResultsView } from './components/views/ResultsView';
import { DecisionsView } from './components/views/DecisionsView';
import { HRManagementView } from './components/views/HRManagementView';
import { MarketAnalysisView } from './components/views/MarketAnalysisView';
import { BoardAndRndView } from './components/views/BoardAndRndView';
import { MessagingView } from './components/views/MessagingView';
import { ToolsView } from './components/views/ToolsView';
import { DocumentationView } from './components/views/DocumentationView';
import { CustomizationModal } from './components/ui/CustomizationModal';
import { CompanyLabView } from './components/views/CompanyLabView';
import { api, getGameCode, setGameCode, SyncState } from './api/client';
import { CheckCircle2, TrendingUp, AlertCircle, X, Sparkles, RotateCcw, AlertTriangle } from 'lucide-react';

const STORAGE_KEY = 'simbiz_executive_simulation_p0_v5';

export default function App() {
  // Load or initialize simulation data - starts at Période 0 (P0)
  const [snapshots, setSnapshots] = useState<Record<number, PeriodSnapshot>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.snapshots && parsed.snapshots[0]) return parsed.snapshots;
      }
    } catch (e) {
      console.error('Failed to load saved simulation state:', e);
    }
    return getHistoricalSnapshots();
  });

  const [currentPeriod, setCurrentPeriod] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.currentPeriod === 'number') return parsed.currentPeriod;
      }
    } catch (e) {}
    return 0; // Commencer en P0
  });

  const [latestPeriod, setLatestPeriod] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.latestPeriod === 'number') return parsed.latestPeriod;
      }
    } catch (e) {}
    return 0; // Commencer en P0
  });

  const [selectedFirmId, setSelectedFirmId] = useState<string>('1');

  // Customization & Game Systems State
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.companySettings) return parsed.companySettings;
      }
    } catch (e) {}
    return DEFAULT_COMPANY_SETTINGS;
  });

  const [objectives, setObjectives] = useState<StrategicObjective[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.objectives) return parsed.objectives;
      }
    } catch (e) {}
    return INITIAL_OBJECTIVES;
  });

  const [crises, setCrises] = useState<Record<number, CrisisEvent>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.crises) return parsed.crises;
      }
    } catch (e) {}
    return CRISIS_SCENARIOS;
  });

  const [techPatents, setTechPatents] = useState<TechPatent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.techPatents) return parsed.techPatents;
      }
    } catch (e) {}
    return TECH_PATENTS;
  });

  const [isCustomizationOpen, setIsCustomizationOpen] = useState<boolean>(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ title: string; message: string; type?: 'success' | 'warning' | 'info' } | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('local');
  const [gameCode, setGameCodeState] = useState(() => getGameCode());
  const [syncReady, setSyncReady] = useState(false);
  const [previewResult, setPreviewResult] = useState<import('./types/simulation').FirmPeriodResult | undefined>();
  const [periodStatus, setPeriodStatus] = useState<PeriodStatus>('draft');
  const [events, setEvents] = useState<DecisionEvent[]>([]);

  const showToast = (title: string, message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    setToast({ title, message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const [pendingDecisions, setPendingDecisions] = useState<FirmDecisions>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.pendingDecisions) return parsed.pendingDecisions;
      }
    } catch (e) {}
    return INITIAL_DECISIONS_P1;
  });

  const [messages, setMessages] = useState<SystemMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.messages) return parsed.messages;
      }
    } catch (e) {}
    return INITIAL_MESSAGES;
  });

  // Navigation State
  const [currentTab, setCurrentTab] = useState<MainViewTab>('recap');
  const [currentSubTab, setCurrentSubTab] = useState<ResultsSubTab>('pnl');

  // Transition modal state
  const [simulationModalInfo, setSimulationModalInfo] = useState<{
    open: boolean;
    period: number;
    profit: number;
    revenue: number;
  } | null>(null);

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          snapshots,
          pendingDecisions,
          messages,
          latestPeriod,
          currentPeriod,
          companySettings,
          objectives,
          crises,
          techPatents,
          events,
          periodStatus,
        })
      );
    } catch (e) {
      console.error('Failed to save simulation to localStorage:', e);
    }
  }, [snapshots, pendingDecisions, messages, latestPeriod, currentPeriod, companySettings, objectives, crises, techPatents, events, periodStatus]);

  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      try {
        const code = getGameCode();
        if (code) {
          const remote = await api.loadGame(code);
          if (!cancelled && remote.state?.snapshots) {
            setSnapshots(remote.state.snapshots);
            setCurrentPeriod(remote.state.currentPeriod);
            setLatestPeriod(remote.state.latestPeriod);
            setCompanySettings(remote.state.companySettings);
            setPendingDecisions(remote.state.pendingDecisions);
            setMessages(remote.state.messages as SystemMessage[]);
            setObjectives((remote.state.objectives as StrategicObjective[] | undefined) || INITIAL_OBJECTIVES);
            setCrises((remote.state.crises as Record<number, CrisisEvent> | undefined) || CRISIS_SCENARIOS);
            setTechPatents((remote.state.techPatents as TechPatent[] | undefined) || TECH_PATENTS);
            setEvents((remote.state.events as DecisionEvent[] | undefined) || []);
            setPeriodStatus((remote.state.periodStatus as PeriodStatus | undefined) || 'draft');
            setSyncState('online');
          }
        } else {
          const created = await api.createGame({ snapshots, currentPeriod, latestPeriod, companySettings, pendingDecisions, messages, objectives, crises, techPatents, events, periodStatus });
          if (!cancelled) {
            setGameCode(created.gameCode);
            setGameCodeState(created.gameCode);
            setSyncState('online');
          }
        }
      } catch {
        if (!cancelled) setSyncState('offline');
      } finally {
        if (!cancelled) setSyncReady(true);
      }
    };
    restore();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!syncReady || !gameCode) return;
    const timer = window.setTimeout(async () => {
      try {
        await api.saveGame(gameCode, { gameCode, deviceId: '', snapshots, currentPeriod, latestPeriod, companySettings, pendingDecisions, messages, objectives, crises, techPatents, events, periodStatus });
        setSyncState('online');
      } catch {
        setSyncState('offline');
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [syncReady, gameCode, snapshots, currentPeriod, latestPeriod, companySettings, pendingDecisions, messages, objectives, crises, techPatents, events, periodStatus]);

  const validation = validateDecisions(
    pendingDecisions,
    snapshots[latestPeriod]?.firmsResults[selectedFirmId] || snapshots[latestPeriod]?.firmsResults['1'],
  );

  const addEvent = (type: DecisionEvent['type'], period: number, message: string) => {
    setEvents(prev => [{ id: `${type}-${period}-${Date.now()}`, type, period, at: new Date().toISOString(), message }, ...prev].slice(0, 50));
  };

  const handlePreview = () => {
    if (validation.some(issue => issue.severity === 'error')) {
      showToast('Prévisualisation bloquée', 'Corrigez les contraintes bloquantes avant de lancer le scénario.', 'warning');
      return;
    }
    const activeSnap = snapshots[latestPeriod];
    if (!activeSnap) return;
    try {
      const next = createPreview(activeSnap, pendingDecisions);
      setPreviewResult(next);
      setPeriodStatus('preview');
      addEvent('preview_generated', next.period, `Prévision P.${next.period} générée sans modifier les résultats officiels.`);
    } catch (error) {
      showToast('Prévisualisation indisponible', error instanceof Error ? error.message : 'Le moteur n’a pas pu calculer le scénario.', 'warning');
    }
  };

  // Execute simulation turn
  const handleSimulateNextPeriod = () => {
    if (validation.some(issue => issue.severity === 'error')) {
      showToast('Clôture bloquée', 'Corrigez les contraintes bloquantes avant de clôturer la période.', 'warning');
      return;
    }
    const activeSnap = snapshots[latestPeriod];
    if (!activeSnap) return;

    // Apply CEO perks and Patent bonuses
    let adjustedDecisions = { ...pendingDecisions };
    if (companySettings.ceoPersona === 'tech_visionary') {
      adjustedDecisions.marketingEffortB = Math.min(1.0, adjustedDecisions.marketingEffortB * 1.12);
      adjustedDecisions.rdBudget = Math.round(adjustedDecisions.rdBudget * 1.15);
    } else if (companySettings.ceoPersona === 'ops_optimizer') {
      adjustedDecisions.laborUtilizationRate = Math.min(1.25, adjustedDecisions.laborUtilizationRate * 1.05);
    }

    const { nextSnapshot, newMessages } = simulateNextPeriod(activeSnap, adjustedDecisions, companySettings);
    const newPeriodNum = nextSnapshot.period;

    // Apply active crises resolution impact if any
    const activeCrisis = crises[newPeriodNum];
    if (activeCrisis && activeCrisis.chosenOptionId) {
      const choice = activeCrisis.choices.find(c => c.id === activeCrisis.chosenOptionId);
      if (choice) {
        const firmRes = nextSnapshot.firmsResults[selectedFirmId];
        if (firmRes) {
          firmRes.balanceSheet.assets.cashAndEquivalents += choice.cashImpact;
          firmRes.incomeStatement.netProfit += choice.profitImpact;
          firmRes.balanceSheet.liabilities.periodNetProfit += choice.profitImpact;
          if (firmRes.balanceSheet.ratios.esgScore) {
            firmRes.balanceSheet.ratios.esgScore = Math.min(100, Math.max(30, firmRes.balanceSheet.ratios.esgScore + choice.esgImpact));
          }
        }
      }
    }

    setSnapshots(prev => commitPeriod(prev, nextSnapshot));
    setLatestPeriod(newPeriodNum);
    setCurrentPeriod(newPeriodNum);
    setPreviewResult(undefined);
    addEvent('period_validated', newPeriodNum, `Décisions P.${newPeriodNum} validées : contraintes contrôlées avant clôture.`);
    setPeriodStatus('closed');
    addEvent('period_closed', newPeriodNum, `Période ${newPeriodNum} clôturée et enregistrée de façon idempotente.`);
    setMessages(prev => [...newMessages, ...prev]);

    // Setup base decisions for NEXT period
    const playerResult = nextSnapshot.firmsResults[selectedFirmId] || nextSnapshot.firmsResults['1'];
    setPendingDecisions(prev => ({
      ...prev,
      period: newPeriodNum + 1,
      productionA: playerResult.decisions.productionA,
      productionB: playerResult.decisions.productionB,
      rawMaterialOrder: Math.round(playerResult.decisions.productionA * 3.0 + playerResult.decisions.productionB * 4.0),
      shortTermLoan: 0,
      mediumTermLoan: 0,
      greenLoanRequested: 0,
      equityRaise: 0,
      chosenCrisisChoiceId: undefined,
    }));

    // Trigger feedback modal
    setSimulationModalInfo({
      open: true,
      period: newPeriodNum,
      profit: playerResult.incomeStatement.netProfit,
      revenue: playerResult.incomeStatement.revenue,
    });
  };

  const handleUpdateDecisions = (updated: Partial<FirmDecisions>) => {
    setPendingDecisions(prev => ({ ...prev, ...updated }));
  };

  const handleSaveCompanySettings = (newSettings: CompanySettings) => {
    setCompanySettings(newSettings);
    // Dynamically update firm 1 display name in benchmark across all snapshots
    setSnapshots(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(pStr => {
        const p = Number(pStr);
        const snap = updated[p];
        if (snap) {
          const comp1 = snap.competitorsBenchmark.find(c => c.firmId === '1');
          if (comp1) comp1.firmName = `${newSettings.companyName} (Vous)`;
        }
      });
      return updated;
    });

    showToast(
      "Configuration Entreprise Enregistrée",
      `L'entreprise est désormais "${newSettings.companyName}" (${newSettings.tickerSymbol}). Tous les rapports sont synchronisés.`,
      "success"
    );
  };

  const handleSelectCrisisChoice = (choiceId: string) => {
    const periodToUse = latestPeriod + 1;
    setCrises(prev => {
      const existing = prev[periodToUse] || prev[1];
      if (!existing) return prev;
      return {
        ...prev,
        [periodToUse]: {
          ...existing,
          chosenOptionId: choiceId,
          resolved: true,
        },
      };
    });
    setPendingDecisions(prev => ({ ...prev, chosenCrisisChoiceId: choiceId }));
  };

  const handleUnlockPatent = (patentId: string) => {
    const pat = techPatents.find(p => p.id === patentId);
    if (!pat || pat.unlocked) return;

    const snap = snapshots[currentPeriod];
    const firm = snap?.firmsResults[selectedFirmId];
    if (!firm || firm.balanceSheet.assets.cashAndEquivalents < pat.rdCost) {
      showToast(
        "Trésorerie Insuffisante",
        `Fonds disponibles (${(firm?.balanceSheet.assets.cashAndEquivalents || 0).toLocaleString('fr-FR')} ${companySettings.currency}) inférieurs au coût de R&D (${pat.rdCost.toLocaleString('fr-FR')} ${companySettings.currency}).`,
        "warning"
      );
      return;
    }

    // Deduct cash from firm
    firm.balanceSheet.assets.cashAndEquivalents -= pat.rdCost;
    if (pat.effect.esgBonus && firm.balanceSheet.ratios.esgScore) {
      firm.balanceSheet.ratios.esgScore = Math.min(100, firm.balanceSheet.ratios.esgScore + pat.effect.esgBonus);
    }

    setTechPatents(prev => prev.map(p => (p.id === patentId ? { ...p, unlocked: true } : p)));
    showToast(
      "Brevet Déposé avec Succès !",
      `Brevet "${pat.name}" activé : ${pat.benefit}`,
      "success"
    );
  };

  const handleClaimObjectiveReward = (objId: string) => {
    const obj = objectives.find(o => o.id === objId);
    if (!obj || obj.completed) return;

    const snap = snapshots[currentPeriod];
    const firm = snap?.firmsResults[selectedFirmId];
    if (!firm) return;

    firm.balanceSheet.assets.cashAndEquivalents += obj.rewardCash;
    if (firm.balanceSheet.ratios.sharePrice) {
      firm.balanceSheet.ratios.sharePrice += obj.rewardSharePriceBonus;
    }

    setObjectives(prev => prev.map(o => (o.id === objId ? { ...o, completed: true } : o)));
    showToast(
      "Objectif Validé par le Conseil !",
      `Prime de ${obj.rewardCash.toLocaleString('fr-FR')} ${companySettings.currency} créditée. Bonus de valorisation accordé.`,
      "success"
    );
  };

  const executeResetToP0 = () => {
    localStorage.removeItem(STORAGE_KEY);
    const freshSnapshots = getHistoricalSnapshots();
    setSnapshots(freshSnapshots);
    setLatestPeriod(0);
    setCurrentPeriod(0);
    setSelectedFirmId('1');
    setPendingDecisions(INITIAL_DECISIONS_P1);
    setMessages(INITIAL_MESSAGES);
    setObjectives(INITIAL_OBJECTIVES);
    setTechPatents(TECH_PATENTS);
    setCurrentTab('recap');
    setPreviewResult(undefined);
    setPeriodStatus('draft');
    setEvents([{ id: 'period-opened-0', type: 'period_opened', period: 0, at: new Date().toISOString(), message: 'Simulation initialisée sur la période 0.' }]);
    setConfirmResetOpen(false);
    showToast("Simulation Réinitialisée", "Retour à la Période 0 (P0) effectué avec succès.", "info");
  };

  const handleMarkAsRead = (id: string) => {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, read: true } : m)));
  };

  const handleMarkAllAsRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, read: true })));
  };

  const handleExportState = () => {
    const state = { snapshots, pendingDecisions, messages, latestPeriod, currentPeriod, companySettings, objectives, crises, techPatents, events, periodStatus };
    const anchor = document.createElement('a');
    anchor.href = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(state, null, 2))}`;
    anchor.download = `simbiz-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
  };

  const handleImportState = async (file: File) => {
    try {
      const parsed = validateBackupState(JSON.parse(await file.text()));
      setSnapshots(parsed.snapshots);
      setPendingDecisions(parsed.pendingDecisions);
      setMessages((parsed.messages as SystemMessage[] | undefined) || []);
      setLatestPeriod(parsed.latestPeriod);
      setCurrentPeriod(parsed.currentPeriod);
      if (parsed.companySettings) setCompanySettings(parsed.companySettings as CompanySettings);
      if (parsed.objectives) setObjectives(parsed.objectives as StrategicObjective[]);
      if (parsed.crises) setCrises(parsed.crises as Record<number, CrisisEvent>);
      if (parsed.techPatents) setTechPatents(parsed.techPatents as TechPatent[]);
      setEvents((parsed.events as DecisionEvent[] | undefined) || []);
      setPeriodStatus(parsed.periodStatus || 'draft');
      showToast('Sauvegarde restaurée', 'L’état complet de la simulation a été importé.', 'success');
    } catch (error) {
      showToast('Import impossible', error instanceof Error ? error.message : 'Fichier JSON illisible.', 'warning');
    }
  };

  const availablePeriods = Object.keys(snapshots)
    .map(Number)
    .sort((a, b) => a - b);

  const activeSnapshot = snapshots[currentPeriod] || snapshots[latestPeriod] || snapshots[0];
  const prevSnapshot = currentPeriod > 0 ? snapshots[currentPeriod - 1] : undefined;
  const unreadCount = messages.filter(m => !m.read).length;
  const currentCrisis = crises[latestPeriod + 1] || crises[1];

  return (
    <div className="app-shell flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Left Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        currentSubTab={currentSubTab}
        onSelectTab={setCurrentTab}
        onSelectSubTab={setCurrentSubTab}
        unreadMessagesCount={unreadCount}
        companySettings={companySettings}
        onOpenCustomization={() => setIsCustomizationOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Unified TopBar with P0 selector, Real-time Stock Ticker & Haute Volatilité */}
        <TopBar
          periods={availablePeriods}
          activePeriod={currentPeriod}
          latestPeriod={latestPeriod}
          onSelectPeriod={setCurrentPeriod}
          onSimulateNext={handleSimulateNextPeriod}
          onResetSimulation={() => setConfirmResetOpen(true)}
          snapshot={activeSnapshot}
          prevSnapshot={prevSnapshot}
          selectedFirmId={selectedFirmId}
          companySettings={companySettings}
          onOpenCustomization={() => setIsCustomizationOpen(true)}
          onSelectFirm={setSelectedFirmId}
        />

        {/* View Router */}
        <main className="app-main flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-950">
          {currentTab === 'recap' && (
            <ExecutiveCockpitView
              snapshot={activeSnapshot}
              previous={prevSnapshot}
              companySettings={companySettings}
              pendingDecisions={pendingDecisions}
              periodStatus={periodStatus}
              events={events}
              validation={validation}
              onDecisions={() => setCurrentTab('decisions')}
              onPreview={handlePreview}
            />
          )}

          {currentTab === 'legacyRecap' && (
            <RecapView
              snapshot={activeSnapshot}
              prevSnapshot={prevSnapshot}
              selectedFirmId={selectedFirmId}
              companySettings={companySettings}
              onGoToDecisions={() => setCurrentTab('decisions')}
              onSelectFirm={setSelectedFirmId}
            />
          )}

          {currentTab === 'results' && (
            <ResultsView
              currentSubTab={currentSubTab}
              snapshot={activeSnapshot}
              prevSnapshot={prevSnapshot}
              allSnapshots={snapshots}
              selectedFirmId={selectedFirmId}
              companySettings={companySettings}
            />
          )}

          {currentTab === 'decisions' && (
            <DecisionsView
              currentPeriod={latestPeriod}
              pendingDecisions={pendingDecisions}
              allSnapshots={snapshots}
              onUpdateDecisions={handleUpdateDecisions}
              onSimulate={handleSimulateNextPeriod}
              selectedFirmId={selectedFirmId}
              companySettings={companySettings}
            />
          )}

          {currentTab === 'board' && (
            <BoardAndRndView
              snapshot={activeSnapshot}
              companySettings={companySettings}
              objectives={objectives}
              currentCrisis={currentCrisis}
              techPatents={techPatents}
              selectedFirmId={selectedFirmId}
              onSelectCrisisChoice={handleSelectCrisisChoice}
              onUnlockPatent={handleUnlockPatent}
              onClaimObjectiveReward={handleClaimObjectiveReward}
            />
          )}

          {currentTab === 'companyLab' && (
            <CompanyLabView settings={companySettings} onSave={handleSaveCompanySettings} />
          )}

          {currentTab === 'hr' && (
            <HRManagementView
              snapshot={activeSnapshot}
              pendingDecisions={pendingDecisions}
              onUpdateDecisions={handleUpdateDecisions}
              selectedFirmId={selectedFirmId}
            />
          )}

          {currentTab === 'market' && (
            <MarketAnalysisView
              snapshot={activeSnapshot}
              selectedFirmId={selectedFirmId}
              companySettings={companySettings}
            />
          )}

          {currentTab === 'messaging' && (
            <MessagingView
              messages={messages}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
          )}

          {currentTab === 'tools' && (
            <ToolsView
              snapshot={activeSnapshot}
              selectedFirmId={selectedFirmId}
              onResetToP0={() => setConfirmResetOpen(true)}
              onExportState={handleExportState}
              onImportState={handleImportState}
              allSnapshots={snapshots}
            />
          )}

          {currentTab === 'documentation' && <DocumentationView />}
        </main>
        <div className="sync-status" title={gameCode ? `Code invité : ${gameCode}` : 'Sauvegarde locale'}>
          <span className={`sync-dot ${syncState}`} />
          {syncState === 'online' ? `Synchronisé · ${gameCode}` : syncState === 'offline' ? 'Hors ligne · sauvegarde locale' : 'Sauvegarde locale'}
        </div>
      </div>

      {/* Company Customization Modal */}
      <CustomizationModal
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        settings={companySettings}
        onSave={handleSaveCompanySettings}
      />

      {/* Confirmation Modal for Reset */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-white">
                  Réinitialiser la Simulation ?
                </h3>
                <p className="text-xs text-slate-400">
                  Cette action ramène la simulation à la Période 0 (P0).
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              Toutes les périodes simulées ultérieures, les brevets débloqués et l'historique de décisions seront réinitialisés à leur état d'origine. Vos réglages de personnalisation d'entreprise seront conservés.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold font-display transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={executeResetToP0}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-display transition-colors shadow-md"
              >
                Confirmer la Réinitialisation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Non-blocking Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 max-w-sm ${
            toast.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/70 text-emerald-200'
              : toast.type === 'warning'
              ? 'bg-amber-950/95 border-amber-500/70 text-amber-200'
              : 'bg-slate-900/95 border-slate-700 text-slate-200'
          }`}>
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {toast.type === 'info' && <Sparkles className="w-4 h-4 text-indigo-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold font-display">{toast.title}</h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Post-simulation Feedback Modal */}
      {simulationModalInfo?.open && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSimulationModalInfo(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-white">
                  Période {simulationModalInfo.period} Clôturée !
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {companySettings.companyName} · Arbitrages traités
                </p>
              </div>
            </div>

            <div className="bg-slate-950 rounded-lg p-4 mb-5 border border-slate-800 space-y-3 font-mono text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Chiffre d'Affaires :</span>
                <span className="font-bold text-white">
                  {simulationModalInfo.revenue.toLocaleString('fr-FR')} {companySettings.currency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Résultat Net :</span>
                <span
                  className={`font-bold ${
                    simulationModalInfo.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {simulationModalInfo.profit >= 0 ? '+' : ''}
                  {simulationModalInfo.profit.toLocaleString('fr-FR')} {companySettings.currency}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSimulationModalInfo(null);
                  setCurrentTab('results');
                  setCurrentSubTab('pnl');
                }}
                className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <span>Examiner les États Financiers</span>
              </button>
              <button
                onClick={() => {
                  setSimulationModalInfo(null);
                  setCurrentTab('decisions');
                }}
                className="py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <span>Préparer P.{simulationModalInfo.period + 1}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

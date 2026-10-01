import { FirmDecisions, FirmPeriodResult, PeriodSnapshot } from '../types/simulation';
import { simulateNextPeriod } from '../engine/simulationEngine';

export type PeriodStatus = 'draft' | 'preview' | 'validated' | 'closed';

export interface DecisionEvent {
  id: string;
  type: 'decision_saved' | 'preview_generated' | 'period_validated' | 'period_closed' | 'period_opened';
  period: number;
  at: string;
  message: string;
}

export interface DecisionValidation {
  field: keyof FirmDecisions | 'budget';
  message: string;
  severity: 'error' | 'warning';
}

export interface PeriodLifecycle {
  status: PeriodStatus;
  draft: FirmDecisions;
  preview?: FirmPeriodResult;
  validatedAt?: string;
  closedAt?: string;
}

export interface BackupState {
  snapshots: Record<number, PeriodSnapshot>;
  pendingDecisions: FirmDecisions;
  currentPeriod: number;
  latestPeriod: number;
  companySettings: unknown;
  messages: unknown[];
  objectives?: unknown[];
  crises?: Record<number, unknown>;
  techPatents?: unknown[];
  events?: DecisionEvent[];
  periodStatus?: PeriodStatus;
}

export const validateBackupState = (input: unknown): BackupState => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Le fichier ne contient pas un état de simulation.');
  }
  const state = input as Partial<BackupState>;
  if (!state.snapshots || typeof state.snapshots !== 'object' || Array.isArray(state.snapshots)) {
    throw new Error('La sauvegarde ne contient pas de périodes valides.');
  }
  if (!state.pendingDecisions || typeof state.pendingDecisions !== 'object') {
    throw new Error('La sauvegarde ne contient pas de décisions en brouillon.');
  }
  const currentPeriod = state.currentPeriod;
  const latestPeriod = state.latestPeriod;
  if (typeof currentPeriod !== 'number' || typeof latestPeriod !== 'number' || !Number.isInteger(currentPeriod) || !Number.isInteger(latestPeriod) || currentPeriod < 0 || latestPeriod < 0) {
    throw new Error('Les périodes de la sauvegarde sont invalides.');
  }
  if (currentPeriod > latestPeriod || !state.snapshots[latestPeriod]) {
    throw new Error('La période active ne correspond pas aux résultats sauvegardés.');
  }
  if (state.periodStatus && !['draft', 'preview', 'validated', 'closed'].includes(state.periodStatus)) {
    throw new Error('Le statut de période est invalide.');
  }
  if (state.events && !Array.isArray(state.events)) throw new Error('Le journal d’activité est invalide.');
  return state as BackupState;
};

export const csvEscape = (value: unknown): string => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[;"\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = (rows: Array<Record<string, unknown>>): string => {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  return `\ufeff${headers.map(csvEscape).join(';')}\n${rows.map(row => headers.map(header => csvEscape(row[header])).join(';')).join('\n')}\n`;
};

export const validateDecisions = (
  decisions: FirmDecisions,
  current: FirmPeriodResult | undefined,
): DecisionValidation[] => {
  const issues: DecisionValidation[] = [];
  const capacity = Math.max(0, decisions.activeMachines * 1000 * (decisions.laborUtilizationRate || 1));
  if (decisions.productionA + decisions.productionB > capacity) {
    issues.push({ field: 'productionA', message: `Production au-delà de la capacité machine (${Math.round(capacity).toLocaleString('fr-FR')} unités).`, severity: 'error' });
  }
  const availableMaterials = (current?.productionReport.rawMaterials.finalStock || 0) + Math.max(0, decisions.rawMaterialOrder);
  const requiredMaterials = decisions.productionA * 3 + decisions.productionB * 4;
  if (requiredMaterials > availableMaterials * 1.25) {
    issues.push({ field: 'rawMaterialOrder', message: 'Le besoin matière dépasse fortement le stock disponible et les achats planifiés.', severity: 'warning' });
  }
  if (decisions.mediumTermLoan > (current?.cashFlow.borrowingCapacityLT || Number.POSITIVE_INFINITY)) {
    issues.push({ field: 'mediumTermLoan', message: 'Le financement demandé dépasse la capacité bancaire long terme.', severity: 'error' });
  }
  if (decisions.dividendPayoutRate && decisions.dividendPayoutRate > 50) {
    issues.push({ field: 'dividendPayoutRate', message: 'La distribution est plafonnée à 50 % du résultat net.', severity: 'error' });
  }
  if (decisions.clientPaymentTerms !== undefined && ![30, 60, 90].includes(decisions.clientPaymentTerms)) {
    issues.push({ field: 'clientPaymentTerms', message: 'Les délais clients acceptés sont 30, 60 ou 90 jours.', severity: 'error' });
  }
  return issues;
};

export const createPreview = (
  snapshot: PeriodSnapshot,
  decisions: FirmDecisions,
): FirmPeriodResult => {
  const result = simulateNextPeriod(snapshot, decisions).nextSnapshot;
  const firm = result.firmsResults[decisions.firmId] || result.firmsResults['1'];
  if (!firm) throw new Error('Résultat de prévisualisation indisponible.');
  return structuredClone(firm);
};

export const commitPeriod = (
  snapshots: Record<number, PeriodSnapshot>,
  nextSnapshot: PeriodSnapshot,
): Record<number, PeriodSnapshot> => {
  if (snapshots[nextSnapshot.period]) return snapshots;
  return { ...snapshots, [nextSnapshot.period]: nextSnapshot };
};

export const kpisFor = (result: FirmPeriodResult) => ({
  revenue: result.incomeStatement.revenue,
  grossMargin: result.incomeStatement.grossMargin,
  netProfit: result.incomeStatement.netProfit,
  cash: result.cashFlow.closingCash,
  debt: result.balanceSheet.liabilities.mortgageLoan + result.balanceSheet.liabilities.otherLoans + result.balanceSheet.liabilities.bankOverdraft,
  headcount: result.hrReport.workforce.totalEmployees,
});

import { FirmDecisions, FirmPeriodResult, PeriodSnapshot } from '../types/simulation';
import { DecisionValidation, PeriodStatus } from './simulationLifecycle';

export type AdvisorSeverity = 'critical' | 'warning' | 'opportunity' | 'info';
export type AdvisorCategory =
  | 'cash'
  | 'margin'
  | 'inventory'
  | 'capacity'
  | 'people'
  | 'marketing'
  | 'rnd'
  | 'esg'
  | 'workflow';

export interface AdvisorRecommendation {
  id: string;
  category: AdvisorCategory;
  severity: AdvisorSeverity;
  title: string;
  rationale: string;
  expectedImpact: string;
  actionLabel: string;
  targetTab: 'decisions' | 'results' | 'hr' | 'market' | 'board' | 'messaging';
  critical: boolean;
}

export interface AdvisorInput {
  snapshot: PeriodSnapshot;
  previousSnapshot?: PeriodSnapshot;
  pendingDecisions: FirmDecisions;
  periodStatus: PeriodStatus;
  validation?: DecisionValidation[];
  selectedFirmId?: string;
}

const resultFor = (snapshot: PeriodSnapshot, firmId: string): FirmPeriodResult =>
  snapshot.firmsResults[firmId] || snapshot.firmsResults['1'] || Object.values(snapshot.firmsResults)[0];

const add = (
  recommendations: AdvisorRecommendation[],
  recommendation: Omit<AdvisorRecommendation, 'critical'>,
) => recommendations.push({ ...recommendation, critical: recommendation.severity === 'critical' });

export function getManagementRecommendations(input: AdvisorInput): AdvisorRecommendation[] {
  const firmId = input.selectedFirmId || '1';
  const current = resultFor(input.snapshot, firmId);
  const previous = input.previousSnapshot ? resultFor(input.previousSnapshot, firmId) : undefined;
  if (!current) return [];

  const recommendations: AdvisorRecommendation[] = [];
  const { incomeStatement, balanceSheet, cashFlow, productionReport, hrReport, decisions } = current;
  const cash = cashFlow.closingCash - cashFlow.closingOverdraft;
  const monthlyOutflow = Math.max(cashFlow.disbursements.totalDisbursements, 1);
  const runway = cash / monthlyOutflow;
  const grossMarginRate = incomeStatement.revenue > 0 ? incomeStatement.grossMargin / incomeStatement.revenue : 0;
  const totalStock = productionReport.rawMaterials.finalStock
    + productionReport.productA.finalStockUnits
    + productionReport.productB.finalStockUnits;
  const plannedProduction = input.pendingDecisions.productionA + input.pendingDecisions.productionB;

  if (cashFlow.closingOverdraft > 0 || cash < 0 || runway < 1) {
    add(recommendations, {
      id: 'cash-runway',
      category: 'cash',
      severity: 'critical',
      title: 'Sécuriser la trésorerie avant de croître',
      rationale: `La position nette est de ${Math.round(cash).toLocaleString('fr-FR')} € avec ${runway.toFixed(1)} période de couverture.`,
      expectedImpact: 'Réduire le risque de rupture de paiement et préserver la continuité.',
      actionLabel: 'Arbitrer la finance',
      targetTab: 'decisions',
    });
  } else if (runway < 2.5) {
    add(recommendations, {
      id: 'cash-buffer',
      category: 'cash',
      severity: 'warning',
      title: 'Reconstituer un coussin de trésorerie',
      rationale: 'Les décaissements du prochain cycle consomment rapidement les liquidités disponibles.',
      expectedImpact: 'Absorber un choc de demande ou de coûts sans découvert.',
      actionLabel: 'Voir la trésorerie',
      targetTab: 'results',
    });
  }

  if (grossMarginRate < 0.28 || (previous && incomeStatement.grossMargin < previous.incomeStatement.grossMargin * 0.9)) {
    add(recommendations, {
      id: 'margin-pricing',
      category: 'margin',
      severity: 'warning',
      title: 'Revoir le prix et le mix produit',
      rationale: `La marge brute représente ${(grossMarginRate * 100).toFixed(1)} % du chiffre d’affaires.`,
      expectedImpact: 'Récupérer des points de marge sans dépendre uniquement du volume.',
      actionLabel: 'Ajuster les décisions',
      targetTab: 'decisions',
    });
  }

  if (totalStock > Math.max(plannedProduction * 1.5, 1000)) {
    add(recommendations, {
      id: 'inventory-carrying',
      category: 'inventory',
      severity: 'warning',
      title: 'Dégonfler le stock immobilisé',
      rationale: `${Math.round(totalStock).toLocaleString('fr-FR')} unités sont en stock face à un plan de production de ${Math.round(plannedProduction).toLocaleString('fr-FR')}.`,
      expectedImpact: 'Libérer du cash et réduire les coûts de stockage.',
      actionLabel: 'Ajuster production',
      targetTab: 'decisions',
    });
  } else if (productionReport.productA.finalStockUnits < 100 || productionReport.productB.finalStockUnits < 100) {
    add(recommendations, {
      id: 'inventory-stockout',
      category: 'inventory',
      severity: 'critical',
      title: 'Éviter une rupture de stock',
      rationale: 'Un produit finit la période avec moins de 100 unités disponibles.',
      expectedImpact: 'Protéger les ventes et la part de marché du prochain cycle.',
      actionLabel: 'Piloter les stocks',
      targetTab: 'decisions',
    });
  }

  if (input.pendingDecisions.activeMachines > 0 && input.pendingDecisions.preventiveMaintenanceBudget !== undefined
    && input.pendingDecisions.preventiveMaintenanceBudget < input.pendingDecisions.activeMachines * 250) {
    add(recommendations, {
      id: 'capacity-maintenance',
      category: 'capacity',
      severity: 'warning',
      title: 'Financer la maintenance préventive',
      rationale: 'Le budget de maintenance est faible au regard du parc de machines actives.',
      expectedImpact: 'Limiter les arrêts et stabiliser la capacité livrable.',
      actionLabel: 'Ouvrir production',
      targetTab: 'decisions',
    });
  }

  if (hrReport.metrics.turnoverRate > 10 || hrReport.metrics.absenteeismRate > 8 || (hrReport.metrics.strikeRiskRate || 0) > 15) {
    add(recommendations, {
      id: 'people-retention',
      category: 'people',
      severity: 'critical',
      title: 'Traiter le risque humain',
      rationale: `Turnover ${hrReport.metrics.turnoverRate.toFixed(1)} %, absentéisme ${hrReport.metrics.absenteeismRate.toFixed(1)} %.`,
      expectedImpact: 'Préserver la productivité et éviter une désorganisation opérationnelle.',
      actionLabel: 'Agir sur les équipes',
      targetTab: 'hr',
    });
  } else if (input.pendingDecisions.trainingBudget < 1000) {
    add(recommendations, {
      id: 'people-training',
      category: 'people',
      severity: 'opportunity',
      title: 'Renforcer la formation',
      rationale: 'Le budget de formation est limité pour soutenir la productivité future.',
      expectedImpact: 'Améliorer les compétences et réduire les défauts à moyen terme.',
      actionLabel: 'Planifier la formation',
      targetTab: 'hr',
    });
  }

  if (input.pendingDecisions.adSpend_local + input.pendingDecisions.adSpend_export < incomeStatement.revenue * 0.01) {
    add(recommendations, {
      id: 'marketing-brand',
      category: 'marketing',
      severity: 'opportunity',
      title: 'Réinvestir dans la demande qualifiée',
      rationale: 'La pression marketing est inférieure à 1 % du chiffre d’affaires réalisé.',
      expectedImpact: 'Soutenir la notoriété et la conversion sur les marchés prioritaires.',
      actionLabel: 'Voir le marché',
      targetTab: 'market',
    });
  }

  if (input.pendingDecisions.rdBudget < incomeStatement.revenue * 0.02) {
    add(recommendations, {
      id: 'rnd-investment',
      category: 'rnd',
      severity: 'opportunity',
      title: 'Protéger le budget R&D',
      rationale: 'L’effort R&D est inférieur à 2 % du chiffre d’affaires réalisé.',
      expectedImpact: 'Maintenir la différenciation produit et le potentiel de croissance.',
      actionLabel: 'Arbitrer R&D',
      targetTab: 'board',
    });
  }

  if ((balanceSheet.ratios.esgScore || 0) < 60 || (input.pendingDecisions.ecoDesignBudget || 0) === 0) {
    add(recommendations, {
      id: 'esg-risk',
      category: 'esg',
      severity: (balanceSheet.ratios.esgScore || 0) < 45 ? 'warning' : 'info',
      title: 'Mettre la trajectoire ESG sous contrôle',
      rationale: `Le score ESG courant est de ${Math.round(balanceSheet.ratios.esgScore || 0)}/100.`,
      expectedImpact: 'Réduire l’exposition réglementaire et renforcer la préférence marché.',
      actionLabel: 'Ouvrir gouvernance',
      targetTab: 'board',
    });
  }

  if (input.periodStatus !== 'closed' || (input.validation || []).some(issue => issue.severity === 'error')) {
    add(recommendations, {
      id: 'period-workflow',
      category: 'workflow',
      severity: 'info',
      title: 'Finaliser l’arbitrage de la prochaine période',
      rationale: 'Les décisions sont encore modifiables ou comportent des contrôles bloquants.',
      expectedImpact: 'Obtenir une prévision lisible avant de clôturer la période.',
      actionLabel: 'Préparer la période',
      targetTab: 'decisions',
    });
  }

  return recommendations
    .sort((a, b) => {
      const severity = { critical: 0, warning: 1, opportunity: 2, info: 3 };
      return severity[a.severity] - severity[b.severity] || a.id.localeCompare(b.id);
    })
    .slice(0, 8);
}

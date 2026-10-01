/**
 * Types and interfaces for the SimBiz Executive Business Simulation.
 */

export interface FirmDecisions {
  period: number;
  firmId: string;
  // Marketing & Sales
  marketingEffortB: number; // 0 to 1
  priceA_local: number;
  priceB_local: number;
  sellersCount_local: number;
  sellerSalary_local: number;
  quotaPerSeller_local: number;
  commissionPerUnit_local: number;
  travelExpensesPerSeller_local: number;
  adSpend_local: number;

  // Export Market
  priceA_export: number;
  priceB_export: number;
  sellersCount_export: number;
  sellerSalary_export: number;
  quotaPerSeller_export: number;
  commissionPerUnit_export: number;
  travelExpensesPerSeller_export: number;
  adSpend_export: number;

  // Production
  productionA: number;
  productionB: number;
  activeMachines: number;
  laborUtilizationRate: number; // e.g. 1.0 to 1.25 (overtime)

  // Supply Chain
  rawMaterialOrder: number; // units

  // Investments
  machinesPurchased: number;
  machinesSold: number;

  // Human Resources
  trainingBudget: number; // Training and skills budget (€)
  qvtBudget: number; // Quality of work life & safety (€)
  workerBonusRate: number; // % bonus on productivity
  rdBudget: number; // R&D & Product improvement (€)

  // Advanced Strategic Levers & Parameters
  clientPaymentTerms?: number; // 30, 60, or 90 days delay granted to customers
  supplierContractType?: 'spot' | 'contract'; // 'spot' (spot market price) or 'contract' (framework discount)
  preventiveMaintenanceBudget?: number; // Preventive machine maintenance (€)
  automationBudget?: number; // Industry 4.0 / Digitization & Robotization (€)
  ecoDesignBudget?: number; // Green transition, carbon reduction & eco-design (€)
  profitSharingRate?: number; // % profit-sharing with employees (0 to 15%)
  greenLoanRequested?: number; // Low-interest subsidized green loan (€)
  equityRaise?: number; // Capital increase via equity issuance (€)
  dividendPayoutRate?: number; // % of net profit distributed as dividends (0 to 50%)
  marketingChannelA?: 'digital' | 'balanced' | 'b2b_events'; // Channel focus
  marketingChannelB?: 'digital' | 'balanced' | 'b2b_events';
  recruitmentPlanWorkers?: number; // Net hiring/firing of production workers
  recruitmentPlanSales?: number; // Net hiring/firing of sales reps
  chosenCrisisChoiceId?: string; // Strategic decision taken for current period crisis

  // Financing
  shortTermLoan: number;
  mediumTermLoan: number;
  loanRepayment: number;

  // Team Forecasts
  forecastRevenue: number;
  forecastProfit: number;
  forecastReceipts: number;
  forecastDisbursements: number;
  // Extended simulation levers
  productMixA?: number;
  maintenanceIntensity?: number;
  supplierDiversification?: number;
  inventorySafetyStock?: number;
  brandInvestment?: number;
  trainingHoursPerEmployee?: number;
  creditLineRequested?: number;
  innovationPortfolio?: number;
  carbonReductionTarget?: number;
  riskHedgeBudget?: number;
}

export interface IncomeStatement {
  revenue: number; // Ventes totales
  revenueA_local: number;
  revenueB_local: number;
  revenueA_export: number;
  revenueB_export: number;
  cogs: number; // Coût de production des biens vendus
  grossMargin: number; // Marge brute

  // Selling Expenses
  sellerSalaries: number;
  salesCommissions: number;
  travelExpenses: number;
  adSpend: number;
  totalSellingExpenses: number;

  // General & Admin Expenses
  adminSalaries: number;
  storageCosts: number;
  hrAndTrainingCosts: number;
  rdCosts: number;
  otherOverheads: number;
  totalOverheads: number;

  // Results
  ebitda: number;
  depreciation: number;
  ebit: number; // Résultat avant frais financiers et taxes
  financialExpenses: number; // Frais financiers
  financialIncome: number;
  preTaxProfit: number; // Résultat avant impôt
  corporateTax: number; // Impôt sur les sociétés
  netProfit: number; // Résultat net mis en réserve
}

export interface ProductionReport {
  rawMaterials: {
    initialStock: number;
    purchasesRegular: number;
    purchasesUnitCost: number;
    purchasesTotalCost: number;
    purchasesSpot: number;
    purchasesSpotUnitCost: number;
    purchasesSpotTotalCost: number;
    consumption: number;
    finalStock: number;
    unitValue: number;
    totalStockValue: number;
  };
  productA: {
    initialStock: number;
    initialStockUnitCost: number;
    initialStockTotalCost: number;
    produced: number;
    costExcludingMaterials: number;
    costMaterials: number;
    unitProductionCost: number;
    totalProductionCost: number;
    availableForSale: number;
    weightedAverageCost: number;
    salesLocalUnits: number;
    salesExportUnits: number;
    totalSalesUnits: number;
    finalStockUnits: number;
    finalStockTotalValue: number;
  };
  productB: {
    initialStock: number;
    initialStockUnitCost: number;
    initialStockTotalCost: number;
    produced: number;
    costExcludingMaterials: number;
    costMaterials: number;
    unitProductionCost: number;
    totalProductionCost: number;
    availableForSale: number;
    weightedAverageCost: number;
    salesLocalUnits: number;
    salesExportUnits: number;
    totalSalesUnits: number;
    finalStockUnits: number;
    finalStockTotalValue: number;
  };
}

export interface BalanceSheet {
  assets: {
    land: { gross: number; net: number };
    buildings: { gross: number; net: number };
    machines: { gross: number; net: number };
    stockRawMaterials: number;
    stockProductA: number;
    stockProductB: number;
    customerReceivables: number; // Créances clients
    cashAndEquivalents: number; // Disponibilités / Caisse
    totalAssets: number;
  };
  liabilities: {
    shareCapital: number; // Capital social
    retainedEarnings: number; // Réserves
    periodNetProfit: number; // Résultat de la période
    mortgageLoan: number; // Emprunt hypothécaire
    otherLoans: number; // Autres emprunts (moyen/long terme)
    supplierPayables: number; // Dettes fournisseurs
    bankOverdraft: number; // Découvert bancaire (court terme)
    otherDebts: number;
    totalLiabilities: number;
  };
  ratios: {
    bfr: number; // Besoin en Fonds de Roulement
    roa: number; // Return on Assets (%)
    roe: number; // Return on Equity (%)
    solvencyRatio: number; // Capitaux propres / Total Actif
    currentRatio: number; // Liquidité générale
    sharePrice?: number; // Cours de l'action (€)
    enterpriseValue?: number; // Valorisation d'entreprise (€)
    altmanZScore?: number; // Score de santé financière
    esgScore?: number; // Score RSE global (0 à 100)
    breakEvenRevenue?: number; // Seuil de rentabilité (€)
  };
}

export interface CashFlowStatement {
  receipts: {
    salesCollectionT1: number; // Encaissement ventes T-1 & comptant
    shortTermLoans: number;
    longTermLoans: number;
    machineSales: number;
    taxRefunds: number;
    otherReceipts: number;
    totalReceipts: number;
  };
  disbursements: {
    rawMaterialsT1: number; // Achats matières T-1
    loanPrincipalRepayments: number;
    mortgageRepayments: number;
    newMachinesCash: number;
    productionLaborCosts: number; // Main d'oeuvre
    otherProductionExpenses: number;
    sellingExpenses: number; // Frais de vente
    managementAndOverheads: number; // Frais de gestion & RH
    corporateTaxPaid: number;
    otherDisbursements: number;
    totalDisbursements: number;
  };
  openingCash: number;
  closingCash: number;
  openingOverdraft: number;
  closingOverdraft: number;
  borrowingCapacityLT: number;
  borrowingCapacityST: number;
}

export interface HumanResourcesReport {
  workforce: {
    productionWorkers: number;
    salesRepsLocal: number;
    salesRepsExport: number;
    engineersRD: number;
    supportAdmin: number;
    totalEmployees: number;
  };
  metrics: {
    productivityIndex: number; // Baseline 100%
    socialClimateScore: number; // 0 to 100%
    turnoverRate: number; // %
    absenteeismRate: number; // %
    defectRate: number; // % scrap rate in factory
    averageSalary: number;
    trainingHoursPerEmployee: number;
    strikeRiskRate?: number; // % risque de grève
    employeeSatisfaction?: number; // % satisfaction
    overtimeHoursTotal?: number; // Heures supplémentaires
  };
  costs: {
    totalPayroll: number;
    socialContributions: number;
    trainingCost: number;
    qvtCost: number;
    recruitmentCost: number;
  };
  alerts: string[];
}

export interface CompetitorMarketData {
  firmId: string;
  firmName: string;
  salesRevenue: number;
  netProfit: number;
  cash: number;
  marketShareOverall: number; // in %
  marketShareLocalA: number;
  marketShareLocalB: number;
  marketShareExportA: number;
  marketShareExportB: number;
  priceLocalA: number;
  priceLocalB: number;
  priceExportA: number;
  priceExportB: number;
  salesVolumeA: number;
  salesVolumeB: number;
  salesVolumeExportA: number;
  salesVolumeExportB: number;
  adSpend: number;
  sellersCount: number;
  sharePrice?: number;
  esgScore?: number;
}

export interface MarketEnvironment {
  period: number;
  annualInterestRate: number; // e.g. 5.5%
  inflationRate: number; // e.g. 2.1%
  rawMaterialSpotPrice: number; // e.g. 20.0 €/unit
  rawMaterialContractPrice: number; // e.g. 14.0 €/unit
  overallMarketDemandA: number; // total units
  overallMarketDemandB: number;
  overallExportDemandA: number;
  overallExportDemandB: number;
  economicOutlook: 'expansion' | 'stable' | 'slowdown';
  headlineNews: string;
  carbonTaxPerTon?: number; // Taxe carbone (€/t CO2)
  greenDemandBonus?: number; // Prime demande éco-conçue (%)
  specialEventTitle?: string;
  specialEventImpact?: string;
}

export interface FirmPeriodResult {
  period: number;
  firmId: string;
  decisions: FirmDecisions;
  incomeStatement: IncomeStatement;
  productionReport: ProductionReport;
  balanceSheet: BalanceSheet;
  cashFlow: CashFlowStatement;
  hrReport: HumanResourcesReport;
}

export interface PeriodSnapshot {
  period: number;
  marketEnvironment: MarketEnvironment;
  firmsResults: Record<string, FirmPeriodResult>;
  competitorsBenchmark: CompetitorMarketData[];
  marketStocks?: Record<string, MarketStock>;
}

export interface MarketStock {
  firmId: string;
  symbol: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  history: number[];
  driver: string;
}

export interface SystemMessage {
  id: string;
  period: number;
  date: string;
  sender: string;
  role: string;
  subject: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
}

export type IndustrySector =
  | 'hightech_iot'
  | 'aero_defense'
  | 'medtech_robotics'
  | 'cleantech_energy'
  | 'automotive_mobility'
  | 'saas_digital'
  | 'retail_consumer'
  | 'healthcare_services'
  | 'industrial_equipment'
  | 'food_agri'
  | 'media_entertainment'
  | 'finance_insurtech'
  | 'logistics_supply'
  | 'education_learning'
  | 'climate_circular';

export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'expert';

export interface SectorEconomics {
  demandVolatility: number;
  capitalIntensity: number;
  regulationSensitivity: number;
  esgSensitivity: number;
  grossMargin: number;
  demandGrowth: number;
}

export type CeoPersona =
  | 'tech_visionary'
  | 'ops_optimizer'
  | 'people_leader'
  | 'global_conqueror'
  | 'financial_strategist';

export interface CompanySettings {
  companyName: string;
  tickerSymbol: string;
  industrySector: IndustrySector;
  sectorName: string;
  productAName: string;
  productBName: string;
  productADesc: string;
  productBDesc: string;
  sectorEconomics?: SectorEconomics;
  ceoName: string;
  ceoPersona: CeoPersona;
  brandColor: string; // hex e.g. '#6366f1'
  logoIcon: 'rocket' | 'cpu' | 'shield' | 'zap' | 'bot' | 'leaf';
  currency: '€' | '$' | '£' | 'CHF';
  country?: string;
  marketScope?: 'local' | 'europe' | 'global';
  theme?: 'midnight' | 'slate' | 'light';
  strategyPriorities?: string[];
  riskAppetite?: 'prudent' | 'balanced' | 'offensive';
  orgStructure?: 'functional' | 'divisional' | 'matrix' | 'holacratic';
  supplierPreference?: 'local' | 'balanced' | 'global';
  productPortfolio?: Array<{ name: string; category: string; pricePosition: 'value' | 'premium' }>;
  /** Selected before P1. Optional only to keep older exported saves readable. */
  difficulty?: DifficultyLevel;
}

export interface StrategicObjective {
  id: string;
  title: string;
  description: string;
  targetMetric: 'revenue' | 'netProfit' | 'cash' | 'sharePrice' | 'esgScore' | 'marketShare' | 'defectRate';
  targetValue: number;
  rewardCash: number;
  rewardSharePriceBonus: number;
  completed: boolean;
  periodAssigned: number;
}

export interface CrisisChoice {
  id: string;
  label: string;
  description: string;
  impactSummary: string;
  cashImpact: number;
  profitImpact: number;
  esgImpact: number;
  socialImpact: number;
  capacityImpact?: number;
}

export interface CrisisEvent {
  id: string;
  period: number;
  title: string;
  category: 'supply_chain' | 'tech_disruption' | 'macro_geopolitics' | 'csr_governance' | 'ma_opportunity';
  description: string;
  choices: CrisisChoice[];
  chosenOptionId?: string;
  resolved: boolean;
}

export interface TechPatent {
  id: string;
  name: string;
  category: 'product' | 'process' | 'green' | 'ai';
  description: string;
  rdCost: number;
  unlocked: boolean;
  benefit: string;
  effect: {
    demandBoostA?: number;
    demandBoostB?: number;
    exportBoost?: number;
    productionCostReduction?: number;
    defectReduction?: number;
    carbonTaxReduction?: number;
    esgBonus?: number;
  };
}

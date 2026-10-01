import {
  PeriodSnapshot,
  FirmDecisions,
  FirmPeriodResult,
  CompetitorMarketData,
  MarketEnvironment,
  SystemMessage,
  CompanySettings
} from '../types/simulation';
import { evolveMarketStocks } from '../domain/marketEvolution';
import { DIFFICULTY_PROFILES, effectiveDifficulty } from '../domain/difficulty';

// Helper for rounding to 2 decimals
const r2 = (n: number) => Math.round(n * 100) / 100;
const r0 = (n: number) => Math.round(n);
const seededRandom = (seed: number) => {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
};

/**
 * Generate AI Decisions for other 5 competitor firms (F1-F6)
 */
export function generateAIDecisions(
  firmId: string,
  period: number,
  prevResult?: FirmPeriodResult,
  difficulty: CompanySettings['difficulty'] = 'normal',
): FirmDecisions {
  const profile = DIFFICULTY_PROFILES[effectiveDifficulty(difficulty)];
  const firmNumber = Number.parseInt(firmId, 10) || 1;
  const drift = seededRandom((period * 104729 + firmNumber * 7919) >>> 0);
  const reaction = (drift() - 0.5) * 0.04 * profile.competitorSkill;
  const base: FirmDecisions = prevResult?.decisions || {
    period,
    firmId,
    marketingEffortB: 0.50,
    priceA_local: 96.0,
    priceB_local: 175.0,
    sellersCount_local: 5,
    sellerSalary_local: 3400,
    quotaPerSeller_local: 700,
    commissionPerUnit_local: 2.50,
    travelExpensesPerSeller_local: 1800,
    adSpend_local: 12000,
    priceA_export: 94.0,
    priceB_export: 182.0,
    sellersCount_export: 3,
    sellerSalary_export: 3800,
    quotaPerSeller_export: 600,
    commissionPerUnit_export: 2.80,
    travelExpensesPerSeller_export: 2500,
    adSpend_export: 10000,
    productionA: 3600,
    productionB: 950,
    activeMachines: 5,
    laborUtilizationRate: 1.05,
    rawMaterialOrder: 18500,
    machinesPurchased: 0,
    machinesSold: 0,
    trainingBudget: 15000,
    qvtBudget: 9000,
    workerBonusRate: 4,
    rdBudget: 20000,
    clientPaymentTerms: 30,
    supplierContractType: 'contract',
    preventiveMaintenanceBudget: 8000,
    automationBudget: 12000,
    ecoDesignBudget: 9000,
    profitSharingRate: 5,
    greenLoanRequested: 0,
    equityRaise: 0,
    dividendPayoutRate: 20,
    marketingChannelA: 'balanced',
    marketingChannelB: 'b2b_events',
    recruitmentPlanWorkers: 0,
    recruitmentPlanSales: 0,
    shortTermLoan: 0,
    mediumTermLoan: 0,
    loanRepayment: 25000,
    forecastRevenue: 1450000,
    forecastProfit: 95000,
    forecastReceipts: 1420000,
    forecastDisbursements: 1350000,
  };

  const evolve = (decision: FirmDecisions): FirmDecisions => ({
    ...decision,
    period,
    priceA_local: r2(Math.max(70, decision.priceA_local * (1 + reaction))),
    priceB_local: r2(Math.max(130, decision.priceB_local * (1 + reaction))),
    priceA_export: r2(Math.max(70, decision.priceA_export * (1 + reaction))),
    priceB_export: r2(Math.max(130, decision.priceB_export * (1 + reaction))),
    adSpend_local: r0(decision.adSpend_local * profile.competitorAggression),
    adSpend_export: r0(decision.adSpend_export * profile.competitorAggression),
    productionA: r0(decision.productionA * (1 + reaction * 0.7)),
    productionB: r0(decision.productionB * (1 + reaction * 0.7)),
    rawMaterialOrder: r0(decision.rawMaterialOrder * (1 + reaction * 0.7)),
  });

  // Once a firm has played a period, it continues from its own choices.
  // The strategy-specific bias is deliberately different per firm so the
  // benchmark develops distinct trajectories instead of replaying one template.
  if (prevResult) {
    const previous = prevResult.decisions;
    const strategicStep = (value: number, rate: number, min = 0) => r0(Math.max(min, value * (1 + rate)));
    const autonomous = {
      '2': {
        price: -0.012, volume: 0.045, marketing: 0.025,
        productionA: 1.06, productionB: 0.98, training: 0.99,
      },
      '3': {
        price: 0.018, volume: 0.012, marketing: 0.018,
        productionA: 0.97, productionB: 1.065, training: 1.04,
      },
      '4': {
        price: -0.004, volume: 0.028, marketing: 0.012,
        productionA: 1.01, productionB: 1.02, training: 1.015,
      },
      '5': {
        price: 0.009, volume: 0.018, marketing: 0.01,
        productionA: 1.0, productionB: 1.03, training: 1.05,
      },
      '6': {
        price: -0.006, volume: 0.04, marketing: 0.008,
        productionA: 1.075, productionB: 1.015, training: 1.02,
      },
    }[firmId] || {
      price: 0, volume: 0.02, marketing: 0, productionA: 1, productionB: 1, training: 1,
    };
    const noise = reaction * 0.35;
    return evolve({
      ...previous,
      period,
      priceA_local: Math.max(70, previous.priceA_local * (1 + autonomous.price + noise)),
      priceB_local: Math.max(130, previous.priceB_local * (1 + autonomous.price + noise)),
      priceA_export: Math.max(70, previous.priceA_export * (1 + autonomous.price + noise)),
      priceB_export: Math.max(130, previous.priceB_export * (1 + autonomous.price + noise)),
      productionA: previous.productionA * autonomous.productionA,
      productionB: previous.productionB * autonomous.productionB,
      rawMaterialOrder: previous.rawMaterialOrder * (1 + autonomous.volume + noise),
      adSpend_local: strategicStep(previous.adSpend_local, autonomous.marketing),
      adSpend_export: strategicStep(previous.adSpend_export, autonomous.marketing * 0.85),
      trainingBudget: strategicStep(previous.trainingBudget, autonomous.training - 1),
      rdBudget: strategicStep(previous.rdBudget, autonomous.training - 1),
      automationBudget: firmId === '6' ? strategicStep(previous.automationBudget || 0, 0.08) : previous.automationBudget,
      ecoDesignBudget: firmId === '5' ? strategicStep(previous.ecoDesignBudget || 0, 0.1) : previous.ecoDesignBudget,
      sellersCount_local: Math.max(2, Math.round(previous.sellersCount_local + (firmId === '4' ? 1 : 0))),
      sellersCount_export: Math.max(1, Math.round(previous.sellersCount_export + (firmId === '4' ? 1 : 0))),
    });
  }

  switch (firmId) {
    case '1': // User firm template if AI runs it
      return evolve({
        ...base,
        period,
        productionA: 3700,
        productionB: 1000,
        rawMaterialOrder: 19000,
        rdBudget: 22000,
      });
    case '2': // VoltaCore (Low Cost / Volume)
      return evolve({
        ...base,
        period,
        marketingEffortB: 0.25,
        priceA_local: 91.5,
        priceB_local: 162.0,
        priceA_export: 89.5,
        priceB_export: 168.0,
        sellersCount_local: 6,
        sellersCount_export: 3,
        adSpend_local: 14000,
        productionA: 4400,
        productionB: 500,
        rawMaterialOrder: 21000,
        trainingBudget: 8000,
        qvtBudget: 5000,
        preventiveMaintenanceBudget: 6000,
        automationBudget: 18000,
        ecoDesignBudget: 4000,
        profitSharingRate: 2,
        clientPaymentTerms: 60, // Offers 60 days to gain volume
      });
    case '3': // Zenith Avionics (Premium / High margin Produit B)
      return evolve({
        ...base,
        period,
        marketingEffortB: 0.70,
        priceA_local: 102.0,
        priceB_local: 188.0,
        priceA_export: 100.0,
        priceB_export: 195.0,
        sellersCount_local: 5,
        sellersCount_export: 4,
        adSpend_local: 16000,
        adSpend_export: 14000,
        productionA: 2900,
        productionB: 1300,
        rawMaterialOrder: 22500,
        trainingBudget: 22000,
        qvtBudget: 12000,
        rdBudget: 35000,
        preventiveMaintenanceBudget: 12000,
        automationBudget: 15000,
        ecoDesignBudget: 14000,
        profitSharingRate: 8,
        clientPaymentTerms: 30,
      });
    case '4': // Atlas Global Trade (Export Specialist)
      return evolve({
        ...base,
        period,
        marketingEffortB: 0.45,
        priceA_local: 96.0,
        priceB_local: 176.0,
        priceA_export: 92.5,
        priceB_export: 178.0,
        sellersCount_local: 4,
        sellersCount_export: 5,
        adSpend_local: 10000,
        adSpend_export: 18000,
        productionA: 3200,
        productionB: 950,
        rawMaterialOrder: 18500,
        trainingBudget: 14000,
        qvtBudget: 8000,
        rdBudget: 18000,
        clientPaymentTerms: 60,
      });
    case '5': // Helios GreenTech (RSE / Eco-conception)
      return evolve({
        ...base,
        period,
        marketingEffortB: 0.55,
        priceA_local: 98.0,
        priceB_local: 180.0,
        priceA_export: 96.0,
        priceB_export: 185.0,
        sellersCount_local: 5,
        sellersCount_export: 3,
        adSpend_local: 13000,
        adSpend_export: 11000,
        productionA: 3300,
        productionB: 900,
        rawMaterialOrder: 18000,
        trainingBudget: 18000,
        qvtBudget: 15000,
        rdBudget: 25000,
        ecoDesignBudget: 22000,
        profitSharingRate: 10,
        preventiveMaintenanceBudget: 10000,
      });
    case '6': // Titan Precision Robotics (Robotique & Machines)
      return evolve({
        ...base,
        period,
        marketingEffortB: 0.35,
        priceA_local: 94.0,
        priceB_local: 170.0,
        priceA_export: 93.0,
        priceB_export: 174.0,
        sellersCount_local: 5,
        sellersCount_export: 3,
        adSpend_local: 11000,
        productionA: 3900,
        productionB: 800,
        rawMaterialOrder: 20000,
        trainingBudget: 12000,
        qvtBudget: 7000,
        automationBudget: 25000,
        preventiveMaintenanceBudget: 11000,
        profitSharingRate: 4,
      });
    default:
      return evolve({ ...base, period });
  }
}

/**
 * Main simulation turn executor
 */
export function simulateNextPeriod(
  currentSnapshot: PeriodSnapshot,
  userDecisions: FirmDecisions,
  companySettings?: CompanySettings
): { nextSnapshot: PeriodSnapshot; newMessages: SystemMessage[] } {
  const nextPeriod = currentSnapshot.period + 1;
  const difficulty = effectiveDifficulty(companySettings?.difficulty);
  const profile = DIFFICULTY_PROFILES[difficulty];
  const prevEnv = currentSnapshot.marketEnvironment;
  const random = seededRandom(
    ((currentSnapshot.period + 1) * 2654435761 + Number.parseInt(userDecisions.firmId || '1', 10) * 97) >>> 0
  );

  // Macro dynamics: Organic growth + macro fluctuations
  const growthA = 1 + 0.03 + (random() * 0.04 - 0.02) * profile.marketVolatility;
  const growthB = 1 + 0.05 + (random() * 0.05 - 0.02) * profile.marketVolatility;

  const newInterestRate = r2(Math.max(3.2, Math.min(6.5, prevEnv.annualInterestRate + (random() * 0.4 - 0.2))));
  const newInflation = r2(Math.max(1.2, Math.min(4.5, prevEnv.inflationRate + (random() * 0.3 - 0.15))));
  
  // Dynamic macro events pool
  const events = [
    { title: 'Plan d\'Investissement Industriel Européen', impact: 'Forte accélération de la demande en équipements électroniques de précision (+8% à l\'export).', bonusA: 1.05, bonusB: 1.09 },
    { title: 'Tensions sur la Supply Chain & Fret Maritime', impact: 'Le prix spot des matières premières grimpe temporairement de +15%. Les contrats cadres protègent les marges.', bonusA: 0.98, bonusB: 1.0 },
    { title: 'Durcissement des Critères RSE & Taxe Carbone', impact: 'Les entreprises avec un score ESG élevé obtiennent un bonus commercial de +10% auprès des donneurs d\'ordres.', bonusA: 1.03, bonusB: 1.06 },
    { title: 'Grand Salon International de l\'Aéronautique & Tech', impact: 'Visibilité record pour les calculateurs embarqués Apex. Explosion des opportunités B2B.', bonusA: 1.02, bonusB: 1.12 },
    { title: 'Stabilité Macro-économique & Confiance Consommateurs', impact: 'Consommation soutenue sur le marché national, conditions de crédit favorables.', bonusA: 1.04, bonusB: 1.04 },
  ];
  const currentEvent = events[(nextPeriod - 1 + (difficulty === 'expert' ? 1 : 0)) % events.length];

  const eventScale = (value: number) => 1 + (value - 1) * profile.eventImpact;
  const overallMarketDemandA = r0(prevEnv.overallMarketDemandA * growthA * eventScale(currentEvent.bonusA));
  const overallMarketDemandB = r0(prevEnv.overallMarketDemandB * growthB * eventScale(currentEvent.bonusB));
  const overallExportDemandA = r0(prevEnv.overallExportDemandA * growthA * eventScale(currentEvent.bonusA));
  const overallExportDemandB = r0(prevEnv.overallExportDemandB * growthB * eventScale(currentEvent.bonusB));

  const rawSpot = r2(18.50 * (1 + (random() * 0.12 - 0.04) * profile.marketVolatility));
  const rawContract = 14.80;

  const newEnv: MarketEnvironment = {
    period: nextPeriod,
    annualInterestRate: newInterestRate,
    inflationRate: newInflation,
    rawMaterialSpotPrice: rawSpot,
    rawMaterialContractPrice: rawContract,
    overallMarketDemandA,
    overallMarketDemandB,
    overallExportDemandA,
    overallExportDemandB,
    economicOutlook: 'stable',
    headlineNews: `Période ${nextPeriod} : ${currentEvent.title}. Demande totale : ${overallMarketDemandA.toLocaleString()} U (Alpha) & ${overallMarketDemandB.toLocaleString()} U (Apex).`,
    carbonTaxPerTon: 45 + nextPeriod * 5,
    greenDemandBonus: 8 + nextPeriod * 2,
    specialEventTitle: currentEvent.title,
    specialEventImpact: currentEvent.impact,
  };

  // Collect decisions for all 6 firms
  const allDecisions: Record<string, FirmDecisions> = {};
  for (let f = 1; f <= 6; f++) {
    const fid = f.toString();
    if (fid === userDecisions.firmId) {
      allDecisions[fid] = { ...userDecisions, period: nextPeriod };
    } else {
      const prevRes = currentSnapshot.firmsResults[fid];
      allDecisions[fid] = generateAIDecisions(fid, nextPeriod, prevRes, difficulty);
    }
  }

  // Calculate market attractiveness scores
  const scores: Record<string, { localA: number; localB: number; exportA: number; exportB: number }> = {};
  let totalLocalA = 0;
  let totalLocalB = 0;
  let totalExportA = 0;
  let totalExportB = 0;

  for (let f = 1; f <= 6; f++) {
    const fid = f.toString();
    const dec = allDecisions[fid];

    // Client terms elasticity: 30j=1.0, 60j=1.05, 90j=1.09
    const termsBonus = (dec.clientPaymentTerms === 90) ? 1.09 : (dec.clientPaymentTerms === 60) ? 1.05 : 1.0;
    // Eco-design boost
    const ecoBonus = 1 + ((dec.ecoDesignBudget || 0) / 100000);
    const brandBonus = 1 + ((dec.brandInvestment || 0) / 120000);

    // Product Alpha: Price sensitivity
    const pLA = Math.max(70, dec.priceA_local);
    const scoreLA = Math.pow(100 / pLA, 2.2) * (1 + (dec.sellersCount_local * 0.18)) * (1 + Math.log10(Math.max(1000, dec.adSpend_local) / 1000) * 0.35) * termsBonus * brandBonus;

    // Product Apex: Brand, marketing effort & eco-design
    const pLB = Math.max(130, dec.priceB_local);
    const effortB = Math.max(0.1, dec.marketingEffortB);
    const scoreLB = Math.pow(180 / pLB, 1.8) * (effortB * 1.5) * (1 + (dec.sellersCount_local * 0.22)) * (1 + Math.log10(Math.max(1000, dec.adSpend_local) / 1000) * 0.45) * termsBonus * ecoBonus * brandBonus;

    // Export A
    const pEA = Math.max(70, dec.priceA_export);
    const scoreEA = (dec.sellersCount_export > 0 ? Math.pow(98 / pEA, 2.3) * dec.sellersCount_export * (1 + Math.log10(Math.max(1000, dec.adSpend_export) / 1000) * 0.4) * termsBonus : 0);

    // Export B
    const pEB = Math.max(130, dec.priceB_export);
    const scoreEB = (dec.sellersCount_export > 0 ? Math.pow(185 / pEB, 1.9) * (effortB * 1.5) * dec.sellersCount_export * (1 + Math.log10(Math.max(1000, dec.adSpend_export) / 1000) * 0.5) * termsBonus * ecoBonus : 0);

    scores[fid] = { localA: scoreLA, localB: scoreLB, exportA: scoreEA, exportB: scoreEB };
    totalLocalA += scoreLA;
    totalLocalB += scoreLB;
    totalExportA += scoreEA;
    totalExportB += scoreEB;
  }

  const nextFirmsResults: Record<string, FirmPeriodResult> = {};
  const competitorBench: CompetitorMarketData[] = [];

  for (let f = 1; f <= 6; f++) {
    const fid = f.toString();
    const dec = allDecisions[fid];
    const prevRes = currentSnapshot.firmsResults[fid] || currentSnapshot.firmsResults['1'];

    // Allocated demand for this firm
    const demLocalA = totalLocalA > 0 ? r0((scores[fid].localA / totalLocalA) * overallMarketDemandA) : 0;
    const demLocalB = totalLocalB > 0 ? r0((scores[fid].localB / totalLocalB) * overallMarketDemandB) : 0;
    const demExportA = totalExportA > 0 ? r0((scores[fid].exportA / totalExportA) * overallExportDemandA) : 0;
    const demExportB = totalExportB > 0 ? r0((scores[fid].exportB / totalExportB) * overallExportDemandB) : 0;

    // HR & Workforce calculation
    const prevHR = prevRes.hrReport;
    const netWorkerChange = dec.recruitmentPlanWorkers || 0;
    const netSalesChange = dec.recruitmentPlanSales || 0;

    const numWorkers = Math.max(12, prevHR.workforce.productionWorkers + netWorkerChange);
    const numSalesLocal = Math.max(2, dec.sellersCount_local);
    const numSalesExport = Math.max(0, dec.sellersCount_export);
    const numRD = prevHR.workforce.engineersRD;
    const numAdmin = prevHR.workforce.supportAdmin;
    const totalEmployees = numWorkers + numSalesLocal + numSalesExport + numRD + numAdmin;

    // HR Metrics driven by training, QVT, profit-sharing and overtime
    const trainingBudget = dec.trainingBudget || 10000;
    const trainingHours = dec.trainingHoursPerEmployee || trainingBudget / 180;
    const qvtBudget = dec.qvtBudget || 6000;
    const profitSharing = dec.profitSharingRate || 4;
    const overtimeRate = dec.laborUtilizationRate || 1.0;

    // Automation program impact
    const automation = dec.automationBudget || 0;
    const maintenance = dec.preventiveMaintenanceBudget || 0;

    // Productivity Index
    let productivity = 100 + (trainingBudget / 2000) + (trainingHours / 4) + (qvtBudget / 3000) + (profitSharing * 0.8) + (automation / 4000);
    if (overtimeRate > 1.15) {
      productivity -= (overtimeRate - 1.15) * 20; // fatigue penalty
    }
    productivity = r2(Math.max(85, Math.min(135, productivity)));

    // Social climate score (0 to 100%)
    let socialScore = 75 + (qvtBudget / 1000) + (profitSharing * 1.5) + (trainingBudget / 3000) - (netWorkerChange < 0 ? Math.abs(netWorkerChange) * 4 : 0);
    if (overtimeRate > 1.20) socialScore -= 10;
    socialScore = r0(Math.max(25, Math.min(98, socialScore)));

    const strikeRisk = socialScore < 50 ? r0((50 - socialScore) * 1.8) : 2;
    const absenteeism = r2(Math.max(1.8, 8.5 - (socialScore * 0.06)));
    const turnover = r2(Math.max(2.0, 10.0 - (socialScore * 0.08)));
    const defectRate = r2(Math.max(1.2, 5.0 - (trainingBudget / 6000) - (trainingHours / 35) - (automation / 8000)));

    const hrAlerts: string[] = [];
    if (socialScore >= 80) hrAlerts.push('✅ Excellent climat social : équipes soudées, absentéisme au plus bas.');
    if (socialScore < 50) hrAlerts.push('⚠️ Tensions sociales vives : préavis de débrayage possible ! Rehaussez la QVT ou l\'intéressement.');
    if (overtimeRate > 1.18) hrAlerts.push('⚠️ Fort recours aux heures supplémentaires : risque de fatigue et de rebuts.');
    if (automation > 10000) hrAlerts.push('🚀 Le programme Industrie 4.0 a réduit le taux de rebut de l\'usine.');

    // Production & Supply Chain
    const prevRM = prevRes.productionReport.rawMaterials;
    const isContract = dec.supplierContractType !== 'spot';
    const unitPriceRM = isContract ? newEnv.rawMaterialContractPrice : newEnv.rawMaterialSpotPrice;

    const orderedRM = Math.max(0, dec.rawMaterialOrder);
    const safetyStock = Math.max(0, dec.inventorySafetyStock || 0);
    const supplierDiversification = Math.max(0, Math.min(1, dec.supplierDiversification ?? 0.5));
    const purchasedCostRM = r0(orderedRM * unitPriceRM);
    const availableRM = prevRM.finalStock + orderedRM + safetyStock;

    // Machine maintenance yield
    const machineYield = maintenance >= 8000 ? 1.04 : maintenance >= 4000 ? 1.00 : 0.94;
    const nominalMachineHours = dec.activeMachines * 1000 * machineYield;

    // Consumption of Raw Material per unit: Alpha uses 3 units RM, Apex uses 4 units RM
    const neededRM = (dec.productionA * 3) + (dec.productionB * 4);
    let actualProdA = dec.productionA;
    let actualProdB = dec.productionB;

    if (neededRM > availableRM) {
      const ratio = availableRM / neededRM;
      actualProdA = r0(actualProdA * ratio);
      actualProdB = r0(actualProdB * ratio);
      hrAlerts.push('⚠️ Rupture de matières premières : la production a dû être bridée par rapport aux prévisions !');
    }

    const consumedRM = (actualProdA * 3) + (actualProdB * 4);
    const finalStockRM = Math.max(0, availableRM - consumedRM);

    const averageRMCost = (prevRM.finalStock * prevRM.unitValue + purchasedCostRM) / (availableRM > 0 ? availableRM : 1);
    const consumedRMCost = r0(consumedRM * averageRMCost);

    // Direct Labor Cost
    const baseHourlyCost = 22; // € / h
    const workerHoursQuarter = numWorkers * 400 * (productivity / 100);
    const directLaborCost = r0(workerHoursQuarter * baseHourlyCost * overtimeRate);

    // Factory indirect costs & maintenance
    const factoryOverhead = 45000 + maintenance + automation + Math.round((dec.riskHedgeBudget || 0) * (1 - supplierDiversification) * 0.15);

    // Production cost split
    const totalProdUnits = actualProdA + actualProdB;
    const shareA = totalProdUnits > 0 ? actualProdA / totalProdUnits : 0.5;
    const shareB = 1 - shareA;

    const costLaborExcludingMP_A = r0((directLaborCost + factoryOverhead) * shareA);
    const costLaborExcludingMP_B = r0((directLaborCost + factoryOverhead) * shareB);

    const costMP_A = r0(actualProdA * 3 * averageRMCost);
    const costMP_B = r0(actualProdB * 4 * averageRMCost);

    const totalCostProdA = costLaborExcludingMP_A + costMP_A;
    const totalCostProdB = costLaborExcludingMP_B + costMP_B;

    const unitCostProdA = actualProdA > 0 ? r2(totalCostProdA / actualProdA) : 55;
    const unitCostProdB = actualProdB > 0 ? r2(totalCostProdB / actualProdB) : 110;

    // Finished Goods Inventory & Sales Available
    const prevProdA = prevRes.productionReport.productA;
    const prevProdB = prevRes.productionReport.productB;

    const availA = prevProdA.finalStockUnits + actualProdA;
    const availB = prevProdB.finalStockUnits + actualProdB;

    // Quotas cap
    const maxLocalCapacity = dec.sellersCount_local * dec.quotaPerSeller_local;
    const maxExportCapacity = dec.sellersCount_export * dec.quotaPerSeller_export;

    let salesLocalA = Math.min(availA, demLocalA);
    let salesExportA = Math.min(availA - salesLocalA, demExportA);
    salesLocalA = Math.min(salesLocalA, maxLocalCapacity);
    salesExportA = Math.min(salesExportA, maxExportCapacity);

    let salesLocalB = Math.min(availB, demLocalB);
    let salesExportB = Math.min(availB - salesLocalB, demExportB);

    const finalStockUnitsA = Math.max(0, availA - (salesLocalA + salesExportA));
    const finalStockUnitsB = Math.max(0, availB - (salesLocalB + salesExportB));

    // Weighted average cost (PUMP)
    const pumpA = availA > 0 ? r2((prevProdA.finalStockTotalValue + totalCostProdA) / availA) : unitCostProdA;
    const pumpB = availB > 0 ? r2((prevProdB.finalStockTotalValue + totalCostProdB) / availB) : unitCostProdB;

    const finalValA = r0(finalStockUnitsA * pumpA);
    const finalValB = r0(finalStockUnitsB * pumpB);

    // Revenue
    const revLA = r0(salesLocalA * dec.priceA_local);
    const revLB = r0(salesLocalB * dec.priceB_local);
    const revEA = r0(salesExportA * dec.priceA_export);
    const revEB = r0(salesExportB * dec.priceB_export);
    const totalRevenue = revLA + revLB + revEA + revEB;

    // COGS
    const cogsA = r0((salesLocalA + salesExportA) * pumpA);
    const cogsB = r0((salesLocalB + salesExportB) * pumpB);
    const totalCOGS = cogsA + cogsB;
    const grossMargin = totalRevenue - totalCOGS;

    // Selling Expenses
    const sellerSalaries = (dec.sellersCount_local * dec.sellerSalary_local) + (dec.sellersCount_export * dec.sellerSalary_export);
    const commissions = r0((salesLocalA + salesLocalB) * dec.commissionPerUnit_local + (salesExportA + salesExportB) * dec.commissionPerUnit_export);
    const travel = (dec.sellersCount_local * dec.travelExpensesPerSeller_local) + (dec.sellersCount_export * dec.travelExpensesPerSeller_export);
    const adTotal = dec.adSpend_local + dec.adSpend_export;
    const totalSelling = sellerSalaries + commissions + travel + adTotal;

    // Overheads, HR, R&D & Carbon tax
    const adminSalaries = numAdmin * 4000;
    const storageCosts = r0((finalStockUnitsA + finalStockUnitsB) * 2.0 + finalStockRM * 0.4);
    const hrCosts = trainingBudget + qvtBudget + (profitSharing * 1000);
    const rdCosts = dec.rdBudget || 15000;
    const carbonTax = Math.max(0, r0((totalRevenue / 10000) * (newEnv.carbonTaxPerTon || 45) * 0.2 - ((dec.ecoDesignBudget || 0) * 0.5)));
    const otherOverheads = 25000 + carbonTax;
    const totalOverheads = adminSalaries + storageCosts + hrCosts + rdCosts + otherOverheads;

    // Depreciation
    const depreciation = 35000; // Fixed quarterly machine & building amortisation

    // Financial charges & income
    const prevBS = prevRes.balanceSheet;
    const existingLoans = prevBS.liabilities.mortgageLoan + prevBS.liabilities.otherLoans;
    const greenLoan = dec.greenLoanRequested || 0;
    const newDebt = dec.mediumTermLoan + dec.shortTermLoan + greenLoan;
    const totalDebt = Math.max(0, existingLoans + newDebt - dec.loanRepayment);
    const financialExpenses = r0((totalDebt * (newInterestRate / 100) / 4) + (greenLoan * 0.032 / 4));
    const financialIncome = prevRes.balanceSheet.assets.cashAndEquivalents > 300000 ? r0(prevRes.balanceSheet.assets.cashAndEquivalents * 0.025 / 4) : 0;

    // Earnings
    const ebitda = grossMargin - totalSelling - totalOverheads;
    const ebit = ebitda - depreciation;
    const preTaxProfit = ebit - financialExpenses + financialIncome;
    const corporateTax = preTaxProfit > 0 ? r0(preTaxProfit * 0.25) : 0;
    const netProfit = preTaxProfit - corporateTax;

    // Dividends distribution
    const dividendPayoutRate = dec.dividendPayoutRate || 0;
    const dividendsPaid = netProfit > 0 ? r0(netProfit * (dividendPayoutRate / 100)) : 0;

    // Cash flow & Receivables
    const clientTerms = dec.clientPaymentTerms || 30;
    // Client collection rate during the quarter: 30j -> 82%, 60j -> 65%, 90j -> 45%
    const collectionRate = clientTerms === 90 ? 0.48 : clientTerms === 60 ? 0.68 : 0.82;
    const prevReceivables = prevBS.assets.customerReceivables;
    const cashSalesCollected = r0(totalRevenue * collectionRate + prevReceivables * 0.75);

    const equityRaise = dec.equityRaise || 0;
    const totalReceipts = cashSalesCollected + dec.mediumTermLoan + dec.shortTermLoan + greenLoan + equityRaise;

    // Disbursements
    const matPaymentT1 = prevBS.liabilities.supplierPayables;
    const loanPrincipalPayment = dec.loanRepayment > 0 ? dec.loanRepayment : 25000;
    const mortgagePayment = 12000;
    const taxPayment = prevRes.incomeStatement.corporateTax;
    const machinePurchaseCost = (dec.machinesPurchased || 0) * 150000;
    const hiringCost = (netWorkerChange > 0 ? netWorkerChange * 3000 : 0) + (netSalesChange > 0 ? netSalesChange * 5000 : 0);

    const totalDisbursements = matPaymentT1 + loanPrincipalPayment + mortgagePayment + directLaborCost + factoryOverhead + totalSelling + totalOverheads + taxPayment + machinePurchaseCost + dividendsPaid + hiringCost;

    let closingCash = prevRes.balanceSheet.assets.cashAndEquivalents + totalReceipts - totalDisbursements;
    let closingOverdraft = 0;
    if (closingCash < 0) {
      closingOverdraft = Math.abs(closingCash);
      closingCash = 0;
    }

    // Balance Sheet
    const netBuildings = Math.max(300000, prevBS.assets.buildings.net - 6000);
    const netMachines = Math.max(200000, prevBS.assets.machines.net - 25000 + machinePurchaseCost);
    const stockMPVal = r0(finalStockRM * averageRMCost);
    const stockAVal = finalValA;
    const stockBVal = finalValB;
    const newReceivables = r0(totalRevenue * (1 - collectionRate) + prevReceivables * 0.25);

    const totalAssets = prevBS.assets.land.net + netBuildings + netMachines + stockMPVal + stockAVal + stockBVal + newReceivables + closingCash;

    const shareCapital = prevBS.liabilities.shareCapital + equityRaise;
    const mortgageLoan = Math.max(0, prevBS.liabilities.mortgageLoan - mortgagePayment);
    const otherLoans = Math.max(0, prevBS.liabilities.otherLoans + dec.mediumTermLoan + greenLoan - loanPrincipalPayment);
    const supplierPayables = r0(purchasedCostRM * 0.65); // 65% deferred supplier payables

    // Retained earnings & balancing
    const liabilitiesSubtotal = shareCapital + (netProfit - dividendsPaid) + mortgageLoan + otherLoans + supplierPayables + closingOverdraft;
    const retainedEarnings = totalAssets - liabilitiesSubtotal;

    // Valuation Ratios & ESG
    const bfr = (stockMPVal + stockAVal + stockBVal + newReceivables) - supplierPayables;
    const roa = r2((netProfit / totalAssets) * 100);
    const equity = shareCapital + retainedEarnings + netProfit;
    const roe = r2((netProfit / (equity > 0 ? equity : 1)) * 100);
    const solvency = r2((equity / totalAssets) * 100);
    const currentRatio = r2((newReceivables + stockAVal + stockBVal + stockMPVal + closingCash) / ((supplierPayables + closingOverdraft) || 1));

    // Share Price & Enterprise Value
    const baseShare = prevBS.ratios.sharePrice || 50;
    const profitImpact = (netProfit / 10000) * 1.2;
    const dividendImpact = (dividendPayoutRate / 10) * 0.8;
    const sharePrice = r2(Math.max(15, baseShare + profitImpact + dividendImpact));
    const enterpriseValue = Math.max(0, r0(ebitda * 6.5 + closingCash - (mortgageLoan + otherLoans + closingOverdraft)));

    // ESG score
    const esgScore = r0(Math.min(96, Math.max(40, 55 + ((dec.ecoDesignBudget || 0) / 750) + (qvtBudget / 1200) + (profitSharing * 1.2))));

    // Altman Z-Score
    const workingCapital = (totalAssets - (prevBS.assets.land.net + netBuildings + netMachines)) - (supplierPayables + closingOverdraft);
    const altmanZ = r2(
      1.2 * (workingCapital / totalAssets) +
      1.4 * (retainedEarnings / totalAssets) +
      3.3 * (ebit / totalAssets) +
      0.6 * (equity / (mortgageLoan + otherLoans + supplierPayables + 1)) +
      1.0 * (totalRevenue / totalAssets)
    );

    // Break-even revenue
    const fixedCosts = totalSelling + totalOverheads + depreciation + financialExpenses;
    const marginRate = grossMargin / (totalRevenue > 0 ? totalRevenue : 1);
    const breakEvenRevenue = marginRate > 0 ? r0(fixedCosts / marginRate) : 0;

    const result: FirmPeriodResult = {
      period: nextPeriod,
      firmId: fid,
      decisions: dec,
      incomeStatement: {
        revenue: totalRevenue,
        revenueA_local: revLA,
        revenueB_local: revLB,
        revenueA_export: revEA,
        revenueB_export: revEB,
        cogs: totalCOGS,
        grossMargin,
        sellerSalaries,
        salesCommissions: commissions,
        travelExpenses: travel,
        adSpend: adTotal,
        totalSellingExpenses: totalSelling,
        adminSalaries,
        storageCosts,
        hrAndTrainingCosts: hrCosts,
        rdCosts,
        otherOverheads,
        totalOverheads,
        ebitda,
        depreciation,
        ebit,
        financialExpenses,
        financialIncome,
        preTaxProfit,
        corporateTax,
        netProfit,
      },
      productionReport: {
        rawMaterials: {
          initialStock: prevRM.finalStock,
          purchasesRegular: isContract ? orderedRM : 0,
          purchasesUnitCost: isContract ? unitPriceRM : 0,
          purchasesTotalCost: isContract ? purchasedCostRM : 0,
          purchasesSpot: !isContract ? orderedRM : 0,
          purchasesSpotUnitCost: !isContract ? unitPriceRM : 0,
          purchasesSpotTotalCost: !isContract ? purchasedCostRM : 0,
          consumption: consumedRM,
          finalStock: finalStockRM,
          unitValue: r2(averageRMCost),
          totalStockValue: stockMPVal,
        },
        productA: {
          initialStock: prevProdA.finalStockUnits,
          initialStockUnitCost: prevProdA.weightedAverageCost,
          initialStockTotalCost: prevProdA.finalStockTotalValue,
          produced: actualProdA,
          costExcludingMaterials: costLaborExcludingMP_A,
          costMaterials: costMP_A,
          unitProductionCost: unitCostProdA,
          totalProductionCost: totalCostProdA,
          availableForSale: availA,
          weightedAverageCost: pumpA,
          salesLocalUnits: salesLocalA,
          salesExportUnits: salesExportA,
          totalSalesUnits: salesLocalA + salesExportA,
          finalStockUnits: finalStockUnitsA,
          finalStockTotalValue: finalValA,
        },
        productB: {
          initialStock: prevProdB.finalStockUnits,
          initialStockUnitCost: prevProdB.weightedAverageCost,
          initialStockTotalCost: prevProdB.finalStockTotalValue,
          produced: actualProdB,
          costExcludingMaterials: costLaborExcludingMP_B,
          costMaterials: costMP_B,
          unitProductionCost: unitCostProdB,
          totalProductionCost: totalCostProdB,
          availableForSale: availB,
          weightedAverageCost: pumpB,
          salesLocalUnits: salesLocalB,
          salesExportUnits: salesExportB,
          totalSalesUnits: salesLocalB + salesExportB,
          finalStockUnits: finalStockUnitsB,
          finalStockTotalValue: finalValB,
        },
      },
      balanceSheet: {
        assets: {
          land: prevBS.assets.land,
          buildings: { gross: prevBS.assets.buildings.gross, net: netBuildings },
          machines: { gross: prevBS.assets.machines.gross + machinePurchaseCost, net: netMachines },
          stockRawMaterials: stockMPVal,
          stockProductA: stockAVal,
          stockProductB: stockBVal,
          customerReceivables: newReceivables,
          cashAndEquivalents: closingCash,
          totalAssets,
        },
        liabilities: {
          shareCapital,
          retainedEarnings,
          periodNetProfit: netProfit,
          mortgageLoan,
          otherLoans,
          supplierPayables,
          bankOverdraft: closingOverdraft,
          otherDebts: prevBS.liabilities.otherDebts,
          totalLiabilities: totalAssets,
        },
        ratios: {
          bfr,
          roa,
          roe,
          solvencyRatio: solvency,
          currentRatio,
          sharePrice,
          enterpriseValue,
          altmanZScore: altmanZ,
          esgScore,
          breakEvenRevenue,
        },
      },
      cashFlow: {
        receipts: {
          salesCollectionT1: cashSalesCollected,
          shortTermLoans: dec.shortTermLoan,
          longTermLoans: dec.mediumTermLoan + greenLoan,
          machineSales: 0,
          taxRefunds: 0,
          otherReceipts: equityRaise,
          totalReceipts,
        },
        disbursements: {
          rawMaterialsT1: matPaymentT1,
          loanPrincipalRepayments: loanPrincipalPayment,
          mortgageRepayments: mortgagePayment,
          newMachinesCash: machinePurchaseCost,
          productionLaborCosts: directLaborCost,
          otherProductionExpenses: factoryOverhead,
          sellingExpenses: totalSelling,
          managementAndOverheads: totalOverheads,
          corporateTaxPaid: taxPayment,
          otherDisbursements: dividendsPaid + hiringCost,
          totalDisbursements,
        },
        openingCash: prevRes.balanceSheet.assets.cashAndEquivalents,
        closingCash,
        openingOverdraft: prevBS.liabilities.bankOverdraft,
        closingOverdraft,
        borrowingCapacityLT: Math.max(100000, r0(equity * 0.8 - (mortgageLoan + otherLoans))),
        borrowingCapacityST: Math.max(50000, r0(totalRevenue * 0.25)),
      },
      hrReport: {
        workforce: {
          productionWorkers: numWorkers,
          salesRepsLocal: numSalesLocal,
          salesRepsExport: numSalesExport,
          engineersRD: numRD,
          supportAdmin: numAdmin,
          totalEmployees,
        },
        metrics: {
          productivityIndex: productivity,
          socialClimateScore: socialScore,
          turnoverRate: turnover,
          absenteeismRate: absenteeism,
          defectRate,
          averageSalary: r0(directLaborCost / (numWorkers > 0 ? numWorkers : 1) / 3),
          trainingHoursPerEmployee: r0(trainingBudget / (totalEmployees * 20)),
          strikeRiskRate: strikeRisk,
          employeeSatisfaction: socialScore,
          overtimeHoursTotal: r0((overtimeRate - 1.0) * numWorkers * 140),
        },
        costs: {
          totalPayroll: directLaborCost + sellerSalaries + adminSalaries,
          socialContributions: r0((directLaborCost + sellerSalaries + adminSalaries) * 0.42),
          trainingCost: trainingBudget,
          qvtCost: qvtBudget,
          recruitmentCost: hiringCost,
        },
        alerts: hrAlerts,
      },
    };

    nextFirmsResults[fid] = result;

    // Benchmark item
    competitorBench.push({
      firmId: fid,
      firmName: fid === '1'
        ? (companySettings?.companyName ? `${companySettings.companyName} (Vous)` : 'AeroPulse Tech (Vous)')
        : fid === '2' ? 'VoltaCore Systems'
        : fid === '3' ? 'Zenith Avionics'
        : fid === '4' ? 'Atlas Global'
        : fid === '5' ? 'Helios GreenTech'
        : 'Titan Robotics',
      salesRevenue: totalRevenue,
      netProfit,
      cash: closingCash,
      marketShareOverall: 0, // will compute after
      marketShareLocalA: 0,
      marketShareLocalB: 0,
      marketShareExportA: 0,
      marketShareExportB: 0,
      priceLocalA: dec.priceA_local,
      priceLocalB: dec.priceB_local,
      priceExportA: dec.priceA_export,
      priceExportB: dec.priceB_export,
      salesVolumeA: salesLocalA,
      salesVolumeB: salesLocalB,
      salesVolumeExportA: salesExportA,
      salesVolumeExportB: salesExportB,
      adSpend: adTotal,
      sellersCount: numSalesLocal + numSalesExport,
      sharePrice,
      esgScore,
    });
  }

  // Calculate actual market shares
  const totalSalesAll = competitorBench.reduce((acc, c) => acc + c.salesRevenue, 0);
  competitorBench.forEach(b => {
    b.marketShareOverall = totalSalesAll > 0 ? r2((b.salesRevenue / totalSalesAll) * 100) : 0;
  });

  const marketStocks = evolveMarketStocks(nextPeriod, newEnv, competitorBench, nextFirmsResults, currentSnapshot.marketStocks, companySettings);
  competitorBench.forEach(b => {
    if (marketStocks[b.firmId]) {
      b.sharePrice = marketStocks[b.firmId].price;
      const firmRes = nextFirmsResults[b.firmId];
      if (firmRes) {
        firmRes.balanceSheet.ratios.sharePrice = marketStocks[b.firmId].price;
      }
    }
  });

  const nextSnapshot: PeriodSnapshot = {
    period: nextPeriod,
    marketEnvironment: newEnv,
    firmsResults: nextFirmsResults,
    competitorsBenchmark: competitorBench,
    marketStocks,
  };

  // Generate dynamic system messages for the user (F1)
  const userRes = nextFirmsResults[userDecisions.firmId] || nextFirmsResults['1'];
  const newMessages: SystemMessage[] = [];

  // Board of directors message
  if (userRes.incomeStatement.netProfit >= 80000) {
    newMessages.push({
      id: `msg-p${nextPeriod}-board`,
      period: nextPeriod,
      date: `Période ${nextPeriod} - Clôture trimestrielle`,
      sender: 'Conseil d\'Administration',
      role: 'Actionnaires & Présidence',
      subject: `🎉 Félicitations du Conseil : Bénéfice net remarquable de ${userRes.incomeStatement.netProfit.toLocaleString()} € !`,
      content: `Le Conseil salue l'excellente trajectoire de la Firme. Le chiffre d'affaires s'élève à ${userRes.incomeStatement.revenue.toLocaleString()} € et l'action progresse à ${userRes.balanceSheet.ratios.sharePrice} €. Les actionnaires apprécient la politique équilibrée de distribution et de réinvestissement.`,
      priority: 'high',
      read: false,
    });
  } else if (userRes.incomeStatement.netProfit < 0) {
    newMessages.push({
      id: `msg-p${nextPeriod}-board`,
      period: nextPeriod,
      date: `Période ${nextPeriod} - Clôture trimestrielle`,
      sender: 'Conseil d\'Administration',
      role: 'Actionnaires & Présidence',
      subject: `⚠️ Alerte du Conseil : Perte nette de ${Math.abs(userRes.incomeStatement.netProfit).toLocaleString()} €`,
      content: `Le Conseil s'alarme de la dégradation de la rentabilité. Vous devez impérativement surveiller vos coûts de structure, ajuster vos prix de vente et optimiser l'utilisation de vos machines pour restaurer la marge brute.`,
      priority: 'urgent',
      read: false,
    });
  } else {
    newMessages.push({
      id: `msg-p${nextPeriod}-board`,
      period: nextPeriod,
      date: `Période ${nextPeriod} - Clôture trimestrielle`,
      sender: 'Conseil d\'Administration',
      role: 'Actionnaires & Présidence',
      subject: `Résultats conformes : Bénéfice net de ${userRes.incomeStatement.netProfit.toLocaleString()} €`,
      content: `Le trimestre s'achève sur une note solide avec une valorisation d'entreprise estimée à ${(userRes.balanceSheet.ratios.enterpriseValue || 0).toLocaleString()} €. Poursuivez vos efforts sur la conquête commerciale et la transition bas-carbone.`,
      priority: 'normal',
      read: false,
    });
  }

  // DRH Message
  newMessages.push({
    id: `msg-p${nextPeriod}-drh`,
    period: nextPeriod,
    date: `Période ${nextPeriod}`,
    sender: 'Directeur des Ressources Humaines (DRH)',
    role: 'Direction RH & QVT',
    subject: `Rapport RH P${nextPeriod} : Indice de productivité à ${userRes.hrReport.metrics.productivityIndex}% et climat social à ${userRes.hrReport.metrics.socialClimateScore}/100`,
    content: `L'effectif actuel est de ${userRes.hrReport.workforce.totalEmployees} collaborateurs. Le taux d'absentéisme ressort à ${userRes.hrReport.metrics.absenteeismRate}% et le taux de rebut usine à ${userRes.hrReport.metrics.defectRate}%.\n\n${userRes.hrReport.alerts.join('\n')}`,
    priority: userRes.hrReport.metrics.socialClimateScore < 50 ? 'urgent' : 'normal',
    read: false,
  });

  return { nextSnapshot, newMessages };
}

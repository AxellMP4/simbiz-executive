import { FirmPeriodResult, CompetitorMarketData, MarketEnvironment } from '../types/simulation';

export type PerformanceGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';

export interface PillarScore {
  name: string;
  score: number; // 0 - 100
  weight: number; // percent
  summary: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface ExecutiveScoreEvaluation {
  overallScore: number; // 0 - 100
  grade: PerformanceGrade;
  gradeTitle: string;
  pillars: {
    financial: PillarScore;
    market: PillarScore;
    resilience: PillarScore;
    humanEsg: PillarScore;
  };
  strengths: string[];
  vulnerabilities: string[];
  boardVerdict: string;
}

export function computeExecutiveScore(
  current: FirmPeriodResult,
  previous?: FirmPeriodResult,
  competitors: CompetitorMarketData[] = [],
  _marketEnv?: MarketEnvironment
): ExecutiveScoreEvaluation {
  const is = current.incomeStatement;
  const cf = current.cashFlow;
  const bs = current.balanceSheet;
  const hr = current.hrReport;

  // 1. Pilier Financier (30%)
  const netMargin = is.revenue > 0 ? (is.netProfit / is.revenue) * 100 : 0;
  let finScore = 50;
  if (is.netProfit > 100000) finScore += 35;
  else if (is.netProfit > 40000) finScore += 25;
  else if (is.netProfit > 0) finScore += 12;
  else if (is.netProfit < -50000) finScore -= 30;
  else finScore -= 15;

  if (netMargin >= 12) finScore += 15;
  else if (netMargin >= 6) finScore += 8;
  else if (netMargin < 0) finScore -= 15;
  finScore = Math.max(0, Math.min(100, Math.round(finScore)));

  // 2. Pilier Marché & Croissance (25%)
  const myBench = competitors.find(c => c.firmId === current.firmId);
  const marketShare = myBench ? myBench.marketShareOverall : 16.7;
  let mktScore = 50;
  if (marketShare >= 22) mktScore += 30;
  else if (marketShare >= 18) mktScore += 20;
  else if (marketShare >= 15) mktScore += 10;
  else if (marketShare < 10) mktScore -= 20;

  if (previous && previous.incomeStatement.revenue > 0) {
    const revGrowth = ((is.revenue - previous.incomeStatement.revenue) / previous.incomeStatement.revenue) * 100;
    if (revGrowth > 10) mktScore += 20;
    else if (revGrowth > 0) mktScore += 10;
    else if (revGrowth < -10) mktScore -= 15;
  }
  mktScore = Math.max(0, Math.min(100, Math.round(mktScore)));

  // 3. Pilier Résilience & Trésorerie (25%)
  let resScore = 60;
  if (cf.closingOverdraft > 0) {
    resScore -= 40;
  } else if (cf.closingCash > 400000) {
    resScore += 25;
  } else if (cf.closingCash > 150000) {
    resScore += 15;
  } else {
    resScore -= 10;
  }

  const equity = bs.liabilities.shareCapital + bs.liabilities.retainedEarnings + bs.liabilities.periodNetProfit;
  const debt = bs.liabilities.mortgageLoan + bs.liabilities.otherLoans + bs.liabilities.bankOverdraft;
  const debtToEquity = equity > 0 ? debt / equity : 2;
  if (debtToEquity < 0.6) resScore += 15;
  else if (debtToEquity > 1.4) resScore -= 15;
  resScore = Math.max(0, Math.min(100, Math.round(resScore)));

  // 4. Pilier Humain, RSE & ESG (20%)
  const climate = hr.metrics.socialClimateScore || 70;
  const defectRate = hr.metrics.defectRate || 2.5;
  const esg = bs.ratios.esgScore || 70;

  let humScore = 50;
  if (climate >= 80) humScore += 20;
  else if (climate >= 65) humScore += 10;
  else humScore -= 20;

  if (defectRate < 2.0) humScore += 15;
  else if (defectRate > 4.5) humScore -= 15;

  if (esg >= 80) humScore += 15;
  else if (esg >= 65) humScore += 5;
  else humScore -= 10;
  humScore = Math.max(0, Math.min(100, Math.round(humScore)));

  // Overall Score
  const overall = Math.round(
    finScore * 0.30 +
    mktScore * 0.25 +
    resScore * 0.25 +
    humScore * 0.20
  );

  let grade: PerformanceGrade = 'C';
  let gradeTitle = 'Gestion Moyenne';
  if (overall >= 90) {
    grade = 'A+';
    gradeTitle = 'Excellence Stratégique & Exécutive';
  } else if (overall >= 80) {
    grade = 'A';
    gradeTitle = 'Très Haute Performance';
  } else if (overall >= 68) {
    grade = 'B';
    gradeTitle = 'Solide et Équilibré';
  } else if (overall >= 52) {
    grade = 'C';
    gradeTitle = 'Conforme mais Marges de Progrès';
  } else if (overall >= 38) {
    grade = 'D';
    gradeTitle = 'Vigilance & Pressions Multiples';
  } else {
    grade = 'E';
    gradeTitle = 'Crise de Gouvernance & Alertes Rouges';
  }

  const strengths: string[] = [];
  const vulnerabilities: string[] = [];

  if (is.netProfit > 50000) strengths.push(`Bénéfice net robuste de ${Math.round(is.netProfit).toLocaleString('fr-FR')} €`);
  if (marketShare >= 18) strengths.push(`Forte pénétration marché (${marketShare.toFixed(1)} % de PDM)`);
  if (cf.closingCash > 250000 && cf.closingOverdraft === 0) strengths.push(`Trésorerie confortable (${Math.round(cf.closingCash).toLocaleString('fr-FR')} € disponibles)`);
  if (climate >= 75) strengths.push(`Excellent climat social (${climate}/100) et équipes motivées`);
  if (esg >= 75) strengths.push(`Engagement RSE & ESG de premier plan (${esg}/100)`);

  if (cf.closingOverdraft > 0) vulnerabilities.push(`Découvert bancaire actif de ${Math.round(cf.closingOverdraft).toLocaleString('fr-FR')} €`);
  if (is.netProfit < 0) vulnerabilities.push(`Pertes d'exploitation (${Math.round(is.netProfit).toLocaleString('fr-FR')} €)`);
  if (climate < 60) vulnerabilities.push(`Climat social dégradé (${climate}/100) : risque de turn-over et absentéisme`);
  if (defectRate > 3.8) vulnerabilities.push(`Taux de rebuts élevé (${defectRate.toFixed(1)} %) pénalisant la rentabilité`);
  if (marketShare < 13) vulnerabilities.push(`Érosion des parts de marché face aux concurrents (${marketShare.toFixed(1)} %)`);

  if (strengths.length === 0) strengths.push('Maintien de l’outil de production opérationnel');
  if (vulnerabilities.length === 0) vulnerabilities.push('Veiller à ne pas relâcher les investissements d’avenir (R&D, transition durable)');

  const getStatus = (s: number): PillarScore['status'] => {
    if (s >= 80) return 'excellent';
    if (s >= 65) return 'good';
    if (s >= 45) return 'warning';
    return 'critical';
  };

  let boardVerdict = '';
  if (grade === 'A+' || grade === 'A') {
    boardVerdict = 'Le Conseil d\'Administration exprime sa pleine confiance : les fondamentaux sont solides, les arbitrages stratégiques portent leurs fruits et la valeur d\'entreprise s\'accroît.';
  } else if (grade === 'B') {
    boardVerdict = 'Le Conseil valide la trajectoire globale. La rentabilité est préservée, mais il convient d\'accélérer les gains de productivité et la conquête commerciale.';
  } else if (grade === 'C') {
    boardVerdict = 'Le Conseil invite la direction à un cadrage plus rigoureux des coûts et du besoin en fonds de roulement afin d\'éviter l\'effritement des marges.';
  } else {
    boardVerdict = 'Le Conseil tire la sonnette d\'alarme et exige un plan de redressement immédiat axé sur la trésorerie d\'urgence, l\'optimisation des capacités et le dialogue social.';
  }

  return {
    overallScore: overall,
    grade,
    gradeTitle,
    pillars: {
      financial: {
        name: 'Rentabilité Financière',
        score: finScore,
        weight: 30,
        summary: is.netProfit >= 0 ? `Bénéfice de ${Math.round(is.netProfit).toLocaleString('fr-FR')} €` : `Déficit de ${Math.round(is.netProfit).toLocaleString('fr-FR')} €`,
        status: getStatus(finScore),
      },
      market: {
        name: 'Parts de Marché & Croissance',
        score: mktScore,
        weight: 25,
        summary: `${marketShare.toFixed(1)} % de part de marché`,
        status: getStatus(mktScore),
      },
      resilience: {
        name: 'Santé Bilancielle & Trésorerie',
        score: resScore,
        weight: 25,
        summary: cf.closingOverdraft > 0 ? `Découvert : ${Math.round(cf.closingOverdraft).toLocaleString('fr-FR')} €` : `Trésorerie nette : ${Math.round(cf.closingCash).toLocaleString('fr-FR')} €`,
        status: getStatus(resScore),
      },
      humanEsg: {
        name: 'Capital Humain & ESG',
        score: humScore,
        weight: 20,
        summary: `Climat ${climate}/100 · ESG ${esg}/100`,
        status: getStatus(humScore),
      },
    },
    strengths,
    vulnerabilities,
    boardVerdict,
  };
}

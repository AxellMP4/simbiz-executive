import React from 'react';
import { ResultsSubTab } from '../layout/Sidebar';
import { PeriodSnapshot, CompanySettings } from '../../types/simulation';
import {
  SimpleBarChart,
  BarLineChart,
  GroupedBarChart,
} from '../ui/ChartComponents';
import { Flame, TrendingUp, TrendingDown, ShieldCheck, Zap } from 'lucide-react';

interface ResultsViewProps {
  currentSubTab: ResultsSubTab;
  snapshot: PeriodSnapshot;
  prevSnapshot?: PeriodSnapshot;
  allSnapshots: Record<number, PeriodSnapshot>;
  selectedFirmId: string;
  companySettings?: CompanySettings;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  currentSubTab,
  snapshot,
  prevSnapshot,
  allSnapshots,
  selectedFirmId,
  companySettings,
}) => {
  const currentPeriod = snapshot.period;
  const currency = companySettings?.currency || '€';
  const myFirm = snapshot.firmsResults[selectedFirmId] || snapshot.firmsResults['1'] || Object.values(snapshot.firmsResults)[0];
  const prevFirm = prevSnapshot?.firmsResults[selectedFirmId] || prevSnapshot?.firmsResults['1'];
  const { incomeStatement, productionReport, balanceSheet, cashFlow } = myFirm;

  const currentPrice = balanceSheet.ratios.sharePrice || 50;
  const previousPrice = prevFirm?.balanceSheet.ratios.sharePrice || 50;
  const priceDiff = currentPrice - previousPrice;
  const pctChange = previousPrice > 0 ? (priceDiff / previousPrice) * 100 : 0;
  const isVolatile = Math.abs(pctChange) >= 15.0;
  const marketCap = Math.round(currentPrice * 50000);

  // Compute historical series up to current period for graphs
  const periodsRange = Object.keys(allSnapshots)
    .map(Number)
    .filter(p => p <= currentPeriod)
    .sort((a, b) => a - b);

  // 1. P&L Charts
  const pnlSalesData = periodsRange.map(p => {
    const s = allSnapshots[p];
    const firm = s.firmsResults[selectedFirmId] || s.firmsResults['1'] || Object.values(s.firmsResults)[0];
    const avgSales =
      s.competitorsBenchmark.reduce((acc, c) => acc + c.salesRevenue, 0) /
      s.competitorsBenchmark.length;
    return {
      label: `P${p}`,
      bar: firm.incomeStatement.revenue,
      line: Math.round(avgSales),
    };
  });

  const pnlMarginData = periodsRange.map(p => {
    const s = allSnapshots[p];
    const firm = s.firmsResults[selectedFirmId] || s.firmsResults['1'] || Object.values(s.firmsResults)[0];
    const marginPct = (firm.incomeStatement.grossMargin / Math.max(1, firm.incomeStatement.revenue)) * 100;
    const avgMarginPct = 22.5; // Benchmark market average
    return {
      label: `P${p}`,
      bar: Math.round(marginPct),
      line: avgMarginPct,
    };
  });

  const pnlProfitData = periodsRange.map(p => {
    const s = allSnapshots[p];
    const firm = s.firmsResults[selectedFirmId] || s.firmsResults['1'] || Object.values(s.firmsResults)[0];
    const avgProfit =
      s.competitorsBenchmark.reduce((acc, c) => acc + c.netProfit, 0) /
      s.competitorsBenchmark.length;
    return {
      label: `P${p}`,
      bar: firm.incomeStatement.netProfit,
      line: Math.round(avgProfit),
    };
  });

  // 2. Production Charts
  const prodRawMaterialData = periodsRange.map(p => {
    const s = allSnapshots[p];
    const firm = s.firmsResults[selectedFirmId] || s.firmsResults['5'];
    return {
      label: `P${p}`,
      value: firm.productionReport.rawMaterials.finalStock,
      color: '#6366f1',
    };
  });

  const prodUnitCostData = periodsRange.map(p => {
    const s = allSnapshots[p];
    const firm = s.firmsResults[selectedFirmId] || s.firmsResults['5'];
    return {
      label: `P${p}`,
      value: firm.productionReport.productA.unitProductionCost,
      color: p === 6 ? '#ef4444' : '#818cf8',
    };
  });

  const prodStocksFinishedData = periodsRange.map(p => {
    const s = allSnapshots[p];
    const firm = s.firmsResults[selectedFirmId] || s.firmsResults['5'];
    return {
      label: `P${p}`,
      v1: firm.productionReport.productA.finalStockUnits,
      v2: firm.productionReport.productB.finalStockUnits,
    };
  });

  // 3. Balance Sheet Charts
  const balanceBFRData = periodsRange.map(p => {
    const s = allSnapshots[p];
    const firm = s.firmsResults[selectedFirmId] || s.firmsResults['5'];
    return {
      label: `P${p}`,
      value: firm.balanceSheet.ratios.bfr,
      color: p === 6 ? '#ef4444' : '#818cf8',
    };
  });

  const balanceROAData = periodsRange.map(p => {
    const s = allSnapshots[p];
    const firm = s.firmsResults[selectedFirmId] || s.firmsResults['5'];
    return {
      label: `P${p}`,
      value: firm.balanceSheet.ratios.roa,
      color: firm.balanceSheet.ratios.roa < 0 ? '#ef4444' : '#818cf8',
    };
  });

  const balanceROEData = periodsRange.map(p => {
    const s = allSnapshots[p];
    const firm = s.firmsResults[selectedFirmId] || s.firmsResults['5'];
    return {
      label: `P${p}`,
      value: firm.balanceSheet.ratios.roe,
      color: firm.balanceSheet.ratios.roe < 0 ? '#ef4444' : '#818cf8',
    };
  });

  // 4. Cash Flow Charts
  const cashFlowInOutData = periodsRange.map(p => {
    const s = allSnapshots[p];
    const firm = s.firmsResults[selectedFirmId] || s.firmsResults['5'];
    return {
      label: `P${p}`,
      v1: firm.cashFlow.receipts.totalReceipts,
      v2: firm.cashFlow.disbursements.totalDisbursements,
    };
  });

  const cashFlowBalanceData = periodsRange.map(p => {
    const s = allSnapshots[p];
    const firm = s.firmsResults[selectedFirmId] || s.firmsResults['5'];
    return {
      label: `P${p}`,
      value: firm.cashFlow.closingCash,
      color: firm.cashFlow.closingCash < 20000 ? '#ef4444' : '#818cf8',
    };
  });

  const cashFlowBorrowingData = periodsRange.map(p => {
    const s = allSnapshots[p];
    const firm = s.firmsResults[selectedFirmId] || s.firmsResults['5'];
    return {
      label: `P${p}`,
      v1: firm.cashFlow.borrowingCapacityST,
      v2: firm.cashFlow.borrowingCapacityLT,
    };
  });

  // 5. Competitor Charts
  const compVolumeSalesData = periodsRange.map(p => {
    const s = allSnapshots[p];
    const firm = s.firmsResults[selectedFirmId] || s.firmsResults['5'];
    return {
      label: `P${p}`,
      v1: firm.productionReport.productA.salesLocalUnits + firm.productionReport.productA.salesExportUnits,
      v2: firm.productionReport.productB.salesLocalUnits + firm.productionReport.productB.salesExportUnits,
    };
  });

  const compExportSalesData = periodsRange.map(p => {
    const s = allSnapshots[p];
    const firm = s.firmsResults[selectedFirmId] || s.firmsResults['5'];
    return {
      label: `P${p}`,
      v1: firm.productionReport.productA.salesExportUnits,
      v2: firm.productionReport.productB.salesExportUnits,
    };
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col xl:flex-row gap-6">
      {/* Central Statement Table */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* SUBTAB 1: COMPTE DE RESULTAT (Screenshot 7) */}
        {currentSubTab === 'pnl' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h2 className="text-xl font-bold tracking-tight text-white mb-4">
              Compte de Résultat
            </h2>
            <div className="space-y-4 text-xs font-mono">
              <div className="border-b border-slate-800 pb-2">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>Ventes</span>
                  <span className="text-sky-400">
                    {incomeStatement.revenue.toLocaleString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4 mt-1">
                  <span>Coût de production des biens vendus</span>
                  <span className="text-sky-400">
                    {incomeStatement.cogs.toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>

              <div className="border-b border-slate-800 pb-2">
                <div className="flex justify-between font-bold text-slate-100">
                  <span>Marge Brute</span>
                  <span className="text-emerald-400 font-bold">
                    {incomeStatement.grossMargin.toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>

              {/* Frais de vente */}
              <div className="border-b border-slate-800 pb-2">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>Frais de Vente</span>
                  <span className="text-slate-300">
                    {incomeStatement.totalSellingExpenses.toLocaleString('fr-FR')}
                  </span>
                </div>
                <div className="pl-4 space-y-1 text-slate-400 mt-1">
                  <div className="flex justify-between">
                    <span>Salaire des Vendeurs</span>
                    <span>{incomeStatement.sellerSalaries.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commissions</span>
                    <span>{incomeStatement.salesCommissions.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frais de Déplacements</span>
                    <span>{incomeStatement.travelExpenses.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Publicité</span>
                    <span>{incomeStatement.adSpend.toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              {/* Frais généraux */}
              <div className="border-b border-slate-800 pb-2">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>Frais généraux</span>
                  <span className="text-slate-300">
                    {incomeStatement.totalOverheads.toLocaleString('fr-FR')}
                  </span>
                </div>
                <div className="pl-4 space-y-1 text-slate-400 mt-1">
                  <div className="flex justify-between">
                    <span>Salaires administratifs</span>
                    <span>{incomeStatement.adminSalaries.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coûts de stockage</span>
                    <span>{incomeStatement.storageCosts.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Charges RH & Formation</span>
                    <span>{incomeStatement.hrAndTrainingCosts.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>R&D & Autres Charges</span>
                    <span className="text-sky-400">
                      {(incomeStatement.rdCosts + incomeStatement.otherOverheads).toLocaleString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Résultat d'exploitation & Net */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>Résultat avant frais financiers et taxes (EBIT)</span>
                  <span
                    className={
                      incomeStatement.ebit < 0 ? 'text-red-400' : 'text-emerald-400'
                    }
                  >
                    {incomeStatement.ebit.toLocaleString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4">
                  <span>Frais Financiers</span>
                  <span className="text-sky-400">
                    {incomeStatement.financialExpenses.toLocaleString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>Résultat avant impôt</span>
                  <span
                    className={
                      incomeStatement.preTaxProfit < 0 ? 'text-red-400' : 'text-emerald-400'
                    }
                  >
                    {incomeStatement.preTaxProfit.toLocaleString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4">
                  <span>Impôt sur les sociétés</span>
                  <span>{incomeStatement.corporateTax.toLocaleString('fr-FR')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-700 text-white">
                  <span>RESULTAT NET MIS EN RESERVE</span>
                  <span
                    className={
                      incomeStatement.netProfit < 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'
                    }
                  >
                    {incomeStatement.netProfit.toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: RAPPORT DE PRODUCTION (Screenshot 6) */}
        {currentSubTab === 'production' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Rapport de Production
            </h2>

            {/* Matières premières */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-800 pb-1">
                Matières Premières
              </h3>
              <table className="w-full text-xs font-mono">
                <thead className="text-slate-400 text-left border-b border-slate-800">
                  <tr>
                    <th className="py-1">Matières Premières</th>
                    <th className="py-1 text-right">Unités</th>
                    <th className="py-1 text-right">€/unité</th>
                    <th className="py-1 text-right">Coût (€)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  <tr>
                    <td className="py-1 pl-2">Stock Initial</td>
                    <td className="text-right">{productionReport.rawMaterials.initialStock.toLocaleString('fr-FR')}</td>
                    <td className="text-right">13,52</td>
                    <td className="text-right">47 323</td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-2">Achats normaux</td>
                    <td className="text-right">{productionReport.rawMaterials.purchasesRegular.toLocaleString('fr-FR')}</td>
                    <td className="text-right">{productionReport.rawMaterials.purchasesUnitCost.toFixed(2)}</td>
                    <td className="text-right">{productionReport.rawMaterials.purchasesTotalCost.toLocaleString('fr-FR')}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-2">Achats spots d'urgence</td>
                    <td className="text-right">{productionReport.rawMaterials.purchasesSpot.toLocaleString('fr-FR')}</td>
                    <td className="text-right">{productionReport.rawMaterials.purchasesSpotUnitCost.toFixed(2)}</td>
                    <td className="text-right">{productionReport.rawMaterials.purchasesSpotTotalCost.toLocaleString('fr-FR')}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-2 text-rose-300 font-semibold">Consommation ateliers</td>
                    <td className="text-right text-rose-300">{productionReport.rawMaterials.consumption.toLocaleString('fr-FR')}</td>
                    <td className="text-right">{productionReport.rawMaterials.unitValue.toFixed(2)}</td>
                    <td className="text-right text-rose-300">{productionReport.rawMaterials.totalStockValue.toLocaleString('fr-FR')}</td>
                  </tr>
                  <tr className="font-semibold text-slate-100 bg-slate-950/40">
                    <td className="py-1 pl-2">Stock Final</td>
                    <td className="text-right">{productionReport.rawMaterials.finalStock.toLocaleString('fr-FR')}</td>
                    <td className="text-right">{productionReport.rawMaterials.unitValue.toFixed(2)}</td>
                    <td className="text-right text-emerald-400">{productionReport.rawMaterials.totalStockValue.toLocaleString('fr-FR')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Produits Finis: A & B */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-800 pb-1">
                Produits Finis
              </h3>
              <table className="w-full text-xs font-mono">
                <thead className="text-slate-400 text-left border-b border-slate-800">
                  <tr>
                    <th className="py-1">Poste</th>
                    <th className="py-1 text-right">Unités A</th>
                    <th className="py-1 text-right">€/U A</th>
                    <th className="py-1 text-right">Unités B</th>
                    <th className="py-1 text-right">€/U B</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  <tr>
                    <td className="py-1 pl-2">Stock Initial</td>
                    <td className="text-right">{productionReport.productA.initialStock.toLocaleString('fr-FR')}</td>
                    <td className="text-right">{productionReport.productA.initialStockUnitCost.toFixed(2)}</td>
                    <td className="text-right">{productionReport.productB.initialStock.toLocaleString('fr-FR')}</td>
                    <td className="text-right">{productionReport.productB.initialStockUnitCost.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-sky-950/20">
                    <td className="py-1 pl-2 font-semibold text-sky-300">Unités Produites</td>
                    <td className="text-right font-semibold text-sky-300">{productionReport.productA.produced.toLocaleString('fr-FR')}</td>
                    <td className="text-right font-semibold text-sky-300">{productionReport.productA.unitProductionCost.toFixed(2)}</td>
                    <td className="text-right font-semibold text-sky-300">{productionReport.productB.produced.toLocaleString('fr-FR')}</td>
                    <td className="text-right font-semibold text-sky-300">{productionReport.productB.unitProductionCost.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-6 text-slate-400">Coût hors Matières Premières</td>
                    <td className="text-right">{productionReport.productA.costExcludingMaterials.toLocaleString('fr-FR')} €</td>
                    <td className="text-right">--</td>
                    <td className="text-right">{productionReport.productB.costExcludingMaterials.toLocaleString('fr-FR')} €</td>
                    <td className="text-right">--</td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-6 text-slate-400">Coût Matières Premières</td>
                    <td className="text-right">{productionReport.productA.costMaterials.toLocaleString('fr-FR')} €</td>
                    <td className="text-right">--</td>
                    <td className="text-right">{productionReport.productB.costMaterials.toLocaleString('fr-FR')} €</td>
                    <td className="text-right">--</td>
                  </tr>
                  <tr className="font-semibold text-slate-200">
                    <td className="py-1 pl-2">Disponible à la Vente</td>
                    <td className="text-right">{productionReport.productA.availableForSale.toLocaleString('fr-FR')}</td>
                    <td className="text-right">{productionReport.productA.weightedAverageCost.toFixed(2)}</td>
                    <td className="text-right">{productionReport.productB.availableForSale.toLocaleString('fr-FR')}</td>
                    <td className="text-right">{productionReport.productB.weightedAverageCost.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-2 text-emerald-400 font-semibold">Ventes Totales</td>
                    <td className="text-right text-emerald-400">{productionReport.productA.totalSalesUnits.toLocaleString('fr-FR')}</td>
                    <td className="text-right">--</td>
                    <td className="text-right text-emerald-400">{productionReport.productB.totalSalesUnits.toLocaleString('fr-FR')}</td>
                    <td className="text-right">--</td>
                  </tr>
                  <tr className="font-bold text-amber-300 bg-slate-950/40">
                    <td className="py-1 pl-2">Stock Final (Invendus)</td>
                    <td className="text-right">{productionReport.productA.finalStockUnits.toLocaleString('fr-FR')}</td>
                    <td className="text-right">{productionReport.productA.finalStockTotalValue.toLocaleString('fr-FR')} €</td>
                    <td className="text-right">{productionReport.productB.finalStockUnits.toLocaleString('fr-FR')}</td>
                    <td className="text-right">{productionReport.productB.finalStockTotalValue.toLocaleString('fr-FR')} €</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Rapport de Ventes */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-800 pb-1">
                Rapport de Ventes
              </h3>
              <table className="w-full text-xs font-mono">
                <thead className="text-slate-400 text-left border-b border-slate-800">
                  <tr>
                    <th className="py-1">Marché & Produit</th>
                    <th className="py-1 text-right">Unités</th>
                    <th className="py-1 text-right">Prix (€)</th>
                    <th className="py-1 text-right">Total CA (€)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  <tr>
                    <td className="py-1 pl-2">Ventes Locales (Produit Alpha A)</td>
                    <td className="text-right">{productionReport.productA.salesLocalUnits.toLocaleString('fr-FR')}</td>
                    <td className="text-right">{(myFirm.decisions?.priceA_local || 96).toFixed(2)} €</td>
                    <td className="text-right">{incomeStatement.revenueA_local.toLocaleString('fr-FR')} €</td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-2">Ventes Export (Produit Alpha A)</td>
                    <td className="text-right">{productionReport.productA.salesExportUnits.toLocaleString('fr-FR')}</td>
                    <td className="text-right">{(myFirm.decisions?.priceA_export || 94).toFixed(2)} €</td>
                    <td className="text-right">{incomeStatement.revenueA_export.toLocaleString('fr-FR')} €</td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-2">Ventes Locales (Produit Apex B)</td>
                    <td className="text-right">{productionReport.productB.salesLocalUnits.toLocaleString('fr-FR')}</td>
                    <td className="text-right">{(myFirm.decisions?.priceB_local || 175).toFixed(2)} €</td>
                    <td className="text-right">{incomeStatement.revenueB_local.toLocaleString('fr-FR')} €</td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-2">Ventes Export (Produit Apex B)</td>
                    <td className="text-right">{productionReport.productB.salesExportUnits.toLocaleString('fr-FR')}</td>
                    <td className="text-right">{(myFirm.decisions?.priceB_export || 182).toFixed(2)} €</td>
                    <td className="text-right">{incomeStatement.revenueB_export.toLocaleString('fr-FR')} €</td>
                  </tr>
                  <tr className="font-bold text-white bg-slate-950/60">
                    <td className="py-1.5 pl-2">Total Chiffre d'Affaires</td>
                    <td className="text-right">{(productionReport.productA.totalSalesUnits + productionReport.productB.totalSalesUnits).toLocaleString('fr-FR')}</td>
                    <td className="text-right">--</td>
                    <td className="text-right text-sky-400 font-bold">
                      {incomeStatement.revenue.toLocaleString('fr-FR')} €
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 3: BILAN (Screenshot 5) */}
        {currentSubTab === 'balance' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h2 className="text-xl font-bold tracking-tight text-white mb-4">Bilan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              {/* ACTIF */}
              <div className="border border-slate-800 rounded p-3 bg-slate-950/40">
                <div className="flex justify-between font-bold text-slate-100 border-b border-slate-800 pb-2 mb-2">
                  <span>ACTIF</span>
                  <div className="space-x-6 text-[11px] text-slate-400">
                    <span>Val. Nette</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>Terrain</span>
                    <span>{balanceSheet.assets.land.net.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Constructions</span>
                    <span>{balanceSheet.assets.buildings.net.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Machines (D et F)</span>
                    <span>{balanceSheet.assets.machines.net.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Stock M.P.</span>
                    <span>{balanceSheet.assets.stockRawMaterials.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Stock Produit A</span>
                    <span>{balanceSheet.assets.stockProductA.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Stock Produit B</span>
                    <span>{balanceSheet.assets.stockProductB.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-sky-400">
                    <span>Créances Clients</span>
                    <span>{balanceSheet.assets.customerReceivables.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Disponibilités (Caisse)</span>
                    <span>{balanceSheet.assets.cashAndEquivalents.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-700">
                    <span>TOTAL ACTIF</span>
                    <span>{balanceSheet.assets.totalAssets.toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              {/* PASSIF */}
              <div className="border border-slate-800 rounded p-3 bg-slate-950/40">
                <div className="flex justify-between font-bold text-slate-100 border-b border-slate-800 pb-2 mb-2">
                  <span>PASSIF</span>
                  <span className="text-[11px] text-slate-400">Montant (€)</span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>Capital Social</span>
                    <span>{balanceSheet.liabilities.shareCapital.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Réserves</span>
                    <span>{balanceSheet.liabilities.retainedEarnings.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Résultat de la Période</span>
                    <span
                      className={
                        balanceSheet.liabilities.periodNetProfit < 0
                          ? 'text-red-400'
                          : 'text-emerald-400'
                      }
                    >
                      {balanceSheet.liabilities.periodNetProfit.toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Emprunt Hypothécaire</span>
                    <span>{balanceSheet.liabilities.mortgageLoan.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Autres Emprunts</span>
                    <span>{balanceSheet.liabilities.otherLoans.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Dettes Fournisseurs</span>
                    <span>{balanceSheet.liabilities.supplierPayables.toLocaleString('fr-FR')}</span>
                  </div>
                  {balanceSheet.liabilities.bankOverdraft > 0 && (
                    <div className="flex justify-between text-rose-400 font-semibold">
                      <span>Découvert Bancaire</span>
                      <span>{balanceSheet.liabilities.bankOverdraft.toLocaleString('fr-FR')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Autres Dettes</span>
                    <span>{balanceSheet.liabilities.otherDebts.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-700">
                    <span>TOTAL PASSIF</span>
                    <span>{balanceSheet.liabilities.totalLiabilities.toLocaleString('fr-FR')} €</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ratios Financiers & Valorisation Boursière */}
            <div className="mt-5 p-4 bg-slate-950/80 rounded-lg border border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span>Ratios Financiers, Santé & Valorisation d'Entreprise</span>
                  {isVolatile && (
                    <span className="flex items-center gap-1 text-[10px] font-tech font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600 animate-pulse">
                      <Flame className="w-3 h-3 fill-current" />
                      <span>Haute Volatilité ({pctChange >= 0 ? '+' : ''}{pctChange.toFixed(1)}%)</span>
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-indigo-400 font-mono">Période {currentPeriod}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 font-mono text-xs">
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">BFR</span>
                  <span className="font-bold text-white text-sm block mt-0.5">{balanceSheet.ratios.bfr.toLocaleString('fr-FR')} {currency}</span>
                  <span className="text-[9px] text-slate-500">Fonds de Roulement</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Solvabilité</span>
                  <span className="font-bold text-emerald-400 text-sm block mt-0.5">{balanceSheet.ratios.solvencyRatio}%</span>
                  <span className="text-[9px] text-slate-500">Capitaux / Actif</span>
                </div>
                <div className={`p-2.5 rounded border ${isVolatile ? 'bg-amber-950/20 border-amber-500/60' : 'bg-slate-900 border-slate-800'}`}>
                  <span className="text-[10px] text-slate-400 block flex items-center justify-between">
                    <span>Cours Action</span>
                    {isVolatile && <Flame className="w-2.5 h-2.5 text-amber-400 fill-current" />}
                  </span>
                  <span className="font-bold text-amber-400 text-sm block mt-0.5">{currentPrice.toFixed(2)} {currency}</span>
                  <span className={`text-[9px] ${pctChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {pctChange >= 0 ? '+' : ''}{pctChange.toFixed(1)}% vs P.{Math.max(0, currentPeriod - 1)}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Cap. Boursière</span>
                  <span className="font-bold text-sky-400 text-sm block mt-0.5">{marketCap.toLocaleString('fr-FR')} {currency}</span>
                  <span className="text-[9px] text-slate-500">50 000 titres</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Valeur Entreprise</span>
                  <span className="font-bold text-indigo-300 text-sm block mt-0.5">{((balanceSheet.ratios.enterpriseValue || Math.round(currentPrice * 50000))).toLocaleString('fr-FR')} {currency}</span>
                  <span className="text-[9px] text-slate-500">EV (Multiple EBITDA)</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Score ESG</span>
                  <span className="font-bold text-indigo-400 text-sm block mt-0.5">{balanceSheet.ratios.esgScore || 74} / 100</span>
                  <span className="text-[9px] text-emerald-400">Altman Z: {balanceSheet.ratios.altmanZScore || 3.45}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: TRESORERIE (Screenshot 4) */}
        {currentSubTab === 'cashflow' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h2 className="text-xl font-bold tracking-tight text-white mb-4">Trésorerie</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              {/* Encaissements */}
              <div className="border border-slate-800 rounded p-3 bg-slate-950/40">
                <div className="font-bold text-slate-100 border-b border-slate-800 pb-2 mb-2">
                  ENCAISSEMENTS
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>Ventes T-1 & comptant</span>
                    <span>{cashFlow.receipts.salesCollectionT1.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Emprunt Court Terme</span>
                    <span>{cashFlow.receipts.shortTermLoans.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Emprunt Moyen/Long Terme</span>
                    <span>{cashFlow.receipts.longTermLoans.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Ventes Machines</span>
                    <span>{cashFlow.receipts.machineSales.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Retour Impôt</span>
                    <span>{cashFlow.receipts.taxRefunds.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-sky-400 pt-2 border-t border-slate-800">
                    <span>TOTAL Encaissements</span>
                    <span>{cashFlow.receipts.totalReceipts.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-400">Caisse T-1</span>
                    <span>{cashFlow.openingCash.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Découvert T</span>
                    <span>{cashFlow.closingOverdraft.toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              {/* Décaissements */}
              <div className="border border-slate-800 rounded p-3 bg-slate-950/40">
                <div className="font-bold text-slate-100 border-b border-slate-800 pb-2 mb-2">
                  DECAISSEMENTS
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>Achats Matières T-1</span>
                    <span>{cashFlow.disbursements.rawMaterialsT1.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Remboursements Emprunts</span>
                    <span>{cashFlow.disbursements.loanPrincipalRepayments.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Remboursement Hypoth.</span>
                    <span>{cashFlow.disbursements.mortgageRepayments.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Main d'Oeuvre Production</span>
                    <span>{cashFlow.disbursements.productionLaborCosts.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Autres Dépenses / Prod.</span>
                    <span>{cashFlow.disbursements.otherProductionExpenses.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Frais de Vente</span>
                    <span>{cashFlow.disbursements.sellingExpenses.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Frais de Gestion</span>
                    <span>{cashFlow.disbursements.managementAndOverheads.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Impôt Payé</span>
                    <span>{cashFlow.disbursements.corporateTaxPaid.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-rose-400 pt-2 border-t border-slate-800">
                    <span>TOTAL Décaissements</span>
                    <span>{cashFlow.disbursements.totalDisbursements.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-400">Découvert T-1</span>
                    <span>{cashFlow.openingOverdraft.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white">
                    <span>Caisse T (Solde disponible)</span>
                    <span className="text-emerald-400">
                      {cashFlow.closingCash.toLocaleString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 5: AUTRES INFORMATIONS / RAPPORT CONCURRENCE (Screenshot 3) */}
        {currentSubTab === 'competitors' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Autres Informations
            </h2>

            <div className="border border-slate-800 rounded p-4 bg-slate-950/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Rapport Concurrence
              </h3>
              <table className="w-full text-xs font-mono">
                <thead className="text-slate-400 text-left border-b border-slate-800">
                  <tr>
                    <th className="py-1">Firme</th>
                    <th className="py-1 text-right">Ventes (€)</th>
                    <th className="py-1 text-right">Prix Locaux A</th>
                    <th className="py-1 text-right">Prix Locaux B</th>
                    <th className="py-1 text-right">Prix Exports A</th>
                    <th className="py-1 text-right">Prix Exports B</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {snapshot.competitorsBenchmark.map(c => (
                    <tr
                      key={c.firmId}
                      className={c.firmId === selectedFirmId ? 'bg-amber-500/10 text-amber-300 font-semibold' : ''}
                    >
                      <td className="py-1.5">{c.firmName}</td>
                      <td className="text-right">{c.salesRevenue.toLocaleString('fr-FR')}</td>
                      <td className="text-right">{c.priceLocalA.toFixed(2)}</td>
                      <td className="text-right">{c.priceLocalB.toFixed(2)}</td>
                      <td className="text-right">{c.priceExportA.toFixed(2)}</td>
                      <td className="text-right">{c.priceExportB.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold text-white bg-slate-950">
                    <td className="py-1.5">Ventes Totales (Unités)</td>
                    <td className="text-right">--</td>
                    <td className="text-right">{snapshot.marketEnvironment.overallMarketDemandA.toLocaleString('fr-FR')}</td>
                    <td className="text-right">{snapshot.marketEnvironment.overallMarketDemandB.toLocaleString('fr-FR')}</td>
                    <td className="text-right">{snapshot.marketEnvironment.overallExportDemandA.toLocaleString('fr-FR')}</td>
                    <td className="text-right">{snapshot.marketEnvironment.overallExportDemandB.toLocaleString('fr-FR')}</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 text-xs">
                <div>
                  <span className="text-slate-400">Votre Coefficient effort sur Produit B : </span>
                  <span className="font-mono font-bold text-amber-400">
                    {myFirm.decisions.marketingEffortB.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Prix Moyen Concurrence : </span>
                  <span className="font-mono font-bold text-slate-200">
                    85,00 € (A) / 83,00 € (Exp)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Dynamic SVG Charts per Subtab (Matches screenshots!) */}
      <div className="w-full xl:w-80 shrink-0 flex flex-col space-y-4">
        {currentSubTab === 'pnl' && (
          <>
            <BarLineChart
              title="Ventes"
              data={pnlSalesData}
              barName="Ventes"
              lineName="Firme Moyenne"
            />
            <BarLineChart
              title="Marge (%)"
              data={pnlMarginData}
              barName="Marge (%)"
              lineName="Firme Moyenne"
              isCurrency={false}
              unit="%"
            />
            <BarLineChart
              title="Bénéfice"
              data={pnlProfitData}
              barName="Bénéfice"
              lineName="Firme Moyenne"
            />
          </>
        )}

        {currentSubTab === 'production' && (
          <>
            <SimpleBarChart
              title="Stocks MP"
              data={prodRawMaterialData}
              isCurrency={false}
              unit="U"
            />
            <SimpleBarChart
              title="Coût De Production"
              data={prodUnitCostData}
              isCurrency={true}
            />
            <GroupedBarChart
              title="Stocks FP"
              data={prodStocksFinishedData}
              name1="Stocks FP A"
              name2="Stocks FP B"
              color1="#818cf8"
              color2="#ef4444"
              unit="U"
            />
          </>
        )}

        {currentSubTab === 'balance' && (
          <>
            <SimpleBarChart
              title="BFR"
              data={balanceBFRData}
              isCurrency={true}
            />
            <SimpleBarChart
              title="ROA (%)"
              data={balanceROAData}
              isCurrency={false}
              unit="%"
            />
            <SimpleBarChart
              title="ROE (%)"
              data={balanceROEData}
              isCurrency={false}
              unit="%"
            />
          </>
        )}

        {currentSubTab === 'cashflow' && (
          <>
            <GroupedBarChart
              title="Encaiss. / Décaiss."
              data={cashFlowInOutData}
              name1="Encaissements"
              name2="Décaissements"
              color1="#818cf8"
              color2="#ef4444"
              isCurrency={true}
            />
            <SimpleBarChart
              title="Caisse"
              data={cashFlowBalanceData}
              isCurrency={true}
            />
            <GroupedBarChart
              title="Capacités d'emprunt"
              data={cashFlowBorrowingData}
              name1="Court Terme"
              name2="Long Terme"
              color1="#818cf8"
              color2="#ef4444"
              isCurrency={true}
            />
          </>
        )}

        {currentSubTab === 'competitors' && (
          <>
            <SimpleBarChart
              title="Parts de Marché (%)"
              data={snapshot.competitorsBenchmark.map(c => ({
                label: `F${c.firmId}`,
                value: c.marketShareOverall,
                highlight: c.firmId === selectedFirmId,
              }))}
              isCurrency={false}
              unit="%"
            />
            <GroupedBarChart
              title="Ventes (unités)"
              data={compVolumeSalesData}
              name1="Produit A"
              name2="Produit B"
              color1="#818cf8"
              color2="#ef4444"
              unit="U"
            />
            <GroupedBarChart
              title="Ventes Export"
              data={compExportSalesData}
              name1="A Exp"
              name2="B Exp"
              color1="#818cf8"
              color2="#ef4444"
              unit="U"
            />
          </>
        )}
      </div>
    </div>
  );
};

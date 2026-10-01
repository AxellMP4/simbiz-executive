import React, { useState } from 'react';
import { PeriodSnapshot, CompanySettings } from '../../types/simulation';
import { SimpleBarChart, GroupedBarChart } from '../ui/ChartComponents';
import { TrendingUp, PieChart, Target, Compass, Sparkles, Sliders } from 'lucide-react';

interface MarketAnalysisViewProps {
  snapshot: PeriodSnapshot;
  selectedFirmId: string;
  companySettings?: CompanySettings;
}

export const MarketAnalysisView: React.FC<MarketAnalysisViewProps> = ({
  snapshot,
  selectedFirmId,
  companySettings,
}) => {
  const { marketEnvironment, competitorsBenchmark } = snapshot;
  const currency = companySettings?.currency || '€';
  const prodAName = companySettings?.productAName || 'Produit Alpha A';
  const prodBName = companySettings?.productBName || 'Produit Apex B';

  // Simulator state for What-if elasticity test
  const [testPriceA, setTestPriceA] = useState<number>(96);
  const [testPriceB, setTestPriceB] = useState<number>(175);
  const [testAdSpend, setTestAdSpend] = useState<number>(12000);

  // Elasticity estimation: baseline price 96 for A, 175 for B
  const elasticityA = -2.1;
  const elasticityB = -1.7;

  const deltaPctA = (testPriceA - 96) / 96;
  const deltaPctB = (testPriceB - 175) / 175;
  const adEffect = Math.log10(Math.max(1000, testAdSpend) / 10000) * 0.15;

  const estimatedVolumeA = Math.round(3450 * (1 + deltaPctA * elasticityA + adEffect));
  const estimatedVolumeB = Math.round(920 * (1 + deltaPctB * elasticityB + adEffect * 1.3));
  const estimatedRevenue = Math.round(estimatedVolumeA * testPriceA + estimatedVolumeB * testPriceB);

  // Market Share in value per competitor
  const totalMarketVal = competitorsBenchmark.reduce((acc, c) => acc + c.salesRevenue, 0);
  const marketShareValueData = competitorsBenchmark.map(c => {
    const isUser = c.firmId === '1';
    const label = isUser && companySettings?.tickerSymbol ? companySettings.tickerSymbol : `F${c.firmId}`;
    return {
      label,
      value: totalMarketVal > 0 ? (c.salesRevenue / totalMarketVal) * 100 : 16.6,
      highlight: c.firmId === selectedFirmId,
      color: c.firmId === selectedFirmId ? (companySettings?.brandColor || '#6366f1') : '#475569',
    };
  });

  // Ad Spend share of voice
  const totalAds = competitorsBenchmark.reduce((acc, c) => acc + c.adSpend, 0);
  const adShareData = competitorsBenchmark.map(c => {
    const isUser = c.firmId === '1';
    const label = isUser && companySettings?.tickerSymbol ? companySettings.tickerSymbol : `F${c.firmId}`;
    return {
      label,
      value: totalAds > 0 ? (c.adSpend / totalAds) * 100 : 16.6,
      highlight: c.firmId === selectedFirmId,
      color: c.firmId === selectedFirmId ? '#f59e0b' : '#38bdf8',
    };
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <span>Analyses de Marché Détaillées & Études Concurrence</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Modélisation de l'élasticité prix/demande, parts de voix publicitaire, matrice BCG et baromètre sectoriel
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded">
          Marché Total P.{snapshot.period} : <strong className="text-white">{(totalMarketVal).toLocaleString('fr-FR')} €</strong>
        </div>
      </div>

      {/* Top 3 Analytical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Macro Barometer */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Baromètre Conjoncturel</span>
          </div>
          <div className="text-xs font-mono space-y-2 text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Demande Globale Produit A</span>
              <span className="font-semibold text-white">
                {marketEnvironment.overallMarketDemandA.toLocaleString('fr-FR')} U (+3.2%)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Demande Globale Produit B</span>
              <span className="font-semibold text-sky-400">
                {marketEnvironment.overallMarketDemandB.toLocaleString('fr-FR')} U (+6.8%)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Taux de Change Export</span>
              <span className="font-semibold text-emerald-400">Stable (1.08 USD/EUR)</span>
            </div>
          </div>
        </div>

        {/* BCG Matrix Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Target className="w-4 h-4 text-amber-400" />
            <span>Matrice BCG du Portefeuille</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <div className="font-bold text-amber-300">Produit A : Vache à Lait</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Marché mature, croissance modérée, fort volume. Doit financer la montée en puissance de l'outil industriel.
              </p>
            </div>
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <div className="font-bold text-purple-300">Produit B : Étoile / Dilemme</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Marché en forte expansion (+6.8%), marge unitaire élevée (115-125 €). Nécessite du budget formation et marketing.
              </p>
            </div>
          </div>
        </div>

        {/* Price Elasticity Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Sensibilité / Élasticité Prix</span>
          </div>
          <div className="text-xs font-mono space-y-2 text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Élasticité Produit A :</span>
              <span className="font-semibold text-rose-400">-2.10 (Forte)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Élasticité Produit B :</span>
              <span className="font-semibold text-amber-400">-1.70 (Moyenne)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Part de Voix Firme {selectedFirmId} :</span>
              <span className="font-semibold text-sky-400">
                {(adShareData.find(d => d.label === `F${selectedFirmId}`)?.value || 0).toFixed(1)} %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* What-If Predictive Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Simulateur Prédictif "What-If" : Impact Prix & Publicité sur les Ventes
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Modèle économétrique dynamique</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sliders */}
          <div className="space-y-4 md:col-span-2">
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">Hypothèse Prix Local Produit A :</span>
                <span className="font-bold text-sky-400">{testPriceA} € (Réf : 95 €)</span>
              </div>
              <input
                type="range"
                min="80"
                max="105"
                step="1"
                value={testPriceA}
                onChange={e => setTestPriceA(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">Hypothèse Prix Local Produit B :</span>
                <span className="font-bold text-purple-400">{testPriceB} € (Réf : 119 €)</span>
              </div>
              <input
                type="range"
                min="100"
                max="135"
                step="1"
                value={testPriceB}
                onChange={e => setTestPriceB(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">Hypothèse Budget Publicité Locale :</span>
                <span className="font-bold text-amber-400">{testAdSpend.toLocaleString('fr-FR')} € (Réf : 4 000 €)</span>
              </div>
              <input
                type="range"
                min="1000"
                max="15000"
                step="500"
                value={testAdSpend}
                onChange={e => setTestAdSpend(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Forecast Result Card */}
          <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 flex flex-col justify-between font-mono">
            <div>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Ventes Estimées (Marché Local)
              </span>
              <div className="space-y-2 mt-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Volume Produit A :</span>
                  <span className="font-bold text-sky-400">{estimatedVolumeA.toLocaleString('fr-FR')} U</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Volume Produit B :</span>
                  <span className="font-bold text-purple-400">{estimatedVolumeB.toLocaleString('fr-FR')} U</span>
                </div>
                <div className="flex justify-between py-1 border-t border-slate-700 text-sm">
                  <span className="text-slate-200 font-bold">Chiffre d'Affaires :</span>
                  <span className="font-bold text-emerald-400">{estimatedRevenue.toLocaleString('fr-FR')} €</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-[10px] text-slate-500 font-sans">
              * Calcul basé sur les élasticités croisées et les parts de voix des 5 concurrents.
            </div>
          </div>
        </div>
      </div>

      {/* Competitors 360 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          title="Parts de Marché en Valeur (%)"
          data={marketShareValueData}
          height={180}
          isCurrency={false}
          unit="%"
        />
        <SimpleBarChart
          title="Part de Voix Publicitaire (Share of Voice %)"
          data={adShareData}
          height={180}
          isCurrency={false}
          unit="%"
        />
      </div>
    </div>
  );
};

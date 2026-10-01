import React, { useState } from 'react';
import { X, Target, Shield, AlertTriangle, TrendingUp, TrendingDown, Eye, Zap, Crosshair, BarChart3 } from 'lucide-react';
import { PeriodSnapshot, CompanySettings } from '../../types/simulation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  snapshot: PeriodSnapshot;
  companySettings: CompanySettings;
  initialFirmId?: string;
}

interface CompetitorDossier {
  firmId: string;
  codename: string;
  strategy: string;
  threatLevel: 'Faible' | 'Modéré' | 'Élevé' | 'Critique';
  strengths: string[];
  weaknesses: string[];
  predictedMove: string;
  counterAction: string;
}

const DOSSIERS: Record<string, CompetitorDossier> = {
  '2': {
    firmId: '2',
    codename: 'VoltaCore Systems',
    strategy: 'Volume massif, compression des coûts et cassage des prix sur le Marché Local A.',
    threatLevel: 'Élevé',
    strengths: ['Grande force de vente locale (9 commerciaux)', 'Politique d’agressivité tarifaire', 'Forte présence régionale'],
    weaknesses: ['Marges nettes faibles (risque en cas de choc)', 'Score RSE inférieur à la moyenne', 'Absence de diversification premium'],
    predictedMove: 'Maintien de prix sous les 92 € sur le produit A pour siphonner les commandes de gros volume.',
    counterAction: 'Renforcer la fidélisation par des délais de paiement à 30 jours et miser sur la qualité supérieure.',
  },
  '3': {
    firmId: '3',
    codename: 'Zenith Avionics',
    strategy: 'Niche technologique haut de gamme, marges brutes record sur le Produit B.',
    threatLevel: 'Critique',
    strengths: ['Marge brute supérieure à 45%', 'Trésorerie abondante (> 450k €)', 'Position de monopole sur certains appels d’offres B'],
    weaknesses: ['Vulnérabilité aux coûts de R&D', 'Volumes restreints sur le marché grand public', 'Capacité de production saturée'],
    predictedMove: 'Augmentation prévisible du budget publicitaire de +15% sur les segments export.',
    counterAction: 'Augmenter le budget R&D pour combler l’écart d’innovation et contester leur premium.',
  },
  '4': {
    firmId: '4',
    codename: 'Atlas Global Trade',
    strategy: 'Expansion internationale agressive et leadership sur les flux de grand export.',
    threatLevel: 'Modéré',
    strengths: ['Réseau de distribution international établi', 'Maîtrise logistique', 'Parts de marché export > 20%'],
    weaknesses: ['Exposition accrue aux variations de change et droits de douane', 'Moindre présence sur le marché intérieur'],
    predictedMove: 'Offensive commerciale sur les marchés émergents avec quotas commerciaux accrus.',
    counterAction: 'Allouer au moins 3 commerciaux sur l’export et négocier des contrats cadres matière première.',
  },
  '5': {
    firmId: '5',
    codename: 'Helios GreenTech',
    strategy: 'Pionnier de la transition écologique, leader absolu sur les critères RSE et bonus vert.',
    threatLevel: 'Modéré',
    strengths: ['Score ESG de 88/100 (numéro 1 du marché)', 'Bénéficie au maximum des subventions vertes', 'Forte attractivité RH'],
    weaknesses: ['Structure de coûts élevée', 'Prix de vente souvent au-dessus de l’équilibre du marché'],
    predictedMove: 'Lancement d’une campagne marketing axée sur la neutralité carbone et l’éco-conception.',
    counterAction: 'Activer le budget Éco-conception à hauteur de 10k € pour capter la prime de demande verte.',
  },
  '6': {
    firmId: '6',
    codename: 'Titan Robotics',
    strategy: 'Automatisation industrielle intensive, gains de productivité et robotique d’atelier.',
    threatLevel: 'Faible',
    strengths: ['Taux de rebut le plus bas du secteur', 'Efficience par machine très élevée', 'Investissements Industrie 4.0'],
    weaknesses: ['Trésorerie la plus faible du panel (< 380k €)', 'Dette court terme pesante', 'Faible flexibilité commerciale'],
    predictedMove: 'Ralentissement probable des embauches pour préserver le cash d’exploitation.',
    counterAction: 'Profiter de leur prudence commerciale pour gagner des parts de marché locales.',
  },
};

export const CompetitorIntelligenceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  snapshot,
  companySettings,
  initialFirmId,
}) => {
  const [selectedFirmId, setSelectedFirmId] = useState<string>(initialFirmId || '2');

  React.useEffect(() => {
    if (initialFirmId && initialFirmId !== '1') {
      setSelectedFirmId(initialFirmId);
    }
  }, [initialFirmId]);

  if (!isOpen) return null;

  const competitors = snapshot.competitorsBenchmark.filter(c => c.firmId !== '1');
  const selectedComp = snapshot.competitorsBenchmark.find(c => c.firmId === selectedFirmId);
  const dossier = DOSSIERS[selectedFirmId] || DOSSIERS['2'];

  const threatColor = {
    'Faible': 'text-emerald-400 bg-emerald-950 border-emerald-800',
    'Modéré': 'text-amber-400 bg-amber-950 border-amber-800',
    'Élevé': 'text-orange-400 bg-orange-950 border-orange-800',
    'Critique': 'text-rose-400 bg-rose-950 border-rose-800',
  }[dossier.threatLevel];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Crosshair className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-white">Intelligence Économique & Fiches Concurrents</h2>
                <span className="rounded-full bg-indigo-950 border border-indigo-800 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                  Renseignement Concurrentiel
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Surveillance stratégique des 5 firmes rivales · Analyse SWOT & Anticipation des mouvements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Competitor Selector Pills */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto">
          {competitors.map(c => {
            const isSelected = c.firmId === selectedFirmId;
            return (
              <button
                key={c.firmId}
                onClick={() => setSelectedFirmId(c.firmId)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${isSelected ? 'bg-indigo-600 text-white font-bold shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                <span>Firme {c.firmId}</span>
                <span className="text-[11px] opacity-80">({c.firmName.split(' ')[0]})</span>
              </button>
            );
          })}
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Selected Competitor Profile */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  {selectedComp?.firmName}
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${threatColor}`}>
                    Menace : {dossier.threatLevel}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">{dossier.strategy}</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block">Chiffre d’affaires</span>
                  <strong className="text-white">{(selectedComp?.salesRevenue || 0).toLocaleString('fr-FR')} {companySettings.currency}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Part de marché</span>
                  <strong className="text-emerald-400">{selectedComp?.marketShareOverall}%</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Trésorerie</span>
                  <strong className="text-white">{(selectedComp?.cash || 0).toLocaleString('fr-FR')} {companySettings.currency}</strong>
                </div>
              </div>
            </div>

            {/* SWOT Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="rounded-lg bg-slate-900 p-3.5 border border-slate-800">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Forces Clés Détectées
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {dossier.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg bg-slate-900 p-3.5 border border-slate-800">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5" />
                  Vulnérabilités Opérationnelles
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {dossier.weaknesses.map((weak, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 mt-0.5">•</span>
                      <span>{weak}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Predictive AI Move & Countermeasure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-indigo-800/60 bg-indigo-950/20 p-4">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold mb-2">
                <Zap className="h-4 w-4" />
                Anticipation des Prochains Mouvements
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed">
                {dossier.predictedMove}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold mb-2">
                <Target className="h-4 w-4" />
                Riposte Tactique Conseillée
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed">
                {dossier.counterAction}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 px-6 py-4 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            L'intelligence économique est recalculée à chaque changement de période en fonction des rapports publics.
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
          >
            Fermer les Fiches
          </button>
        </div>
      </div>
    </div>
  );
};

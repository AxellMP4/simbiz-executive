import React from 'react';
import { BookOpen, CheckCircle, HelpCircle, Layers, Lightbulb } from 'lucide-react';

export const DocumentationView: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span>Manuel de Gestion Stratégique SimBiz / PolyTech</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Règles économiques, algorithmes de calcul, nomenclature industrielle et guide des décisions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs text-slate-300">
        {/* Section 1: Marchés & Produits */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
          <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>1. Marchés & Gamme de Produits</span>
          </h3>
          <ul className="space-y-2 leading-relaxed font-sans">
            <li>
              <strong className="text-white">Produit A (Standard) :</strong> Produit grand public à fort volume. Élasticité-prix élevée (-2,10). Les clients sont très sensibles au prix et à la présence des commerciaux en magasin.
            </li>
            <li>
              <strong className="text-white">Produit B (Haut de Gamme) :</strong> Produit premium à forte marge unitaire. La demande dépend fortement du coefficient d'effort marketing (0 à 1), de la réputation de qualité et de la publicité.
            </li>
            <li>
              <strong className="text-white">Marché Export :</strong> Marché international ouvert. Nécessite des commerciaux export dédiés et un budget publicitaire spécifique.
            </li>
          </ul>
        </div>

        {/* Section 2: Production & Usine */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>2. Outil Industriel & Matières Premières</span>
          </h3>
          <ul className="space-y-2 leading-relaxed font-sans">
            <li>
              <strong className="text-white">Capacité machine :</strong> Chaque Machine F produit jusqu'à 800 unités par trimestre en régime normal (taux d'utilisation = 1,00). Le taux peut monter jusqu'à 1,25 avec des heures supplémentaires (+35% sur le coût horaire).
            </li>
            <li>
              <strong className="text-white">Nomenclature Matières :</strong> 1 unité A nécessite 3,0 unités de MP. 1 unité B nécessite 4,5 unités de MP.
            </li>
            <li>
              <strong className="text-white">Achats spots d'urgence :</strong> Si les matières disponibles sont insuffisantes pour honorer le plan de fabrication, des achats spots automatiques sont déclenchés au prix pénalisant de 20,00 €/U (contre 14,00 € en contrat régulier).
            </li>
            <li>
              <strong className="text-white">Valorisation des stocks (PUMP) :</strong> Les stocks de matières et de produits finis sont valorisés au Prix Unitaire Moyen Pondéré.
            </li>
          </ul>
        </div>

        {/* Section 3: Ressources Humaines Avancées */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
          <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>3. Gestion Avancée des Ressources Humaines (RH)</span>
          </h3>
          <ul className="space-y-2 leading-relaxed font-sans">
            <li>
              <strong className="text-white">Indice de Productivité :</strong> Varie entre 80% et 125%. Il est directement alimenté par le budget formation continue et la prime d'intéressement. Une productivité élevée abaisse le temps ouvrier par pièce.
            </li>
            <li>
              <strong className="text-white">Taux de Rebuts Usine :</strong> Mesure le pourcentage de pièces défectueuses jetées en fin de chaîne. L'investissement dans la formation technique et les certifications qualité fait chuter ce taux sous les 2%.
            </li>
            <li>
              <strong className="text-white">Climat Social & Absentéisme :</strong> Dépend des salaires, du respect des charges de travail et du budget QVT (ergonomie, sécurité). Un mauvais climat social déclenche du turnover coûteux et de l'absentéisme.
            </li>
          </ul>
        </div>

        {/* Section 4: Finance & Ratios */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>4. Pilotage Financier & Bilan</span>
          </h3>
          <ul className="space-y-2 leading-relaxed font-sans">
            <li>
              <strong className="text-white">Besoin en Fonds de Roulement (BFR) :</strong> Stocks + Créances clients - Dettes fournisseurs. Surveillez le délai de paiement accordé aux clients pour éviter les crises de liquidités.
            </li>
            <li>
              <strong className="text-white">Trésorerie & Découvert :</strong> Si le solde de caisse devient négatif en fin de trimestre, la banque applique un découvert d'office avec des agios élevés.
            </li>
            <li>
              <strong className="text-white">Capacités d'Emprunt :</strong> Plafonnées par la valeur des capitaux propres et le niveau d'endettement existant. Le taux d'intérêt est révisé chaque trimestre par la banque centrale.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

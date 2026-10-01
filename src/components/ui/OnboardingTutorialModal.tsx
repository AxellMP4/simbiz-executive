import React, { useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, CheckCircle2, GraduationCap, Building2,
  Factory, Users, DollarSign, TrendingUp, ShieldCheck, Sparkles, AlertTriangle, ArrowRight
} from 'lucide-react';
import { CompanySettings, PeriodSnapshot } from '../../types/simulation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGoToDecisions?: () => void;
  snapshot: PeriodSnapshot;
  companySettings: CompanySettings;
}

export const OnboardingTutorialModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onGoToDecisions,
  snapshot,
  companySettings,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(() => {
    return localStorage.getItem('simbiz_tutorial_dismissed') === 'true';
  });

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('simbiz_tutorial_dismissed', 'true');
    } else {
      localStorage.removeItem('simbiz_tutorial_dismissed');
    }
    onClose();
  };

  const firmResult = snapshot.firmsResults['1'] || Object.values(snapshot.firmsResults)[0];
  const currency = companySettings.currency || '€';

  const steps = [
    {
      title: "Bienvenue, Monsieur/Madame le Directeur Général",
      subtitle: "Prise de fonction · Mois 1 (Période 0)",
      badge: "Votre Entreprise",
      icon: Building2,
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      content: (
        <div className="space-y-4 text-xs text-slate-300">
          <p className="text-sm text-slate-200 leading-relaxed">
            Félicitations pour votre nomination à la tête de <strong>{companySettings.companyName}</strong> ! Vous prenez les rênes d'une entreprise industrielle reconnue, réalisant <strong>{(firmResult?.incomeStatement.revenue || 1385000).toLocaleString('fr-FR')} {currency}</strong> de chiffre d'affaires annuel.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-[11px] text-slate-500 block">Trésorerie</span>
              <strong className="text-sm font-mono text-emerald-400">{(firmResult?.cashFlow.closingCash || 425000).toLocaleString('fr-FR')} {currency}</strong>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Effectif</span>
              <strong className="text-sm font-mono text-white">41 salariés</strong>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Machines</span>
              <strong className="text-sm font-mono text-white">5 actives</strong>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Cours Bourse</span>
              <strong className="text-sm font-mono text-amber-400">50.00 {currency}</strong>
            </div>
          </div>
          <div className="rounded-lg bg-indigo-950/30 border border-indigo-800/50 p-3 space-y-1">
            <h4 className="font-bold text-indigo-300 text-xs">Vos 2 Produits Stratégiques :</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• <strong>Produit A</strong> : Composant standard à fort volume (Prix ~96 €, Coût unitaire ~54 €).</li>
              <li>• <strong>Produit B</strong> : Composant de haute précision à forte marge (Prix ~175 €, Coût unitaire ~109 €).</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "L'Usine & la Capacité de Production",
      subtitle: "Gérer l'atelier, les matières et le personnel",
      badge: "Opérations & Atelier",
      icon: Factory,
      iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      content: (
        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            Votre outil industriel compte <strong>5 machines de production</strong>. Chaque machine offre 800 heures d'atelier par mois. La fabrication d'une unité de Produit A requiert 1 heure machine, tandis que le Produit B exige 4 heures machine.
          </p>
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 space-y-2">
            <h4 className="font-bold text-white text-xs">⚠️ Les 3 Règles d'Or de l'Atelier :</h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Matières Premières :</strong> Ne tombez jamais en rupture ! Commandez environ <strong>18 000 unités de MP</strong> par mois pour alimenter vos lignes.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Taux d'utilisation :</strong> Vous pouvez activer les heures supplémentaires (1.05 à 1.15), mais au-delà de 1.20, fatigue ouvrière et rebuts augmentent.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Maintenance Préventive :</strong> Un budget d'entretien préventif évite les pannes imprévues et maintient la qualité.</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "La Stratégie Commerciale & le Marché",
      subtitle: "Conquérir les parts de marché face aux 5 rivaux",
      badge: "Ventes & Marketing",
      icon: Users,
      iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      content: (
        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            Vous vendez sur deux zones géographiques distinctes : le <strong>Marché Local</strong> (forte demande, sensibilité au prix et aux commerciaux) et le <strong>Grand Export</strong> (frais de port, quotas de vente et forte rentabilité sur le Produit B).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <h5 className="font-bold text-white text-xs mb-1">Votre Force de Vente (8 commerciaux)</h5>
              <p className="text-[11px] text-slate-400">
                5 commerciaux couvrent le marché local et 3 opèrent à l'export. Fixez des quotas motivants et des commissions équilibrées (environ 2,50 € à 2,80 € / unité).
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <h5 className="font-bold text-white text-xs mb-1">Le Rôle de la Publicité</h5>
              <p className="text-[11px] text-slate-400">
                Allouer environ 22 000 € de publicité par période renforce votre image de marque face à VoltaCore qui casse les prix et Zenith qui vise le très haut de gamme.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "La Règle d'Or Financière : Préserver le Cash",
      subtitle: "BFR, rentabilité et marge de sécurité",
      badge: "Finances & Trésorerie",
      icon: DollarSign,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      content: (
        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            En simulation d'entreprise, une société rentable sur le papier peut faire faillite si sa trésorerie devient négative. C'est le piège classique du <strong>BFR (Besoin en Fonds de Roulement)</strong>.
          </p>
          <div className="rounded-xl bg-amber-950/20 border border-amber-800/40 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <AlertTriangle className="h-4 w-4" />
              Les 2 Pièges à Éviter Absolument :
            </div>
            <ul className="space-y-1.5 text-[11px] text-amber-200/90">
              <li>• <strong>Le découvert non autorisé :</strong> Vos découverts coûtent 12% d'intérêts et détruisent la notation bancaire.</li>
              <li>• <strong>Les délais clients :</strong> Accorder 60 jours retarde vos encaissements d'un mois complet. Privilégiez 30 jours au départ.</li>
            </ul>
          </div>
          <p className="text-[11px] text-slate-400">
            💡 <em>Conseil : Si vous prévoyez d'acheter de nouvelles machines, souscrivez un prêt moyen terme ou un prêt vert subventionné pour ne pas épuiser vos liquidités.</em>
          </p>
        </div>
      ),
    },
    {
      title: "La Bourse & la RSE (Scores ESG)",
      subtitle: "Valoriser l'action & capter le bonus vert de +8%",
      badge: "Bourse & Climat",
      icon: ShieldCheck,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      content: (
        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            Toutes les 6 firmes débutent sur un pied d'égalité à <strong>50.00 €</strong> par action. Vos performances vont immédiatement créer des écarts concurrentiels majeurs.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <h5 className="font-bold text-white text-xs">Moteurs du Cours de Bourse :</h5>
              <p className="text-[11px] text-slate-400">
                Croissance du résultat net, régularité des dividendes (autour de 20%), part de marché et solidité du bilan.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <h5 className="font-bold text-emerald-400 text-xs">Le Bonus Vert de +8% :</h5>
              <p className="text-[11px] text-slate-400">
                Un budget Éco-conception (> 8k €) et une bonne QVT propulsent votre score ESG (> 70/100) et débloquent <strong>+8% de clients éco-responsables</strong> !
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Votre Premier Cycle de Décisions (Workflow)",
      subtitle: "3 étapes simples pour réussir votre premier mois",
      badge: "Passage à l'Action",
      icon: Sparkles,
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      content: (
        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            Voici la méthode pas-à-pas pour arbitrer la <strong>Période 1</strong> en toute sérénité :
          </p>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">1</span>
              <div>
                <strong className="text-white text-xs block">Régler la Grille de Décisions</strong>
                <p className="text-[11px] text-slate-400">Ajustez vos prix (ex: 96 € pour A, 175 € pour B), commandez vos MP (18 500 unités) et validez la production.</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">2</span>
              <div>
                <strong className="text-white text-xs block">Générer une Prévision sans Risque</strong>
                <p className="text-[11px] text-slate-400">Le bouton "Générer une prévision" vous donne une projection de résultat et de trésorerie avant engagement officiel.</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-black">3</span>
              <div>
                <strong className="text-white text-xs block">Valider et Clôturer le Mois</strong>
                <p className="text-[11px] text-slate-400">Le moteur confronte vos choix à ceux des 5 concurrents, calcule les parts de marché et met à jour le cours de bourse !</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Checklist Recommandée pour le Mois 1 (P1)",
      subtitle: "Paramètres de référence pour démarrer avec rentabilité",
      badge: "Checklist Directeur",
      icon: CheckCircle2,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      content: (
        <div className="space-y-3.5 text-xs text-slate-300">
          <p className="text-slate-300 leading-relaxed">
            Pour réussir votre prise de fonction et éviter les pièges de démarrage (rupture de stock, découvert bancaire, machines sous-utilisées), voici la grille de référence testée et approuvée par le Conseil d'Administration :
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 block">Prix & Marché Local</span>
              <div className="text-[11px] space-y-0.5 font-mono text-slate-200">
                <div className="flex justify-between"><span>Prix Alpha :</span><strong className="text-white">96.00 {currency}</strong></div>
                <div className="flex justify-between"><span>Prix Apex :</span><strong className="text-white">175.00 {currency}</strong></div>
                <div className="flex justify-between"><span>Commerciaux :</span><strong className="text-white">5 vendeurs</strong></div>
                <div className="flex justify-between"><span>Pub Locale :</span><strong className="text-white">14 000 {currency}</strong></div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-sky-400 block">Exportation (International)</span>
              <div className="text-[11px] space-y-0.5 font-mono text-slate-200">
                <div className="flex justify-between"><span>Prix Export A :</span><strong className="text-white">102.00 {currency}</strong></div>
                <div className="flex justify-between"><span>Prix Export B :</span><strong className="text-white">182.00 {currency}</strong></div>
                <div className="flex justify-between"><span>Commerciaux :</span><strong className="text-white">3 vendeurs</strong></div>
                <div className="flex justify-between"><span>Pub Export :</span><strong className="text-white">10 000 {currency}</strong></div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 block">Atelier & Production</span>
              <div className="text-[11px] space-y-0.5 font-mono text-slate-200">
                <div className="flex justify-between"><span>Production A :</span><strong className="text-white">3 400 unités</strong></div>
                <div className="flex justify-between"><span>Production B :</span><strong className="text-white">900 unités</strong></div>
                <div className="flex justify-between"><span>Commande MP :</span><strong className="text-emerald-400">18 500 unités</strong></div>
                <div className="flex justify-between"><span>Maintenance :</span><strong className="text-white">8 000 {currency}</strong></div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-amber-400 block">RSE, RH & Finance</span>
              <div className="text-[11px] space-y-0.5 font-mono text-slate-200">
                <div className="flex justify-between"><span>Éco-conception :</span><strong className="text-emerald-400">9 000 {currency}</strong></div>
                <div className="flex justify-between"><span>Budget R&D :</span><strong className="text-white">20 000 {currency}</strong></div>
                <div className="flex justify-between"><span>Intéressement RH :</span><strong className="text-white">5.0%</strong></div>
                <div className="flex justify-between"><span>Dividendes :</span><strong className="text-white">20%</strong></div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-emerald-950/30 border border-emerald-800/40 p-2.5 flex items-center gap-2 text-[11px] text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Vous êtes paré ! Cliquez ci-dessous pour configurer vos décisions du Mois 1.</span>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];
  const Icon = current.icon;
  const isLast = currentStep === steps.length - 1;

  const handleFinish = () => {
    handleClose();
    if (onGoToDecisions) onGoToDecisions();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${current.iconColor}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-indigo-950 border border-indigo-800 px-2 py-0.5 text-[10px] font-mono text-indigo-300 font-bold">
                  {current.badge}
                </span>
                <span className="text-xs font-mono text-slate-400">Étape {currentStep + 1} / {steps.length}</span>
              </div>
              <h2 className="text-base font-bold font-display text-white mt-0.5">{current.title}</h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="flex h-1.5 w-full bg-slate-800">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-full flex-1 transition-all duration-300 ${idx <= currentStep ? 'bg-indigo-500' : 'bg-transparent'}`}
            />
          ))}
        </div>

        {/* Step Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {current.content}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 px-6 py-4 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={e => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
            />
            <span>Ne plus afficher au démarrage</span>
          </label>

          <div className="flex items-center gap-2 justify-end">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-xs font-bold font-mono text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Précédent
              </button>
            )}

            {!isLast ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold font-mono text-white transition-colors shadow"
              >
                Suivant <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-bold font-mono text-black transition-colors shadow-lg shadow-emerald-950/40"
              >
                Lancer ma Première Période <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

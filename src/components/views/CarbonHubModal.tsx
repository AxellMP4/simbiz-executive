import React, { useState } from 'react';
import { X, Leaf, Zap, Truck, Factory, ShieldAlert, CheckCircle2, TrendingDown, ArrowRight, DollarSign } from 'lucide-react';
import { PeriodSnapshot, CompanySettings } from '../../types/simulation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  snapshot: PeriodSnapshot;
  companySettings: CompanySettings;
}

export const CarbonHubModal: React.FC<Props> = ({
  isOpen,
  onClose,
  snapshot,
  companySettings,
}) => {
  const [activeInitiatives, setActiveInitiatives] = useState<string[]>(['solar_roof']);

  if (!isOpen) return null;

  const firmResult = snapshot.firmsResults['1'] || Object.values(snapshot.firmsResults)[0];
  const prodA = firmResult?.productionReport?.productA?.produced || 3600;
  const prodB = firmResult?.productionReport?.productB?.produced || 950;
  const activeMachines = firmResult?.decisions?.activeMachines || 5;
  const carbonTaxRate = snapshot.marketEnvironment.carbonTaxPerTon || 45;

  // Calculs Bilan Carbone Scope 1, 2, 3
  const rawScope1 = Math.round((prodA * 0.085) + (prodB * 0.16));
  const rawScope2 = Math.round(activeMachines * 38);
  const rawScope3 = Math.round((prodA * 0.11) + (prodB * 0.22) + 65);

  const initiatives = [
    {
      id: 'solar_roof',
      title: 'Centrale Solaire en Toiture Usine',
      scope: 'Scope 2 (-35%)',
      reduction: 0.35,
      scopeTarget: 'scope2',
      cost: 45000,
      annualSavings: 14000,
      esgBonus: 6,
      desc: 'Installation de 1 200 m² de panneaux photovoltaïques pour autoconsommation industrielle.',
    },
    {
      id: 'green_procurement',
      title: 'Approvisionnement Matières Bas-Carbone',
      scope: 'Scope 3 (-30%)',
      reduction: 0.30,
      scopeTarget: 'scope3',
      cost: 32000,
      annualSavings: 18000,
      esgBonus: 8,
      desc: 'Partenariat avec des fournisseurs certifiés ISO 14001 et circuits courts européens.',
    },
    {
      id: 'heat_recovery',
      title: 'Récupération de Chaleur Fatale Usine',
      scope: 'Scope 1 (-40%)',
      reduction: 0.40,
      scopeTarget: 'scope1',
      cost: 28000,
      annualSavings: 11000,
      esgBonus: 5,
      desc: 'Captation et réinjection des rejets thermiques des presses pour chauffer les ateliers.',
    },
    {
      id: 'eco_fleet',
      title: 'Flotte Logistique Électrique & Bio-GNV',
      scope: 'Scope 3 (-20%)',
      reduction: 0.20,
      scopeTarget: 'scope3',
      cost: 22000,
      annualSavings: 8500,
      esgBonus: 4,
      desc: 'Remplacement des camions diesel affrétés par une flotte hybride et électrique.',
    },
  ];

  // Calcul avec initiatives actives
  let s1Reduction = 0;
  let s2Reduction = 0;
  let s3Reduction = 0;

  activeInitiatives.forEach(id => {
    const init = initiatives.find(i => i.id === id);
    if (!init) return;
    if (init.scopeTarget === 'scope1') s1Reduction += init.reduction;
    if (init.scopeTarget === 'scope2') s2Reduction += init.reduction;
    if (init.scopeTarget === 'scope3') s3Reduction += init.reduction;
  });

  const scope1 = Math.round(rawScope1 * (1 - s1Reduction));
  const scope2 = Math.round(rawScope2 * (1 - s2Reduction));
  const scope3 = Math.round(rawScope3 * (1 - s3Reduction));
  const totalEmissions = scope1 + scope2 + scope3;
  const initialTotal = rawScope1 + rawScope2 + rawScope3;
  const savedTons = initialTotal - totalEmissions;
  const carbonTaxCost = Math.round(totalEmissions * carbonTaxRate);
  const taxSavings = Math.round(savedTons * carbonTaxRate);

  const toggleInitiative = (id: string) => {
    setActiveInitiatives(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-white">Hub Décarbonation & Bilan Carbone</h2>
                <span className="rounded-full bg-emerald-950 border border-emerald-800 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                  CSRD & GHG Protocol
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mesure certifiée Scope 1, 2 et 3 · Taxe carbone européenne à {carbonTaxRate} € / tonne CO₂
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

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                Total Émissions
                <TrendingDown className="h-4 w-4 text-emerald-400" />
              </span>
              <strong className="mt-2 block text-2xl font-mono text-white">{totalEmissions} <span className="text-xs font-normal text-slate-400">t CO₂</span></strong>
              <span className="text-[11px] font-mono text-emerald-400">
                -{savedTons} t évitées ({Math.round((savedTons / initialTotal) * 100)}%)
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                Scope 1 (Direct usine)
                <Factory className="h-4 w-4 text-amber-400" />
              </span>
              <strong className="mt-2 block text-2xl font-mono text-white">{scope1} <span className="text-xs font-normal text-slate-400">t CO₂</span></strong>
              <span className="text-[11px] text-slate-400">Combustion & procédés</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                Scope 2 (Électricité)
                <Zap className="h-4 w-4 text-indigo-400" />
              </span>
              <strong className="mt-2 block text-2xl font-mono text-white">{scope2} <span className="text-xs font-normal text-slate-400">t CO₂</span></strong>
              <span className="text-[11px] text-slate-400">{activeMachines} machines actives</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                Scope 3 (Supply Chain)
                <Truck className="h-4 w-4 text-purple-400" />
              </span>
              <strong className="mt-2 block text-2xl font-mono text-white">{scope3} <span className="text-xs font-normal text-slate-400">t CO₂</span></strong>
              <span className="text-[11px] text-slate-400">Fret, emballage & export</span>
            </div>
          </div>

          {/* Taxe Carbone Alert Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-amber-800/60 bg-amber-950/30 p-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-amber-200">Impact Financier de la Taxe Carbone</h4>
                <p className="text-xs text-amber-300/80">
                  Votre redevance s'élève à <strong>{carbonTaxCost.toLocaleString('fr-FR')} {companySettings.currency}</strong> cette période. Vos initiatives ont déjà économisé <strong>{taxSavings.toLocaleString('fr-FR')} {companySettings.currency}</strong>.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-amber-400 font-mono block">Bonus vert activé</span>
              <strong className="text-emerald-400 font-mono">+{snapshot.marketEnvironment.greenDemandBonus}% demande</strong>
            </div>
          </div>

          {/* Transition Roadmap & Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white font-display">Leviers d'Investissement Bas-Carbone</h3>
              <span className="text-xs text-slate-400">Cliquez pour simuler l'activation des programmes</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {initiatives.map(init => {
                const isActive = activeInitiatives.includes(init.id);
                return (
                  <div
                    key={init.id}
                    onClick={() => toggleInitiative(init.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${isActive ? 'border-emerald-600 bg-emerald-950/20 shadow-lg shadow-emerald-950/30' : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${isActive ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <h4 className="text-xs font-bold text-white">{init.title}</h4>
                      </div>
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400 font-semibold">
                        {init.scope}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-400">{init.desc}</p>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px] font-mono">
                      <span className="text-slate-400">Investissement : <strong className="text-white">{init.cost.toLocaleString('fr-FR')} {companySettings.currency}</strong></span>
                      <span className="text-emerald-400 font-semibold">+{init.esgBonus} pts RSE</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 px-6 py-4 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Les réductions de tonnes allègent directement les débours de trésorerie en période suivante.
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition-colors"
          >
            Fermer le Hub
          </button>
        </div>
      </div>
    </div>
  );
};

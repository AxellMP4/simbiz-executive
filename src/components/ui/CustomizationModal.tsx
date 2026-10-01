import React, { useState } from 'react';
import {
  CompanySettings,
  IndustrySector,
  CeoPersona
} from '../../types/simulation';
import {
  INDUSTRY_SECTORS,
  CEO_PERSONAS,
} from '../../data/customizationData';
import {
  Building2,
  X,
  Sparkles,
  Check,
  Palette,
  Briefcase,
  UserCheck,
  DollarSign,
  Cpu,
  Rocket,
  Shield,
  Zap,
  Bot,
  Leaf
} from 'lucide-react';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CompanySettings;
  onSave: (newSettings: CompanySettings) => void;
}

const BRAND_COLORS = [
  { name: 'Indigo Corporate', hex: '#6366f1' },
  { name: 'Émeraude Green', hex: '#10b981' },
  { name: 'Bleu Cyan Tech', hex: '#06b6d4' },
  { name: 'Ambre Gold', hex: '#f59e0b' },
  { name: 'Violet Royal', hex: '#8b5cf6' },
  { name: 'Rose Titanium', hex: '#ec4899' },
];

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [activeTab, setActiveTab] = useState<'identity' | 'sector' | 'ceo' | 'branding'>('identity');

  if (!isOpen) return null;

  const handleSectorSelect = (sectorKey: IndustrySector) => {
    const sector = INDUSTRY_SECTORS[sectorKey];
    setFormData(prev => ({
      ...prev,
      industrySector: sectorKey,
      sectorName: sector.name,
      productAName: sector.productAName,
      productBName: sector.productBName,
      productADesc: sector.productADesc,
      productBDesc: sector.productBDesc,
      brandColor: sector.defaultColor,
    }));
  };

  const handleCeoSelect = (ceoKey: CeoPersona) => {
    setFormData(prev => ({
      ...prev,
      ceoPersona: ceoKey,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold font-display shadow-md"
              style={{ backgroundColor: formData.brandColor }}
            >
              {formData.logoIcon === 'cpu' && <Cpu className="w-5 h-5" />}
              {formData.logoIcon === 'rocket' && <Rocket className="w-5 h-5" />}
              {formData.logoIcon === 'shield' && <Shield className="w-5 h-5" />}
              {formData.logoIcon === 'zap' && <Zap className="w-5 h-5" />}
              {formData.logoIcon === 'bot' && <Bot className="w-5 h-5" />}
              {formData.logoIcon === 'leaf' && <Leaf className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">
                Personnalisation de l'Entreprise
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Façonnez l'identité, le secteur industriel, vos gammes de produits et le profil du DG
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 text-xs font-medium font-display">
          <button
            onClick={() => setActiveTab('identity')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'identity'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Identité & Produits</span>
          </button>
          <button
            onClick={() => setActiveTab('sector')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'sector'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Secteur Industriel</span>
          </button>
          <button
            onClick={() => setActiveTab('ceo')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'ceo'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Profil du DG (Persona)</span>
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'branding'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Marque & Devise</span>
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: IDENTITY & PRODUCTS */}
          {activeTab === 'identity' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nom de l'Entreprise
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-display text-sm focus:border-indigo-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Symbole Boursier
                  </label>
                  <input
                    type="text"
                    value={formData.tickerSymbol}
                    onChange={e => setFormData({ ...formData, tickerSymbol: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-indigo-500 focus:outline-hidden uppercase"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400 font-display">
                  <Sparkles className="w-4 h-4" />
                  <span>Personnalisation de vos 2 Produits Fabricables</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Produit A (Volume / Standard)</span>
                    <input
                      type="text"
                      value={formData.productAName}
                      onChange={e => setFormData({ ...formData, productAName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-semibold focus:border-indigo-500 focus:outline-hidden"
                      placeholder="Nom du produit A"
                    />
                    <textarea
                      value={formData.productADesc}
                      onChange={e => setFormData({ ...formData, productADesc: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-[11px] text-slate-300 resize-none h-14 focus:border-indigo-500 focus:outline-hidden"
                      placeholder="Description courte du produit A"
                    />
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">Produit B (Haut de Gamme / Apex)</span>
                    <input
                      type="text"
                      value={formData.productBName}
                      onChange={e => setFormData({ ...formData, productBName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-semibold focus:border-indigo-500 focus:outline-hidden"
                      placeholder="Nom du produit B"
                    />
                    <textarea
                      value={formData.productBDesc}
                      onChange={e => setFormData({ ...formData, productBDesc: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-[11px] text-slate-300 resize-none h-14 focus:border-indigo-500 focus:outline-hidden"
                      placeholder="Description courte du produit B"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECTOR SELECTION */}
          {activeTab === 'sector' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Sélectionnez un secteur d'activité pour adapter automatiquement la nomenclature des produits, l'écosystème concurrentiel et l'ambiance sectorielle :
              </p>
              <div className="grid grid-cols-1 gap-3">
                {(Object.keys(INDUSTRY_SECTORS) as IndustrySector[]).map(sectorKey => {
                  const sec = INDUSTRY_SECTORS[sectorKey];
                  const isSelected = formData.industrySector === sectorKey;
                  return (
                    <div
                      key={sectorKey}
                      onClick={() => handleSectorSelect(sectorKey)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: sec.defaultColor }}
                          />
                          <span className="font-bold text-sm text-white font-display">
                            {sec.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {sec.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">{sec.description}</p>
                      <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                        <span>
                          Produit A : <strong className="text-slate-200">{sec.productAName}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Produit B : <strong className="text-purple-300">{sec.productBName}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CEO PERSONA */}
          {activeTab === 'ceo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nom du Directeur Général / Mandataire Social
                </label>
                <input
                  type="text"
                  value={formData.ceoName}
                  onChange={e => setFormData({ ...formData, ceoName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-display text-sm focus:border-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-2.5">
                <span className="text-xs font-semibold text-slate-300 block">
                  Style de Leadership & Bonus Stratégique (Perk)
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  {(Object.keys(CEO_PERSONAS) as CeoPersona[]).map(ceoKey => {
                    const persona = CEO_PERSONAS[ceoKey];
                    const isSelected = formData.ceoPersona === ceoKey;
                    return (
                      <div
                        key={ceoKey}
                        onClick={() => handleCeoSelect(ceoKey)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-amber-950/20 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                            : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-2xl p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                          {persona.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white font-display">
                              {persona.name}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/80 font-bold">
                              {persona.bonusSummary}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{persona.description}</p>
                          <div className="text-[11px] text-amber-300 font-semibold mt-1.5 flex items-center gap-1 font-mono">
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                            <span>Avantage DG : {persona.perk}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BRANDING & CURRENCY */}
          {activeTab === 'branding' && (
            <div className="space-y-5">
              {/* Brand color */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Couleur Corporative de l'Entreprise
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {BRAND_COLORS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setFormData({ ...formData, brandColor: c.hex })}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        formData.brandColor === c.hex
                          ? 'border-white bg-slate-800 ring-2 ring-white/30'
                          : 'border-slate-800 bg-slate-950 hover:bg-slate-900'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full shadow"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[10px] text-slate-300 font-mono text-center">
                        {c.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo icon */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Icône Corporative
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {[
                    { id: 'cpu', icon: Cpu, label: 'IoT / Tech' },
                    { id: 'rocket', icon: Rocket, label: 'Aérospatial' },
                    { id: 'shield', icon: Shield, label: 'Défense' },
                    { id: 'zap', icon: Zap, label: 'Énergie' },
                    { id: 'bot', icon: Bot, label: 'Robotique' },
                    { id: 'leaf', icon: Leaf, label: 'CleanTech' },
                  ].map(item => {
                    const IconComp = item.icon;
                    const isSelected = formData.logoIcon === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, logoIcon: item.id as any })}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 ring-1 ring-indigo-500'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                        <span className="text-[9px] font-mono">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Devise Monétaire
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { sym: '€', label: 'Euro (EUR)' },
                    { sym: '$', label: 'Dollar (USD)' },
                    { sym: '£', label: 'Livre (GBP)' },
                    { sym: 'CHF', label: 'Franc Suisse' },
                  ].map(cur => (
                    <button
                      key={cur.sym}
                      type="button"
                      onClick={() => setFormData({ ...formData, currency: cur.sym as any })}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        formData.currency === cur.sym
                          ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <span className="text-base font-bold block">{cur.sym}</span>
                      <span className="text-[10px] font-mono text-slate-400">{cur.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Save & Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-display tracking-wide shadow-lg shadow-indigo-950 transition-all flex items-center gap-2 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer les Modifications</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

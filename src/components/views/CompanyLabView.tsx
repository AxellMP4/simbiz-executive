import React, { useState } from 'react';
import { CompanySettings } from '../../types/simulation';
import { CEO_PERSONAS, INDUSTRY_SECTORS } from '../../data/customizationData';

interface Props {
  settings: CompanySettings;
  onSave: (settings: CompanySettings) => void;
}

export const CompanyLabView: React.FC<Props> = ({ settings, onSave }) => {
  const [draft, setDraft] = useState(settings);
  const update = <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) =>
    setDraft(prev => ({ ...prev, [key]: value }));
  const sectors = Object.entries(INDUSTRY_SECTORS) as Array<[CompanySettings['industrySector'], typeof INDUSTRY_SECTORS[CompanySettings['industrySector']]]>;
  return (
    <section className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Company Lab</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">Votre atelier de direction : identité, structure et doctrine stratégique restent attachées à la partie.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-white">Identité & marché</h2>
            <label className="block text-xs text-slate-400">Nom de l'entreprise<input value={draft.companyName} onChange={e => update('companyName', e.target.value)} className="lab-input" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs text-slate-400">Ticker<input value={draft.tickerSymbol} onChange={e => update('tickerSymbol', e.target.value.toUpperCase().slice(0, 8))} className="lab-input" /></label>
              <label className="block text-xs text-slate-400">Pays<input value={draft.country || ''} onChange={e => update('country', e.target.value)} className="lab-input" /></label>
            </div>
            <label className="block text-xs text-slate-400">Secteur<select value={draft.industrySector} onChange={e => {
              const sector = e.target.value as CompanySettings['industrySector'];
              const info = INDUSTRY_SECTORS[sector];
              setDraft(prev => ({ ...prev, industrySector: sector, sectorName: info.name, productAName: info.productAName, productBName: info.productBName, productADesc: info.productADesc, productBDesc: info.productBDesc, brandColor: info.defaultColor }));
            }} className="lab-input">{sectors.map(([id, info]) => <option key={id} value={id}>{info.name}</option>)}</select></label>
            <label className="block text-xs text-slate-400">Périmètre<select value={draft.marketScope || 'europe'} onChange={e => update('marketScope', e.target.value as CompanySettings['marketScope'])} className="lab-input"><option value="local">Local</option><option value="europe">Europe</option><option value="global">Mondial</option></select></label>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-white">Doctrine du dirigeant</h2>
            <label className="block text-xs text-slate-400">CEO<input value={draft.ceoName} onChange={e => update('ceoName', e.target.value)} className="lab-input" /></label>
            <label className="block text-xs text-slate-400">Persona<select value={draft.ceoPersona} onChange={e => update('ceoPersona', e.target.value as CompanySettings['ceoPersona'])} className="lab-input">{Object.entries(CEO_PERSONAS).map(([id, persona]) => <option key={id} value={id}>{persona.name}</option>)}</select></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs text-slate-400">Appétit risque<select value={draft.riskAppetite || 'balanced'} onChange={e => update('riskAppetite', e.target.value as CompanySettings['riskAppetite'])} className="lab-input"><option value="prudent">Prudent</option><option value="balanced">Équilibré</option><option value="offensive">Offensif</option></select></label>
              <label className="block text-xs text-slate-400">Organisation<select value={draft.orgStructure || 'functional'} onChange={e => update('orgStructure', e.target.value as CompanySettings['orgStructure'])} className="lab-input"><option value="functional">Fonctionnelle</option><option value="divisional">Divisionnelle</option><option value="matrix">Matricielle</option><option value="holacratic">Holacratique</option></select></label>
            </div>
            <label className="block text-xs text-slate-400">Préférence fournisseurs<select value={draft.supplierPreference || 'balanced'} onChange={e => update('supplierPreference', e.target.value as CompanySettings['supplierPreference'])} className="lab-input"><option value="local">Local</option><option value="balanced">Mixte</option><option value="global">Mondial</option></select></label>
          </div>
        </div>
        <div className="flex justify-end"><button onClick={() => onSave(draft)} className="px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold">Enregistrer le profil</button></div>
      </div>
    </section>
  );
};

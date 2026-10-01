import React, { useMemo, useState } from 'react';
import { Activity, Bell, Download, Eye, EyeOff, LineChart, Newspaper, ShieldCheck, Wallet, X } from 'lucide-react';
import { CompanySettings, PeriodSnapshot } from '../../types/simulation';
import {
  executeOrder,
  FinancialMarketState,
  instrumentsFromSnapshot,
  portfolioValue,
  unrealizedPnl,
  validateOrder,
} from '../../domain/financialMarket';

interface FinancialMarketViewProps {
  snapshot: PeriodSnapshot;
  previousSnapshot?: PeriodSnapshot;
  state: FinancialMarketState;
  companySettings?: CompanySettings;
  onStateChange: (state: FinancialMarketState) => void;
  onSelectFirm: (firmId: string) => void;
}

const money = (value: number) => `${value.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`;

export const FinancialMarketView: React.FC<FinancialMarketViewProps> = ({
  snapshot, previousSnapshot, state, companySettings, onStateChange, onSelectFirm,
}) => {
  const instruments = useMemo(() => instrumentsFromSnapshot(snapshot, companySettings), [snapshot, companySettings]);
  const [selectedFirmId, setSelectedFirmId] = useState(instruments[0]?.firmId || '1');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(10);
  const [notice, setNotice] = useState<string | null>(null);
  const [watchOnly, setWatchOnly] = useState(false);
  const selected = instruments.find((instrument) => instrument.firmId === selectedFirmId) || instruments[0];
  const marketValue = portfolioValue(state, instruments);
  const pnl = unrealizedPnl(state, instruments);
  const index = instruments.length ? instruments.reduce((sum, item) => sum + item.price, 0) / instruments.length : 0;
  const previousIndex = instruments.length ? instruments.reduce((sum, item) => sum + item.previousClose, 0) / instruments.length : 0;
  const indexChange = previousIndex ? ((index - previousIndex) / previousIndex) * 100 : 0;
  const validation = selected ? validateOrder(state, instruments, { side, firmId: selected.firmId, quantity }) : null;

  const toggleWatch = (firmId: string) => {
    onStateChange({
      ...state,
      watchlist: state.watchlist.includes(firmId) ? state.watchlist.filter((id) => id !== firmId) : [...state.watchlist, firmId],
    });
  };

  const placeOrder = () => {
    if (!selected || !validation?.valid) {
      setNotice(validation?.message || 'Sélectionnez une valeur cotée.');
      return;
    }
    if (!window.confirm(`${side === 'buy' ? 'Acheter' : 'Vendre'} ${quantity} ${selected.symbol} à ${money(selected.price)} ?`)) return;
    try {
      onStateChange(executeOrder(state, instruments, { side, firmId: selected.firmId, quantity }, snapshot.period, new Date().toISOString()));
      setNotice(`Ordre exécuté · ${side === 'buy' ? 'Achat' : 'Vente'} de ${quantity} ${selected.symbol}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Ordre refusé.');
    }
  };

  const exportPortfolio = (format: 'csv' | 'json') => {
    const data = state.positions.map((position) => {
      const instrument = instruments.find((item) => item.firmId === position.firmId);
      return { ...position, cours: instrument?.price || 0, valeur: (instrument?.price || 0) * position.quantity };
    });
    const content = format === 'json'
      ? JSON.stringify({ cash: state.cash, positions: data, transactions: state.transactions }, null, 2)
      : ['Symbole;Quantité;PRU;Cours;Valeur', ...data.map((item) => `${item.symbol};${item.quantity};${item.averageCost};${item.cours};${item.valeur}`)].join('\n');
    const anchor = document.createElement('a');
    anchor.href = `data:${format === 'json' ? 'application/json' : 'text/csv'};charset=utf-8,${encodeURIComponent(content)}`;
    anchor.download = `marche-simbiz-p${snapshot.period}.${format}`;
    anchor.click();
  };

  const visibleInstruments = watchOnly ? instruments.filter((instrument) => state.watchlist.includes(instrument.firmId)) : instruments;
  const sectors = Array.from(new Set(instruments.map((instrument) => instrument.sector)));

  return (
    <div className="financial-market-view flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
      <header className="market-hero flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="market-status-line"><span className="market-live-dot" /> Marché SIMBIX · Période {snapshot.period}</div>
          <h1 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-white">Marchés financiers</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">Un marché simulé, déterministe et pédagogique. Les transactions influencent uniquement votre portefeuille, jamais les résultats opérationnels.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="market-action" onClick={() => exportPortfolio('csv')}><Download className="w-3.5 h-3.5" /> Export CSV</button>
          <button className="market-action" onClick={() => exportPortfolio('json')}><Download className="w-3.5 h-3.5" /> Export JSON</button>
        </div>
      </header>

      <section className="market-overview-grid">
        <article className="market-overview-panel market-overview-panel--index">
          <div className="market-panel-label"><LineChart className="w-4 h-4" /> Indice SIMBIX-6</div>
          <strong>{index.toFixed(2)} pts</strong>
          <span className={indexChange >= 0 ? 'market-positive' : 'market-negative'}>{indexChange >= 0 ? '+' : ''}{indexChange.toFixed(2)}% · réalisé P.{snapshot.period}</span>
        </article>
        <article className="market-overview-panel">
          <div className="market-panel-label"><Wallet className="w-4 h-4" /> Liquidités de marché</div>
          <strong>{money(state.cash)}</strong>
          <span>Capital initial · {money(state.initialCash)}</span>
        </article>
        <article className="market-overview-panel">
          <div className="market-panel-label"><Activity className="w-4 h-4" /> Portefeuille</div>
          <strong>{money(marketValue + state.cash)}</strong>
          <span className={pnl >= 0 ? 'market-positive' : 'market-negative'}>{pnl >= 0 ? '+' : ''}{money(pnl)} latent</span>
        </article>
        <article className="market-overview-panel">
          <div className="market-panel-label"><ShieldCheck className="w-4 h-4" /> Risque</div>
          <strong>{Math.round(instruments.reduce((sum, item) => sum + Math.abs(item.changePercent), 0) / Math.max(1, instruments.length))}%</strong>
          <span>Volatilité moyenne · indicateur pédagogique</span>
        </article>
      </section>

      {notice && <div className="market-notice" role="status">{notice}<button onClick={() => setNotice(null)} aria-label="Fermer"><X className="w-3.5 h-3.5" /></button></div>}

      <div className="market-main-grid">
        <section className="market-panel market-quotes-panel">
          <div className="market-panel-heading">
            <div><h2>Cotations et secteurs</h2><p>Variation par rapport au dernier cours réalisé.</p></div>
            <button className="market-filter" onClick={() => setWatchOnly(!watchOnly)}>{watchOnly ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />} {watchOnly ? 'Watchlist' : 'Toutes les valeurs'}</button>
          </div>
          <div className="market-sector-strip">{sectors.map((sector) => <span key={sector}>{sector} · {instruments.filter((item) => item.sector === sector).length}</span>)}</div>
          <div className="market-quotes-table">
            {visibleInstruments.map((instrument) => {
              const positive = instrument.changePercent >= 0;
              const max = Math.max(...instrument.history);
              return (
                <button key={instrument.firmId} className={`market-quote-row ${selectedFirmId === instrument.firmId ? 'is-selected' : ''}`} onClick={() => { setSelectedFirmId(instrument.firmId); onSelectFirm(instrument.firmId); }}>
                  <span className="market-quote-name"><strong>{instrument.symbol}</strong><small>{instrument.name} · {instrument.sector}</small></span>
                  <span className="market-sparkline" aria-label={`Historique ${instrument.symbol}`}>{instrument.history.map((point, i) => <i key={i} style={{ height: `${Math.max(18, point / max * 100)}%` }} />)}</span>
                  <span className="market-quote-price">{instrument.price.toFixed(2)} €<small>{instrument.volume.toLocaleString('fr-FR')} titres</small></span>
                  <span className={positive ? 'market-positive' : 'market-negative'}>{positive ? '+' : ''}{instrument.changePercent.toFixed(2)}%</span>
                  <span className="market-watch" onClick={(event) => { event.stopPropagation(); toggleWatch(instrument.firmId); }}>{state.watchlist.includes(instrument.firmId) ? <Bell className="w-3.5 h-3.5 text-amber-300" /> : <Bell className="w-3.5 h-3.5 text-slate-600" />}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="market-panel market-order-panel">
          <div className="market-panel-heading"><div><h2>Passer un ordre</h2><p>Exécution instantanée au dernier cours simulé.</p></div><Wallet className="w-5 h-5 text-amber-300" /></div>
          <div className="market-segmented"><button className={side === 'buy' ? 'active-buy' : ''} onClick={() => setSide('buy')}>Acheter</button><button className={side === 'sell' ? 'active-sell' : ''} onClick={() => setSide('sell')}>Vendre</button></div>
          <label className="market-field">Valeur<select value={selectedFirmId} onChange={(event) => setSelectedFirmId(event.target.value)}>{instruments.map((instrument) => <option key={instrument.firmId} value={instrument.firmId}>{instrument.symbol} · {instrument.price.toFixed(2)} €</option>)}</select></label>
          <label className="market-field">Quantité<input min="1" step="1" type="number" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} /></label>
          <div className="market-order-summary"><span>Montant estimé</span><strong>{money(validation?.estimatedTotal || 0)}</strong><small>Frais de courtage · {money(validation?.fees || 0)}</small></div>
          <button className={`market-submit ${side === 'sell' ? 'market-submit--sell' : ''}`} onClick={placeOrder}>{side === 'buy' ? 'Confirmer l’achat' : 'Confirmer la vente'}</button>
          {validation && !validation.valid && <p className="market-error">{validation.message}</p>}
          <p className="market-disclaimer">Simulation uniquement · aucun conseil financier réel.</p>
        </section>
      </div>

      <div className="market-bottom-grid">
        <section className="market-panel">
          <div className="market-panel-heading"><div><h2>Positions</h2><p>Réalisé vs latent, au cours de la période.</p></div></div>
          {state.positions.length === 0 ? <p className="market-empty">Aucune position. Utilisez le ticket pour investir une partie des {money(state.initialCash)} initiaux.</p> : <div className="market-positions">{state.positions.map((position) => { const instrument = instruments.find((item) => item.firmId === position.firmId); const value = (instrument?.price || 0) * position.quantity; const positionPnl = (instrument?.price || position.averageCost) - position.averageCost; return <div className="market-position-row" key={position.firmId}><span><strong>{position.symbol}</strong><small>{position.quantity} titres · PRU {position.averageCost.toFixed(2)} €</small></span><span>{money(value)}</span><span className={positionPnl >= 0 ? 'market-positive' : 'market-negative'}>{positionPnl >= 0 ? '+' : ''}{positionPnl.toFixed(2)} €/titre</span></div>; })}</div>}
        </section>
        <section className="market-panel">
          <div className="market-panel-heading"><div><h2>Actualités & facteurs</h2><p>Lecture explicable du moteur de marché.</p></div><Newspaper className="w-5 h-5 text-amber-300" /></div>
          <div className="market-news"><strong>{snapshot.marketEnvironment.headlineNews || 'Marché en observation'}</strong><span>{snapshot.marketEnvironment.specialEventTitle || 'Aucun événement exceptionnel cette période'}</span><small>{snapshot.marketEnvironment.economicOutlook === 'expansion' ? 'Conjoncture : expansion' : snapshot.marketEnvironment.economicOutlook === 'slowdown' ? 'Conjoncture : ralentissement' : 'Conjoncture : stable'} · prévision et réalisé sont séparés</small></div>
          <div className="market-driver-list">{instruments.slice(0, 4).map((instrument) => <div key={instrument.firmId}><span>{instrument.symbol}</span><small>{instrument.driver}</small></div>)}</div>
        </section>
        <section className="market-panel">
          <div className="market-panel-heading"><div><h2>Journal des transactions</h2><p>Historique local de votre portefeuille.</p></div></div>
          {state.transactions.length === 0 ? <p className="market-empty">Les ordres exécutés apparaîtront ici.</p> : <div className="market-transactions">{state.transactions.slice(0, 5).map((transaction) => <div key={transaction.id}><span className={transaction.side === 'buy' ? 'market-buy-tag' : 'market-sell-tag'}>{transaction.side === 'buy' ? 'ACHAT' : 'VENTE'}</span><strong>{transaction.quantity} {transaction.symbol}</strong><small>{money(transaction.total)} · P.{transaction.period}</small></div>)}</div>}
        </section>
      </div>
      {previousSnapshot && <p className="market-footnote">Cours affichés : réalisé P.{snapshot.period}. La période précédente P.{previousSnapshot.period} sert uniquement de référence de variation.</p>}
    </div>
  );
};

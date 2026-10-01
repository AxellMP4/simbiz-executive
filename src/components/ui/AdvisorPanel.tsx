import React from 'react';
import { ArrowRight, Check, ChevronDown, Lightbulb, ShieldAlert, X } from 'lucide-react';
import { AdvisorRecommendation } from '../../domain/managementAdvisor';

interface AdvisorPanelProps {
  recommendations: AdvisorRecommendation[];
  open: boolean;
  compact?: boolean;
  onToggle: () => void;
  onNavigate: (target: AdvisorRecommendation['targetTab']) => void;
  onDismiss: (id: string) => void;
}

const severityLabel = { critical: 'Critique', warning: 'À surveiller', opportunity: 'Levier', info: 'Repère' };

export const AdvisorPanel: React.FC<AdvisorPanelProps> = ({
  recommendations, open, compact = false, onToggle, onNavigate, onDismiss,
}) => {
  const criticalCount = recommendations.filter(recommendation => recommendation.critical).length;
  const primary = recommendations[0];
  return (
    <div className={`advisor-panel ${compact ? 'advisor-panel--compact' : ''}`}>
      <button className="advisor-trigger" onClick={onToggle} aria-expanded={open} aria-controls="advisor-panel-content">
        <span className="advisor-trigger__icon"><Lightbulb className="h-4 w-4" /></span>
        <span className="min-w-0 text-left">
          <strong>Conseiller</strong>
          <span>{criticalCount > 0 ? `${criticalCount} alerte${criticalCount > 1 ? 's' : ''} prioritaire${criticalCount > 1 ? 's' : ''}` : `${recommendations.length} piste${recommendations.length > 1 ? 's' : ''} pour cette période`}</span>
        </span>
        {criticalCount > 0 && <span className="advisor-count">{criticalCount}</span>}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {!open && primary && (
        <button className="advisor-teaser" onClick={onToggle}>
          <span className={`advisor-severity advisor-severity--${primary.severity}`} />
          <span className="truncate">{primary.title}</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0" />
        </button>
      )}
      {open && (
        <div id="advisor-panel-content" className="advisor-panel__content">
          <div className="advisor-panel__heading">
            <div><span className="advisor-kicker">Lecture déterministe · Période en cours</span><h2>Les prochains arbitrages</h2></div>
            <button className="icon-button" onClick={onToggle} aria-label="Fermer le conseiller"><X className="h-4 w-4" /></button>
          </div>
          {recommendations.length === 0 && <p className="advisor-empty">Aucun signal prioritaire. Les indicateurs sont sous contrôle.</p>}
          <div className="advisor-list">
            {recommendations.map(recommendation => (
              <article key={recommendation.id} className={`advisor-item advisor-item--${recommendation.severity}`}>
                <div className="advisor-item__marker">{recommendation.critical ? <ShieldAlert className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><span className="advisor-severity-label">{severityLabel[recommendation.severity]}</span><h3>{recommendation.title}</h3></div>
                  <p>{recommendation.rationale}</p>
                  <span className="advisor-impact">Impact attendu · {recommendation.expectedImpact}</span>
                  <div className="mt-2 flex items-center gap-2">
                    <button className="advisor-action" onClick={() => onNavigate(recommendation.targetTab)}>{recommendation.actionLabel}<ArrowRight className="h-3.5 w-3.5" /></button>
                    {!recommendation.critical && <button className="advisor-dismiss" onClick={() => onDismiss(recommendation.id)}><Check className="h-3.5 w-3.5" /> Marquer traité</button>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

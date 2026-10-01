import React from 'react';
import {
  Lightbulb,
  ShieldAlert,
  X,
  ArrowRight,
  Check,
  Sparkles,
  AlertTriangle,
  Zap,
  TrendingUp,
  Target
} from 'lucide-react';
import { AdvisorRecommendation } from '../../domain/managementAdvisor';

interface AdvisorDrawerProps {
  open: boolean;
  onClose: () => void;
  recommendations: AdvisorRecommendation[];
  onNavigate: (target: AdvisorRecommendation['targetTab']) => void;
  onDismiss: (id: string) => void;
}

const severityConfig: Record<
  AdvisorRecommendation['severity'],
  { label: string; bg: string; text: string; border: string; glow: string; icon: React.FC<{ className?: string }> }
> = {
  critical: {
    label: 'Critique',
    bg: 'bg-rose-950/40',
    text: 'text-rose-300',
    border: 'border-rose-500/60',
    glow: 'shadow-rose-500/20',
    icon: ShieldAlert,
  },
  warning: {
    label: 'Point d\'attention',
    bg: 'bg-amber-950/40',
    text: 'text-amber-300',
    border: 'border-amber-500/60',
    glow: 'shadow-amber-500/20',
    icon: AlertTriangle,
  },
  opportunity: {
    label: 'Opportunité',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-300',
    border: 'border-emerald-500/60',
    glow: 'shadow-emerald-500/20',
    icon: TrendingUp,
  },
  info: {
    label: 'Repère tactique',
    bg: 'bg-cyan-950/40',
    text: 'text-cyan-300',
    border: 'border-cyan-500/60',
    glow: 'shadow-cyan-500/20',
    icon: Target,
  },
};

export const AdvisorDrawer: React.FC<AdvisorDrawerProps> = ({
  open,
  onClose,
  recommendations,
  onNavigate,
  onDismiss,
}) => {
  if (!open) return null;

  const criticalCount = recommendations.filter(r => r.critical || r.severity === 'critical').length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="advisor-title"
          className="w-screen max-w-md bg-slate-950 border-l border-purple-500/40 shadow-2xl flex flex-col text-slate-100 z-10"
          style={{
            boxShadow: '-10px 0 35px rgba(176, 38, 255, 0.15)',
          }}
        >
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400">
                <Sparkles className="w-4 h-4 text-purple-300" />
              </div>
              <div>
                <h2 id="advisor-title" className="text-base font-bold font-display text-white">
                  Conseiller Stratégique
                </h2>
                <p className="text-[11px] font-mono text-purple-300">
                  {criticalCount > 0
                    ? `${criticalCount} alerte${criticalCount > 1 ? 's' : ''} prioritaire${criticalCount > 1 ? 's' : ''}`
                    : `${recommendations.length} recommandations en cours`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Fermer le panneau"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-sm text-white">
                  Tous les indicateurs sont au vert
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Aucun déséquilibre majeur détecté. Vos marges, votre trésorerie et vos capacités sont sous contrôle.
                </p>
              </div>
            ) : (
              recommendations.map(rec => {
                const conf = severityConfig[rec.severity] || severityConfig.info;
                const Icon = conf.icon;

                return (
                  <article
                    key={rec.id}
                    className={`rounded-2xl border ${conf.bg} ${conf.border} p-4 space-y-3 transition-all hover:scale-[1.01]`}
                    style={{
                      boxShadow: rec.critical ? '0 0 18px rgba(244, 63, 94, 0.15)' : undefined,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 shrink-0 ${conf.text}`} />
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${conf.bg} ${conf.text} ${conf.border}`}>
                          {conf.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {rec.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white font-display">
                        {rec.title}
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        {rec.rationale}
                      </p>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 bg-black/40 p-2 rounded-lg border border-slate-800">
                      <span className="text-purple-300 font-semibold">Impact attendu : </span>
                      {rec.expectedImpact}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          onNavigate(rec.targetTab);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold font-display text-xs transition-colors cursor-pointer"
                      >
                        <span>{rec.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {!rec.critical && (
                        <button
                          onClick={() => onDismiss(rec.id)}
                          className="text-[11px] font-mono text-slate-400 hover:text-emerald-300 flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Traité</span>
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/60 text-center">
            <span className="text-[10px] font-mono text-slate-400">
              Conseils calculés de façon déterministe par le moteur expert SimBiz
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
};

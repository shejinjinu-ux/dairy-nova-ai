import React from 'react';
import { HealthAlert } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { StatusBadge } from '../common/StatusBadge';
import { SourceTag } from '../common/SourceTag';
import { ReadAloudButton } from '../common/ReadAloudButton';
import { AlertOctagon, Sparkles, CheckCircle2, ChevronRight, Stethoscope } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface HealthAlertCardProps {
  alert: HealthAlert;
  onResolve?: (id: string) => void;
  onAskAI?: (alert: HealthAlert) => void;
  onScreening?: (alert: HealthAlert) => void;
}

export const HealthAlertCard: React.FC<HealthAlertCardProps> = ({
  alert,
  onResolve,
  onAskAI,
  onScreening,
}) => {
  const { t } = useLanguage();
  const isCritical = alert.severity === 'critical';
  const isResolved = alert.status === 'resolved';

  return (
    <div className={`rounded-3xl p-4 border transition-all duration-200 shadow-card-soft space-y-3 ${
      isResolved
        ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
        : isCritical
        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isCritical ? 'bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300' : 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300'
          }`}>
            <AlertOctagon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-1.5 py-0.2 rounded">
                {alert.animalTag}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {alert.animalName}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">{formatDate(alert.timestamp)}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={alert.severity === 'critical' ? 'Critical Alert' : 'Needs Attention'} size="sm" />
          <SourceTag source={alert.source} />
        </div>
      </div>

      {/* Title & Description */}
      <div>
        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
          {alert.title}
        </h4>
        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
          {alert.description}
        </p>
      </div>

      {/* AI Assessment Box */}
      <div className="bg-white/80 dark:bg-slate-950/70 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-2 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1">
            <Sparkles size={12} className="text-teal-500" />
            Possible Concern: {alert.possibleConcern}
          </span>
          <span className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-900/60 px-1.5 py-0.5 rounded">
            {alert.confidenceScore}% Confidence
          </span>
        </div>

        <p className="text-slate-600 dark:text-slate-400 text-[11px]">
          <strong className="text-slate-700 dark:text-slate-300">{t.recommendations || 'Guidance'}:</strong> {alert.preliminaryGuidance}
        </p>

        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
          <Stethoscope size={13} className="shrink-0 mt-0.5 text-amber-600" />
          <span className="text-[10px] font-medium leading-tight">
            <strong>{t.recommendedAction || 'Vet Advice'}:</strong> {alert.veterinaryAdvice}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <ReadAloudButton
          textToRead={`${alert.animalName} health alert: ${alert.title}. ${alert.preliminaryGuidance}. ${alert.veterinaryAdvice}`}
          size="sm"
        />

        <div className="flex items-center gap-1.5">
          {onAskAI && (
            <button
              type="button"
              onClick={() => onAskAI(alert)}
              className="px-2.5 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-[11px] flex items-center gap-1 active:scale-95 transition"
            >
              <Sparkles size={11} /> {t.navAskAi || 'Ask AI'}
            </button>
          )}

          {onResolve && !isResolved && (
            <button
              type="button"
              onClick={() => onResolve(alert.id)}
              className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1 active:scale-95 transition"
            >
              <CheckCircle2 size={11} /> {t.resolveAlert || 'Resolve'}
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

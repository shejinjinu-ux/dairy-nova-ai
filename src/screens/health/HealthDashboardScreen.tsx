import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { MetricCard } from '../../components/common/MetricCard';
import { HealthAlertCard } from '../../components/health/HealthAlertCard';
import { DiseaseScreeningModal } from '../../components/health/DiseaseScreeningModal';
import { EmptyState } from '../../components/common/FeedbackStates';
import {
  HeartPulse,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Stethoscope,
  Syringe,
  History,
  Sparkles,
} from 'lucide-react';

export const HealthDashboardScreen: React.FC = () => {
  const { animals, healthAlerts, navigate, addHealthAlert, resolveHealthAlert } = useAppData();
  const { t } = useLanguage();

  const [isScreeningOpen, setIsScreeningOpen] = useState<boolean>(false);
  const [filterSeverity, setFilterSeverity] = useState<'All' | 'critical' | 'active' | 'resolved'>('All');

  const healthyCount = animals.filter((a) => a.healthStatus === 'Healthy').length;
  const attentionCount = animals.filter((a) => a.healthStatus === 'Needs Attention').length;
  const criticalCount = animals.filter((a) => a.healthStatus === 'Critical Alert').length;

  const filteredAlerts = healthAlerts.filter((a) => {
    if (filterSeverity === 'critical') return a.severity === 'critical';
    if (filterSeverity === 'active') return a.status === 'active';
    if (filterSeverity === 'resolved') return a.status === 'resolved';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader title={t.navHealth} subtitle="Herd Diagnostics & Health Telemetry" />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* Metric Summary */}
        <div className="grid grid-cols-3 gap-2">
          <MetricCard
            label="Healthy"
            value={healthyCount}
            icon={CheckCircle2}
            colorScheme="emerald"
          />
          <MetricCard
            label="Attention"
            value={attentionCount}
            icon={AlertTriangle}
            colorScheme="amber"
          />
          <MetricCard
            label="Critical"
            value={criticalCount}
            icon={AlertOctagon}
            colorScheme="rose"
          />
        </div>

        {/* AI Disease Screening Launcher Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-tr from-teal-900 via-teal-950 to-slate-950 text-white border border-teal-700/50 shadow-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-teal-400" />
              AI Disease Screening Engine
            </span>
            <span className="text-[10px] font-bold bg-teal-500 text-slate-950 px-2 py-0.5 rounded-full">
              Vision + Symptoms
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Upload photos of cow eyes, udder, or skin lesions with voice-described symptoms for preliminary veterinary guidance.
          </p>

          <button
            type="button"
            onClick={() => setIsScreeningOpen(true)}
            className="w-full py-2.5 px-3 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-md shadow-teal-400/20 flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Stethoscope size={15} /> Start New Disease Screening
          </button>
        </div>

        {/* Health Quick Links */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => navigate('vaccinations')}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 active:scale-95 transition"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Syringe size={16} />
            </div>
            <span>Vaccinations Schedule</span>
          </button>

          <button
            onClick={() => navigate('history')}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 active:scale-95 transition"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <History size={16} />
            </div>
            <span>Health History Log</span>
          </button>
        </div>

        {/* Severity Filter Tabs */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Health & Pathology Alerts
            </h3>
            <span className="text-xs font-semibold text-slate-400">{filteredAlerts.length} records</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(['All', 'active', 'critical', 'resolved'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterSeverity(filter)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  filterSeverity === filter
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {filter === 'All' ? 'All Alerts' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {filteredAlerts.length > 0 ? (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <HealthAlertCard
                  key={alert.id}
                  alert={alert}
                  onResolve={resolveHealthAlert}
                  onAskAI={() => navigate('ai-chat')}
                  onScreening={() => setIsScreeningOpen(true)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="No Health Alerts in this Category"
              description="Your herd telemetry is clean with no active pathology flags."
            />
          )}
        </div>

      </main>

      <BottomNavigation />

      {/* Disease Screening Modal */}
      <DiseaseScreeningModal
        isOpen={isScreeningOpen}
        onClose={() => setIsScreeningOpen(false)}
        onResultSaved={addHealthAlert}
        onOpenAIChat={() => navigate('ai-chat')}
      />

    </div>
  );
};

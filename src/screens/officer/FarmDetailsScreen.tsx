import React from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SourceTag } from '../../components/common/SourceTag';
import { formatDate } from '../../utils/formatters';
import {
  MapPin,
  Phone,
  Milk,
  Layers,
  Calendar,
  Wheat,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export const FarmDetailsScreen: React.FC = () => {
  const { officerFarms, selectedFarmId, goBack } = useAppData();
  const { t } = useLanguage();

  const farm = officerFarms.find((f) => f.id === selectedFarmId) || officerFarms[0];

  if (!farm) {
    return (
      <div className="flex-1 p-6 text-center">
        <p className="text-xs text-slate-500">Farm record not found.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader showBack={true} title={farm.farmName} subtitle={`${farm.village}, ${farm.district}`} />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn text-xs">
        
        {/* Farm Hero Card */}
        <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-3.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                {t.affiliatedFarms || 'Cooperative Member Dairy Unit'}
              </span>
              <h2 className="text-lg font-extrabold text-white">{farm.farmName}</h2>
              <p className="text-xs text-slate-300">{farm.farmerName} • <span className="font-mono text-amber-400">{farm.contactNumber}</span></p>
            </div>
            <StatusBadge status={farm.overallHealthStatus} size="sm" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800">
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 block font-medium">{t.registeredAnimals || 'Total Cattle'}</span>
              <span className="text-sm font-extrabold text-white">{farm.totalCattle} ({farm.cowsCount}C / {farm.buffaloesCount}B)</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 block font-medium">{t.dailyYieldLabel || 'Daily Milk'}</span>
              <span className="text-sm font-extrabold text-dairy-400">{farm.todayMilkCollectionL} L</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 block font-medium">{t.fatContent || 'Fat / SNF'}</span>
              <span className="text-sm font-extrabold text-amber-400">{farm.avgMilkFat}% / {farm.avgMilkSnf}%</span>
            </div>
          </div>
        </div>

        {/* Quality Diagnostics Summary */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {t.qualityDiagnosticsSummary || 'Quality Audits & Feed Inspections'}
          </h3>

          <div className="space-y-2 text-[11px]">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wheat size={16} className="text-amber-600" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{t.feedCheck || 'Recent Feed Quality'}</span>
                  <span className="text-slate-400">{farm.recentFeedGrade}</span>
                </div>
              </div>
              <SourceTag source="Sensor Reading" />
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-teal-600" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{t.silageCheck || 'Recent Silage Quality'}</span>
                  <span className="text-slate-400">{farm.recentSilageGrade}</span>
                </div>
              </div>
              <SourceTag source="AI Screening" />
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-dairy-600" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{t.lastVeterinaryVisit || 'Last Veterinary Visit'}</span>
                  <span className="text-slate-400">{farm.lastInspectionDate}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600">● {t.certifiedRoutine || 'Certified Routine'}</span>
            </div>
          </div>
        </div>

        {/* Officer Action Log */}
        <div className="p-4 rounded-3xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 space-y-2">
          <h4 className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-teal-600" /> {t.officerActionLog || 'Field Officer Observations'}
          </h4>
          <p className="text-[11px] text-teal-800 dark:text-teal-300 leading-relaxed">
            Farm maintains consistent sanitary milking hygiene. Somatic cell counts remain below cooperative threshold limits. Transition feed supplementation active for pregnant cattle.
          </p>
        </div>

      </main>

    </div>
  );
};

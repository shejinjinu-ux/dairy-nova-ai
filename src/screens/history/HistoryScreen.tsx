import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SourceTag } from '../../components/common/SourceTag';
import { EmptyState } from '../../components/common/FeedbackStates';
import { formatDate } from '../../utils/formatters';
import {
  History,
  Search,
  Stethoscope,
  Wheat,
  Activity,
  Milk,
  Syringe,
  Calendar,
  Filter,
} from 'lucide-react';

export const HistoryScreen: React.FC = () => {
  const { healthAlerts, feedAnalyses, silageAnalyses, milkRecords, vaccinations, navigate } = useAppData();

  const [category, setCategory] = useState<'All' | 'Disease' | 'Feed' | 'Silage' | 'Milk' | 'Vaccination'>('All');
  const [search, setSearch] = useState<string>('');

  // Combine unified activity items
  const unifiedHistory = [
    ...healthAlerts.map((h) => ({
      id: `hist-h-${h.id}`,
      type: 'Disease' as const,
      title: h.title,
      subtitle: `${h.animalName} (${h.animalTag})`,
      date: h.timestamp.split('T')[0],
      badge: h.possibleConcern,
      status: h.severity === 'critical' ? 'Critical Alert' : 'Needs Attention',
      source: h.source,
      icon: Stethoscope,
      color: 'teal',
      onClick: () => navigate('health'),
    })),
    ...feedAnalyses.map((f) => ({
      id: `hist-f-${f.id}`,
      type: 'Feed' as const,
      title: f.feedName,
      subtitle: `Score: ${f.overallScore}/100 • Protein: ${f.crudeProteinPercent}%`,
      date: f.date,
      badge: f.qualityGrade,
      status: f.qualityGrade,
      source: f.inputSource === 'Portable Scanner Simulation' ? ('Sensor Reading' as const) : ('AI Screening' as const),
      icon: Wheat,
      color: 'amber',
      onClick: () => navigate('feed'),
    })),
    ...silageAnalyses.map((s) => ({
      id: `hist-s-${s.id}`,
      type: 'Silage' as const,
      title: s.silageType,
      subtitle: `pH ${s.phValue} • Temp ${s.internalTemperatureC}°C`,
      date: s.date,
      badge: s.overallQuality,
      status: s.overallQuality,
      source: 'Sensor Reading' as const,
      icon: Activity,
      color: 'teal',
      onClick: () => navigate('silage'),
    })),
    ...milkRecords.map((m) => ({
      id: `hist-m-${m.id}`,
      type: 'Milk' as const,
      title: `${m.quantityLiters} L logged (${m.shift} Shift)`,
      subtitle: `${m.animalName} (${m.animalTag}) • Fat ${m.fatPercent || 4.8}%`,
      date: m.date,
      badge: `${m.quantityLiters} Liters`,
      status: 'Completed',
      source: 'Measured' as const,
      icon: Milk,
      color: 'dairy',
      onClick: () => navigate('milk'),
    })),
    ...vaccinations.map((v) => ({
      id: `hist-v-${v.id}`,
      type: 'Vaccination' as const,
      title: v.diseaseName,
      subtitle: `${v.animalName} • ${v.vaccineName}`,
      date: v.completedDate || v.scheduledDate,
      badge: v.status,
      status: v.status,
      source: 'Measured' as const,
      icon: Syringe,
      color: 'blue',
      onClick: () => navigate('vaccinations'),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = unifiedHistory.filter((item) => {
    const matchCat = category === 'All' || item.type === category;
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader showBack={true} title="Unified Activity History" subtitle="Audit Log of Farm Operations" />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity records..."
            className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-dairy-500 shadow-sm"
          />
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs font-bold">
          {(['All', 'Disease', 'Feed', 'Silage', 'Milk', 'Vaccination'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition active:scale-95 ${
                category === cat
                  ? 'bg-dairy-600 text-white shadow-sm shadow-dairy-600/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat === 'All' ? 'All Activity' : cat}
            </button>
          ))}
        </div>

        {/* Timeline Records */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={item.onClick}
                  className="p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft hover:shadow-card-hover cursor-pointer active:scale-[0.98] transition space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                        <Icon size={16} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block">
                          {item.type}
                        </span>
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                          {item.title}
                        </h4>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">{formatDate(item.date)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                    <span className="text-slate-500 truncate max-w-[200px]">{item.subtitle}</span>
                    <SourceTag source={item.source} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={History}
            title="No Records Found"
            description="No logged operational events match your filter criteria."
          />
        )}

      </main>

      <BottomNavigation />
    </div>
  );
};

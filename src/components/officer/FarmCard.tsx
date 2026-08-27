import React from 'react';
import { OfficerFarm } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Milk, MapPin, Phone, AlertTriangle, ChevronRight, Layers } from 'lucide-react';

interface FarmCardProps {
  farm: OfficerFarm;
  onClick: () => void;
}

export const FarmCard: React.FC<FarmCardProps> = ({ farm, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-card-soft hover:shadow-card-hover transition-all duration-200 cursor-pointer active:scale-[0.98] group space-y-3"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
            <MapPin size={12} className="text-teal-600" />
            <span>{farm.village}, {farm.district}</span>
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
            {farm.farmName}
          </h3>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {farm.farmerName} • <span className="font-mono text-[11px]">{farm.contactNumber}</span>
          </p>
        </div>

        <StatusBadge status={farm.overallHealthStatus} size="sm" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="bg-slate-50 dark:bg-slate-950/50 p-2 rounded-xl">
          <span className="text-[10px] text-slate-400 block font-medium">Cattle Count</span>
          <span className="font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-1">
            <Layers size={11} className="text-teal-600" /> {farm.totalCattle}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/50 p-2 rounded-xl">
          <span className="text-[10px] text-slate-400 block font-medium">Today's Milk</span>
          <span className="font-extrabold text-dairy-600 dark:text-dairy-400 flex items-center justify-center gap-1">
            <Milk size={11} /> {farm.todayMilkCollectionL} L
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/50 p-2 rounded-xl">
          <span className="text-[10px] text-slate-400 block font-medium">Fat / SNF</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {farm.avgMilkFat}% / {farm.avgMilkSnf}%
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 text-[11px]">
        {farm.activeContaminationAlerts > 0 ? (
          <span className="text-rose-600 font-bold flex items-center gap-1">
            <AlertTriangle size={12} className="animate-pulse" />
            {farm.activeContaminationAlerts} Active Contamination Flag
          </span>
        ) : (
          <span className="text-emerald-600 font-medium">● Inspected on {farm.lastInspectionDate}</span>
        )}

        <div className="flex items-center gap-1 text-slate-400 group-hover:text-teal-600 transition">
          <span className="font-bold text-[10px]">Inspect Farm</span>
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

    </div>
  );
};

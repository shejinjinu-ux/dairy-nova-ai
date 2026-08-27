import React from 'react';
import { Animal } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Milk, Sparkles, ChevronRight, Activity, Thermometer } from 'lucide-react';

interface AnimalCardProps {
  animal: Animal;
  onClick: () => void;
  onAskAI?: (animal: Animal) => void;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({
  animal,
  onClick,
  onAskAI,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-card-soft hover:shadow-card-hover transition-all duration-200 cursor-pointer active:scale-[0.98] group relative overflow-hidden"
    >
      {/* Top row: Avatar, Tag ID, Name, Status */}
      <div className="flex items-start gap-3.5">
        {/* Animal Avatar */}
        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 ring-2 ring-slate-100 dark:ring-slate-800 bg-slate-100 relative">
          <img
            src={animal.imageUrl}
            alt={animal.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <span className="absolute bottom-0 inset-x-0 bg-slate-950/70 text-white text-[9px] font-bold text-center py-0.5 backdrop-blur-xs uppercase">
            {animal.type}
          </span>
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-1">
            <span className="font-mono text-xs font-extrabold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-md">
              {animal.tagId}
            </span>
            <StatusBadge status={animal.healthStatus} size="sm" />
          </div>

          <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
            {animal.name}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {animal.breed} • {animal.ageYears}y {animal.ageMonths}m
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-slate-50 dark:bg-slate-950/50 p-2 rounded-xl">
          <span className="text-[10px] text-slate-400 block font-medium">Daily Milk</span>
          <span className="font-bold text-dairy-600 dark:text-dairy-400 flex items-center justify-center gap-0.5">
            <Milk size={11} /> {animal.dailyMilkYieldL} L
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/50 p-2 rounded-xl">
          <span className="text-[10px] text-slate-400 block font-medium">Stage</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
            {animal.lactationStage}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/50 p-2 rounded-xl">
          <span className="text-[10px] text-slate-400 block font-medium">Body Temp</span>
          <span className={`font-semibold flex items-center justify-center gap-0.5 ${
            animal.temperatureC > 39.2 ? 'text-rose-500 font-bold' : 'text-slate-700 dark:text-slate-300'
          }`}>
            <Thermometer size={11} /> {animal.temperatureC}°C
          </span>
        </div>
      </div>

      {/* Footer Quick Action */}
      <div className="mt-2.5 flex items-center justify-between pt-1">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Activity size={12} className="text-emerald-500" />
          {animal.pregnancyStatus}
        </span>

        <div className="flex items-center gap-1">
          {onAskAI && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAskAI(animal);
              }}
              className="px-2 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition"
            >
              <Sparkles size={11} /> Ask AI
            </button>
          )}
          <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

    </div>
  );
};

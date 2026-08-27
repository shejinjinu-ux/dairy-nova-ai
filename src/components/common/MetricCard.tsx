import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  colorScheme?: 'emerald' | 'teal' | 'amber' | 'rose' | 'blue';
  trend?: string;
  trendPositive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  colorScheme = 'emerald',
  trend,
  trendPositive = true,
  onClick,
  className = '',
}) => {
  const schemes = {
    emerald: {
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/60',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300',
      valueColor: 'text-slate-900 dark:text-white',
    },
    teal: {
      bg: 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-100 dark:border-teal-900/60',
      iconBg: 'bg-teal-100 dark:bg-teal-900/80 text-teal-700 dark:text-teal-300',
      valueColor: 'text-slate-900 dark:text-white',
    },
    amber: {
      bg: 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/60',
      iconBg: 'bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300',
      valueColor: 'text-slate-900 dark:text-white',
    },
    rose: {
      bg: 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/60',
      iconBg: 'bg-rose-100 dark:bg-rose-900/80 text-rose-700 dark:text-rose-300',
      valueColor: 'text-slate-900 dark:text-white',
    },
    blue: {
      bg: 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/60',
      iconBg: 'bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300',
      valueColor: 'text-slate-900 dark:text-white',
    },
  };

  const current = schemes[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`p-3.5 rounded-2xl border shadow-card-soft transition-all duration-200 ${current.bg} ${
        onClick ? 'cursor-pointer active:scale-95 hover:shadow-md' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate max-w-[130px]">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${current.iconBg}`}>
          <Icon size={16} />
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        <span className={`text-xl font-black tracking-tight ${current.valueColor}`}>{value}</span>
        {unit && <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{unit}</span>}
      </div>

      {trend && (
        <div className="mt-1.5 flex items-center gap-1">
          <span
            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              trendPositive
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};

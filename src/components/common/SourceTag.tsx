import React from 'react';
import { DataSourceType } from '../../types';
import { Activity, Sparkles, Scale, Cpu } from 'lucide-react';

interface SourceTagProps {
  source: DataSourceType | string;
  className?: string;
}

export const SourceTag: React.FC<SourceTagProps> = ({ source, className = '' }) => {
  switch (source) {
    case 'Sensor Reading':
      return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 ${className}`}>
          <Cpu size={10} className="text-sky-500" />
          Sensor Reading
        </span>
      );

    case 'AI Screening':
      return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 ${className}`}>
          <Sparkles size={10} className="text-teal-500" />
          AI Screening
        </span>
      );

    case 'Measured':
      return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ${className}`}>
          <Scale size={10} className="text-emerald-500" />
          Measured
        </span>
      );

    case 'Estimated':
    default:
      return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 ${className}`}>
          <Activity size={10} className="text-amber-500" />
          Estimated
        </span>
      );
  }
};

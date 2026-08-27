import React from 'react';
import { HealthStatus, VaccinationStatus } from '../../types';
import { CheckCircle2, AlertTriangle, AlertOctagon, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: HealthStatus | VaccinationStatus | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  const iconSize = size === 'sm' ? 11 : 13;

  switch (status) {
    case 'Healthy':
    case 'Completed':
    case 'Verified Pure':
    case 'Certified Safe':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ${sizeClasses}`}>
          {showIcon && <CheckCircle2 size={iconSize} className="text-emerald-500" />}
          {status}
        </span>
      );

    case 'Needs Attention':
    case 'Due':
    case 'Upcoming':
    case 'Under Observation':
    case 'Moderate Concern':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 ${sizeClasses}`}>
          {showIcon && (status === 'Upcoming' ? <Clock size={iconSize} className="text-amber-500" /> : <AlertTriangle size={iconSize} className="text-amber-500" />)}
          {status}
        </span>
      );

    case 'Critical Alert':
    case 'Overdue':
    case 'Critical Flag':
    case 'Active Alert':
    case 'Severe Hazard':
      return (
        <span className={`inline-flex items-center gap-1 font-bold rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse ${sizeClasses}`}>
          {showIcon && <AlertOctagon size={iconSize} className="text-rose-500" />}
          {status}
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};

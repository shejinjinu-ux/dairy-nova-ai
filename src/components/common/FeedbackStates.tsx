import React from 'react';
import { LucideIcon, Inbox, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`p-8 text-center flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center">
        <Icon size={24} />
      </div>
      <div className="space-y-1">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{title}</h4>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 py-2 px-4 bg-dairy-600 hover:bg-dairy-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-dairy-600/30 active:scale-95 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export const LoadingState: React.FC<{ message?: string; className?: string }> = ({
  message = 'Loading data...',
  className = '',
}) => {
  return (
    <div className={`p-10 flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-dairy-200 border-t-dairy-600 animate-spin" />
      </div>
      <p className="text-xs font-medium text-slate-500 animate-pulse">{message}</p>
    </div>
  );
};

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void; className?: string }> = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-6 text-center flex flex-col items-center justify-center space-y-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-3xl border border-rose-200 dark:border-rose-900 ${className}`}>
      <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
        <AlertCircle size={22} />
      </div>
      <p className="text-xs font-semibold text-rose-800 dark:text-rose-300 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition"
        >
          <RefreshCw size={12} /> Retry
        </button>
      )}
    </div>
  );
};

import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const { t } = useLanguage();
  const effectiveConfirm = confirmLabel || t.continueBtn || 'Confirm';
  const effectiveCancel = cancelLabel || t.cancelBtn || 'Cancel';
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
        
        <div className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center ${
          isDestructive ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'bg-dairy-100 text-dairy-600 dark:bg-dairy-950/60 dark:text-dairy-400'
        }`}>
          <AlertCircle size={26} />
        </div>

        <div className="space-y-1.5">
          <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition"
          >
            {effectiveCancel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-white shadow-md active:scale-95 transition flex items-center justify-center gap-1.5 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                : 'bg-dairy-600 hover:bg-dairy-700 shadow-dairy-600/30'
            }`}
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            {isLoading ? (t.analyzingAI || 'Processing...') : effectiveConfirm}
          </button>
        </div>

      </div>
    </div>
  );
};

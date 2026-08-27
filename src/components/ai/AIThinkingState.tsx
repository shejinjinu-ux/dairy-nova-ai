import React from 'react';
import { Sparkles, Brain, Cpu } from 'lucide-react';

interface AIThinkingStateProps {
  message?: string;
  className?: string;
}

export const AIThinkingState: React.FC<AIThinkingStateProps> = ({
  message = 'Dairy Nova AI is thinking...',
  className = '',
}) => {
  return (
    <div className={`p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 flex items-center gap-3 animate-fadeIn ${className}`}>
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-dairy-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30 shrink-0">
        <Sparkles size={18} className="animate-spin text-white" />
        <span className="absolute -inset-1 rounded-xl bg-teal-400/30 animate-ping -z-10" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
          {message}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-bounce" />
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-bounce delay-100" />
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-bounce delay-200" />
          <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium ml-1">
            Synthesizing veterinary & herd datasets
          </span>
        </div>
      </div>
    </div>
  );
};

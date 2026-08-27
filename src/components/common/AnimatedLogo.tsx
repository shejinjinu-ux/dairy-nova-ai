import React from 'react';
import { Sparkles } from 'lucide-react';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Cow & Tech Emblem */}
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-dairy-600 via-dairy-700 to-teal-800 text-white shadow-lg shadow-dairy-700/30 ${sizeClasses[size]} shrink-0 overflow-hidden`}>
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
        
        {/* Cow silhouette & AI Star */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4 text-white relative z-10"
        >
          {/* Stylized Modern Cow Head with Ears and Horns */}
          <path
            d="M12 18C12 14 15 10 24 10C33 10 36 14 36 18C36 24 34 32 24 38C14 32 12 24 12 18Z"
            fill="currentColor"
            fillOpacity="0.95"
          />
          {/* Muzzle */}
          <path
            d="M16 26C16 23 20 23 24 23C28 23 32 23 32 26C32 31 29 35 24 35C19 35 16 31 16 26Z"
            fill="#dcfce7"
          />
          {/* Nostrils */}
          <circle cx="20.5" cy="27.5" r="1.5" fill="#15803d" />
          <circle cx="27.5" cy="27.5" r="1.5" fill="#15803d" />
          {/* Horns */}
          <path
            d="M14 15C11 11 9 6 7 6C8 10 11 14 13 16"
            stroke="#fef08a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M34 15C37 11 39 6 41 6C40 10 37 14 35 16"
            stroke="#fef08a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Tech Nodes / Synapses */}
          <circle cx="24" cy="15" r="2.2" fill="#38bdf8" className="animate-pulse" />
          <circle cx="18" cy="18" r="1.5" fill="#a7f3d0" />
          <circle cx="30" cy="18" r="1.5" fill="#a7f3d0" />
          <line x1="18" y1="18" x2="24" y2="15" stroke="#38bdf8" strokeWidth="1" strokeDasharray="1 1" />
          <line x1="30" y1="18" x2="24" y2="15" stroke="#38bdf8" strokeWidth="1" strokeDasharray="1 1" />
        </svg>

        {/* AI Sparkle Badge */}
        <div className="absolute -bottom-1 -right-1 bg-teal-500 rounded-full p-0.5 border-2 border-white shadow-sm">
          <Sparkles size={iconSizes[size] * 0.4} className="text-white" />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-lg sm:text-xl font-sans">
              Dairy Nova
            </span>
            <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
              AI
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
            Smart Dairy Assistant
          </span>
        </div>
      )}
    </div>
  );
};

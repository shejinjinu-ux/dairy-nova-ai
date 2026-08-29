import React from 'react';
import { AnimatedLogo } from '../../components/common/AnimatedLogo';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Sparkles, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { navigate } = useAppData();
  const { t } = useLanguage();

  return (
    <div className="min-h-full flex-1 flex flex-col items-center justify-between p-6 sm:p-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-dairy-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Tagline Pill */}
      <div className="pt-4 animate-fadeIn">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-semibold backdrop-blur-md border border-white/10 shadow-sm">
          <Sparkles size={12} className="text-teal-400 animate-pulse" />
          Smart AI Rapid Feed & Silage Testing System
        </span>
      </div>

      {/* Center Emblem & Branding */}
      <div className="flex flex-col items-center text-center space-y-4 animate-fadeIn my-auto">
        <AnimatedLogo size="xl" showText={false} />

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Dairy Nova
            </h1>
            <span className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-teal-500 text-slate-950 shadow-md shadow-teal-500/40">
              AI
            </span>
          </div>

          <h2 className="text-sm font-bold text-emerald-400 max-w-xs leading-relaxed">
            Smart AI-Enabled Rapid Feed and Silage Quality Testing System for Dairy Farmers
          </h2>

          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Rapid NIR Fodder Nutrition • Silage Fermentation & Spoilage AI
          </p>
        </div>
      </div>

      {/* Two Primary Options: NEW USER / EXISTING USER */}
      <div className="w-full max-w-xs space-y-3 pb-4 animate-fadeIn">
        {/* Option 1: New User — Sign Up */}
        <button
          type="button"
          onClick={() => navigate('register')}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-dairy-600 to-teal-600 hover:from-dairy-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-dairy-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <UserPlus size={16} />
          <span>{t.newUserSignUp || 'NEW USER — Sign Up'}</span>
          <ArrowRight size={15} />
        </button>

        {/* Option 2: Existing User — Login */}
        <button
          type="button"
          onClick={() => navigate('login')}
          className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs backdrop-blur-md flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <LogIn size={15} className="text-teal-400" />
          <span>{t.existingUserLogin || 'EXISTING USER — Login'}</span>
        </button>
      </div>

    </div>
  );
};

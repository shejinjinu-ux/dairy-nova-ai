import React, { useEffect, useState } from 'react';
import { AnimatedLogo } from '../../components/common/AnimatedLogo';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { navigate } = useAppData();
  const { isAuthenticated, role } = useAuth();
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 250);

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate(role === 'officer' ? 'officer-dashboard' : 'home');
      } else {
        navigate('language-select');
      }
    }, 1600);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isAuthenticated, role, navigate]);

  return (
    <div className="min-h-full flex-1 flex flex-col items-center justify-between p-6 sm:p-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-dairy-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Tagline Pill */}
      <div className="pt-6 animate-fadeIn">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-semibold backdrop-blur-md border border-white/10">
          <Sparkles size={12} className="text-teal-400" />
          Next-Gen AI Dairy Farming Assistant
        </span>
      </div>

      {/* Center Emblem & Branding */}
      <div className="flex flex-col items-center text-center space-y-5 animate-fadeIn">
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

          <p className="text-sm font-semibold text-emerald-400 max-w-xs leading-relaxed">
            Smart Dairy. Healthy Animals. Better Decisions.
          </p>

          <p className="text-xs text-slate-400 max-w-xs leading-relaxed pt-1">
            Predictive health screening, precision feed NIR analysis, milk yield forecasting & tamper-proof QR traceability in your pocket.
          </p>
        </div>
      </div>

      {/* Bottom Loading Progress */}
      <div className="w-full max-w-xs space-y-4 pb-4 animate-fadeIn">
        <div className="space-y-1.5 text-center">
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-dairy-500 to-teal-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Initializing smart herd assistant...</span>
        </div>

        <button
          onClick={() => navigate('language-select')}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-dairy-600 to-teal-600 hover:from-dairy-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-dairy-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span>Get Started</span>
          <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
};

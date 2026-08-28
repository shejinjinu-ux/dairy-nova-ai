import React from 'react';
import { Home, Sparkles, History, User, Wheat, LucideIcon } from 'lucide-react';
import { useAppData, ScreenType } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const BottomNavigation: React.FC = () => {
  const { currentScreen, navigate } = useAppData();
  const { t } = useLanguage();

  const navItems: { id: ScreenType; label: string; icon: LucideIcon; isTest?: boolean }[] = [
    { id: 'home', label: t.navHome || 'Home', icon: Home },
    { id: 'rapid-test', label: t.navTest || 'Test', icon: Wheat, isTest: true },
    { id: 'history', label: t.navHistory || 'History', icon: History },
    { id: 'ai-chat', label: t.navAdvice || 'Advice', icon: Sparkles },
    { id: 'profile', label: t.profile || 'Profile', icon: User },
  ];

  const isCurrentScreenInNav = (id: ScreenType): boolean => {
    if (id === 'home' && currentScreen === 'home') return true;
    if (id === 'rapid-test' && (currentScreen === 'rapid-test' || currentScreen === 'feed' || currentScreen === 'silage')) return true;
    if (id === 'history' && currentScreen === 'history') return true;
    if (id === 'ai-chat' && currentScreen === 'ai-chat') return true;
    if (id === 'profile' && (currentScreen === 'profile' || currentScreen === 'settings' || currentScreen === 'more')) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 sm:absolute max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 px-3 py-2 z-40 shadow-lg shadow-black/10">
      <div className="flex items-center justify-around relative">
        {navItems.map((item) => {
          const isActive = isCurrentScreenInNav(item.id);
          const Icon = item.icon;

          if (item.isTest) {
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className="relative -top-4 flex flex-col items-center group focus:outline-none"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white scale-105 shadow-emerald-500/40 ring-4 ring-white dark:ring-slate-900'
                    : 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-emerald-600/30 group-hover:scale-105 ring-4 ring-white dark:ring-slate-900'
                }`}>
                  <Icon size={22} className="stroke-[2.5px]" />
                </div>
                <span className={`text-[10px] font-extrabold mt-1 tracking-tight ${
                  isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all duration-200 relative min-w-[56px] active:scale-95 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'} />
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

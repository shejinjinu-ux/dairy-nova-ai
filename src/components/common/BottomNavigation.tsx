import React from 'react';
import { Home, Sparkles, HeartPulse, Milk, Grid, Layers, LucideIcon } from 'lucide-react';
import { useAppData, ScreenType } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const BottomNavigation: React.FC = () => {
  const { currentScreen, navigate, healthAlerts } = useAppData();
  const { t } = useLanguage();

  const activeAlertsCount = healthAlerts.filter((a) => a.status === 'active').length;

  const navItems: { id: ScreenType; label: string; icon: LucideIcon; badge?: number; isAI?: boolean }[] = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'animals', label: t.navAnimals, icon: Layers },
    { id: 'ai-chat', label: t.navAI, icon: Sparkles, isAI: true },
    { id: 'health', label: t.navHealth, icon: HeartPulse, badge: activeAlertsCount },
    { id: 'milk', label: t.navMilk, icon: Milk },
  ];

  const isCurrentScreenInNav = (id: ScreenType): boolean => {
    if (id === 'home' && currentScreen === 'home') return true;
    if (id === 'animals' && (currentScreen === 'animals' || currentScreen === 'animal-details' || currentScreen === 'add-animal')) return true;
    if (id === 'health' && (currentScreen === 'health' || currentScreen === 'disease-screening' || currentScreen === 'vaccinations')) return true;
    if (id === 'milk' && (currentScreen === 'milk' || currentScreen === 'milk-quality' || currentScreen === 'record-milk')) return true;
    if (id === 'ai-chat' && currentScreen === 'ai-chat') return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 sm:absolute max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 px-3 py-2 z-40 shadow-lg shadow-black/10">
      <div className="flex items-center justify-around relative">
        {navItems.map((item) => {
          const isActive = isCurrentScreenInNav(item.id);
          const Icon = item.icon;

          if (item.isAI) {
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className="relative -top-4 flex flex-col items-center group focus:outline-none"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-tr from-teal-600 to-dairy-500 text-white scale-105 shadow-teal-500/40 ring-4 ring-white dark:ring-slate-900'
                    : 'bg-gradient-to-tr from-teal-500 to-dairy-600 text-white shadow-teal-600/30 group-hover:scale-105 ring-4 ring-white dark:ring-slate-900'
                }`}>
                  <Sparkles size={22} className="animate-pulse" />
                </div>
                <span className={`text-[10px] font-bold mt-1 tracking-tight ${
                  isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'
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
                  ? 'text-dairy-600 dark:text-dairy-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold px-1 min-w-[14px] h-[14px] rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-dairy-600 dark:bg-dairy-400 mt-0.5" />
              )}
            </button>
          );
        })}

        {/* More Menu Pill */}
        <button
          onClick={() => navigate('more')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all duration-200 relative min-w-[56px] active:scale-95 ${
            currentScreen === 'more' || currentScreen === 'settings' || currentScreen === 'profile' || currentScreen === 'qr-traceability' || currentScreen === 'byproducts' || currentScreen === 'history' || currentScreen === 'breeds'
              ? 'text-dairy-600 dark:text-dairy-400 font-semibold'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Grid size={20} className={currentScreen === 'more' ? 'stroke-[2.5px]' : 'stroke-[1.75px]'} />
          <span className="text-[10px] mt-1 tracking-tight leading-none">{t.navMore}</span>
          {(currentScreen === 'more' || currentScreen === 'settings' || currentScreen === 'profile') && (
            <span className="w-1.5 h-1.5 rounded-full bg-dairy-600 dark:bg-dairy-400 mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};

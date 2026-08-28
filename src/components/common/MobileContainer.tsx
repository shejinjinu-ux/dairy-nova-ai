import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, BatteryMedium, Signal, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useOffline } from '../../contexts/OfflineContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ConfirmationDialog } from './ConfirmationDialog';

interface MobileContainerProps {
  children: React.ReactNode;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  const { isOffline, pendingQueue, syncNow, isSyncing } = useOffline();
  const { showLogoutModal, setShowLogoutModal, logout, isLoggingOut, logoutSuccessToast, setLogoutSuccessToast } = useAuth();
  const { t } = useLanguage();

  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-start sm:p-4 md:p-6 lg:p-8 select-none">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[844px] sm:max-h-[920px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 sm:rounded-[36px] sm:shadow-2xl sm:shadow-black/60 overflow-hidden flex flex-col relative border-0 sm:border sm:border-slate-800/80">
        
        {/* Mobile Status Bar */}
        <div className="bg-slate-950 text-slate-300 px-5 pt-2.5 pb-1 flex items-center justify-between text-xs font-medium shrink-0 z-50 select-none">
          <span className="font-semibold tracking-wider text-[11px] text-slate-200">{currentTime}</span>
          
          <div className="flex items-center gap-2 text-slate-400">
            {isOffline ? (
              <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full font-bold">
                <WifiOff size={11} /> Offline Mode
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full font-bold">
                <Wifi size={11} /> Online
              </span>
            )}
          </div>
        </div>

        {/* Offline Warning Banner */}
        {isOffline && (
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-3.5 py-1.5 flex items-center justify-between text-xs font-medium shadow-sm shrink-0 z-40 animate-fadeIn">
            <div className="flex items-center gap-1.5 truncate">
              <AlertTriangle size={14} className="shrink-0 text-amber-200 animate-pulse" />
              <span className="truncate">{t.offlineBanner}</span>
            </div>
            <button
              onClick={() => syncNow()}
              disabled={isSyncing}
              className="ml-2 bg-amber-900/60 hover:bg-amber-900 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 shrink-0 active:scale-95 transition-transform"
            >
              <RefreshCw size={10} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : 'Sync'}
            </button>
          </div>
        )}

        {/* Pending Sync Bar (When online with items queued) */}
        {!isOffline && pendingQueue.length > 0 && (
          <div className="bg-teal-700 text-teal-100 px-3.5 py-1.5 flex items-center justify-between text-xs shrink-0 z-40">
            <span>{pendingQueue.length} {t.pendingSync}</span>
            <button
              onClick={() => syncNow()}
              disabled={isSyncing}
              className="bg-white/20 hover:bg-white/30 text-white text-[11px] px-2 py-0.5 rounded font-semibold flex items-center gap-1"
            >
              <RefreshCw size={10} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : t.syncNow}
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative pb-20 custom-scrollbar">
          {children}
        </div>

        {/* Logout Confirmation Modal */}
        <ConfirmationDialog
          isOpen={showLogoutModal}
          title={t.logoutConfirmTitle}
          message={t.logoutConfirmMsg}
          confirmLabel={t.logout}
          cancelLabel={t.cancel}
          isDestructive={true}
          isLoading={isLoggingOut}
          onConfirm={logout}
          onCancel={() => setShowLogoutModal(false)}
        />

        {/* Logout Success Toast */}
        {logoutSuccessToast && (
          <div className="absolute top-12 left-4 right-4 bg-emerald-700 text-white p-3 rounded-2xl shadow-xl z-50 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              {t.loggedOutSuccess}
            </div>
            <button onClick={() => setLogoutSuccessToast(false)} className="text-white/80 hover:text-white p-1">
              <X size={14} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

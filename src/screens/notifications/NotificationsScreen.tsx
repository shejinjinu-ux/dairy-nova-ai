import React from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { EmptyState } from '../../components/common/FeedbackStates';
import {
  Bell,
  CheckCheck,
  AlertOctagon,
  AlertTriangle,
  Syringe,
  Wheat,
  Activity,
  Milk,
  ChevronRight,
} from 'lucide-react';

export const NotificationsScreen: React.FC = () => {
  const { notifications, markAllNotificationsRead, navigate, unreadNotificationsCount } = useAppData();

  const getNotificationIcon = (type: string, severity: string) => {
    if (severity === 'critical') return <AlertOctagon size={18} className="text-rose-500" />;
    switch (type) {
      case 'vaccination':
        return <Syringe size={18} className="text-amber-500" />;
      case 'health':
        return <AlertTriangle size={18} className="text-rose-500" />;
      case 'feed':
        return <Wheat size={18} className="text-amber-500" />;
      case 'silage':
        return <Activity size={18} className="text-teal-500" />;
      case 'milk':
        return <Milk size={18} className="text-dairy-500" />;
      default:
        return <Bell size={18} className="text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader showBack={true} title="Notification Center" subtitle={`${unreadNotificationsCount} unread alerts`} />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Priority Herd & Hardware Alerts
          </span>

          {unreadNotificationsCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline active:scale-95 transition"
            >
              <CheckCheck size={14} /> Mark All as Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (notif.actionRoute) {
                    navigate(notif.actionRoute as any);
                  }
                }}
                className={`p-4 rounded-3xl border transition-all duration-200 shadow-card-soft cursor-pointer active:scale-[0.98] space-y-2 relative overflow-hidden ${
                  !notif.isRead
                    ? 'bg-white dark:bg-slate-900 border-teal-300 dark:border-teal-800 ring-1 ring-teal-500/20'
                    : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 opacity-80'
                }`}
              >
                {!notif.isRead && (
                  <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                )}

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {getNotificationIcon(notif.type, notif.severity)}
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {notif.type} • {notif.timestamp}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mt-0.5 leading-snug">
                      {notif.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                {notif.actionRoute && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-teal-600 dark:text-teal-400 font-bold">
                    <span>Tap to view details</span>
                    <ChevronRight size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bell}
            title="All Caught Up!"
            description="You have no unread notifications or urgent alerts at this time."
          />
        )}

      </main>

      <BottomNavigation />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Download,
  Smartphone,
  CheckCircle2,
  X,
  Share2,
  PlusSquare,
  Sparkles,
  Zap,
  WifiOff,
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Capture beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
        >
          <X size={16} />
        </button>

        {/* App Branding */}
        <div className="flex items-center gap-3 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-dairy-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-dairy-600/30">
            <Smartphone size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Install Dairy Nova AI
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct Farmer Mobile App Experience
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="space-y-2 py-1 text-xs">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
            <Zap size={16} className="text-amber-500 shrink-0" />
            <span>Instant 1-tap launch from your home screen</span>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
            <WifiOff size={16} className="text-teal-500 shrink-0" />
            <span>Works offline & queues data for sync</span>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
            <Sparkles size={16} className="text-dairy-500 shrink-0" />
            <span>Full-screen view with zero browser address bar</span>
          </div>
        </div>

        {/* Installation Actions & Guidance */}
        {isInstalled ? (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-bold">
            <CheckCircle2 size={18} />
            <span>Dairy Nova AI is already installed on this device!</span>
          </div>
        ) : deferredPrompt ? (
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-dairy-600 to-teal-600 hover:from-dairy-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-dairy-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Download size={16} />
            <span>Install App Now</span>
          </button>
        ) : isIOS ? (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2 text-slate-700 dark:text-slate-300">
            <span className="font-bold block text-slate-900 dark:text-white">To install on iPhone / iPad:</span>
            <ol className="list-decimal pl-4 space-y-1 text-[11px]">
              <li>Tap the <Share2 size={12} className="inline mx-0.5 text-blue-500" /> <b>Share</b> icon in Safari</li>
              <li>Scroll down and select <PlusSquare size={12} className="inline mx-0.5" /> <b>Add to Home Screen</b></li>
              <li>Tap <b>Add</b> in the top-right corner</li>
            </ol>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
            <span className="font-bold block text-slate-900 dark:text-white">To install on Android / Chrome:</span>
            <p className="text-[11px]">
              Tap the browser menu <b>(⋮)</b> and choose <b>"Install app"</b> or <b>"Add to Home screen"</b>.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 text-center text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          Close
        </button>

      </div>
    </div>
  );
};

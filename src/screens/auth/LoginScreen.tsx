import React, { useState } from 'react';
import { AnimatedLogo } from '../../components/common/AnimatedLogo';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { loginFarmer, loginOfficer, isLoading } = useAuth();
  const { navigate } = useAppData();
  const { t } = useLanguage();

  const [mobileOrEmail, setMobileOrEmail] = useState<string>('9845023456');
  const [password, setPassword] = useState<string>('dairy123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileOrEmail.trim()) {
      setErrorMessage('Please enter your mobile number or email.');
      return;
    }
    if (password.length < 4) {
      setErrorMessage('Please enter a valid password.');
      return;
    }
    setErrorMessage('');
    await loginFarmer(mobileOrEmail, password);
    navigate('home');
  };

  const handleDemoFarmer = async () => {
    setErrorMessage('');
    await loginFarmer('9845023456', 'demo123');
    navigate('home');
  };

  const handleDemoOfficer = async () => {
    setErrorMessage('');
    await loginOfficer();
    navigate('officer-dashboard');
  };

  return (
    <div className="min-h-full flex-1 flex flex-col justify-between p-5 sm:p-6 bg-slate-50 dark:bg-slate-950">
      
      {/* Top Brand */}
      <div className="space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between">
          <AnimatedLogo size="md" showText={true} />
          <button
            onClick={() => navigate('language-select')}
            className="text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2.5 py-1 rounded-xl"
          >
            Language / மொழி
          </button>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.welcomeBack}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to access your herd health and milk management dashboard.
          </p>
        </div>

        {/* Demo Buttons Banner */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 p-3.5 rounded-3xl border border-emerald-200/80 dark:border-emerald-800/80 space-y-2.5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-dairy-700 dark:text-dairy-300 block flex items-center gap-1">
            <Sparkles size={12} /> Instant 1-Tap Demo Access
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoFarmer}
              disabled={isLoading}
              className="py-2.5 px-3 rounded-2xl bg-dairy-600 hover:bg-dairy-700 text-white font-bold text-xs shadow-md shadow-dairy-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
              {t.demoFarmer}
            </button>

            <button
              type="button"
              onClick={handleDemoOfficer}
              disabled={isLoading}
              className="py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition border border-slate-700"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} className="text-amber-400" />}
              {t.demoOfficer}
            </button>
          </div>
        </div>

        {/* Standard Login Form */}
        <form onSubmit={handleStandardLogin} className="space-y-3 pt-1 text-xs">
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[11px] font-semibold border border-rose-200">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Mobile Number or Email
            </label>
            <div className="relative">
              <input
                type="text"
                value={mobileOrEmail}
                onChange={(e) => setMobileOrEmail(e.target.value)}
                placeholder="e.g. 98450 23456"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-dairy-500"
              />
              <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => navigate('forgot-password')}
                className="text-[11px] font-semibold text-dairy-600 dark:text-dairy-400 hover:underline"
              >
                {t.forgotPassword}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-dairy-500"
              />
              <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-dairy-600 to-teal-600 hover:from-dairy-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-dairy-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
            {t.login} <ArrowRight size={14} />
          </button>
        </form>
      </div>

      {/* Footer Register Link */}
      <div className="pt-6 pb-2 text-center text-xs text-slate-500 dark:text-slate-400 animate-fadeIn">
        <span>Don't have a dairy account? </span>
        <button
          onClick={() => navigate('register')}
          className="font-bold text-dairy-600 dark:text-dairy-400 hover:underline"
        >
          {t.register}
        </button>
      </div>

    </div>
  );
};

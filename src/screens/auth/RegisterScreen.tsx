import React, { useState } from 'react';
import { AnimatedLogo } from '../../components/common/AnimatedLogo';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Language } from '../../types';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RegisterScreen: React.FC = () => {
  const { register, isLoading } = useAuth();
  const { navigate } = useAppData();
  const { language, languageOptions, t } = useLanguage();

  const [name, setName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [farmName, setFarmName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [prefLang, setPrefLang] = useState<Language>(language);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!mobile.trim() || mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    await register({
      name,
      mobile: `+91 ${mobile}`,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@dairy.com`,
      farmName: farmName || `${name}'s Dairy Farm`,
      language: prefLang,
    });

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#16a34a', '#0d9488', '#f59e0b'],
    });

    setIsSuccess(true);
    setTimeout(() => {
      navigate('home');
    }, 1400);
  };

  return (
    <div className="min-h-full flex-1 flex flex-col justify-between p-5 sm:p-6 bg-slate-50 dark:bg-slate-950">
      
      {/* Top Brand */}
      <div className="space-y-3.5 animate-fadeIn">
        <div className="flex items-center justify-between">
          <AnimatedLogo size="sm" showText={true} />
          <button
            onClick={() => navigate('login')}
            className="text-xs font-bold text-dairy-600 dark:text-dairy-400 hover:underline"
          >
            {t.login}
          </button>
        </div>

        <div className="space-y-0.5">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.register}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join the smart AI dairy farming community today.
          </p>
        </div>

        {isSuccess ? (
          <div className="py-12 text-center space-y-3 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Account Created!</h3>
            <p className="text-xs text-slate-500">Welcome to Dairy Nova AI. Loading your farm dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[11px] font-semibold border border-rose-200">
                {error}
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Farmer Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-dairy-500"
                />
                <User size={14} className="absolute left-3 top-2.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. 98450 23456"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-dairy-500"
                />
                <Phone size={14} className="absolute left-3 top-2.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Farm Name
              </label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="e.g. Sri Lakshmi Dairy Farm"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-dairy-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Preferred Language
              </label>
              <select
                value={prefLang}
                onChange={(e) => setPrefLang(e.target.value as Language)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                {languageOptions.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full pl-8 pr-8 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                  <Lock size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Confirm *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-8 pr-8 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                  <Lock size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-dairy-600 to-teal-600 hover:from-dairy-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-dairy-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition mt-2"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
              {t.register} <ArrowRight size={14} />
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      {!isSuccess && (
        <div className="pt-4 pb-2 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>Already have an account? </span>
          <button
            onClick={() => navigate('login')}
            className="font-bold text-dairy-600 dark:text-dairy-400 hover:underline"
          >
            {t.login}
          </button>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { AnimatedLogo } from '../../components/common/AnimatedLogo';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { authApi } from '../../services/api/authApi';
import { Phone, Lock, KeyRound, CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ForgotPasswordScreen: React.FC = () => {
  const { navigate } = useAppData();
  const { t } = useLanguage();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mobileOrEmail, setMobileOrEmail] = useState<string>('9845023456');
  const [otp, setOtp] = useState<string>('482916');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileOrEmail.trim()) {
      setError('Please enter your registered mobile number or email.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authApi.requestPasswordReset(mobileOrEmail);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Please enter the 6-digit verification code sent to your phone.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const isValid = await authApi.verifyOtp(mobileOrEmail, otp);
      if (isValid) {
        setStep(3);
      } else {
        setError('Invalid OTP code. Please check and retry.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword(newPassword);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#16a34a', '#0d9488', '#38bdf8'],
      });
      setIsSuccess(true);
      setTimeout(() => {
        navigate('login');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex-1 flex flex-col justify-between p-5 sm:p-6 bg-slate-50 dark:bg-slate-950">
      
      {/* Header */}
      <div className="space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between">
          <AnimatedLogo size="sm" showText={true} />
          <button
            onClick={() => navigate('login')}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400"
          >
            Back to Login
          </button>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-dairy-600 dark:text-dairy-400">
            Step {step} of 3 • Security Recovery
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {step === 1 && 'Reset Password'}
            {step === 2 && 'Enter Verification Code'}
            {step === 3 && 'Set New Password'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {step === 1 && 'Enter your registered mobile or email to receive a 6-digit OTP code.'}
            {step === 2 && `We sent an OTP verification code to ${mobileOrEmail}.`}
            {step === 3 && 'Choose a strong new password for your dairy account.'}
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[11px] font-semibold border border-rose-200">
            {error}
          </div>
        )}

        {/* Step 1: Send Code */}
        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-3 pt-2 text-xs animate-fadeIn">
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-dairy-500"
                />
                <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-dairy-600 hover:bg-dairy-700 text-white font-bold text-xs shadow-md shadow-dairy-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              Send Reset Code <ArrowRight size={14} />
            </button>
          </form>
        )}

        {/* Step 2: Verify Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-3 pt-2 text-xs animate-fadeIn">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                6-Digit Verification Code (OTP)
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="482916"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center font-mono font-black text-lg tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-dairy-500"
                />
                <KeyRound size={14} className="absolute left-3 top-3.5 text-slate-400" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Demo code preset: <strong className="text-teal-600">482916</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Change Number
              </button>

              <button
                type="submit"
                disabled={loading}
                className="py-2.5 px-3 rounded-xl bg-dairy-600 hover:bg-dairy-700 text-white font-bold text-xs shadow-md shadow-dairy-600/30 flex items-center justify-center gap-1"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                Verify Code <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Set New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-3 pt-2 text-xs animate-fadeIn">
            {isSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 size={28} />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Password Reset Successful!</h4>
                <p className="text-slate-500 text-xs">Redirecting to login...</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    New Password (Min 6 chars)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-dairy-500"
                    />
                    <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-dairy-500"
                    />
                    <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl bg-dairy-600 hover:bg-dairy-700 text-white font-bold text-xs shadow-md shadow-dairy-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition mt-2"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                  Reset Password & Sign In
                </button>
              </>
            )}
          </form>
        )}
      </div>

      {/* Bottom Back Button */}
      <div className="pt-4 pb-2 text-center text-xs text-slate-500 dark:text-slate-400">
        <button
          onClick={() => navigate('login')}
          className="font-bold text-slate-700 dark:text-slate-300 hover:underline flex items-center justify-center gap-1 mx-auto"
        >
          <ArrowLeft size={13} /> Cancel & Return to Login
        </button>
      </div>

    </div>
  );
};

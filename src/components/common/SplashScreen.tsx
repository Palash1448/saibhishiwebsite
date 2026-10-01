import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  minDuration?: number; // Duration in ms, defaults to 2200ms
  showSkip?: boolean;
}

const LOADING_STEPS = [
  { text: 'Connecting to SaiBhishi Secure Cloud...', icon: Lock },
  { text: 'Verifying Secure Session...', icon: ShieldCheck },
  { text: 'Loading Bhishi & Member Ledgers...', icon: Sparkles },
  { text: 'Welcome to साई भिषी मंडळ!', icon: CheckCircle2 },
];

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDuration = 2000,
  showSkip = false,
}) => {
  const [progress, setProgress] = useState(15);
  const [stepIndex, setStepIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isRendered, setIsRendered] = useState(true);

  useEffect(() => {
    // Step ticker timer
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, minDuration / LOADING_STEPS.length);

    // Progress percentage interpolation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(prev + Math.floor(Math.random() * 18 + 12), 100);
      });
    }, minDuration / 8);

    // Finish timeout
    const finishTimeout = setTimeout(() => {
      setProgress(100);
      setStepIndex(LOADING_STEPS.length - 1);
      
      // Trigger fade out
      setIsFadingOut(true);

      const unmountTimeout = setTimeout(() => {
        setIsRendered(false);
        if (onFinish) onFinish();
      }, 500);

      return () => clearTimeout(unmountTimeout);
    }, minDuration);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearTimeout(finishTimeout);
    };
  }, [minDuration, onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsRendered(false);
      if (onFinish) onFinish();
    }, 300);
  };

  if (!isRendered) return null;

  const CurrentStepIcon = LOADING_STEPS[stepIndex].icon;

  return (
    <div
      className={`fixed inset-0 z-9999 flex flex-col items-center justify-between bg-slate-950 text-white select-none overflow-hidden transition-all duration-500 ease-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at center, #0f172a 0%, #06111f 55%, #020617 100%)',
      }}
    >
      {/* 1. Ambient Dynamic Glow Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[32rem] h-80 sm:h-[32rem] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '0.8s' }} />

      {/* Decorative Golden Mandal Outer Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-emerald-500/10 animate-spin-slow pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 sm:w-[28rem] sm:h-[28rem] rounded-full border border-dashed border-amber-500/10 animate-spin-reverse-slow pointer-events-none" />

      {/* Top Bar / Brand Badge */}
      <div className="pt-8 sm:pt-12 px-6 flex items-center justify-between w-full max-w-md z-10 animate-fade-in">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-emerald-500/20 text-[11px] font-medium text-emerald-300 backdrop-blur-md shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Finance & Investment Portal</span>
        </div>

        {showSkip && (
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Skip &rarr;
          </button>
        )}
      </div>

      {/* Center Core: Logo Emblem, Floating Glow & Typography */}
      <div className="flex flex-col items-center justify-center text-center px-6 z-10 max-w-md my-auto animate-scale-in">
        {/* Logo with Multi-Layered Glowing Halos */}
        <div className="relative mb-6 animate-float-gentle">
          {/* Pulsing Aura */}
          <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-amber-400/30 via-emerald-400/20 to-teal-400/30 blur-xl opacity-80 animate-pulse" />
          
          {/* Outer Golden Border Ring */}
          <div className="relative p-1.5 rounded-full bg-gradient-to-br from-amber-300 via-emerald-400 to-amber-500 shadow-2xl">
            <img
              src="/logo.png"
              alt="साई भिषी मंडळ"
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover shadow-2xl bg-slate-900 ring-2 ring-slate-950"
            />
          </div>

          {/* Verification Badge */}
          <div className="absolute -bottom-1 right-2 w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg ring-3 ring-slate-950">
            <ShieldCheck className="w-4.5 h-4.5 text-white" />
          </div>
        </div>

        {/* Titles with Shimmer Gradient */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display bg-gradient-to-r from-amber-200 via-white to-amber-300 bg-clip-text text-transparent drop-shadow-md">
            साई भिषी मंडळ
          </h1>
          <p className="text-sm sm:text-base font-semibold text-emerald-400 tracking-wide font-sans">
            SaiBhishi Finance & Investment Co.
          </p>
          <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto pt-1">
            Community Bhishi, Chit Funds & Microfinance Management
          </p>
        </div>
      </div>

      {/* Bottom Area: Progress Bar, Status Ticker & Security Tag */}
      <div className="w-full max-w-xs sm:max-w-sm px-6 pb-8 sm:pb-12 z-10 space-y-4 animate-fade-in">
        {/* Status Step Ticker */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-300 font-medium h-5">
          <CurrentStepIcon className="w-4 h-4 text-emerald-400 animate-spin-slow" />
          <span className="truncate transition-all duration-200">
            {LOADING_STEPS[stepIndex].text}
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-1.5">
          <div className="w-full h-1.5 sm:h-2 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/50 backdrop-blur-sm">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 shadow-sm shadow-emerald-500/50 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>SECURE CLOUD SYNC</span>
            <span className="font-bold text-emerald-400">{progress}%</span>
          </div>
        </div>

        {/* Bottom Lock / Security Disclaimer */}
        <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>256-Bit SSL Encrypted • Real-time Cloud Sync</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

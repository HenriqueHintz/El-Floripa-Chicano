import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { FireCanvas } from './FireCanvas';
import { SITE_INFO } from '../data/constants';
import { Flame } from 'lucide-react';

interface PreloaderProps {
  onFinish?: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFading(true);
            setTimeout(() => {
              setHidden(true);
              if (onFinish) onFinish();
            }, 600);
          }, 350);
          return 100;
        }
        const step = Math.floor(Math.random() * 20) + 12;
        return Math.min(100, prev + step);
      });
    }, 65);

    return () => clearInterval(interval);
  }, [onFinish]);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#001219] transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Rising Embers Canvas */}
      <FireCanvas />

      {/* Cinematic Ambient Glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#EE9B00]/15 blur-[140px] pointer-events-none" />


      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {/* Animated Brand Logo */}
        <div className="animate-pulse-glow">
          <Logo className="h-24 sm:h-28 w-auto" />
        </div>

        {/* Tagline */}
        <div className="flex items-center gap-2 text-[#EE9B00] font-warmth text-2xl sm:text-3xl -rotate-1">
          <Flame className="w-5 h-5 fill-current animate-bounce" />
          <span>{SITE_INFO.manifesto}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-64 max-w-xs flex flex-col gap-2 mt-4">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/15">
            <div
              className="h-full bg-gradient-to-r from-[#CA6702] via-[#EE9B00] to-[#94D2BD] transition-all duration-150 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase text-[#E9D8A6]/60">
            <span>Floripa • Laguna</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

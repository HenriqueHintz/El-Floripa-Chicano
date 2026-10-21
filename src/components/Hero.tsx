import React, { useState, useRef } from 'react';
import { FireCanvas } from './FireCanvas';
import { SITE_INFO } from '../data/constants';
import { ShoppingBag, ArrowDown, Flame } from 'lucide-react';
import { smoothScrollToTarget } from '../utils/scroll';

interface HeroProps {
  onNavigate?: (href: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: (y / (rect.height / 2)) * -4.5,
      y: (x / (rect.width / 2)) * 4.5,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleScrollToAbout = () => {
    if (onNavigate) {
      onNavigate('#about-section');
    } else {
      smoothScrollToTarget('#about-section');
    }
  };

  return (
    <section
      id="hero-section"
      className="relative min-h-[100dvh] flex flex-col justify-center items-center bg-[#001219] pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-24 overflow-hidden"
    >
      {/* Background Image with Ken Burns motion */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 animate-ken-burns opacity-35"
        style={{ backgroundImage: "url('/images/logos/hero.webp')" }}
      />

      {/* Fiery Embers Particle Canvas */}
      <FireCanvas />

      {/* Atmospheric Cinematic Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#CA6702]/15 via-transparent to-[#001219]/90 pointer-events-none z-[1]" />
      <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#EE9B00_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none z-[2]" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#EE9B00]/10 blur-[160px] pointer-events-none z-[2] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#CA6702]/15 blur-[160px] pointer-events-none z-[2] animate-pulse-glow" />

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 w-full my-auto">
        
        {/* 3D Interactive Hero Card */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: isHovered
              ? `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px)`
              : 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)',
            transition: isHovered
              ? 'transform 0.12s ease-out, box-shadow 0.2s ease-out'
              : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease-out',
            boxShadow: isHovered
              ? `${18 - tilt.y * 0.9}px ${18 + tilt.x * 0.9}px 0px 0px #001219`
              : '14px 14px 0px 0px #001219',
          }}
          className="w-full border-4 border-[#001219] rounded-[2.5rem] overflow-hidden bg-[#FAF5E8] relative p-8 sm:p-12 md:p-16 text-left will-change-transform"
        >
          {/* Inner dashed craft border */}
          <div className="absolute inset-4 border-[1.5px] border-dashed border-[#001219]/15 rounded-[1.8rem] pointer-events-none" />

          <div className="relative z-10 w-full flex flex-col items-start">
            {/* Badges Strip */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-6">
              <span className="font-warmth text-2xl sm:text-3xl text-[#BB3E03] -rotate-3 block select-none animate-hero-stamp hover:rotate-2 transition-transform duration-200 cursor-default">
                Autêntico!
              </span>
              <span className="inline-flex items-center gap-1.5 animate-badge-glow rounded-full">
                <span className="font-mono text-[11px] sm:text-xs font-black uppercase tracking-[0.22em] text-[#001219] bg-[#EE9B00] border-2 border-[#001219] rounded-full px-4 py-1.5 shadow-chicano-sm select-none">
                  TEX·BRA·MEX
                </span>
                <sup className="font-mono text-[10px] font-black text-[#001219]/70 -mt-1 select-none">
                  ®
                </sup>
              </span>
            </div>

            {/* Cinematic Main Headline with Animated Flame Text */}
            <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-[#001219] uppercase leading-[0.92] tracking-tight">
              <span className="block animate-hero-fade-1">FEITO COM FÉ,</span>
              <span className="block animate-hero-fade-2 animate-fire-text filter drop-shadow-[0_2px_12px_rgba(202,103,2,0.35)]">
                FOGO E CORAÇÃO.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="font-sans text-lg sm:text-2xl md:text-3xl text-[#001219]/85 mt-6 font-semibold leading-relaxed max-w-3xl animate-hero-fade-3">
              {SITE_INFO.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-8 sm:mt-10 w-full sm:w-auto animate-hero-fade-4">
              <a
                href={SITE_INFO.cardapioWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative overflow-hidden inline-flex items-center justify-center gap-3 px-9 py-4 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-[#001219] shadow-[4px_4px_0px_0px_#001219] hover:shadow-[7px_7px_0px_0px_#001219] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#001219] transition-all duration-200 cursor-pointer text-center group"
              >
                <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none animate-cta-shimmer" />
                <ShoppingBag className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6" />
                <span>PEÇA AGORA</span>
              </a>

              <button
                type="button"
                onClick={handleScrollToAbout}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#001219] hover:bg-[#CA6702] text-[#E9D8A6] hover:text-[#001219] font-display font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-[#001219] shadow-[4px_4px_0px_0px_#001219] hover:shadow-[7px_7px_0px_0px_#001219] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#001219] transition-all duration-200 cursor-pointer group"
              >
                <span>Nossa História</span>
                <ArrowDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-1" />
              </button>
            </div>
          </div>

          {/* Rotating Stamp with Animated Flickering Core Flame */}
          <div className="hidden lg:block absolute bottom-8 right-8 select-none pointer-events-none">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
                <path
                  id="stampHeroPath"
                  d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                  fill="none"
                />
                <text
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '7px',
                    fontWeight: 900,
                    fill: '#CA6702',
                    fillOpacity: 0.65,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  <textPath href="#stampHeroPath" startOffset="0%">
                    {SITE_INFO.stampText}
                  </textPath>
                </text>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[#EE9B00]">
                <Flame className="w-7 h-7 stroke-[2.5px] fill-[#EE9B00]/30 animate-flame-flicker" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Immersive Transition to About */}
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent via-[#001219]/70 to-[#003843]/40 pointer-events-none z-[3]" />
      <div className="section-divider-warm" />
      <div className="section-divider-glow-warm" />
    </section>
  );
};

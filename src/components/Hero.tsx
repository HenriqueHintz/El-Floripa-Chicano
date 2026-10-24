import React, { useState, useRef, useEffect } from 'react';
import { FireCanvas } from './FireCanvas';
import { SITE_INFO } from '../data/constants';
import { ShoppingBag, ArrowDown, Flame } from 'lucide-react';
import { smoothScrollToTarget } from '../utils/scroll';

interface HeroProps {
  onNavigate?: (href: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });

    const tiltX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -6;
    const tiltY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 6;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setMousePos({ x: 50, y: 50 });
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
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[100dvh] flex flex-col justify-center items-center bg-[#001219] pt-28 sm:pt-32 pb-20 sm:pb-24 overflow-hidden selection:bg-[#EE9B00] selection:text-[#001219]"
    >
      {/* 1. Camada de Fundo Cinematográfica com Imagem e Ken Burns */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 animate-ken-burns opacity-40 mix-blend-luminosity filter contrast-125"
        style={{ backgroundImage: "url('/images/logos/hero.webp')" }}
      />

      {/* 2. Textura Rupestre de Fundo com Fusão Suave */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.14] mix-blend-overlay pointer-events-none z-[1]"
        style={{ backgroundImage: "url('/images/sections/texture-rupestre.webp')" }}
      />

      {/* 3. Partículas de Brasa e Fogo Vivas */}
      <FireCanvas />

      {/* 4. Iluminação Volumétrica Dinâmica que Segue o Cursor */}
      <div
        className="absolute inset-0 pointer-events-none z-[2] transition-opacity duration-700 ease-out"
        style={{
          background: `radial-gradient(circle 650px at ${mousePos.x}% ${mousePos.y}%, rgba(238, 155, 0, 0.16), transparent 70%)`,
        }}
      />

      {/* 5. Glows Atmosféricos Profundos */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#EE9B00]/12 blur-[170px] pointer-events-none z-[2] animate-ambient-glow" />
      <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-[#CA6702]/15 blur-[170px] pointer-events-none z-[2] animate-ambient-glow" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#001219]/90 via-[#001219]/40 to-[#001219] pointer-events-none z-[3]" />

      {/* 6. Palco Principal Cinematográfico Aberto (Sem o retângulo branco) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Lado Esquerdo: Tipografia Monumental, Selos e CTAs */}
          <div
            className="lg:col-span-8 flex flex-col items-start text-left will-change-transform"
            style={{
              transform: isHovered
                ? `perspective(1000px) rotateX(${tilt.x * 0.4}deg) rotateY(${tilt.y * 0.4}deg) translateZ(10px)`
                : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
              transition: isHovered ? 'transform 0.15s ease-out' : 'transform 0.6s ease-out',
            }}
          >
            {/* Faixa de Selos e Badges Vivos */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
              <span className="font-warmth text-2xl sm:text-3xl text-[#EE9B00] -rotate-3 block select-none animate-hero-stamp drop-shadow-[0_2px_8px_rgba(238,155,0,0.5)]">
                Autêntico!
              </span>

              <div className="inline-flex items-center gap-1.5 animate-badge-glow rounded-full">
                <span className="font-mono text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-[#001219] bg-[#EE9B00] border-2 border-[#FAF5E8] rounded-full px-4 py-1.5 shadow-[0_0_20px_rgba(238,155,0,0.6)] select-none">
                  TEX·BRA·MEX
                </span>
                <sup className="font-mono text-[10px] font-black text-[#EE9B00] select-none">
                  ®
                </sup>
              </div>
            </div>

            {/* Título Monumental Feito com Fé, Fogo e Coração */}
            <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white uppercase leading-[0.92] tracking-tight">
              <span className="block drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] animate-hero-fade-1">
                FEITO COM FÉ,
              </span>
              <span className="block animate-hero-fade-2 animate-fire-text filter drop-shadow-[0_0_40px_rgba(238,155,0,0.5)]">
                FOGO E CORAÇÃO.
              </span>
            </h1>

            {/* Subtítulo Integrado com Glassmorphism Leve */}
            <div className="mt-6 sm:mt-8 max-w-2xl px-5 py-3.5 rounded-2xl bg-white/[0.05] backdrop-blur-md border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.5)] animate-hero-fade-3">
              <p className="font-sans text-lg sm:text-2xl md:text-3xl text-[#E9D8A6] font-semibold leading-relaxed">
                {SITE_INFO.subtitle}
              </p>
            </div>

            {/* Botões de Ação de Alta Fidelidade */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-8 sm:mt-10 w-full sm:w-auto animate-hero-fade-4">
              <a
                href={SITE_INFO.cardapioWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative overflow-hidden inline-flex items-center justify-center gap-3 px-9 py-4 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-[#001219] shadow-[0_0_25px_rgba(238,155,0,0.5),4px_4px_0px_0px_#001219] hover:shadow-[0_0_35px_rgba(238,155,0,0.8),7px_7px_0px_0px_#001219] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px] transition-all duration-200 cursor-pointer text-center group"
              >
                <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none animate-cta-shimmer" />
                <ShoppingBag className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6" />
                <span>PEÇA AGORA</span>
              </a>

              <button
                type="button"
                onClick={handleScrollToAbout}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-[#FAF5E8] text-[#E9D8A6] hover:text-[#001219] font-display font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-white/20 hover:border-[#001219] backdrop-blur-md shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)] hover:shadow-[7px_7px_0px_0px_#001219] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px] transition-all duration-200 cursor-pointer group"
              >
                <span>Nossa História</span>
                <ArrowDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-1 text-[#EE9B00] group-hover:text-[#001219]" />
              </button>
            </div>
          </div>

          {/* Lado Direito: Selo de Autenticidade Giratório e Brasas Cinematográficas */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end items-center relative">
            
            {/* Halo de luz quente ao redor do selo */}
            <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-[#EE9B00]/15 blur-3xl pointer-events-none animate-pulse-glow" />

            {/* Selo Giratório Monumental com Chama Viva no Centro */}
            <div
              className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full p-2 bg-gradient-to-br from-white/15 via-white/[0.03] to-transparent backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_40px_rgba(238,155,0,0.2)] flex items-center justify-center transition-transform duration-700 ease-out hover:scale-105 group"
              style={{
                transform: isHovered
                  ? `perspective(800px) rotateX(${tilt.x * -0.6}deg) rotateY(${tilt.y * -0.6}deg)`
                  : 'perspective(800px) rotateX(0deg) rotateY(0deg)',
              }}
            >
              {/* Aro de Brilho Interno */}
              <div className="absolute inset-3 rounded-full border border-dashed border-[#EE9B00]/30 pointer-events-none" />

              {/* SVG de Texto Circular em Rotação Contínua */}
              <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow pointer-events-none select-none">
                <path
                  id="stampHeroPath"
                  d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                  fill="none"
                />
                <text
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '6.8px',
                    fontWeight: 900,
                    fill: '#EE9B00',
                    fillOpacity: 0.9,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}
                >
                  <textPath href="#stampHeroPath" startOffset="0%">
                    {SITE_INFO.stampText}
                  </textPath>
                </text>
              </svg>

              {/* Chama Viva no Núcleo do Selo */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#001219]/90 border border-[#EE9B00]/50 shadow-[0_0_25px_rgba(238,155,0,0.6)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-[#EE9B00] fill-[#EE9B00]/40 stroke-[2px] animate-flame-flicker" />
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 7. Transição Fluida e Orgânica para a Seção História */}
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent via-[#001219]/70 to-[#001219] pointer-events-none z-[3]" />
      <div className="section-divider-warm" />
      <div className="section-divider-glow-warm" />
    </section>
  );
};

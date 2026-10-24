import React, { useState, useRef } from 'react';
import { FireCanvas } from './FireCanvas';
import { SITE_INFO } from '../data/constants';
import { ShoppingBag, ArrowDown } from 'lucide-react';
import { smoothScrollToTarget } from '../utils/scroll';

interface HeroProps {
  onNavigate?: (href: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const tiltX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -4;
    const tiltY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 4;
    setTilt({ x: tiltX, y: tiltY });
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
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[100dvh] flex flex-col justify-between sm:justify-center items-stretch sm:items-center bg-[#001219] pt-24 sm:pt-32 pb-4 sm:pb-24 overflow-hidden selection:bg-[#EE9B00] selection:text-[#001219]"
    >
      {/* 1. Imagem de Fundo 100% Colorida, Autêntica e com Movimento Suave Ken Burns */}
      <div
        className="absolute inset-0 bg-cover bg-center sm:bg-[center_top_15%] md:bg-center pointer-events-none z-0 animate-ken-burns opacity-85 filter contrast-105 saturate-110"
        style={{ backgroundImage: "url('/images/logos/hero.webp')" }}
      />

      {/* 2. Textura Rupestre de Fundo Muito Suave */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.06] mix-blend-overlay pointer-events-none z-[1]"
        style={{ backgroundImage: "url('/images/sections/texture-rupestre.webp')" }}
      />

      {/* 3. Partículas de Fogo e Brasas Vivas */}
      <FireCanvas />

      {/* 4. Vinhetas e Sombreamento de Legibilidade (Sem filtro azul: apenas contraste neutro) */}
      {/* Sombra escura no topo para a barra de navegação */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none z-[2]" />
      
      {/* Sombra lateral para contraste do texto */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent pointer-events-none z-[2]" />

      {/* Sombra inferior suave para a transição com a próxima seção */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#001219] via-black/60 to-transparent pointer-events-none z-[2]" />

      {/* 5. Conteúdo Principal Cinematográfico Aberto */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex-1 sm:flex-initial flex flex-col justify-between sm:justify-center sm:my-auto">
        <div
          className="flex-1 sm:flex-initial flex flex-col items-start text-left max-w-3xl will-change-transform justify-between sm:justify-start"
          style={{
            transform: isHovered
              ? `perspective(1000px) rotateX(${tilt.x * 0.3}deg) rotateY(${tilt.y * 0.3}deg) translateZ(8px)`
              : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
            transition: isHovered ? 'transform 0.15s ease-out' : 'transform 0.6s ease-out',
          }}
        >
          {/* Bloco de Textos e Badges */}
          <div className="flex flex-col items-start my-auto sm:my-0">
            {/* Badges de Autenticidade */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <span className="font-warmth text-2xl sm:text-3xl text-[#EE9B00] -rotate-3 block select-none animate-hero-stamp drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                Autêntico!
              </span>

              <div className="inline-flex items-center gap-1.5 animate-badge-glow rounded-full">
                <span className="font-mono text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-[#001219] bg-[#EE9B00] border-2 border-[#FAF5E8] rounded-full px-4 py-1.5 shadow-[0_0_20px_rgba(238,155,0,0.5)] select-none">
                  TEX·BRA·MEX
                </span>
                <sup className="font-mono text-[10px] font-black text-[#EE9B00] select-none">
                  ®
                </sup>
              </div>
            </div>

            {/* Título Monumental: Feito com Fé, Fogo e Coração (Deslocado mais para baixo no mobile com mt-10) */}
            <h1 className="mt-10 sm:mt-0 font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white uppercase leading-[0.92] tracking-tight">
              <span className="block drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] animate-hero-fade-1">
                FEITO COM{' '}
                <span
                  className="bg-gradient-to-r from-[#FF4D00] via-[#E63946] to-[#D62828] bg-clip-text text-transparent filter drop-shadow-[0_0_35px_rgba(230,57,70,0.65)]"
                  style={{
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  FÉ
                </span>
                ,
              </span>
              <span className="block drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] animate-hero-fade-2">
                <span
                  className="bg-gradient-to-r from-[#FF4D00] via-[#E63946] to-[#D62828] bg-clip-text text-transparent filter drop-shadow-[0_0_35px_rgba(230,57,70,0.65)]"
                  style={{
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  FOGO
                </span>{' '}
                E{' '}
                <span
                  className="bg-gradient-to-r from-[#FF4D00] via-[#E63946] to-[#D62828] bg-clip-text text-transparent filter drop-shadow-[0_0_35px_rgba(230,57,70,0.65)]"
                  style={{
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  CORAÇÃO
                </span>
                .
              </span>
            </h1>

            {/* Subtítulo: Apresentação Limpa com Quebra no Mobile e Posicionado Mais Abaixo */}
            <div className="mt-12 sm:mt-8 flex items-center gap-3 sm:gap-4 animate-hero-fade-3">
              <div className="w-1.5 h-10 sm:h-12 rounded-full bg-gradient-to-b from-[#FF4D00] to-[#E63946] shadow-[0_0_15px_rgba(230,57,70,0.8)] shrink-0" />
              <p className="font-sans text-base sm:text-2xl md:text-3xl text-[#FAF5E8] font-medium leading-snug sm:leading-relaxed drop-shadow-[0_3px_12px_rgba(0,0,0,0.95)]">
                Comida mexicana <br className="sm:hidden" />com alma brasileira.
              </p>
            </div>
          </div>

          {/* 6. Botões de Ação: Centralizados e acima da pimenta no mobile (justify-center pb-32), posição original no desktop (sm:justify-start sm:mt-10 sm:pb-0) */}
          <div className="flex flex-row flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-4 mt-auto sm:mt-10 pb-32 sm:pb-0 w-full sm:w-auto self-center sm:self-start animate-hero-fade-4">
            <a
              href={SITE_INFO.cardapioWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden inline-flex items-center justify-center gap-1.5 sm:gap-3 px-4 sm:px-9 py-2 sm:py-4 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl sm:rounded-2xl border-2 border-[#001219] shadow-[0_0_20px_rgba(238,155,0,0.4),3px_3px_0px_0px_#001219] sm:shadow-[0_0_25px_rgba(238,155,0,0.4),4px_4px_0px_0px_#001219] hover:shadow-[0_0_30px_rgba(238,155,0,0.7),5px_5px_0px_0px_#001219] sm:hover:shadow-[0_0_35px_rgba(238,155,0,0.7),7px_7px_0px_0px_#001219] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[1px] active:translate-y-[1px] sm:active:translate-x-[2px] sm:active:translate-y-[2px] transition-all duration-200 cursor-pointer text-center group"
            >
              <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none animate-cta-shimmer" />
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6" />
              <span>PEÇA AGORA</span>
            </a>

            <button
              type="button"
              onClick={handleScrollToAbout}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-3 px-4 sm:px-8 py-2 sm:py-4 bg-black/60 hover:bg-[#FAF5E8] text-[#E9D8A6] hover:text-[#001219] font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl sm:rounded-2xl border-2 border-white/20 hover:border-[#001219] backdrop-blur-md shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-[5px_5px_0px_0px_#001219] sm:hover:shadow-[7px_7px_0px_0px_#001219] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[1px] active:translate-y-[1px] sm:active:translate-x-[2px] sm:active:translate-y-[2px] transition-all duration-200 cursor-pointer group"
            >
              <span>Nossa História</span>
              <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:translate-y-1 text-[#EE9B00] group-hover:text-[#001219]" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Divisória Suave de Transição */}
      <div className="section-divider-warm" />
      <div className="section-divider-glow-warm" />
    </section>
  );
};

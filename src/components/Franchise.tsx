import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';

interface FranchiseProps {
  onNavigateToFranchise?: () => void;
}

export const Franchise: React.FC<FranchiseProps> = ({ onNavigateToFranchise }) => {
  const handleStartClick = (e: React.MouseEvent) => {
    if (onNavigateToFranchise) {
      e.preventDefault();
      onNavigateToFranchise();
    }
  };

  return (
    <section
      id="franchise-section"
      className="relative overflow-hidden flex flex-col justify-center items-center min-h-0 lg:min-h-[100dvh] py-0 scroll-mt-16 bg-[#001219]"
    >
      {/* DESKTOP VERSION (>= lg): A própria seção é a imagem horizontal Seja um Franqueado (1376x768), sem Frida Kahlo e sem card azul */}
      <div className="hidden lg:flex relative w-full min-h-[100dvh] items-center">
        <img
          src="/images/sections/franquia-bg-horizontal.webp"
          alt="Seja um Franqueado El Chicano"
          className="w-full h-full object-cover object-center absolute inset-0 pointer-events-none select-none z-0"
          loading="lazy"
          decoding="async"
        />
        {/* Gradiente suave apenas no lado esquerdo para destacar o texto sem cobrir a arte da direita */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#001219]/75 via-[#001219]/30 to-transparent pointer-events-none z-[1]" />

        <div className="w-full max-w-7xl mx-auto px-12 relative z-10 py-20">
          <div className="max-w-xl flex flex-col items-start text-left text-white">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono tracking-widest text-[#001219] uppercase font-bold px-4 py-1.5 bg-[#E9D8A6] border-2 border-[#001219] rounded-full w-fit shadow-[3px_3px_0px_#001219] mb-6">
              <Flame className="w-3.5 h-3.5 text-[#BB3E03] fill-current" />
              Expansão e Parceria
            </span>

            <span className="font-script text-3xl text-[#E9D8A6] font-black drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] block mb-1">
              Seja dono do seu próprio negócio!
            </span>

            <h2 className="font-display font-black text-5xl xl:text-6xl text-white uppercase leading-[0.98] tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              LEVE O EL CHICANO <br />
              <span className="text-[#EE9B00]">PARA SUA CIDADE</span>
            </h2>

            <p className="text-white/95 text-lg font-sans font-medium leading-relaxed mt-5 max-w-md drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              O modelo comprovado de comida mexicana artesanal que conquista multidões.
            </p>

            <button
              type="button"
              onClick={handleStartClick}
              className="mt-8 w-fit relative overflow-hidden group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-[#001219] shadow-[4px_4px_0px_0px_#001219] hover:shadow-[6px_6px_0px_#001219] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer font-display text-center"
            >
              <span className="absolute inset-0 -translate-x-full animate-cta-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              <span className="relative z-10">QUERO COMEÇAR</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE VERSION (< lg): A própria seção é a imagem vertical Seja um Franqueado (896x1152), nítida, sem zoom e sem blur azul */}
      <div className="lg:hidden relative w-full overflow-hidden bg-[#001219]">
        <img
          src="/images/sections/franquia-bg.webp"
          alt="Seja um Franqueado El Chicano"
          width={896}
          height={1152}
          loading="lazy"
          decoding="async"
          className="w-full h-auto block select-none pointer-events-none"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#001219]/95 via-[#001219]/50 to-transparent pointer-events-none" />

        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-7 pt-4 flex flex-col items-center text-center">
          <span className="font-script text-lg text-[#E9D8A6] font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] block">
            Seja dono do seu próprio negócio!
          </span>
          <h3 className="font-display font-black text-xl text-white uppercase tracking-tight mt-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            LEVE O EL CHICANO <br />
            <span className="text-[#EE9B00] drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">PARA SUA CIDADE</span>
          </h3>

          <button
            type="button"
            onClick={handleStartClick}
            className="mt-3.5 w-fit relative overflow-hidden group inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-black text-sm uppercase tracking-wider rounded-xl border-2 border-[#001219] shadow-[3px_3px_0px_0px_#001219] active:translate-y-0 transition-all duration-300 cursor-pointer font-display text-center"
          >
            <span className="absolute inset-0 -translate-x-full animate-cta-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
            <span className="relative z-10">QUERO COMEÇAR</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </section>
  );
};

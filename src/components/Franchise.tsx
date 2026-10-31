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
      className="relative overflow-hidden flex flex-col justify-between items-center min-h-[640px] sm:min-h-[100dvh] pt-4 pb-8 sm:py-20 md:py-24 scroll-mt-16 bg-[#001219]"
    >
      {/* Desktop Background & Atmosphere */}
      <div
        className="hidden sm:block absolute inset-0 bg-cover bg-center pointer-events-none z-0"
        style={{
          backgroundImage: "url('/images/sections/frida-kahlo.webp')",
        }}
      />
      <div className="hidden sm:block absolute inset-0 bg-[#005F73]/65 pointer-events-none" />
      <div
        className="hidden sm:block absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-25"
        style={{ backgroundImage: "url('/images/sections/texture-rupestre.webp')" }}
      />
      <div className="hidden sm:block absolute inset-0 opacity-[0.03] bg-[radial-gradient(#94D2BD_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="hidden sm:block absolute top-1/3 left-1/3 w-[600px] h-[600px] rounded-full bg-[#94D2BD]/10 blur-[160px] pointer-events-none z-[1]" />

      {/* MOBILE ONLY: A imagem franquia-bg.webp enquadrada perfeitamente na largura (sem barras pretas laterais) */}
      <div
        className="lg:hidden absolute inset-x-0 top-0 h-[490px] pointer-events-none z-0"
        style={{
          backgroundImage: "url('/images/sections/franquia-bg.webp')",
          backgroundSize: '100% auto',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Mobile Overlays: Vinheta suave no topo e degradê escuro na base da foto */}
      <div className="lg:hidden absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#001219]/60 to-transparent pointer-events-none z-[1]" />
      <div className="lg:hidden absolute inset-x-0 top-56 h-[280px] bg-gradient-to-t from-[#001219] via-[#001219]/85 to-transparent pointer-events-none z-[1]" />

      {/* Desktop Top Transition */}
      <div className="hidden sm:block absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#002430] to-transparent pointer-events-none z-[2]" />

      <div className="w-full max-w-md lg:max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10 my-auto">
        {/* On Mobile: Borderless, sem caixa azul, conteúdo integrado diretamente ao fundo fotográfico; On Desktop: card 12 colunas */}
        <div className="w-full border-0 lg:border-4 lg:border-[#001219] rounded-none lg:rounded-[2.5rem] overflow-visible lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-none lg:shadow-[12px_12px_0px_0px_#001219] bg-transparent lg:bg-[#005f73] relative hover:shadow-[8px_8px_0px_#001219] lg:hover:shadow-[16px_16px_0px_0px_#001219] hover:-translate-y-0.5 lg:hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
          
          {/* Top accent bar on desktop */}
          <div className="hidden lg:block absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#BB3E03] via-[#EE9B00] to-[#CA6702] z-20" />

          {/* Content Column (7 cols desktop, full width mobile) */}
          <div className="lg:col-span-7 bg-transparent lg:bg-[#005f73] p-0 lg:p-16 min-h-[520px] sm:min-h-0 flex flex-col justify-between items-start text-left text-white relative z-10">
            <div className="hidden lg:block absolute inset-4 border-[1.5px] border-dashed border-white/10 rounded-[1.8rem] pointer-events-none" />
            
            {/* Desktop Only Badge: Tag removida no mobile a pedido do usuário */}
            <div className="hidden lg:block w-full pt-1">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#001219] uppercase font-bold px-3.5 py-1.5 bg-[#E9D8A6] border-2 border-[#001219] rounded-full w-fit shadow-[2px_2px_0px_#001219] mb-6 hover:rotate-1 transition-transform duration-300 cursor-default">
                <Flame className="w-3 h-3 text-[#BB3E03] fill-current" />
                Expansão e Parceria
              </span>
            </div>

            {/* Bottom Content Area: Ajustado para harmonizar com a foto de fundo */}
            <div className="w-full mt-auto pt-4">
              {/* Desktop Headline */}
              <h2 className="hidden lg:block font-display font-black text-4xl md:text-5xl lg:text-6xl text-white uppercase leading-none tracking-tight">
                SEJA UM <br />
                <span className="relative inline-block text-[#E9D8A6] font-manifesto mt-2">
                  FRANQUEADO!
                  <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-[#EE9B00] rounded-full animate-badge-glow" />
                </span>
              </h2>

              {/* Mobile Headline */}
              <div className="lg:hidden">
                <span className="font-script text-base text-[#E9D8A6] font-black drop-shadow-md block">
                  Seja dono do seu próprio negócio!
                </span>
                <h3 className="font-display font-black text-lg text-white uppercase tracking-tight mt-0.5">
                  LEVE O EL CHICANO <br />
                  <span className="text-[#EE9B00]">PARA SUA CIDADE</span>
                </h3>
              </div>

              <p className="hidden lg:block text-white/95 text-base lg:text-lg font-sans font-medium leading-relaxed mt-6 max-w-md drop-shadow-sm">
                O modelo comprovado de comida mexicana artesanal que conquista multidões.
              </p>

              <button
                type="button"
                onClick={handleStartClick}
                className="mt-3.5 sm:mt-10 w-full sm:w-auto relative overflow-hidden group inline-flex items-center justify-center gap-2.5 sm:gap-3 px-5 py-3 sm:px-8 sm:py-4 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl sm:rounded-2xl border-2 border-[#001219] shadow-[3px_3px_0px_0px_#001219] sm:shadow-[4px_4px_0px_0px_#001219] hover:shadow-[6px_6px_0px_#001219] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer font-display text-center"
              >
                <span className="absolute inset-0 -translate-x-full animate-cta-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                <span className="relative z-10">QUERO COMEÇAR</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* Desktop Right Column: Large Photo Banner (5 cols desktop only) */}
          <div className="hidden lg:block lg:col-span-5 min-h-[380px] border-l-4 border-[#001219] relative overflow-hidden group">
            <div
              className="absolute inset-0 bg-cover bg-[center_65%] pointer-events-none animate-ken-burns transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              style={{ backgroundImage: "url('/images/sections/franquia-bg.webp')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#001219]/25 to-transparent pointer-events-none z-[1]" />
          </div>

        </div>
      </div>

      {/* Refined Immersive Hairline Divider connecting Franchise to Contact */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EE9B00]/70 to-transparent pointer-events-none z-20" />
      <div className="lg:hidden absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-[#EE9B00]/25 blur-[4px] rounded-full pointer-events-none z-10" />

      {/* Desktop Bottom Transition */}
      <div className="hidden sm:block absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent via-[#001219]/70 to-[#001219] pointer-events-none z-[2]" />
      <div className="hidden sm:block section-divider-warm" />
      <div className="hidden sm:block section-divider-glow-warm" />
    </section>
  );
};

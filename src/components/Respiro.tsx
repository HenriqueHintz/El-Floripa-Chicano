import React from 'react';
import { SITE_INFO } from '../data/constants';
import { TurquoiseCanvas } from './TurquoiseCanvas';
import { Flame, ShoppingBag } from 'lucide-react';
import { smoothScrollToTarget } from '../utils/scroll';

interface RespiroProps {
  onNavigate?: (href: string) => void;
}

export const Respiro: React.FC<RespiroProps> = ({ onNavigate }) => {
  const handleScrollToContact = () => {
    if (onNavigate) {
      onNavigate('#contact-section');
    } else {
      smoothScrollToTarget('#contact-section');
    }
  };

  return (
    <section
      id="respiro-section"
      className="relative overflow-hidden flex flex-col items-center justify-center bg-[#FAF5E8] sm:bg-[#001219] min-h-0 sm:min-h-[100dvh] pt-14 pb-10 sm:py-20 md:py-24 scroll-mt-16"
    >
      {/* Desktop Background Gradient & Image with motion */}
      <div
        className="hidden sm:block absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'linear-gradient(160deg, #001219 0%, #002430 50%, #003843 100%)',
        }}
      />
      <div
        className="hidden sm:block absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-40 animate-ken-burns"
        style={{ backgroundImage: "url('/images/sections/respiro-bg.webp')" }}
      />

      {/* Desktop Turquoise Canvas & Atmosphere Glows */}
      <div className="hidden sm:block pointer-events-none">
        <TurquoiseCanvas />
        <div className="absolute top-0 left-1/4 w-[600px] h-64 rounded-full bg-[#EE9B00]/10 blur-[130px] z-[1]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-64 rounded-full bg-[#005F73]/25 blur-[130px] z-[1]" />
      </div>

      {/* Refined Immersive Hairline Divider connecting MenuSection (dark) to Respiro (cream) */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EE9B00]/70 to-transparent pointer-events-none z-20" />
      <div className="sm:hidden absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-[#EE9B00]/25 blur-[4px] rounded-full pointer-events-none z-10" />

      {/* Desktop Top Transition */}
      <div className="hidden sm:block absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#001219] to-transparent pointer-events-none z-[2]" />

      {/* Main Content Container */}
      <div className="w-full max-w-sm sm:max-w-4xl mx-auto px-4 sm:px-6 relative z-10 my-auto">
        {/* On Mobile: Seamless with section background; On Desktop: Floating card */}
        <div className="w-full bg-[#FAF5E8] border-0 sm:border-4 border-[#001219] rounded-none sm:rounded-[2.5rem] shadow-none sm:shadow-[14px_14px_0px_0px_#001219] sm:hover:shadow-[18px_18px_0px_0px_#001219] sm:hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden relative p-4 sm:p-12 md:p-16 text-center flex flex-col items-center">
          
          {/* Top accent bar on desktop */}
          <div className="hidden sm:block absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#BB3E03] via-[#EE9B00] to-[#CA6702]" />
          
          {/* Inner decorative dashed frame - Hidden on mobile */}
          <div className="hidden sm:block absolute inset-4 border border-dashed border-[#001219]/15 rounded-[1.8rem] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center w-full">
            {/* Top Flame Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EE9B00] border-2 border-[#001219] shadow-chicano-sm flex items-center justify-center shrink-0 mb-3 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
              <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-[#001219] fill-current animate-flame-flicker" />
            </div>

            {/* Handwritten Quote */}
            <span className="font-script text-base sm:text-3xl lg:text-4xl text-[#CA6702] tracking-wide font-black block mb-2 sm:mb-4 max-w-2xl">
              "Feito com fé, fogo e coração."
            </span>

            {/* Main Statement */}
            <h3 className="font-display font-black text-2xl sm:text-4xl lg:text-6xl text-[#001219] uppercase tracking-tight leading-[1.05] sm:leading-[0.95] mt-1 sm:mt-2">
              A CASA ESTÁ PRONTA. <br />
              <span className="text-[#005F73]">SÓ FALTA VOCÊ.</span>
            </h3>

            {/* Action Buttons: Stacked vertically on mobile with matching width */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-5 sm:mt-8 w-auto">
              <a
                href={SITE_INFO.cardapioWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative overflow-hidden group w-44 sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 py-2.5 px-5 sm:py-4 sm:px-9 min-h-[44px] sm:min-h-[46px] bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-sm uppercase tracking-wider rounded-xl sm:rounded-2xl border-2 border-[#001219] shadow-[3px_3px_0px_#001219] sm:shadow-chicano hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer text-center"
              >
                <span className="absolute inset-0 -translate-x-full animate-cta-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                <ShoppingBag className="w-4 h-4 sm:w-4 sm:h-4 relative z-10 shrink-0" />
                <span className="relative z-10">PEÇA AGORA</span>
              </a>

              <button
                type="button"
                onClick={handleScrollToContact}
                className="w-44 sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 py-2.5 px-5 sm:py-4 sm:px-8 min-h-[44px] sm:min-h-[46px] bg-white hover:bg-[#E9D8A6] text-[#001219] font-display font-black text-sm uppercase tracking-wider rounded-xl sm:rounded-2xl border-2 border-[#001219] shadow-[3px_3px_0px_#001219] sm:shadow-chicano hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer text-center"
              >
                <span>Contato</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Refined Immersive Hairline Divider connecting Respiro (cream) to Gallery (dark teal) */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0A9396]/70 to-transparent pointer-events-none z-20" />
      <div className="sm:hidden absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-[#0A9396]/25 blur-[4px] rounded-full pointer-events-none z-10" />

      {/* Desktop Bottom Transition */}
      <div className="hidden sm:block absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent via-[#003843]/60 to-[#005F73]/50 pointer-events-none z-[2]" />
      <div className="hidden sm:block section-divider-cool" />
      <div className="hidden sm:block section-divider-glow-cool" />
    </section>
  );
};

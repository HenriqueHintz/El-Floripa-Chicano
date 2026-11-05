import React from 'react';
import { SITE_INFO } from '../data/constants';
import { TurquoiseCanvas } from './TurquoiseCanvas';
import { Flame, ShoppingBag } from 'lucide-react';
import { smoothScrollToTarget } from '../utils/scroll';
import { SectionDivider } from './SectionDivider';

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

      {/* Immersive Light Divider connecting MenuSection (dark) to Respiro (cream) */}
      <SectionDivider position="top" variant="warm" blend="dark-to-cream" />

      {/* Desktop Top Transition */}
      <div className="hidden sm:block absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#001219] to-transparent pointer-events-none z-[2]" />

      {/* Main Content Container */}
      <div className="w-full max-w-sm sm:max-w-xl lg:max-w-2xl mx-auto px-4 sm:px-6 relative z-10 my-auto">
        {/* On Mobile: Seamless with section background; On Desktop: Compact Floating card */}
        <div className="w-full bg-[#FAF5E8] border-0 sm:border-4 border-[#001219] rounded-none sm:rounded-3xl shadow-none sm:shadow-[10px_10px_0px_0px_#001219] sm:hover:shadow-[14px_14px_0px_0px_#001219] sm:hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden relative p-4 sm:p-7 md:p-9 text-center flex flex-col items-center">
          
          {/* Top accent bar on desktop */}
          <div className="hidden sm:block absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#BB3E03] via-[#EE9B00] to-[#CA6702]" />
          
          {/* Inner decorative dashed frame - Hidden on mobile */}
          <div className="hidden sm:block absolute inset-3 border border-dashed border-[#001219]/15 rounded-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center w-full">
            {/* Top Flame Icon */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#EE9B00] border-2 border-[#001219] shadow-chicano-sm flex items-center justify-center shrink-0 mb-2.5 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-[#001219] fill-current animate-flame-flicker" />
            </div>

            {/* Handwritten Quote */}
            <span className="font-script text-base sm:text-2xl lg:text-3xl text-[#CA6702] tracking-wide font-black block mb-1.5 sm:mb-2.5 max-w-xl">
              "Feito com fé, fogo e coração."
            </span>

            {/* Main Statement */}
            <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-[#001219] uppercase tracking-tight leading-[1.05] sm:leading-[1.0] mt-1">
              A CASA ESTÁ PRONTA. <br />
              <span className="text-[#005F73]">SÓ FALTA VOCÊ.</span>
            </h3>

            {/* Action Buttons: Stacked vertically on mobile with matching width */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5 mt-4 sm:mt-6 w-auto">
              <a
                href={SITE_INFO.cardapioWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative overflow-hidden group w-44 sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-2.5 py-2.5 px-5 sm:py-3 sm:px-6 min-h-[44px] bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl border-2 border-[#001219] shadow-[3px_3px_0px_#001219] sm:shadow-chicano-sm hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer text-center"
              >
                <span className="absolute inset-0 -translate-x-full animate-cta-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                <ShoppingBag className="w-4 h-4 relative z-10 shrink-0" />
                <span className="relative z-10">PEÇA AGORA</span>
              </a>

              <button
                type="button"
                onClick={handleScrollToContact}
                className="w-44 sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-2.5 py-2.5 px-5 sm:py-3 sm:px-6 min-h-[44px] bg-white hover:bg-[#E9D8A6] text-[#001219] font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl border-2 border-[#001219] shadow-[3px_3px_0px_#001219] sm:shadow-chicano-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer text-center"
              >
                <span>Contato</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Immersive Light Divider connecting Respiro (cream) to Gallery (dark teal) */}
      <SectionDivider position="bottom" variant="cool" blend="cream-to-dark" />

      {/* Desktop Bottom Transition */}
      <div className="hidden sm:block absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent via-[#003843]/60 to-[#005F73]/50 pointer-events-none z-[2]" />
    </section>
  );
};

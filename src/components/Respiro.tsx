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
      className="min-h-[100dvh] py-16 md:py-24 relative overflow-hidden flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(160deg, #001219 0%, #002430 50%, #003843 100%)'
      }}
    >
      {/* Background Image with Ken Burns */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-40 animate-ken-burns"
        style={{ backgroundImage: "url('/images/sections/respiro-bg.webp')" }}
      />

      {/* Turquoise / Pearl-Aqua Particle Canvas */}
      <TurquoiseCanvas />

      {/* Atmospheric lighting glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-64 rounded-full bg-[#EE9B00]/10 blur-[130px] pointer-events-none z-[1]" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-64 rounded-full bg-[#005F73]/25 blur-[130px] pointer-events-none z-[1]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 w-full my-auto">
        <div className="w-full bg-[#FAF5E8] border-4 border-[#001219] rounded-[2.5rem] shadow-[14px_14px_0px_0px_#001219] hover:shadow-[18px_18px_0px_0px_#001219] hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden relative p-8 sm:p-12 md:p-16 text-center flex flex-col items-center">
          
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#BB3E03] via-[#EE9B00] to-[#CA6702]" />
          <div className="absolute inset-4 border-[1.5px] border-dashed border-[#001219]/15 rounded-[1.8rem] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center w-full">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#001219] text-[#EE9B00] border-2 border-[#001219] shadow-chicano-sm mb-4">
              <span className="font-mono text-xs font-black uppercase tracking-widest">
                ¡Ándale a Probar! • Chicanos Y Chicanas
              </span>
            </div>

            {/* Top Flame Icon */}
            <div className="w-14 h-14 rounded-2xl bg-[#EE9B00] border-2 border-[#001219] shadow-chicano-sm flex items-center justify-center shrink-0 mb-6 group-hover:scale-110 transition-transform duration-300">
              <Flame className="w-7 h-7 text-[#001219] fill-current animate-flame-flicker" />
            </div>

            {/* Handwritten Quote */}
            <span className="font-script text-3xl sm:text-4xl lg:text-5xl text-[#CA6702] tracking-wide font-black block mb-4 max-w-2xl">
              "Feito com fé, fogo e coração."
            </span>

            {/* Main Statement */}
            <h3 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-[#001219] uppercase tracking-tight leading-[0.95] mt-2">
              A CASA ESTÁ PRONTA. <br />
              <span className="text-[#005F73]">SÓ FALTA VOCÊ.</span>
            </h3>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full sm:w-auto">
              <a
                href={SITE_INFO.cardapioWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative overflow-hidden group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-[#001219] shadow-chicano hover:-translate-y-0.5 transition-all cursor-pointer text-center"
              >
                <span className="absolute inset-0 -translate-x-full animate-cta-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                <ShoppingBag className="w-4 h-4 relative z-10" />
                <span className="relative z-10">PEÇA AGORA</span>
              </a>

              <button
                type="button"
                onClick={handleScrollToContact}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-[#E9D8A6] text-[#001219] font-display font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-[#001219] shadow-chicano hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <span>Contato</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Immersive Transition to Gallery */}
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent via-[#003843]/60 to-[#005F73]/50 pointer-events-none z-[2]" />
      <div className="section-divider-cool" />
      <div className="section-divider-glow-cool" />
    </section>
  );
};

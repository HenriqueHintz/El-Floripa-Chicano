import React from 'react';
import { ArrowRight } from 'lucide-react';

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
      className="min-h-[100dvh] py-16 md:py-24 relative overflow-hidden flex flex-col justify-center items-center"
      style={{
        backgroundImage: "url('/images/sections/frida-kahlo.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[#005F73]/50" />
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-[0.32]"
        style={{ backgroundImage: "url('/images/sections/texture-rupestre.webp')" }}
      />
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#94D2BD_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] rounded-full bg-[#94D2BD]/10 blur-[160px] pointer-events-none z-[1]" />

      <div className="max-w-[92rem] mx-auto px-4 sm:px-8 lg:px-12 relative z-10 w-full my-auto">
        <div className="w-full max-w-6xl mx-auto border-4 border-[#001219] rounded-[2.5rem] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-[12px_12px_0px_0px_#001219] relative hover:shadow-[16px_16px_0px_0px_#001219] hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
          
          <div className="lg:col-span-7 bg-[#005f73] p-8 md:p-12 lg:p-16 flex flex-col justify-center items-start text-left text-white relative">
            <div className="absolute inset-4 border-[1.5px] border-dashed border-white/10 rounded-[1.8rem] pointer-events-none" />
            
            <div className="relative z-10 w-full">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#001219] uppercase font-bold px-3.5 py-1.5 bg-[#E9D8A6] border-2 border-[#001219] rounded-full w-fit shadow-[2px_2px_0px_#001219] mb-6 hover:rotate-1 transition-transform duration-300 cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EE9B00] animate-pulse" />
                Expansão e Parceria
              </span>

              <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-white uppercase leading-none tracking-tight">
                SEJA UM <br />
                <span className="relative inline-block text-[#E9D8A6] font-manifesto mt-2">
                  FRANQUEADO!
                  <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-[#EE9B00] rounded-full animate-badge-glow" />
                </span>
              </h2>

              <p className="text-white/90 text-sm md:text-base lg:text-lg font-sans font-semibold leading-relaxed mt-6 max-w-md">
                Leve o sabor autêntico e o espírito inabalável do El Chicano para a sua cidade.
              </p>

              <button
                type="button"
                onClick={handleStartClick}
                className="mt-10 relative overflow-hidden group inline-flex items-center gap-3 px-8 py-4 bg-[#E9D8A6] hover:bg-[#EE9B00] text-[#001219] font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-[#001219] shadow-[4px_4px_0px_0px_#001219] hover:shadow-[8px_8px_0px_0px_#001219] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 cursor-pointer font-display"
              >
                <span className="absolute inset-0 -translate-x-full animate-cta-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                <span className="relative z-10">QUERO COMEÇAR</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 min-h-[350px] lg:min-h-0 border-t-4 lg:border-t-0 lg:border-l-4 border-[#001219] relative overflow-hidden group">
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none animate-ken-burns transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              style={{ backgroundImage: "url('/images/sections/franquia-bg.webp')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#001219]/20 to-transparent pointer-events-none z-[1]" />
          </div>

        </div>
      </div>

      {/* Immersive Transition to Contact */}
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent via-[#001219]/70 to-[#001219] pointer-events-none z-[2]" />
      <div className="section-divider-warm" />
      <div className="section-divider-glow-warm" />
    </section>
  );
};

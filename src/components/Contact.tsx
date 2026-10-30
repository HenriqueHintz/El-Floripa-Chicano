import React from 'react';
import { MessageCircle, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { InstagramIcon as Instagram } from './Icons';
import { SITE_INFO } from '../data/constants';

export const Contact: React.FC = () => {
  return (
    <section
      id="contact-section"
      className="min-h-0 sm:min-h-[100dvh] py-8 sm:py-20 md:py-24 px-3 sm:px-6 relative overflow-hidden flex flex-col justify-center items-center bg-[#001219]"
    >
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-45 animate-ken-burns"
        style={{ backgroundImage: "url('/images/sections/respiro-bg.webp')" }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#94D2BD]/5 blur-[150px] pointer-events-none z-[1]" />

      <div className="max-w-xl mx-auto px-4 py-5 sm:px-6 sm:py-10 md:p-12 relative z-10 bg-[#FAF5E8] border-3 sm:border-4 border-[#001219] rounded-[1.75rem] sm:rounded-[2.5rem] shadow-[8px_8px_0px_0px_#001219] sm:shadow-[12px_12px_0px_0px_#001219] hover:shadow-[16px_16px_0px_0px_#001219] hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center text-center gap-3 sm:gap-6 overflow-hidden w-full my-auto">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#005F73] via-[#0A9396] to-[#94D2BD]" />
        <div className="absolute inset-2.5 sm:inset-3 border border-dashed border-[#001219]/10 rounded-[1.25rem] sm:rounded-[1.8rem] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-2.5 sm:gap-5 w-full">
          <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono tracking-widest text-white uppercase font-bold px-3 py-0.5 sm:px-3.5 sm:py-1.5 bg-[#005f73] border-2 border-[#001219] rounded-full w-fit shadow-[2px_2px_0px_#001219] hover:rotate-1 transition-transform duration-300 cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-[#94D2BD] animate-pulse" />
            Contato
          </span>

          <h2 className="font-display font-black text-2xl sm:text-4xl md:text-5xl text-[#001219] uppercase leading-none tracking-tight">
            A MESA ESTÁ <br /> <span className="text-[#005f73]">À SUA ESPERA</span>
          </h2>

          <div className="flex flex-col gap-2.5 sm:gap-4 w-full mt-1 sm:mt-3 font-sans text-xs md:text-sm text-[#001219]">
            {/* 1. Faça seu Pedido - Cardápio Online (Principal CTA) */}
            <a
              href={SITE_INFO.cardapioWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden group flex items-center justify-between p-3 sm:p-4.5 rounded-xl sm:rounded-[2rem] bg-[#EE9B00] border-2 sm:border-4 border-[#001219] shadow-chicano-sm sm:shadow-[4px_4px_0px_0px_#001219] hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
            >
              <span className="absolute inset-0 -translate-x-full animate-cta-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-white flex items-center justify-center text-[#001219] border-2 border-[#001219] shadow-sm group-hover:bg-[#CA6702] group-hover:text-white transition-all shrink-0">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[8px] sm:text-[9px] font-mono text-[#001219]/60 uppercase tracking-widest font-black leading-none">
                    Cardápio Oficial
                  </span>
                  <span className="text-sm sm:text-base font-black text-[#001219] mt-0.5 group-hover:text-white transition-colors font-display">
                    FAÇA SEU PEDIDO ONLINE
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#001219]/60 group-hover:text-white group-hover:translate-x-0.5 transition-all relative z-10" />
            </a>

            {/* 2 e 3. WhatsApp Floripa e Instagram Combinados Lado a Lado no Mobile */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full">
              {/* WhatsApp Floripa */}
              <a
                href={SITE_INFO.whatsappFloripaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 sm:p-4 rounded-xl sm:rounded-[2rem] bg-white border-2 sm:border-4 border-[#001219] shadow-chicano-sm sm:shadow-[4px_4px_0px_0px_#001219] hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer group"
              >
                <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
                  <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl bg-[#005f73] flex items-center justify-center text-white border sm:border-2 border-[#001219] group-hover:bg-[#25D366] transition-all shrink-0">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex flex-col text-left min-w-0 truncate">
                    <span className="text-[8px] sm:text-[9px] font-mono text-[#001219]/50 uppercase tracking-wider font-black leading-none truncate">
                      WhatsApp
                    </span>
                    <span className="text-[9.5px] sm:text-sm font-bold sm:font-black text-[#001219] mt-0.5 group-hover:text-[#005f73] transition-colors truncate">
                      (48) 99652-0836
                    </span>
                  </div>
                </div>
              </a>

              {/* Instagram Oficial */}
              <a
                href={SITE_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 sm:p-4 rounded-xl sm:rounded-[2rem] bg-white border-2 sm:border-4 border-[#001219] shadow-chicano-sm sm:shadow-[4px_4px_0px_0px_#001219] hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer group"
              >
                <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
                  <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl bg-[#005f73] flex items-center justify-center text-white border sm:border-2 border-[#001219] group-hover:bg-[#E1306C] transition-all shrink-0">
                    <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex flex-col text-left min-w-0 truncate">
                    <span className="text-[8px] sm:text-[9px] font-mono text-[#001219]/50 uppercase tracking-wider font-black leading-none truncate">
                      Instagram
                    </span>
                    <span className="text-[9px] sm:text-sm font-bold sm:font-black text-[#001219] mt-0.5 group-hover:text-[#005f73] transition-colors truncate">
                      @elchicanofloripa
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Immersive Transition to Footer */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-[#001219]/80 to-[#001219] pointer-events-none z-[2]" />
      <div className="section-divider-cool" />
      <div className="section-divider-glow-cool" />
    </section>
  );
};

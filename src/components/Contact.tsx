import React from 'react';
import { MessageCircle, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { InstagramIcon as Instagram } from './Icons';
import { SITE_INFO } from '../data/constants';

export const Contact: React.FC = () => {
  return (
    <section
      id="contact-section"
      className="min-h-[100dvh] py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden flex flex-col justify-center items-center bg-[#001219]"
    >
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-45 animate-ken-burns"
        style={{ backgroundImage: "url('/images/sections/respiro-bg.webp')" }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#94D2BD]/5 blur-[150px] pointer-events-none z-[1]" />

      <div className="max-w-xl mx-auto px-6 py-10 md:p-12 relative z-10 bg-[#FAF5E8] border-4 border-[#001219] rounded-[2.5rem] shadow-[12px_12px_0px_0px_#001219] hover:shadow-[16px_16px_0px_0px_#001219] hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center text-center gap-6 overflow-hidden w-full my-auto">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#005F73] via-[#0A9396] to-[#94D2BD]" />
        <div className="absolute inset-3 border border-dashed border-[#001219]/10 rounded-[1.8rem] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-5 w-full">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-white uppercase font-bold px-3.5 py-1.5 bg-[#005f73] border-2 border-[#001219] rounded-full w-fit shadow-[2px_2px_0px_#001219] mb-2 hover:rotate-1 transition-transform duration-300 cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-[#94D2BD] animate-pulse" />
            Contato
          </span>

          <h2 className="font-display font-black text-3xl md:text-5xl text-[#001219] uppercase leading-none tracking-tight">
            A MESA ESTÁ <br /> <span className="text-[#005f73]">À SUA ESPERA</span>
          </h2>

          <div className="flex flex-col gap-4 w-full mt-3 font-sans text-xs md:text-sm text-[#001219]">
            {/* 1. WhatsApp Floripa */}
            <a
              href={SITE_INFO.whatsappFloripaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4.5 rounded-[2rem] bg-white border-4 border-[#001219] shadow-[4px_4px_0px_0px_#001219] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#001219] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#005f73] flex items-center justify-center text-white border-2 border-[#001219] shadow-[2px_2px_0px_#001219] group-hover:bg-[#EE9B00] group-hover:text-[#001219] group-hover:scale-105 transition-all duration-300 shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-mono text-[#001219]/50 uppercase tracking-widest font-black leading-none">
                    WhatsApp Floripa
                  </span>
                  <span className="text-base font-black text-[#001219] mt-1 group-hover:text-[#005f73] transition-colors">
                    (48) 99652-0836
                  </span>
                  <span className="text-[10px] text-[#0A9396] font-bold mt-0.5">
                    Atendimento Rápido
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#001219]/40 group-hover:text-[#005f73] group-hover:translate-x-0.5 transition-all" />
            </a>

            {/* 2. Faça seu Pedido - Cardápio Online */}
            <a
              href={SITE_INFO.cardapioWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden group flex items-center justify-between p-4.5 rounded-[2rem] bg-[#EE9B00] border-4 border-[#001219] shadow-[4px_4px_0px_0px_#001219] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#001219] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
            >
              <span className="absolute inset-0 -translate-x-full animate-cta-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#001219] border-2 border-[#001219] shadow-[2px_2px_0px_#001219] group-hover:bg-[#CA6702] group-hover:text-white group-hover:scale-105 transition-all duration-300 shrink-0">
                  <ShoppingBag className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-mono text-[#001219]/60 uppercase tracking-widest font-black leading-none">
                    Faça seu Pedido
                  </span>
                  <span className="text-base font-black text-[#001219] mt-1 group-hover:text-white transition-colors font-display">
                    PEÇA AGORA
                  </span>
                  <span className="text-[10px] text-[#001219]/70 font-bold mt-0.5">
                    Cardápio Online Oficial
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#001219]/50 group-hover:text-white group-hover:translate-x-0.5 transition-all relative z-10" />
            </a>

            {/* 3. Instagram Oficial */}
            <a
              href={SITE_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4.5 rounded-[2rem] bg-white border-4 border-[#001219] shadow-[4px_4px_0px_0px_#001219] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#001219] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#005f73] flex items-center justify-center text-white border-2 border-[#001219] shadow-[2px_2px_0px_#001219] group-hover:bg-[#EE9B00] group-hover:text-[#001219] group-hover:scale-105 transition-all duration-300 shrink-0">
                  <Instagram className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-mono text-[#001219]/50 uppercase tracking-widest font-black leading-none">
                    Instagram Oficial
                  </span>
                  <span className="text-base font-black text-[#001219] mt-1 group-hover:text-[#005f73] transition-colors">
                    @elchicanofloripa
                  </span>
                  <span className="text-[10px] text-[#001219]/60 font-semibold mt-0.5">
                    Novidades e Bastidores
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#001219]/40 group-hover:text-[#005f73] group-hover:translate-x-0.5 transition-all" />
            </a>
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

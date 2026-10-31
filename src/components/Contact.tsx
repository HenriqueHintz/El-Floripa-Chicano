import React from 'react';
import { MessageCircle, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { InstagramIcon as Instagram } from './Icons';
import { SITE_INFO } from '../data/constants';

export const Contact: React.FC = () => {
  return (
    <section
      id="contact-section"
      className="relative overflow-hidden flex flex-col justify-center items-center bg-[#FAF5E8] sm:bg-[#001219] min-h-0 sm:min-h-[100dvh] pt-12 pb-12 sm:py-20 md:py-24 px-4 sm:px-6 scroll-mt-16"
    >
      {/* Desktop Background Image with motion & Ken Burns */}
      <div
        className="hidden sm:block absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-45 animate-ken-burns"
        style={{ backgroundImage: "url('/images/sections/respiro-bg.webp')" }}
      />
      <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#94D2BD]/5 blur-[150px] pointer-events-none z-[1]" />

      {/* Desktop Top Transition */}
      <div className="hidden sm:block absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#001219] to-transparent pointer-events-none z-[2]" />

      <div className="w-full max-w-sm sm:max-w-xl mx-auto px-4 py-6 sm:px-8 sm:py-10 md:p-12 relative z-10 bg-[#FAF5E8] sm:border-4 border-[#001219] rounded-2xl sm:rounded-[2.5rem] sm:shadow-[12px_12px_0px_0px_#001219] sm:hover:shadow-[16px_16px_0px_0px_#001219] sm:hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center text-center gap-3 sm:gap-6 overflow-hidden my-auto">
        
        {/* Top accent bar on desktop */}
        <div className="hidden sm:block absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#005F73] via-[#0A9396] to-[#94D2BD]" />
        
        {/* Inner decorative dashed border (desktop only, to keep mobile clean and airy) */}
        <div className="hidden sm:block absolute inset-3 border border-dashed border-[#001219]/15 rounded-[1.8rem] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-2.5 sm:gap-4 w-full">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono tracking-widest text-white uppercase font-bold px-3 py-1 sm:px-3.5 sm:py-1.5 bg-[#005f73] border-2 border-[#001219] rounded-full w-fit shadow-[2px_2px_0px_#001219] hover:rotate-1 transition-transform duration-300 cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-[#94D2BD] animate-pulse" />
            Contato
          </span>

          {/* Title */}
          <h2 className="font-display font-black text-2xl sm:text-4xl md:text-5xl text-[#001219] uppercase leading-none tracking-tight">
            A MESA ESTÁ <br /> <span className="text-[#005f73]">À SUA ESPERA</span>
          </h2>

          <p className="font-sans text-xs sm:text-sm text-[#001219]/80 font-medium max-w-sm">
            Venha viver a experiência El Chicano ou peça no conforto da sua casa.
          </p>

          {/* Stacked Action Buttons: Um embaixo do outro, cada um com sua identidade limpa */}
          <div className="flex flex-col gap-2.5 sm:gap-3.5 w-full mt-2 sm:mt-3 font-sans pr-10 sm:pr-0">
            
            {/* 1. Faça seu Pedido - Cardápio Online (Identidade Delivery / Âmbar) */}
            <a
              href={SITE_INFO.cardapioWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Fazer pedido no Cardápio Online Oficial El Chicano"
              className="relative overflow-hidden group flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#EE9B00] hover:bg-[#CA6702] border-2 border-[#001219] shadow-[2.5px_2.5px_0px_#001219] sm:shadow-[4px_4px_0px_#001219] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer w-full"
            >
              <span className="absolute inset-0 -translate-x-full animate-cta-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#001219] border-2 border-[#001219] shadow-sm shrink-0">
                  <ShoppingBag className="w-5 h-5 text-[#CA6702]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[8.5px] sm:text-[9.5px] font-mono text-[#001219]/70 uppercase tracking-widest font-black leading-none">
                    Delivery Oficial
                  </span>
                  <span className="text-xs sm:text-base font-black text-[#001219] mt-0.5 font-display tracking-wide">
                    FAÇA SEU PEDIDO ONLINE
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#001219]/70 group-hover:text-[#001219] group-hover:translate-x-0.5 transition-all relative z-10 shrink-0" />
            </a>

            {/* 2. WhatsApp Floripa (Identidade WhatsApp / Verde Esmeralda) */}
            <a
              href={SITE_INFO.whatsappFloripaUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Conversar com El Chicano Floripa no WhatsApp"
              className="relative overflow-hidden group flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white hover:bg-[#F0FDF4] border-2 border-[#001219] shadow-[2.5px_2.5px_0px_#001219] sm:shadow-[4px_4px_0px_#001219] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer w-full"
            >
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center text-white border-2 border-[#001219] shadow-sm shrink-0">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[8.5px] sm:text-[9.5px] font-mono text-[#166534] uppercase tracking-widest font-black leading-none">
                    Atendimento Direto
                  </span>
                  <span className="text-xs sm:text-sm font-black text-[#001219] mt-0.5 font-sans">
                    WhatsApp: <span className="font-mono text-[#005f73] font-bold">(48) 99652-0836</span>
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#001219]/50 group-hover:text-[#25D366] group-hover:translate-x-0.5 transition-all relative z-10 shrink-0" />
            </a>

            {/* 3. Instagram Oficial (Identidade Instagram / Gradiente Oficial) */}
            <a
              href={SITE_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Seguir @elchicanofloripa no Instagram"
              className="relative overflow-hidden group flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white hover:bg-[#FDF2F8] border-2 border-[#001219] shadow-[2.5px_2.5px_0px_#001219] sm:shadow-[4px_4px_0px_#001219] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer w-full"
            >
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center text-white border-2 border-[#001219] shadow-sm shrink-0">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[8.5px] sm:text-[9.5px] font-mono text-[#9D174D] uppercase tracking-widest font-black leading-none">
                    Rede Oficial
                  </span>
                  <span className="text-xs sm:text-sm font-black text-[#001219] mt-0.5 font-sans">
                    Instagram: <span className="font-mono text-[#005f73] font-bold">@elchicanofloripa</span>
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#001219]/50 group-hover:text-[#E1306C] group-hover:translate-x-0.5 transition-all relative z-10 shrink-0" />
            </a>

          </div>
        </div>
      </div>

      {/* Desktop Bottom Transition */}
      <div className="hidden sm:block absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-[#001219]/80 to-[#001219] pointer-events-none z-[2]" />
      <div className="hidden sm:block section-divider-cool" />
      <div className="hidden sm:block section-divider-glow-cool" />
    </section>
  );
};

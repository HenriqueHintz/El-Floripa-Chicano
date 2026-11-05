import React from 'react';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { UNITS } from '../data/constants';
import { SectionDivider } from './SectionDivider';

export const Units: React.FC = () => {
  const floripaUnit = UNITS.find((u) => u.city.toLowerCase().includes('florianópolis')) || UNITS[0];
  const lagunaUnit = UNITS.find((u) => u.city.toLowerCase().includes('laguna')) || UNITS[1];

  return (
    <section
      id="units-section"
      className="relative overflow-hidden flex flex-col justify-center items-center bg-[#FAF5E8] lg:bg-[#001219] min-h-0 lg:min-h-[100dvh] pt-14 pb-12 sm:py-20 md:py-24 scroll-mt-16"
    >
      {/* Desktop Background: Imagem da Frida Kahlo que antes estava na seção de franquia (/images/sections/frida-kahlo.webp) */}
      <div
        className="hidden lg:block absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{ backgroundImage: "url('/images/sections/frida-kahlo.webp')" }}
      />
      <div className="hidden lg:block absolute inset-0 bg-gradient-to-b from-[#001219]/75 via-[#001219]/45 to-[#001219]/85 pointer-events-none z-[1]" />

      {/* Immersive Light Divider connecting Gallery (dark teal) to Units (cream on mobile) */}
      <SectionDivider position="top" variant="cool" blend="dark-to-cream" />

      {/* Content Container: Elementos diretamente encaixados sobre o plano de fundo da seção (sem caixa externa fechada) */}
      <div className="w-full max-w-md lg:max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10 my-auto">
        <div className="relative z-10 w-full flex flex-col items-start lg:items-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-xs font-mono tracking-widest text-white uppercase font-bold px-3 py-1 sm:px-4 sm:py-1.5 bg-[#005f73] border-2 border-[#001219] rounded-full w-fit shadow-[2px_2px_0px_#001219] mb-2.5 sm:mb-4 hover:rotate-1 transition-transform duration-300 cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-[#94D2BD] animate-pulse" />
            Nossas Casas
          </span>

          {/* Title & Subtitle */}
          <h2 className="font-display font-black text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-[#001219] lg:text-white uppercase leading-none tracking-tight text-left lg:text-center lg:drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            ONDE O FOGO <span className="text-[#005f73] lg:text-[#EE9B00]">ESTÁ ACESO!</span>
          </h2>

          <p className="font-sans text-xs sm:text-base md:text-lg text-[#CA6702] lg:text-[#FAF5E8] font-semibold mt-1.5 sm:mt-3 text-left lg:text-center lg:drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Um lugar que recebe todas as idades, com o sabor de casa.
          </p>

          {/* Units Grid: Os 2 cards das unidades direto sobre a foto de fundo da seção */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 w-full mt-5 sm:mt-10 text-left">
            {/* 1. Florianópolis Unit - Unidade Ativa */}
            <div className="rounded-2xl lg:rounded-3xl border-2 lg:border-4 border-[#001219] bg-white/95 backdrop-blur-sm shadow-[3px_3px_0px_#001219] lg:shadow-[8px_8px_0px_0px_#001219] p-4 sm:p-6 flex flex-col justify-between gap-3.5 hover:shadow-[5px_5px_0px_#001219] lg:hover:shadow-[12px_12px_0px_0px_#001219] hover:-translate-y-0.5 lg:hover:-translate-y-1 transition-all duration-300">
              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="flex items-center justify-between gap-2 border-b border-[#001219]/10 pb-2.5">
                  <h3 className="font-display font-black text-base sm:text-lg text-[#005f73] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#EE9B00] shrink-0" />
                    FLORIANÓPOLIS
                  </h3>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-black text-[#0A9396] bg-[#25D366]/15 px-2.5 py-1 rounded-full border border-[#25D366]/30 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-ping" />
                    Aberto
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-xs text-[#001219]/85 font-medium leading-relaxed">
                  <p className="font-black text-sm text-[#001219]">Centro</p>
                  <p>{floripaUnit.address}</p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-[#005f73] bg-[#005f73]/8 px-3 py-2 rounded-xl border border-[#005f73]/15">
                  <Clock className="w-4 h-4 shrink-0 text-[#0A9396]" />
                  <span>Segunda a Sexta: 11h30 às 23h30</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#001219]/10 flex items-center justify-between gap-2">
                <a
                  href={floripaUnit.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#EE9B00] hover:bg-[#CA6702] border-2 border-[#001219] shadow-[2px_2px_0px_#001219] text-xs font-display font-black text-[#001219] hover:text-white uppercase tracking-wider transition-all active:translate-y-0.5"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>Atendimento</span>
                </a>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={floripaUnit.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl border-2 border-[#001219] bg-white hover:bg-[#FAF5E8] text-[#001219] flex items-center justify-center transition-all shadow-[2px_2px_0px_#001219] active:translate-y-0.5"
                    title="Ver rota no Google Maps"
                    aria-label="Ver rota no Google Maps para Florianópolis"
                  >
                    <Navigation className="w-4 h-4 text-[#005f73]" />
                  </a>
                  <a
                    href={floripaUnit.instagramUrl || 'https://www.instagram.com/elchicanofloripa'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl border-2 border-[#001219] bg-[#FAF5E8] hover:bg-[#EE9B00] text-[#001219] flex items-center justify-center transition-all shadow-[2px_2px_0px_#001219] active:translate-y-0.5"
                    title="Ver no Instagram"
                    aria-label="Instagram El Chicano Florianópolis"
                  >
                    <span className="text-[10px] font-mono font-black">IG</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 2. Laguna Unit - Origem / Pausado */}
            <div className="rounded-2xl lg:rounded-3xl border-2 lg:border-4 border-[#001219] bg-white/95 backdrop-blur-sm shadow-[3px_3px_0px_#001219] lg:shadow-[8px_8px_0px_0px_#001219] p-4 sm:p-6 flex flex-col justify-between gap-3.5 hover:shadow-[5px_5px_0px_#001219] lg:hover:shadow-[12px_12px_0px_0px_#001219] hover:-translate-y-0.5 lg:hover:-translate-y-1 transition-all duration-300">
              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="flex items-center justify-between gap-2 border-b border-[#001219]/10 pb-2.5">
                  <h3 className="font-display font-black text-base sm:text-lg text-[#005f73] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#EE9B00] shrink-0" />
                    LAGUNA
                  </h3>
                  <span className="inline-flex items-center gap-1 font-mono text-[9px] font-black text-[#AE2012] bg-[#AE2012]/15 px-2.5 py-1 rounded-full border border-[#AE2012]/30 uppercase">
                    Pausado Temporariamente
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-xs text-[#001219]/85 font-medium leading-relaxed">
                  <p className="font-black text-sm text-[#001219]">Praia do Mar Grosso</p>
                  <p>Rua Giocondo Tasso, 2245 - Laguna - SC</p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-[#001219] bg-[#001219]/5 px-3 py-2 rounded-xl border border-[#001219]/10">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-[#EE9B00]" />
                  <span>Celular: (48) 99664-0777</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#001219]/10 flex items-center justify-between gap-2">
                <a
                  href={lagunaUnit.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAF5E8] border-2 border-[#001219] shadow-[2px_2px_0px_#001219] text-xs font-display font-black text-[#001219] hover:text-[#CA6702] uppercase tracking-wider transition-all active:translate-y-0.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#EE9B00] shrink-0" />
                  <span>Contato</span>
                </a>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={lagunaUnit.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl border-2 border-[#001219] bg-white hover:bg-[#FAF5E8] text-[#001219] flex items-center justify-center transition-all shadow-[2px_2px_0px_#001219] active:translate-y-0.5"
                    title="Ver rota no Google Maps"
                    aria-label="Ver rota no Google Maps para Laguna"
                  >
                    <Navigation className="w-4 h-4 text-[#005f73]" />
                  </a>
                  <a
                    href="https://www.instagram.com/elchicanofloripa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl border-2 border-[#001219] bg-[#FAF5E8] hover:bg-[#EE9B00] text-[#001219] flex items-center justify-center transition-all shadow-[2px_2px_0px_#001219] active:translate-y-0.5"
                    title="Ver no Instagram"
                    aria-label="Instagram El Chicano Laguna"
                  >
                    <span className="text-[10px] font-mono font-black">IG</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Immersive Light Divider connecting Units (cream) to Franchise */}
      <SectionDivider position="bottom" variant="warm" blend="cream-to-dark" />
    </section>
  );
};

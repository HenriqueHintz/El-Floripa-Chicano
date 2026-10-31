import React from 'react';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { UNITS } from '../data/constants';

export const Units: React.FC = () => {
  const floripaUnit = UNITS.find((u) => u.city.toLowerCase().includes('florianópolis')) || UNITS[0];
  const lagunaUnit = UNITS.find((u) => u.city.toLowerCase().includes('laguna')) || UNITS[1];

  return (
    <section
      id="units-section"
      className="relative overflow-hidden flex flex-col justify-center items-center bg-[#FAF5E8] lg:bg-[#002430] min-h-0 lg:min-h-[100dvh] pt-14 pb-12 sm:py-20 md:py-24 scroll-mt-16"
    >
      {/* Desktop Background & Atmospheric Image */}
      <div
        className="hidden lg:block absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'linear-gradient(180deg, #004754 0%, #003843 50%, #002430 100%)',
        }}
      />
      <div
        className="hidden lg:block absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-45 animate-ken-burns"
        style={{ backgroundImage: "url('/images/sections/respiro-bg.webp')" }}
      />
      <div className="hidden lg:block absolute top-1/4 left-10 w-[500px] h-[500px] rounded-full bg-[#94D2BD]/5 blur-[150px] pointer-events-none z-[1]" />
      <div className="hidden lg:block absolute bottom-1/4 right-10 w-[400px] h-[400px] rounded-full bg-[#0A9396]/10 blur-[130px] pointer-events-none z-[1]" />

      {/* Refined Immersive Hairline Divider connecting Gallery (dark teal) to Units (cream) */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0A9396]/70 to-transparent pointer-events-none z-20" />
      <div className="lg:hidden absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-[#0A9396]/25 blur-[4px] rounded-full pointer-events-none z-10" />

      {/* Desktop Top Transition */}
      <div className="hidden lg:block absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#001219] to-transparent pointer-events-none z-[2]" />

      {/* Content Container */}
      <div className="w-full max-w-md lg:max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10 my-auto">
        {/* On Mobile: Clean, borderless editorial layout directly on #FAF5E8 without boxes; On Desktop: 12-col neo-brutalist card */}
        <div className="w-full border-0 lg:border-4 lg:border-[#001219] rounded-none lg:rounded-[2.5rem] overflow-visible lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-none lg:shadow-[12px_12px_0px_0px_#001219] bg-transparent lg:bg-[#FAF5E8] lg:hover:shadow-[16px_16px_0px_0px_#001219] lg:hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative">
          
          <div className="hidden lg:block absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#005F73] via-[#0A9396] to-[#94D2BD] z-20" />

          {/* Left Column: Units info (7 cols desktop, full width mobile) */}
          <div className="lg:col-span-7 p-0 lg:p-14 flex flex-col justify-center items-start text-left text-[#001219] relative w-full">
            <div className="hidden lg:block absolute inset-4 border border-dashed border-[#001219]/10 rounded-[1.8rem] pointer-events-none" />

            <div className="relative z-10 w-full pr-12 lg:pr-0">
              {/* Badge */}
              <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono tracking-widest text-white uppercase font-bold px-3 py-1 sm:px-3.5 sm:py-1.5 bg-[#005f73] border-2 border-[#001219] rounded-full w-fit shadow-[2px_2px_0px_#001219] mb-2.5 sm:mb-6 hover:rotate-1 transition-transform duration-300 cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-[#94D2BD] animate-pulse" />
                Nossas Casas
              </span>

              {/* Title & Subtitle */}
              <h2 className="font-display font-black text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-[#001219] uppercase leading-none tracking-tight">
                ONDE O FOGO <br />
                <span className="text-[#005f73]">ESTÁ ACESO!</span>
              </h2>

              <p className="font-sans text-xs sm:text-base md:text-lg text-[#CA6702] font-semibold mt-1.5 sm:mt-4">
                Um lugar que recebe todas as idades, com o sabor de casa.
              </p>

              {/* Mobile Subtle Header Divider */}
              <div className="lg:hidden w-full h-px bg-[#001219]/15 my-4" />

              {/* Units Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 lg:gap-6 w-full mt-1 sm:mt-8">
                {/* 1. Florianópolis Unit */}
                <div className="p-0 lg:p-6 lg:rounded-[2rem] lg:border-4 lg:border-[#001219] lg:bg-white lg:shadow-[6px_6px_0px_0px_#001219] flex flex-col justify-between lg:hover:shadow-[8px_8px_0px_0px_#001219] lg:hover:-translate-y-1 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <div className="flex flex-col gap-1.5 sm:gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display font-black text-sm sm:text-lg text-[#005f73] uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#EE9B00] shrink-0" />
                        FLORIANÓPOLIS
                      </h3>
                      <span className="hidden lg:inline-flex items-center gap-1 font-mono text-[8px] sm:text-[9px] font-black text-[#0A9396] bg-[#25D366]/15 px-2 py-0.5 rounded-full border border-[#25D366]/30 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-ping" />
                        Aberto
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-[11px] sm:text-xs text-[#001219]/80 font-medium pl-0.5 leading-snug sm:leading-relaxed">
                      <p className="font-black text-xs sm:text-sm text-[#001219]">Centro</p>
                      <p>{floripaUnit.address}</p>
                      <p className="flex items-center gap-1.5 text-[#0A9396] font-bold mt-0.5">
                        <Clock className="w-3.5 h-3.5 shrink-0 text-[#0A9396]" />
                        <span>Segunda a Sexta: 11h30 às 23h30</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 lg:mt-6 pt-2.5 lg:pt-4 border-t border-[#001219]/15 lg:border-t-2 lg:border-dashed lg:border-[#001219]/10 flex items-center justify-between lg:justify-between gap-2">
                    <a
                      href={floripaUnit.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 lg:px-0 lg:py-0 rounded-lg lg:rounded-none bg-white lg:bg-transparent border lg:border-0 border-[#001219] shadow-[1.5px_1.5px_0px_#001219] lg:shadow-none text-[11px] sm:text-xs font-black text-[#001219] hover:text-[#CA6702] transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#EE9B00] shrink-0" />
                      <span>Atendimento</span>
                    </a>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={floripaUnit.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border sm:border-2 border-[#001219] bg-white hover:bg-[#EE9B00] text-[#001219] flex items-center justify-center transition-colors shadow-chicano-sm"
                        title="Ver rota no Google Maps"
                      >
                        <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </a>
                      <a
                        href={floripaUnit.instagramUrl || 'https://www.instagram.com/elchicanofloripa'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border sm:border-2 border-[#001219] bg-[#E9D8A6]/40 hover:bg-[#EE9B00] text-[#001219] flex items-center justify-center transition-colors shadow-chicano-sm"
                        title="Ver no Instagram"
                      >
                        <span className="text-[9px] sm:text-[10px] font-mono font-black">IG</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Mobile Divider Between Units */}
                <div className="lg:hidden w-full h-px bg-[#001219]/15 my-4" />

                {/* 2. Laguna Unit */}
                <div className="p-0 lg:p-6 lg:rounded-[2rem] lg:border-4 lg:border-[#001219] lg:bg-white/95 lg:shadow-[6px_6px_0px_0px_#001219] flex flex-col justify-between lg:hover:shadow-[8px_8px_0px_0px_#001219] lg:hover:-translate-y-1 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-90">
                  <div className="flex flex-col gap-1.5 sm:gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display font-black text-sm sm:text-lg text-[#005f73] uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#EE9B00] shrink-0" />
                        LAGUNA
                      </h3>
                      <span className="inline-flex items-center gap-1 font-mono text-[8px] sm:text-[9px] font-black text-[#AE2012] bg-[#AE2012]/15 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full border border-[#AE2012]/30 uppercase">
                        Pausado Temporariamente
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-[11px] sm:text-xs text-[#001219]/80 font-medium pl-0.5 leading-snug sm:leading-relaxed">
                      <p className="font-black text-xs sm:text-sm text-[#001219]">Praia do Mar Grosso</p>
                      <p>Rua Giocondo Tasso, 2245<span className="hidden lg:inline"> - Pausado Temporariamente</span></p>
                      <p className="flex items-center gap-1.5 text-[#001219] font-bold mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-[#EE9B00] shrink-0" />
                        <span>Celular: (48) 99664-0777</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 lg:mt-6 pt-2.5 lg:pt-4 border-t border-[#001219]/15 lg:border-t-2 lg:border-dashed lg:border-[#001219]/10 flex items-center justify-between lg:justify-between gap-2">
                    <a
                      href="https://api.whatsapp.com/send/?phone=5548996640777"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 lg:px-0 lg:py-0 rounded-lg lg:rounded-none bg-white lg:bg-transparent border lg:border-0 border-[#001219] shadow-[1.5px_1.5px_0px_#001219] lg:shadow-none text-[11px] sm:text-xs font-black text-[#001219] hover:text-[#CA6702] transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#EE9B00] shrink-0" />
                      <span>Atendimento</span>
                    </a>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={lagunaUnit.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border sm:border-2 border-[#001219] bg-white hover:bg-[#EE9B00] text-[#001219] flex items-center justify-center transition-colors shadow-chicano-sm"
                        title="Ver rota no Google Maps"
                      >
                        <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </a>
                      <a
                        href="https://www.instagram.com/elchicanofloripa"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border sm:border-2 border-[#001219] bg-[#E9D8A6]/40 hover:bg-[#EE9B00] text-[#001219] flex items-center justify-center transition-colors shadow-chicano-sm"
                        title="Ver no Instagram"
                      >
                        <span className="text-[9px] sm:text-[10px] font-mono font-black">IG</span>
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Polaroid Image (5 cols desktop only) */}
          <div className="hidden lg:flex lg:col-span-5 bg-[#005f73] p-8 md:p-12 items-center justify-center relative overflow-hidden border-l-4 border-[#001219]">
            <div className="relative w-full max-w-sm aspect-square bg-[#FAF5E8] p-4 rounded-3xl border-4 border-[#001219] shadow-[8px_8px_0px_0px_#001219] rotate-2 hover:rotate-0 hover:scale-102 hover:shadow-[12px_12px_0px_0px_#001219] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
              <div
                className="w-full h-[82%] rounded-2xl overflow-hidden border-2 border-[#001219]/10 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
                style={{ backgroundImage: "url('/images/gallery/gallery-4.webp')" }}
              />
              <div className="h-[18%] flex items-center justify-center">
                <span className="font-script text-2xl text-[#001219] font-black rotate-1">
                  Estilo de Vida Chicano! 🌵🌮
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Refined Immersive Hairline Divider connecting Units (cream) to Franchise (warm poster) */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EE9B00]/70 to-transparent pointer-events-none z-20" />
      <div className="lg:hidden absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-[#EE9B00]/25 blur-[4px] rounded-full pointer-events-none z-10" />

      {/* Desktop Bottom Transition */}
      <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent via-[#002430]/70 to-[#005F73]/50 pointer-events-none z-[2]" />
      <div className="hidden lg:block section-divider-warm" />
      <div className="hidden lg:block section-divider-glow-warm" />
    </section>
  );
};

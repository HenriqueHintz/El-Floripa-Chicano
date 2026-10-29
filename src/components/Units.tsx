import React from 'react';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { UNITS } from '../data/constants';

export const Units: React.FC = () => {
  const floripaUnit = UNITS.find((u) => u.city.toLowerCase().includes('florianópolis')) || UNITS[0];
  const lagunaUnit = UNITS.find((u) => u.city.toLowerCase().includes('laguna')) || UNITS[1];

  return (
    <section
      id="units-section"
      className="min-h-[100dvh] py-16 md:py-24 relative overflow-hidden flex flex-col justify-center items-center"
      style={{
        background: 'linear-gradient(180deg, #004754 0%, #003843 50%, #002430 100%)',
      }}
    >
      {/* Background Image with motion */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-45 animate-ken-burns"
        style={{ backgroundImage: "url('/images/sections/respiro-bg.webp')" }}
      />
      <div className="absolute top-1/4 left-10 w-[500px] h-[500px] rounded-full bg-[#94D2BD]/5 blur-[150px] pointer-events-none z-[1]" />
      <div className="absolute bottom-1/4 right-10 w-[400px] h-[400px] rounded-full bg-[#0A9396]/10 blur-[130px] pointer-events-none z-[1]" />

      <div className="max-w-[92rem] mx-auto px-4 sm:px-8 lg:px-12 relative z-10 w-full my-auto">
        <div className="w-full max-w-6xl mx-auto border-4 border-[#001219] rounded-[2.5rem] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-[12px_12px_0px_0px_#001219] bg-[#FAF5E8] hover:shadow-[16px_16px_0px_0px_#001219] hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative">
          
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#005F73] via-[#0A9396] to-[#94D2BD] z-20" />

          {/* Left Column: Units info (7 cols) */}
          <div className="lg:col-span-7 p-8 md:p-12 lg:p-14 flex flex-col justify-center items-start text-left text-[#001219] relative">
            <div className="absolute inset-4 border-[1.5px] border-dashed border-[#001219]/10 rounded-[1.8rem] pointer-events-none" />

            <div className="relative z-10 w-full">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-white uppercase font-bold px-3.5 py-1.5 bg-[#005f73] border-2 border-[#001219] rounded-full w-fit shadow-[2px_2px_0px_#001219] mb-6 hover:rotate-1 transition-transform duration-300 cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-[#94D2BD] animate-pulse" />
                Nossas Casas
              </span>

              <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-[#001219] uppercase leading-none tracking-tight">
                ONDE O FOGO <br />
                <span className="text-[#005f73]">ESTÁ ACESO!</span>
              </h2>

              <p className="font-sans text-base md:text-lg text-[#CA6702] font-semibold mt-4">
                Um lugar que recebe todas as idades, com o sabor de casa.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-8">
                {/* 1. Florianópolis Card */}
                <div className="p-6 rounded-[2rem] border-4 border-[#001219] bg-white shadow-[6px_6px_0px_0px_#001219] flex flex-col justify-between hover:shadow-[10px_10px_0px_0px_#001219] hover:-translate-y-1.5 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-black text-lg text-[#005f73] uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#EE9B00] shrink-0" />
                        FLORIANÓPOLIS
                      </h3>
                      <span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-black text-[#0A9396] bg-[#25D366]/15 px-2.5 py-0.5 rounded-full border border-[#25D366]/30 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-ping" />
                        Aberto
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 text-xs text-[#001219]/80 font-medium pl-1 leading-relaxed">
                      <p className="font-black text-sm text-[#001219]">Centro</p>
                      <p>{floripaUnit.address}</p>
                      <div className="w-full h-px bg-[#001219]/5 my-1" />
                      <p className="flex items-center gap-1.5 text-[#0A9396] font-bold">
                        <Clock className="w-4 h-4 shrink-0 text-[#0A9396]" />
                        <span>Segunda a Sexta: 11h30 às 23h30</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t-2 border-dashed border-[#001219]/10 flex items-center justify-between gap-2">
                    <a
                      href={floripaUnit.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-black text-[#001219] hover:text-[#CA6702] transition-colors"
                    >
                      <Phone className="w-4 h-4 text-[#EE9B00] shrink-0" />
                      <span>Atendimento</span>
                    </a>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={floripaUnit.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-xl border-2 border-[#001219] bg-[#FAF5E8] hover:bg-[#EE9B00] text-[#001219] flex items-center justify-center transition-colors shadow-chicano-sm"
                        title="Ver rota no Google Maps"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={floripaUnit.instagramUrl || 'https://www.instagram.com/elchicanofloripa'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-xl border-2 border-[#001219] bg-[#E9D8A6]/30 hover:bg-[#EE9B00] text-[#001219] flex items-center justify-center transition-colors shadow-chicano-sm"
                        title="Ver no Instagram"
                      >
                        <span className="text-[10px] font-mono font-black">IG</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* 2. Laguna Card (Pausado Temporariamente) */}
                <div className="p-6 rounded-[2rem] border-4 border-[#001219] bg-white/95 shadow-[6px_6px_0px_0px_#001219] flex flex-col justify-between hover:shadow-[10px_10px_0px_0px_#001219] hover:-translate-y-1.5 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-90">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-black text-lg text-[#005f73] uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#EE9B00] shrink-0" />
                        LAGUNA
                      </h3>
                      <span className="inline-flex items-center gap-1 font-mono text-[9px] font-black text-[#AE2012] bg-[#AE2012]/15 px-2 py-0.5 rounded-full border border-[#AE2012]/30 uppercase">
                        Pausado Temporariamente
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 text-xs text-[#001219]/80 font-medium pl-1 leading-relaxed">
                      <p className="font-black text-sm text-[#001219]">Praia do Mar Grosso</p>
                      <p>Rua Giocondo Tasso, 2245 - Pausado Temporariamente</p>
                      <div className="w-full h-px bg-[#001219]/5 my-1" />
                      <p className="flex items-center gap-1.5 text-[#001219] font-bold">
                        <Phone className="w-4 h-4 shrink-0 text-[#EE9B00]" />
                        <span>Celular: (48) 99664-0777</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t-2 border-dashed border-[#001219]/10 flex items-center justify-between gap-2">
                    <a
                      href="https://api.whatsapp.com/send/?phone=5548996640777"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-black text-[#001219] hover:text-[#CA6702] transition-colors"
                    >
                      <Phone className="w-4 h-4 text-[#EE9B00] shrink-0" />
                      <span>(48) 99664-0777</span>
                    </a>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={lagunaUnit.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-xl border-2 border-[#001219] bg-[#FAF5E8] hover:bg-[#EE9B00] text-[#001219] flex items-center justify-center transition-colors shadow-chicano-sm"
                        title="Ver rota no Google Maps"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href="https://www.instagram.com/elchicanofloripa"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-xl border-2 border-[#001219] bg-[#E9D8A6]/30 hover:bg-[#EE9B00] text-[#001219] flex items-center justify-center transition-colors shadow-chicano-sm"
                        title="Ver no Instagram"
                      >
                        <span className="text-[10px] font-mono font-black">IG</span>
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Polaroid Image (5 cols) */}
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

      {/* Immersive Transition to Franchise */}
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent via-[#002430]/70 to-[#005F73]/50 pointer-events-none z-[2]" />
      <div className="section-divider-warm" />
      <div className="section-divider-glow-warm" />
    </section>
  );
};

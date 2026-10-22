import React from 'react';
import { SITE_INFO } from '../data/constants';
import { ShoppingBag } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <section
      id="about-section"
      className="py-20 md:py-28 relative overflow-hidden flex flex-col justify-center items-center"
      style={{
        background: 'linear-gradient(160deg, #003843 0%, #004754 40%, #005F73 100%)',
      }}
    >
      {/* Background Texture & Atmospheric Glows */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#94D2BD_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#EE9B00]/12 blur-[130px] pointer-events-none animate-ambient-glow" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#94D2BD]/12 blur-[130px] pointer-events-none animate-ambient-glow" />

      {/* Texture Rupestre overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-[0.15] mix-blend-overlay"
        style={{ backgroundImage: "url('/images/sections/texture-rupestre.webp')" }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-8 relative z-10 w-full text-center flex flex-col items-center gap-6 py-6 md:py-10">
        <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-white uppercase leading-[0.95] tracking-tight">
          DA ESTRADA <br />
          <span className="text-[#EE9B00]">PARA A MESA</span>
        </h2>

        <div className="flex flex-col gap-4 font-sans text-white/90 max-w-2xl">
          <p className="text-base sm:text-lg md:text-xl font-medium leading-relaxed">
            Nascido no centro histórico de Laguna/SC, o <strong className="text-[#EE9B00] font-black">El Chicano</strong> cresceu para conectar pessoas através de comida de verdade e momentos reais.
          </p>
          <p className="text-sm sm:text-base md:text-lg font-medium leading-relaxed text-white/80">
            Um projeto familiar que mantém sua essência artesanal e respeito absoluto aos ingredientes. Aqui, o acolhimento não segue protocolo — é de família para família, feito com o fogo que nunca se apaga.
          </p>
        </div>

        {/* Quote Box */}
        <div className="w-full max-w-2xl px-6 py-4 border-l-4 border-[#EE9B00] bg-white/[0.04] rounded-r-2xl relative overflow-hidden transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-[#EE9B00]/15 via-transparent to-transparent pointer-events-none" />
          <p className="text-base sm:text-lg md:text-xl font-bold text-[#EE9B00] italic tracking-wide leading-relaxed relative">
            "Mudar não é apagar o passado, é dar um futuro às nossas raízes."
          </p>
        </div>

        {/* CTA */}
        <div className="mt-4">
          <a
            href={SITE_INFO.cardapioWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative overflow-hidden group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-[#001219] shadow-[4px_4px_0px_0px_#001219] hover:shadow-[7px_7px_0px_0px_#001219] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#001219] transition-all duration-200 cursor-pointer"
          >
            <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none animate-cta-shimmer" />
            <span>FAZER MEU PEDIDO</span>
            <ShoppingBag className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
          </a>
        </div>
      </div>

      {/* Immersive Transition to Menu */}
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent via-[#001219]/60 to-[#001219] pointer-events-none z-[10]" />
      <div className="section-divider-cool" />
      <div className="section-divider-glow-cool" />
    </section>
  );
};

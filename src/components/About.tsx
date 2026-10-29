import React, { useState, useEffect, useRef } from 'react';
import { SITE_INFO } from '../data/constants';
import { ShoppingBag } from 'lucide-react';

interface Chapter {
  id: string;
  num: string;
  text: string;
  image: string;
  alt: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 'tex-bra-mex',
    num: '01',
    text: 'Nascido na praia do Mar Grosso na cidade histórica de Laguna/SC, o El Chicano cresceu para conectar pessoas através de comida de verdade e momentos reais.',
    image: '/images/historia/historia-01-tex-bra-mex.webp',
    alt: 'Foto 1: Tex. Bra. Mex. - Culinária criada pelo nosso chef Rafa',
  },
  {
    id: 'receitas-exclusivas',
    num: '02',
    text: 'Um projeto familiar que mantém sua essência artesanal e respeito absoluto aos ingredientes.',
    image: '/images/historia/historia-02-receitas-exclusivas.webp',
    alt: 'Foto 2: Receitas exclusivas El Chicano',
  },
  {
    id: 'vamos-a-probar',
    num: '03',
    text: '¡Ándale a Probar! Chicanos Y Chicanas — De família para família, um acolhimento sem protocolo para conectar pessoas através de comida de verdade.',
    image: '/images/historia/historia-03-vamos-a-probar.webp',
    alt: 'Foto 3: ¡Ándale a Probar! Chicanos Y Chicanas',
  },
];

export const About: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let rafId = 0;

    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;

      if (scrollableDistance <= 0) return;

      const rawProgress = -rect.top / scrollableDistance;
      const progress = Math.max(0, Math.min(1, rawProgress));

      if (progress < 0.35) {
        setActiveIdx(0);
      } else if (progress < 0.7) {
        setActiveIdx(1);
      } else {
        setActiveIdx(2);
      }
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          handleScroll();
          rafId = 0;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      id="about-section"
      ref={sectionRef}
      className="relative bg-[#001219]"
      style={{ height: '300vh' }}
      aria-label="Nossa História"
    >
      {/* Palco Fixo Sticky que acompanha o rolamento vertical */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Glow atmosférico suave */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#EE9B00]/10 blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#005F73]/20 blur-[140px] pointer-events-none" />

        {/* Textura Rupestre de fundo */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.12] mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: "url('/images/sections/texture-rupestre.webp')" }}
        />

        {/* Conteúdo Limpo em 2 Colunas com Mais Ênfase na Imagem */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">

            {/* Coluna Esquerda: Título + Texto Mudando Embaixo + CTA */}
            <div className="lg:col-span-5 flex flex-col gap-6 text-left">
              
              {/* Título Principal Limpo */}
              <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white uppercase leading-[0.95] tracking-tight">
                DA ESTRADA <br />
                <span className="text-[#EE9B00]">PARA A MESA</span>
              </h2>

              {/* Texto Dinâmico que muda com o rolamento vertical */}
              <div className="relative min-h-[90px] sm:min-h-[110px] flex items-center">
                {CHAPTERS.map((ch, idx) => (
                  <p
                    key={ch.id}
                    className={`absolute inset-0 font-sans text-base sm:text-lg md:text-xl font-medium leading-relaxed text-white/90 transition-all duration-500 ease-out ${
                      idx === activeIdx
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
                  >
                    {idx === 0 ? (
                      <>
                        Nascido na praia do Mar Grosso na cidade histórica de Laguna/SC, o{' '}
                        <strong className="text-[#EE9B00] font-black">El Chicano</strong>{' '}
                        cresceu para conectar pessoas através de comida de verdade e momentos reais.
                      </>
                    ) : idx === 2 ? (
                      <>
                        <strong className="text-[#EE9B00] font-black">¡Ándale a Probar! Chicanos Y Chicanas</strong>{' '}
                        — De família para família, um acolhimento sem protocolo para conectar pessoas através de comida de verdade.
                      </>
                    ) : (
                      ch.text
                    )}
                  </p>
                ))}
              </div>

              {/* Indicador sutil de 3 etapas + Botão de Pedido */}
              <div className="flex items-center gap-6 pt-2">
                <div className="flex gap-2">
                  {CHAPTERS.map((ch, idx) => (
                    <div
                      key={`dot-${ch.id}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === activeIdx ? 'w-8 bg-[#EE9B00]' : 'w-2 bg-white/25'
                      }`}
                    />
                  ))}
                </div>

                <a
                  href={SITE_INFO.cardapioWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative overflow-hidden group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl border-2 border-[#001219] shadow-chicano hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                >
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none animate-cta-shimmer" />
                  <span>FAZER MEU PEDIDO</span>
                  <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
                </a>
              </div>

            </div>

            {/* Coluna Direita: Fotos em Grande Destaque com Borda Fina e Translúcida */}
            <div className="lg:col-span-7 flex justify-center items-center">
              <div
                className="relative w-full max-w-[360px] sm:max-w-[440px] md:max-w-[490px] lg:max-w-[530px] aspect-[4/5] rounded-[2rem] p-1.5 sm:p-2 bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_30px_rgba(238,155,0,0.15)] transition-transform duration-500 ease-out"
                style={{ transform: 'rotate(-1deg)' }}
              >
                {/* Glow suave ao redor da moldura */}
                <div className="absolute -inset-3 bg-[#EE9B00]/10 blur-xl rounded-[2.5rem] pointer-events-none -z-10" />

                <div className="relative w-full h-full rounded-[1.6rem] overflow-hidden bg-[#001219]">
                  {CHAPTERS.map((ch, idx) => (
                    <img
                      key={ch.id}
                      src={ch.image}
                      alt={ch.alt}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
                        idx === activeIdx
                          ? 'opacity-100 scale-100 z-10'
                          : 'opacity-0 scale-105 z-0 pointer-events-none'
                      }`}
                    />
                  ))}

                  {/* Vinheta bem sutil apenas na base */}
                  <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-t from-[#001219]/45 via-transparent to-transparent" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Divisória de Transição para o Cardápio */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[#001219] pointer-events-none z-20" />
      </div>
    </section>
  );
};

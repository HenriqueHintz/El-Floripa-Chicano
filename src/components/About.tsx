import React, { useState, useEffect, useRef } from 'react';
import { SITE_INFO } from '../data/constants';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const activeIdxRef = useRef(0);
  const [desktopIdx, setDesktopIdx] = useState(0);
  const [mobileIdx, setMobileIdx] = useState(0);

  // Sync ref with current active index
  useEffect(() => {
    activeIdxRef.current = mobileIdx;
  }, [mobileIdx]);

  // Desktop sticky scroll calculation (strictly disabled on mobile < 1024px)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let rafId = 0;

    const handleScroll = () => {
      if (window.innerWidth < 1024 || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;

      if (scrollableDistance <= 50) return;

      const rawProgress = -rect.top / scrollableDistance;
      const progress = Math.max(0, Math.min(1, rawProgress));

      if (progress < 0.35) {
        setDesktopIdx(0);
      } else if (progress < 0.7) {
        setDesktopIdx(1);
      } else {
        setDesktopIdx(2);
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

  // Update mobile active indicator based on horizontal scroll position
  const handleMobileScroll = () => {
    if (isProgrammaticScroll.current) return;
    if (!mobileScrollRef.current) return;
    const container = mobileScrollRef.current;
    const firstCard = container.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard ? firstCard.offsetWidth + 12 : container.offsetWidth * 0.72;
    if (cardWidth <= 0) return;
    const newIdx = Math.round(container.scrollLeft / cardWidth);
    setMobileIdx(Math.max(0, Math.min(CHAPTERS.length - 1, newIdx)));
  };

  const scrollToMobileChapter = (idx: number) => {
    if (!mobileScrollRef.current) return;
    const container = mobileScrollRef.current;
    const cards = container.children;
    if (cards[idx]) {
      isProgrammaticScroll.current = true;
      const card = cards[idx] as HTMLElement;
      const containerWidth = container.clientWidth;
      const cardWidth = card.clientWidth;
      const cardLeft = card.offsetLeft;
      const targetLeft = cardLeft - (containerWidth - cardWidth) / 2;

      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: 'smooth',
      });
      setMobileIdx(idx);

      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 500);
    }
  };

  // Auto-slide automático rigorosamente na ordem 1 -> 2 -> 3 -> 1 (< 1024px)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timer = setInterval(() => {
      if (window.innerWidth < 1024) {
        const nextIdx = (activeIdxRef.current + 1) % CHAPTERS.length;
        scrollToMobileChapter(nextIdx);
      }
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const nextMobileChapter = () => {
    const next = (activeIdxRef.current + 1) % CHAPTERS.length;
    scrollToMobileChapter(next);
  };

  const prevMobileChapter = () => {
    const prev = (activeIdxRef.current - 1 + CHAPTERS.length) % CHAPTERS.length;
    scrollToMobileChapter(prev);
  };

  return (
    <section
      id="about-section"
      ref={sectionRef}
      className="relative bg-[#001219] lg:h-[300vh]"
      aria-label="Nossa História"
    >
      {/* Container: No mobile encaixa perfeitamente no viewport (100dvh) sem rolagem vertical; no desktop é sticky h-screen */}
      <div className="relative lg:sticky top-0 w-full overflow-hidden flex items-center justify-center py-4 sm:py-6 lg:py-0 min-h-[100dvh] lg:h-screen">
        
        {/* Glow atmosférico suave */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-[#EE9B00]/10 blur-[120px] sm:blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-[#005F73]/20 blur-[120px] sm:blur-[140px] pointer-events-none" />

        {/* Textura Rupestre de fundo */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.12] mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: "url('/images/sections/texture-rupestre.webp')" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full relative z-10">

          {/* ================================================================= */}
          {/* MOBILE VERSION (< 1024px): 100% ENQUADRADO NA TELA DO CELULAR     */}
          {/* Espaçamento harmonioso e compacto entre cabeçalho, cards e botões */}
          {/* ================================================================= */}
          <div className="block lg:hidden w-full text-left flex flex-col justify-center gap-2.5 sm:gap-3 py-1">
            {/* Header Mobile Compacto */}
            <div className="shrink-0">
              <span className="inline-block font-mono text-[10px] text-[#EE9B00] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[#EE9B00]/10 border border-[#EE9B00]/20 mb-1">
                Nossa Origem & Essência
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase leading-none tracking-tight">
                DA ESTRADA <span className="text-[#EE9B00]">PARA A MESA</span>
              </h2>
            </div>

            {/* Trilho de Cards Compactos com Snap Horizontal Nativo */}
            <div
              ref={mobileScrollRef}
              onScroll={handleMobileScroll}
              className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory py-1 -mx-4 px-4 scrollbar-none touch-pan-y select-none"
              style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
            >
              {CHAPTERS.map((ch, idx) => {
                const chapterSnippets: Record<string, { subtitle: string; desc: string }> = {
                  'tex-bra-mex': {
                    subtitle: 'Origem Litorânea',
                    desc: 'Nascido na Praia do Mar Grosso na cidade histórica de Laguna - SC',
                  },
                  'receitas-exclusivas': {
                    subtitle: 'Essência Artesanal',
                    desc: 'Culinária de família com receitas exclusivas e respeito aos ingredientes.',
                  },
                  'vamos-a-probar': {
                    subtitle: 'Família & Brasa',
                    desc: 'Acolhimento autêntico sem protocolo, feito com fé, fogo e coração.',
                  },
                };

                const snippet = chapterSnippets[ch.id] || {
                  subtitle: `Capítulo ${ch.num}`,
                  desc: ch.text,
                };

                return (
                  <div
                    key={`mob-card-${ch.id}`}
                    className="snap-center shrink-0 w-[76vw] max-w-[305px] rounded-2xl p-2 bg-white/[0.04] border border-white/10 flex flex-col justify-between shadow-lg"
                  >
                    {/* Top bar do card: fino e discreto */}
                    <div className="flex items-center justify-between px-1.5 py-0.5 text-[9px] font-mono">
                      <span className="text-[#EE9B00] font-bold tracking-wider uppercase">
                        Cap. {ch.num} • {snippet.subtitle}
                      </span>
                      <span className="text-[#E9D8A6]/40">0{idx + 1}/03</span>
                    </div>

                    {/* Foto do Capítulo: Proporção 4:5 real aumentada verticalmente - Zero corte de texto */}
                    <div className="relative w-full aspect-[4/5] max-h-[46dvh] sm:max-h-[50dvh] rounded-xl overflow-hidden bg-[#001219] flex items-center justify-center">
                      <img
                        src={ch.image}
                        alt={ch.alt}
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        className="w-full h-full object-contain object-center"
                      />
                    </div>

                    {/* Texto Curto e Ajustado */}
                    <div className="px-1.5 pt-2 pb-0.5 text-left">
                      <p className="font-sans text-[11px] sm:text-xs text-[#E9D8A6]/90 font-normal leading-tight">
                        {snippet.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Controles de Navegação no Mobile (Pills + Setas + CTA) */}
            <div className="flex items-center justify-between gap-2 pt-1 pb-1 shrink-0">
              {/* Indicador de Dots e Setas */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={prevMobileChapter}
                  className="w-7 h-7 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                  aria-label="Capítulo anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1 px-1">
                  {CHAPTERS.map((ch, idx) => (
                    <button
                      key={`mob-dot-${ch.id}`}
                      type="button"
                      onClick={() => scrollToMobileChapter(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === mobileIdx ? 'w-5 bg-[#EE9B00]' : 'w-1.5 bg-white/25'
                      }`}
                      aria-label={`Ir para capítulo ${ch.num}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={nextMobileChapter}
                  className="w-7 h-7 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                  aria-label="Próximo capítulo"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Botão Pedido Compacto */}
              <a
                href={SITE_INFO.cardapioWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-[11px] uppercase tracking-wider rounded-xl border border-[#001219] shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <span>FAZER PEDIDO</span>
                <ShoppingBag className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* ================================================================= */}
          {/* DESKTOP VERSION (>= 1024px): Experiência Sticky Cinematográfica   */}
          {/* ================================================================= */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-14 items-center">
            {/* Coluna Esquerda Desktop */}
            <div className="lg:col-span-5 flex flex-col gap-6 text-left">
              <span className="inline-block font-mono text-xs text-[#EE9B00] font-black uppercase tracking-widest px-3 py-1 rounded bg-[#EE9B00]/10 border border-[#EE9B00]/20 w-fit">
                Nossa Origem & Essência
              </span>

              <h2 className="font-display font-black text-5xl md:text-6xl text-white uppercase leading-[0.95] tracking-tight">
                DA ESTRADA <br />
                <span className="text-[#EE9B00]">PARA A MESA</span>
              </h2>

              {/* Texto Dinâmico Desktop */}
              <div className="relative min-h-[110px] flex items-center">
                {CHAPTERS.map((ch, idx) => (
                  <p
                    key={`desk-text-${ch.id}`}
                    className={`absolute inset-0 font-sans text-lg md:text-xl font-medium leading-relaxed text-white/90 transition-all duration-500 ease-out ${
                      idx === desktopIdx
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

              {/* Indicador de 3 etapas interativo + Botão de Pedido */}
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  {CHAPTERS.map((ch, idx) => (
                    <button
                      key={`desk-dot-${ch.id}`}
                      type="button"
                      onClick={() => setDesktopIdx(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EE9B00] ${
                        idx === desktopIdx
                          ? 'w-8 bg-[#EE9B00]'
                          : 'w-2 bg-white/25 hover:bg-white/50'
                      }`}
                      aria-label={`Ir para capítulo 0${idx + 1}`}
                    />
                  ))}
                </div>

                <a
                  href={SITE_INFO.cardapioWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative overflow-hidden group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-sm uppercase tracking-wider rounded-xl border-2 border-[#001219] shadow-chicano hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                >
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none animate-cta-shimmer" />
                  <span>FAZER MEU PEDIDO</span>
                  <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
                </a>
              </div>
            </div>

            {/* Coluna Direita Desktop: Foto Gigante Cinematográfica */}
            <div className="lg:col-span-7 flex justify-center items-center">
              <div
                className="relative w-full max-w-[530px] aspect-[4/5] rounded-[2rem] p-2 bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_30px_rgba(238,155,0,0.15)] transition-transform duration-500 ease-out"
                style={{ transform: 'rotate(-1deg)' }}
              >
                <div className="absolute -inset-3 bg-[#EE9B00]/10 blur-xl rounded-[2.5rem] pointer-events-none -z-10" />

                <div className="relative w-full h-full rounded-[1.6rem] overflow-hidden bg-[#001219]">
                  {CHAPTERS.map((ch, idx) => (
                    <img
                      key={`desk-img-${ch.id}`}
                      src={ch.image}
                      alt={ch.alt}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
                        idx === desktopIdx
                          ? 'opacity-100 scale-100 z-10'
                          : 'opacity-0 scale-105 z-0 pointer-events-none'
                      }`}
                    />
                  ))}
                  <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-t from-[#001219]/45 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Divisória de Transição */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[#001219] pointer-events-none z-20" />
      </div>
    </section>
  );
};

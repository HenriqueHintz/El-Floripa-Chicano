import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { NAV_LINKS, SITE_INFO } from '../data/constants';
import { MessageCircle, Menu, X, ArrowUpRight, Music } from 'lucide-react';
import { InstagramIcon } from './Icons';
import { smoothScrollToTarget } from '../utils/scroll';
import { ambientAudio } from '../utils/ambientAudio';

interface HeaderProps {
  onNavigate?: (href: string) => void;
}

const NAV_SUBTITLES: Record<string, string> = {
  '#hero-section': 'Origem & Essência',
  '#about-section': 'Tex. Bra. Mex.',
  '#products-section': 'Burritos, Tacos & Sabores',
  '#gallery-section': 'Noites & Encontros',
  '#units-section': 'Floripa & Laguna',
  '#franchise-section': 'Seja Franqueado',
};

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);

  useEffect(() => {
    setIsAudioActive(ambientAudio.getStatus());
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const toggleAudio = () => {
    const active = ambientAudio.toggle();
    setIsAudioActive(active);
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    document.body.style.overflow = '';
    requestAnimationFrame(() => {
      if (onNavigate) {
        onNavigate(href);
      } else {
        smoothScrollToTarget(href);
      }
    });
  };

  return (
    <>
      <header
        id="main-header"
        className={`fixed left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileMenuOpen ? 'opacity-0 pointer-events-none' : ''
        } ${
          scrolled
            ? 'w-[94%] md:w-[90%] max-w-6xl rounded-[1.8rem] bg-[#001219]/95 backdrop-blur-md shadow-[6px_6px_0px_0px_#000] border-3 border-[#001219] py-2 top-3'
            : 'w-[96%] md:w-[92%] max-w-6xl rounded-[2.2rem] bg-black/55 backdrop-blur-md shadow-xl border-3 border-white/10 py-3.5 top-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero-section"
            onClick={(e) => handleLinkClick(e, '#hero-section')}
            className="flex items-center group cursor-pointer"
          >
            <Logo
              className={`w-auto group-hover:scale-105 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                scrolled ? 'h-9 sm:h-10' : 'h-10 sm:h-12 md:h-13'
              }`}
            />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-xs font-mono font-bold uppercase tracking-widest text-white hover:text-[#EE9B00] relative py-1 transition-colors duration-200 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] rounded-full bg-[#EE9B00] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop Controls (Sound Toggle & Contact CTA) */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Mexican Music Toggle Button */}
            <button
              type="button"
              onClick={toggleAudio}
              className={`px-3 py-2 rounded-xl border-2 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase transition-all cursor-pointer ${
                isAudioActive
                  ? 'bg-[#EE9B00] text-[#001219] border-[#001219] shadow-chicano-sm scale-102'
                  : 'bg-white/10 text-[#E9D8A6] border-white/15 hover:border-[#EE9B00] hover:text-white'
              }`}
              title={isAudioActive ? 'Pausar música mexicana' : 'Tocar música mexicana'}
              aria-label={isAudioActive ? 'Pausar música mexicana' : 'Tocar música mexicana'}
            >
              <Music className={`w-3.5 h-3.5 ${isAudioActive ? 'animate-bounce text-[#AE2012]' : 'text-[#EE9B00]'}`} />
              <span className="hidden lg:inline">{isAudioActive ? 'Música Ativa' : 'Música Mexicana'}</span>
            </button>

            {/* Contact CTA */}
            <a
              href="#contact-section"
              onClick={(e) => handleLinkClick(e, '#contact-section')}
              className="relative overflow-hidden group px-5 py-2 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-[11px] tracking-wider uppercase rounded-xl border-2 border-[#001219] shadow-[3px_3px_0px_#000] hover:shadow-[1px_1px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-300 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span className="absolute inset-0 -translate-x-full animate-cta-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              <MessageCircle className="w-4 h-4 shrink-0 relative z-10" />
              <span className="relative z-10">Contato</span>
            </a>
          </div>

          {/* Mobile Actions: Music Button in Initial Header + Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Music Toggle Button in Header */}
            <button
              type="button"
              onClick={toggleAudio}
              className={`h-9 px-2.5 rounded-xl border flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase transition-all cursor-pointer active:scale-95 ${
                isAudioActive
                  ? 'bg-[#EE9B00] text-[#001219] border-[#EE9B00] scale-102'
                  : 'bg-white/10 text-[#E9D8A6] border-white/15 hover:border-[#EE9B00] hover:text-white'
              }`}
              title={isAudioActive ? 'Pausar música mexicana' : 'Tocar música mexicana'}
              aria-label={isAudioActive ? 'Pausar música mexicana' : 'Tocar música mexicana'}
            >
              <Music
                className={`w-3.5 h-3.5 ${
                  isAudioActive ? 'animate-bounce text-[#AE2012]' : 'text-[#EE9B00]'
                }`}
              />
              <span className="text-[10px] tracking-wide font-black">
                {isAudioActive ? 'Som ON' : 'Música'}
              </span>
              {isAudioActive && (
                <span className="flex items-end gap-0.5 h-2.5">
                  <span className="w-0.5 h-2 bg-[#001219] rounded-full animate-pulse" />
                  <span className="w-0.5 h-3 bg-[#001219] rounded-full animate-bounce" />
                  <span className="w-0.5 h-1.5 bg-[#001219] rounded-full animate-pulse" />
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/10 border border-white/15 text-[#E9D8A6] hover:text-[#EE9B00] hover:border-[#EE9B00] active:scale-95 transition-all cursor-pointer"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay - Delicate, Clean & Ultra-Legible (No Cards, No Clutter) */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal de navegação El Chicano"
          className="md:hidden fixed inset-0 z-50 bg-[#001219] w-full h-[100dvh] flex flex-col justify-between p-5 sm:p-7 overflow-y-auto overscroll-contain animate-in fade-in duration-200"
        >
          {/* Top Bar: Delicate Brand Header & Close */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <a
                href="#hero-section"
                onClick={(e) => handleLinkClick(e, '#hero-section')}
                className="cursor-pointer"
              >
                <Logo className="h-11 sm:h-12 w-auto" />
              </a>

              <div className="h-8 w-px bg-white/15" />

              <p className="text-[11px] sm:text-xs font-sans text-[#E9D8A6]/80 leading-tight italic">
                <span>Comida mexicana</span>
                <br />
                <span>com alma brasileira</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="h-10 w-10 flex items-center justify-center text-[#E9D8A6] hover:text-[#EE9B00] hover:bg-white/5 active:scale-95 transition-all rounded-xl border border-white/15 cursor-pointer shrink-0 ml-2"
              aria-label="Fechar menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Nav Items: Pure Typographic Elegance (No Cards, Clean Dividers) */}
          <nav className="flex flex-col justify-center my-auto py-2">
            {NAV_LINKS.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="group py-3 border-b border-white/5 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-[#EE9B00]/70 font-bold">
                    0{index + 1}
                  </span>
                  <span className="font-display font-black text-2xl sm:text-3xl text-white group-hover:text-[#EE9B00] uppercase tracking-tight transition-colors">
                    {link.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#E9D8A6]/40 group-hover:text-[#94D2BD] font-sans transition-colors hidden xs:inline">
                    {NAV_SUBTITLES[link.href] || ''}
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-[#EE9B00] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </a>
            ))}
          </nav>

          {/* Bottom Section: Centered Instagram Only */}
          <div className="flex items-center justify-center pt-4 border-t border-white/10 shrink-0">
            <a
              href={SITE_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#E1306C] text-[#E9D8A6] hover:text-white text-xs font-mono font-bold tracking-widest uppercase transition-all active:scale-95 cursor-pointer shadow-sm"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4 h-4 text-[#E1306C] shrink-0" />
              <span>Instagram</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
};

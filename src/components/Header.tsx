import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { NAV_LINKS, SITE_INFO } from '../data/constants';
import { MessageCircle, Menu, X, ArrowUpRight, Flame } from 'lucide-react';
import { smoothScrollToTarget } from '../utils/scroll';
import { ambientAudio } from '../utils/ambientAudio';

interface HeaderProps {
  onNavigate?: (href: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);

  useEffect(() => {
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
    return () => {
      document.body.style.overflow = '';
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
        <div className="max-w-7xl mx-auto px-5 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero-section"
            onClick={(e) => handleLinkClick(e, '#hero-section')}
            className="flex items-center group cursor-pointer"
          >
            <Logo
              className={`w-auto group-hover:scale-105 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                scrolled ? 'h-9 sm:h-10' : 'h-11 sm:h-12 md:h-13'
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
            {/* Ambient Sound Toggle Button */}
            <button
              type="button"
              onClick={toggleAudio}
              className={`px-3 py-2 rounded-xl border-2 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase transition-all cursor-pointer ${
                isAudioActive
                  ? 'bg-[#EE9B00] text-[#001219] border-[#001219] shadow-chicano-sm scale-102'
                  : 'bg-white/10 text-[#E9D8A6] border-white/15 hover:border-[#EE9B00] hover:text-white'
              }`}
              title={isAudioActive ? 'Desativar som da brasa' : 'Ativar som ambiente da brasa'}
            >
              <Flame className={`w-3.5 h-3.5 ${isAudioActive ? 'fill-current animate-flame-flicker text-[#AE2012]' : 'text-[#EE9B00]'}`} />
              <span className="hidden lg:inline">{isAudioActive ? 'Brasa Ativa' : 'Som Ambiente'}</span>
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

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden flex items-center justify-center p-2 text-[#E9D8A6] hover:text-[#EE9B00] transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#001219]/98 backdrop-blur-2xl w-screen h-screen flex flex-col justify-between p-6 sm:p-8 animate-in fade-in duration-300">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <Logo className="h-10 w-auto" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-[#E9D8A6] hover:text-[#EE9B00] transition-colors rounded-xl bg-white/5 border border-white/10"
              aria-label="Fechar menu"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          {/* Nav Items */}
          <div className="flex flex-col gap-4 my-auto">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#94D2BD] font-bold">
              Menu de Navegação
            </span>
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="font-display font-black text-2xl sm:text-3xl text-white hover:text-[#EE9B00] uppercase tracking-tight flex items-center justify-between py-2 border-b border-white/10 transition-colors"
              >
                <span>{link.label}</span>
                <ArrowUpRight className="w-5 h-5 text-[#94D2BD]" />
              </a>
            ))}

            {/* Mobile Sound Toggle */}
            <button
              type="button"
              onClick={toggleAudio}
              className={`mt-3 py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 font-mono text-xs font-bold uppercase transition-all ${
                isAudioActive
                  ? 'bg-[#EE9B00] text-[#001219] border-[#001219]'
                  : 'bg-white/10 text-white border-white/15'
              }`}
            >
              <Flame className="w-4 h-4 fill-current text-[#CA6702]" />
              <span>{isAudioActive ? 'Brasa Acesa (Som Ativo)' : 'Ativar Som Ambiente da Brasa'}</span>
            </button>
          </div>

          {/* Mobile Bottom CTAs */}
          <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
            <a
              href={SITE_INFO.cardapioWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-2xl bg-[#EE9B00] text-[#001219] font-display font-black text-sm uppercase tracking-wider text-center border-2 border-[#001219] shadow-chicano active:scale-98 transition-all"
            >
              Fazer Pedido Online
            </a>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#E9D8A6]/60">
              <span>{SITE_INFO.hashtag}</span>
              <span>Floripa & Laguna</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

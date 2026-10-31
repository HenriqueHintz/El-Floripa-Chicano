import type { MouseEvent } from 'react';
import { Logo } from './Logo';
import { SITE_INFO, UNITS } from '../data/constants';
import { MessageCircle, ShoppingBag } from 'lucide-react';
import { InstagramIcon as Instagram } from './Icons';
import { smoothScrollToTarget } from '../utils/scroll';

interface FooterProps {
  onNavigate?: (href: string) => void;
}

export const Footer = ({ onNavigate }: FooterProps) => {
  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(href);
    } else {
      smoothScrollToTarget(href);
    }
  };

  const navItems = [
    { label: 'Início', href: '#hero-section' },
    { label: 'Nossa História', href: '#about-section' },
    { label: 'Cardápio', href: '#products-section' },
    { label: 'Galeria da Casa', href: '#gallery-section' },
    { label: 'Nossas Casas', href: '#units-section' },
    { label: 'Franquia', href: '#franchise-section' },
    { label: 'Contato', href: '#contact-section' }
  ];

  return (
    <footer className="relative bg-[#001219] text-[#E9D8A6] overflow-hidden">
      {/* Top Gradient Divider - Refinado 1px no mobile com brilho imersivo, 6px no desktop */}
      <div className="relative w-full">
        <div 
          className="h-px sm:h-1.5 w-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #005F73 20%, #0A9396 50%, #005F73 80%, transparent 100%)'
          }}
        />
        <div className="sm:hidden absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-[#0A9396]/25 blur-[4px] rounded-full pointer-events-none" />
      </div>

      <div className="max-w-[92rem] mx-auto px-4 sm:px-8 lg:px-12 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/[0.08]">
          
          {/* Brand Column (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5 text-left">
            <a 
              href="#hero-section" 
              onClick={(e) => handleLinkClick(e, '#hero-section')}
              className="w-fit cursor-pointer"
            >
              <Logo className="h-16 sm:h-20 w-auto hover:scale-105 transition-transform" />
            </a>

            <p className="font-sans text-sm text-[#EE9B00] leading-relaxed font-semibold max-w-sm">
              "{SITE_INFO.quote}"
            </p>

            <div className="flex flex-col gap-1 text-xs font-mono">
              <span className="text-white/40 uppercase tracking-widest">{SITE_INFO.tagline}</span>
              <span className="text-[#EE9B00] font-bold">{SITE_INFO.hashtag}</span>
              <span className="text-[#94D2BD]/70 uppercase tracking-wider font-bold">{SITE_INFO.origin}</span>
              <span className="text-[#E9D8A6]/40 italic">{SITE_INFO.faith}</span>
            </div>
          </div>

          {/* Quick Navigation (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-4 text-left">
            <h4 className="font-mono text-xs uppercase tracking-widest text-white font-black pb-2 border-b border-white/10">
              Navegação
            </h4>
            <ul className="flex flex-col gap-2.5 font-sans text-xs">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={(e) => handleLinkClick(e, item.href)}
                    className="text-[#E9D8A6]/70 hover:text-[#EE9B00] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A9396] group-hover:bg-[#EE9B00] transition-colors" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Houses & Hours (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4 text-left">
            <h4 className="font-mono text-xs uppercase tracking-widest text-white font-black pb-2 border-b border-white/10">
              Unidades & Horários
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
              {UNITS.map((unit) => (
                <div key={unit.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="font-mono text-[10px] font-black uppercase tracking-wider text-[#94D2BD] block mb-1">
                    {unit.city} • {unit.neighborhood}
                  </span>
                  <p className="text-white/80 line-clamp-2">{unit.address}</p>
                  <p className="text-[#EE9B00] font-mono text-[11px] mt-2 font-bold">{unit.hours}</p>
                  <p className="text-white/60 font-mono text-[11px] mt-1">{unit.phone}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#E9D8A6]/50">
          <div className="flex items-center gap-2">
            <span>© 2026 El Chicano Mexican Food.</span>
            <span>Todos os direitos reservados.</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={SITE_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E9D8A6]/70 hover:text-[#94D2BD] transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={SITE_INFO.whatsappFloripaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E9D8A6]/70 hover:text-[#25D366] transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a
              href={SITE_INFO.cardapioWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E9D8A6]/70 hover:text-[#EE9B00] transition-colors"
              aria-label="CardápioWeb"
            >
              <ShoppingBag className="w-4 h-4" />
            </a>
            <span className="text-[#E9D8A6]/30">|</span>
            <span className="text-[#94D2BD]/60 font-black tracking-widest uppercase text-[10px]">
              Laguna • Floripa
            </span>
            <span className="text-[#E9D8A6]/20">|</span>
            <button
              type="button"
              onClick={() => onNavigate?.('/admin')}
              className="text-white/25 hover:text-[#EE9B00] font-mono text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
              title="Painel de Gestão (Leads & Galeria)"
            >
              Painel
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

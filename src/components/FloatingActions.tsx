import React, { useState, useEffect } from 'react';
import { SITE_INFO } from '../data/constants';
import { MessageCircle, ShoppingBag, ArrowUp } from 'lucide-react';
import { smoothScrollToTop } from '../utils/scroll';

export const FloatingActions: React.FC = () => {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    smoothScrollToTop();
  };

  return (
    <div className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 sm:gap-3.5 items-center">
      {/* WhatsApp Pulse Action */}
      <a
        href={SITE_INFO.whatsappFloripaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-[#25D366] text-white border-2 sm:border-3 border-[#001219] flex items-center justify-center shadow-[4px_4px_0px_#000] hover:scale-110 hover:shadow-[6px_6px_0px_#000] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer relative group"
        aria-label="Pedir no WhatsApp"
      >
        <span className="absolute inset-0 rounded-2xl bg-[#25D366]/40 animate-ping pointer-events-none" />
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-current relative z-10" />
        <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-[#001219] text-white text-[10px] font-mono uppercase tracking-wider font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl border-2 border-white/10">
          WhatsApp Floripa
        </span>
      </a>

      {/* Cardápio Online Action */}
      <a
        href={SITE_INFO.cardapioWebUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-[#EE9B00] text-[#001219] border-2 sm:border-3 border-[#001219] flex items-center justify-center shadow-[4px_4px_0px_#000] hover:scale-110 hover:shadow-[6px_6px_0px_#000] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer relative group"
        aria-label="Fazer Pedido Online"
      >
        <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
        <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-[#001219] text-white text-[10px] font-mono uppercase tracking-wider font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl border-2 border-white/10">
          Cardápio Online
        </span>
      </a>

      {/* Scroll to Top Action */}
      {showTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-[#FAF5E8] border-2 sm:border-3 border-[#001219] text-[#001219] flex items-center justify-center shadow-[4px_4px_0px_#000] hover:scale-110 hover:shadow-[6px_6px_0px_#000] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer relative group animate-in fade-in zoom-in duration-200"
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5px]" />
          <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-[#001219] text-white text-[10px] font-mono uppercase tracking-wider font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl border-2 border-white/10">
            Voltar ao Topo
          </span>
        </button>
      )}
    </div>
  );
};

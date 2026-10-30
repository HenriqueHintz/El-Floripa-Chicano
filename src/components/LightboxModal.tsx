import { useEffect } from 'react';
import { GalleryItem } from '../types';
import { SITE_INFO } from '../data/constants';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { InstagramIcon as Instagram } from './Icons';

interface LightboxModalProps {
  item: GalleryItem | null;
  items: GalleryItem[];
  onClose: () => void;
  onNavigate: (item: GalleryItem) => void;
  onToggleLike?: (id: string) => void;
  likedIds?: Set<string>;
}

export const LightboxModal = ({
  item,
  items,
  onClose,
  onNavigate
}: LightboxModalProps) => {
  useEffect(() => {
    if (!item) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [item]);

  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        const idx = items.findIndex((i) => i.id === item.id);
        const prevIdx = (idx - 1 + items.length) % items.length;
        onNavigate(items[prevIdx]);
      }
      if (e.key === 'ArrowRight') {
        const idx = items.findIndex((i) => i.id === item.id);
        const nextIdx = (idx + 1) % items.length;
        onNavigate(items[nextIdx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, items, onClose, onNavigate]);

  if (!item) return null;

  const currentIndex = items.findIndex((i) => i.id === item.id);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIdx = (currentIndex - 1 + items.length) % items.length;
    onNavigate(items[prevIdx]);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (currentIndex + 1) % items.length;
    onNavigate(items[nextIdx]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 z-50 p-2.5 rounded-full bg-[#001219] text-white hover:text-[#EE9B00] border-2 border-white/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EE9B00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001219]"
        aria-label="Fechar galeria"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-[#001219]/80 text-white hover:bg-[#EE9B00] hover:text-[#001219] border-2 border-white/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EE9B00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001219]"
        aria-label="Item anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-[#001219]/80 text-white hover:bg-[#EE9B00] hover:text-[#001219] border-2 border-white/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EE9B00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001219]"
        aria-label="Próximo item"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Visualizador de Galeria"
        className="max-w-4xl w-full max-h-[90vh] bg-[#001219] border-4 border-[#001219] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media Container */}
        <div className="relative bg-black flex items-center justify-center max-h-[62vh] overflow-hidden">
          {item.type === 'video' ? (
            <video
              src={item.src}
              poster={item.thumbnail && !item.thumbnail.endsWith('.mp4') ? item.thumbnail : '/images/sections/respiro-bg.webp'}
              controls
              autoPlay
              playsInline
              className="max-h-[62vh] w-auto max-w-full object-contain"
            />
          ) : (
            <img
              src={item.src}
              alt={item.caption}
              className="max-h-[62vh] w-auto max-w-full object-contain"
            />
          )}
        </div>

        {/* Caption & Actions Footer */}
        <div className="p-5 sm:p-6 bg-[#001f2d] border-t-2 border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col text-left">
            <p className="font-sans text-sm sm:text-base text-[#FAF5E8] font-medium max-w-2xl leading-relaxed">
              {item.caption}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Instagram Link */}
            <a
              href={SITE_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-[#EE9B00] border-2 border-white/20 hover:border-[#001219] text-[#E9D8A6] hover:text-[#001219] transition-all font-mono text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EE9B00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001f2d]"
              aria-label="Abrir no Instagram"
            >
              <Instagram className="w-4 h-4" />
              <span>@elchicanofloripa</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

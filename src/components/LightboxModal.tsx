import React, { useEffect } from 'react';
import { GalleryItem } from '../types';
import { SITE_INFO } from '../data/constants';
import { X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { InstagramIcon as Instagram } from './Icons';

interface LightboxModalProps {
  item: GalleryItem | null;
  items: GalleryItem[];
  onClose: () => void;
  onNavigate: (item: GalleryItem) => void;
  onToggleLike: (id: string) => void;
  likedIds: Set<string>;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  item,
  items,
  onClose,
  onNavigate,
  onToggleLike,
  likedIds
}) => {
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
  const isLiked = likedIds.has(item.id);

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
        className="absolute top-5 right-5 z-50 p-2.5 rounded-full bg-[#001219] text-white hover:text-[#EE9B00] border-2 border-white/20 transition-colors cursor-pointer"
        aria-label="Fechar galeria"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-[#001219]/80 text-white hover:bg-[#EE9B00] hover:text-[#001219] border-2 border-white/20 transition-all cursor-pointer"
        aria-label="Item anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-[#001219]/80 text-white hover:bg-[#EE9B00] hover:text-[#001219] border-2 border-white/20 transition-all cursor-pointer"
        aria-label="Próximo item"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Modal Card */}
      <div
        className="max-w-4xl w-full max-h-[90vh] bg-[#001219] border-4 border-[#001219] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media Container */}
        <div className="relative bg-black flex items-center justify-center max-h-[62vh] overflow-hidden">
          {item.type === 'video' ? (
            <video
              src={item.src}
              poster={item.thumbnail}
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
            <span className="font-mono text-[10px] text-[#94D2BD] uppercase tracking-widest font-bold">
              Item {currentIndex + 1} de {items.length} • #{item.category}
            </span>
            <p className="font-sans text-sm text-[#FAF5E8] mt-1 font-medium max-w-xl">
              {item.caption}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Like Button */}
            <button
              type="button"
              onClick={() => onToggleLike(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-mono text-xs font-bold transition-all cursor-pointer ${
                isLiked
                  ? 'bg-[#AE2012] border-[#AE2012] text-white'
                  : 'bg-white/5 border-white/20 text-white hover:border-[#AE2012]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{item.likes + (isLiked ? 1 : 0)}</span>
            </button>

            {/* Instagram Link */}
            <a
              href={SITE_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-white/5 border-2 border-white/20 text-[#E9D8A6] hover:text-[#94D2BD] hover:border-[#94D2BD] transition-all"
              aria-label="Abrir no Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { Product } from '../types';
import { SITE_INFO, getCategoryColor } from '../data/constants';
import { X, ExternalLink } from 'lucide-react';
import { TrimmedImage } from './TrimmedImage';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

type AspectCategory = 'wide' | 'landscape' | 'portrait' | 'square';

export const ProductModal = ({ product, onClose }: ProductModalProps) => {
  const [aspectType, setAspectType] = useState<AspectCategory>('landscape');

  // Reset aspect ratio when product changes
  useEffect(() => {
    setAspectType('landscape');
  }, [product?.id]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!product) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [product]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const categoryColor = getCategoryColor(product.category || product.categoryName || '');
  const imageSrc = product.imageUrl || product.thumbnailUrl || product.image || '/images/products/el-chicano-246.webp';
  const priceDisplay = typeof product.price === 'number' 
    ? `R$ ${product.price.toFixed(2).replace('.', ',')}` 
    : product.price;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const ratio = naturalWidth / naturalHeight;

    if (ratio >= 1.45) {
      setAspectType('wide');
    } else if (ratio >= 1.15) {
      setAspectType('landscape');
    } else if (ratio <= 0.85) {
      setAspectType('portrait');
    } else {
      setAspectType('square');
    }
  };

  // Intelligent container max width based on photo orientation
  const getContainerMaxWidth = () => {
    switch (aspectType) {
      case 'wide':
        return 'max-w-sm sm:max-w-3xl';
      case 'landscape':
        return 'max-w-sm sm:max-w-2xl';
      case 'portrait':
        return 'max-w-xs sm:max-w-lg';
      case 'square':
        return 'max-w-sm sm:max-w-xl';
      default:
        return 'max-w-sm sm:max-w-2xl';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-name"
        className={`w-full ${getContainerMaxWidth()} bg-[#FAF5E8] border-3 sm:border-4 border-[#001219] rounded-[2rem] sm:rounded-[2.5rem] shadow-[12px_12px_0px_0px_#001219] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200 transition-all ease-[cubic-bezier(0.16,1,0.3,1)] max-h-[92dvh] sm:max-h-[94vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-[#BB3E03] via-[#EE9B00] to-[#0A9396] shrink-0" />

        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-30 w-11 h-11 sm:w-10 sm:h-10 min-w-[44px] min-h-[44px] rounded-full bg-[#001219] text-white hover:bg-[#EE9B00] hover:text-[#001219] border-2 border-[#001219] flex items-center justify-center transition-all shadow-chicano-sm hover:scale-105 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EE9B00]"
          aria-label="Fechar detalhes do produto"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col">
          
          {/* IMMERSIVE LARGE HERO PHOTO STAGE */}
          <div className="relative h-[54vh] sm:h-72 md:h-80 bg-[#001219] overflow-hidden flex items-center justify-center border-b-3 border-[#001219] transition-all duration-300">
            
            {/* Ambient Blurred Background Glow */}
            <div 
              className="absolute inset-0 bg-center bg-cover filter blur-3xl opacity-35 scale-125 pointer-events-none transform-gpu"
              style={{ backgroundImage: `url(${imageSrc})` }}
            />
            
            {/* Texture Rupestre Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 mix-blend-overlay"
              style={{ backgroundImage: "url('/images/sections/texture-rupestre.webp')" }}
            />

            {/* Centralized Full-View Product Photo */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-2 sm:p-4 select-none">
              <TrimmedImage 
                src={imageSrc} 
                alt={product.name} 
                onLoad={handleImageLoad}
                className="max-w-full max-h-full object-contain filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.8)]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/products/el-chicano-246.webp';
                }}
              />
            </div>

            {/* Category Tag (Top Left of Photo) */}
            <div className="absolute top-3.5 left-3.5 z-20">
              <span 
                className="px-2.5 py-0.5 rounded-full text-white font-mono text-[9px] uppercase font-black tracking-wider border-2 border-[#001219] shadow-chicano-sm"
                style={{ backgroundColor: categoryColor }}
              >
                {product.category?.replace(/\+.*$/, '').trim() || product.categoryName || 'El Chicano'}
              </span>
            </div>
          </div>

          {/* PRODUCT DETAILS: Compact Bottom Info Bar */}
          <div className="p-3.5 sm:p-5 text-left text-[#001219] bg-[#FAF5E8]">
            {/* Title & Price Header */}
            <div className="flex items-center justify-between gap-3 pb-3">
              <h3 id="product-modal-name" className="font-display font-black text-sm sm:text-xl text-[#001219] uppercase leading-tight line-clamp-2">
                {product.name}
              </h3>

              <div className="font-mono font-black text-base sm:text-2xl text-[#CA6702] shrink-0 bg-[#001219]/5 px-3 py-1 rounded-xl border border-[#001219]/10">
                {priceDisplay}
              </div>
            </div>

            {/* Bottom Actions: CardápioWeb Button + Fechar */}
            <div className="pt-2.5 border-t border-[#001219]/10 flex items-center gap-2.5">
              <a
                href={SITE_INFO.cardapioWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 relative overflow-hidden group inline-flex items-center justify-center gap-2 py-2.5 sm:py-3 px-5 rounded-xl bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-xs uppercase tracking-wider border-2 border-[#001219] shadow-chicano hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CA6702]"
              >
                <span className="absolute inset-0 -translate-x-full animate-cta-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                <span className="relative z-10">Pedir no CardápioWeb</span>
                <ExternalLink className="w-3.5 h-3.5 relative z-10" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 sm:py-3 rounded-xl bg-[#FAF5E8] hover:bg-white text-[#001219] font-mono text-xs uppercase font-bold border-2 border-[#001219] shadow-chicano-sm hover:-translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EE9B00]"
              >
                Fechar
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

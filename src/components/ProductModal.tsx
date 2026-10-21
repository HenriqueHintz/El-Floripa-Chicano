import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { SITE_INFO, getCategoryColor } from '../data/constants';
import { X, ExternalLink, Flame, ZoomIn, ZoomOut } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

type AspectCategory = 'wide' | 'landscape' | 'portrait' | 'square';

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const [aspectType, setAspectType] = useState<AspectCategory>('landscape');
  const [isZoomed, setIsZoomed] = useState(false);

  // Reset zoom and aspect ratio when product changes
  useEffect(() => {
    setIsZoomed(false);
    setAspectType('landscape');
  }, [product?.id]);

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

  // Intelligent container max width based on photo orientation (compact to fit without scrolling)
  const getContainerMaxWidth = () => {
    switch (aspectType) {
      case 'wide':
        return 'max-w-3xl';
      case 'landscape':
        return 'max-w-2xl';
      case 'portrait':
        return 'max-w-lg';
      case 'square':
        return 'max-w-xl';
      default:
        return 'max-w-2xl';
    }
  };

  // Compact photo stage height so the entire modal fits on screen without scrolling
  const getImageStageHeight = () => {
    switch (aspectType) {
      case 'wide':
        return 'h-48 sm:h-56 md:h-64';
      case 'landscape':
        return 'h-52 sm:h-60 md:h-68';
      case 'portrait':
        return 'h-60 sm:h-68 md:h-76';
      case 'square':
        return 'h-52 sm:h-60 md:h-68';
      default:
        return 'h-52 sm:h-60 md:h-64';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`w-full ${getContainerMaxWidth()} bg-[#FAF5E8] border-4 border-[#001219] rounded-[2rem] sm:rounded-[2.5rem] shadow-[12px_12px_0px_0px_#001219] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200 transition-all ease-[cubic-bezier(0.16,1,0.3,1)] max-h-[92vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-[#BB3E03] via-[#EE9B00] to-[#0A9396] shrink-0" />

        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-[#001219] text-white hover:bg-[#EE9B00] hover:text-[#001219] border-2 border-[#001219] flex items-center justify-center transition-all shadow-chicano-sm hover:scale-105 cursor-pointer"
          aria-label="Fechar detalhes"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content - compact so everything fits without scrolling */}
        <div className="overflow-y-auto">
          
          {/* CENTERED HERO PHOTO STAGE */}
          <div className={`relative ${getImageStageHeight()} bg-[#001219] overflow-hidden flex items-center justify-center border-b-3 border-[#001219] transition-all duration-300`}>
            
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

            {/* Centralized Product Photo */}
            <div 
              onClick={() => setIsZoomed(!isZoomed)}
              className={`relative z-10 w-full h-full flex items-center justify-center p-3 sm:p-4 cursor-zoom-${isZoomed ? 'out' : 'in'} group/photo`}
              title="Clique para ampliar / reduzir foto"
            >
              <img 
                src={imageSrc} 
                alt={product.name} 
                onLoad={handleImageLoad}
                className={`max-w-full max-h-full object-contain transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
                  isZoomed 
                    ? 'scale-135 sm:scale-145 filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]' 
                    : 'scale-100 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] group-hover/photo:scale-103'
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/products/el-chicano-246.webp';
                }}
              />
            </div>

            {/* Category Tag (Top Left of Photo) */}
            <div className="absolute top-3.5 left-3.5 z-20">
              <span 
                className="px-3 py-1 rounded-full text-white font-mono text-[10px] uppercase font-black tracking-wider border-2 border-[#001219] shadow-chicano-sm"
                style={{ backgroundColor: categoryColor }}
              >
                {product.category?.replace(/\+.*$/, '').trim() || product.categoryName || 'El Chicano'}
              </span>
            </div>

            {/* Photo Zoom Controls (Bottom Right of Photo Stage) */}
            <div className="absolute bottom-3 right-3 z-20">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed(!isZoomed);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#001219]/90 hover:bg-[#EE9B00] text-white hover:text-[#001219] border-2 border-[#001219] font-mono text-[9px] uppercase font-bold transition-all shadow-chicano-sm cursor-pointer"
              >
                {isZoomed ? (
                  <>
                    <ZoomOut className="w-3 h-3" />
                    <span>Reduzir</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-3 h-3" />
                    <span>Ampliar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* PRODUCT DETAILS (Below the Photo - Clean, direct and compact) */}
          <div className="p-4 sm:p-6 text-left text-[#001219]">
            
            {/* Header: Subtitle + Spice tag */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-mono text-[11px] uppercase tracking-widest text-[#CA6702] font-black">
                Receita Tradicional Chicana
              </span>

              {product.spiciness && product.spiciness > 0 && (
                <span className="inline-flex items-center text-[10px] font-mono text-[#AE2012] bg-[#AE2012]/10 border border-[#AE2012]/20 px-2 py-0.5 rounded-full font-bold">
                  <Flame className="w-3 h-3 mr-0.5 fill-current" /> Picante
                </span>
              )}
            </div>

            {/* Title & Price Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#001219]/10">
              <h3 className="font-display font-black text-xl sm:text-2xl text-[#001219] uppercase leading-tight">
                {product.name}
              </h3>

              <div className="font-mono font-black text-xl sm:text-2xl text-[#CA6702] shrink-0 bg-[#001219]/5 px-3 py-1 rounded-xl border border-[#001219]/10">
                {priceDisplay}
              </div>
            </div>

            {/* Description */}
            <div className="mt-2.5 font-sans text-xs sm:text-sm text-[#001219]/80 font-medium leading-relaxed">
              {product.description || 'Preparado artesanalmente no fogo com temperos sagrados e ingredientes selecionados.'}
            </div>

            {/* Bottom Actions: CardápioWeb Button + Voltar */}
            <div className="mt-4 pt-3.5 border-t border-[#001219]/10 flex items-center gap-3">
              <a
                href={SITE_INFO.cardapioWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 relative overflow-hidden group inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-xs uppercase tracking-wider border-2 border-[#001219] shadow-chicano hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                <span className="absolute inset-0 -translate-x-full animate-cta-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                <span className="relative z-10">Pedir no CardápioWeb</span>
                <ExternalLink className="w-3.5 h-3.5 relative z-10" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl bg-[#FAF5E8] hover:bg-white text-[#001219] font-mono text-xs uppercase font-bold border-2 border-[#001219] shadow-chicano-sm hover:-translate-y-0.5 transition-all cursor-pointer"
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

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product } from '../types';
import { SITE_INFO } from '../data/constants';
import { getLiveMenuData, getLiveMenuDataAsync } from '../services/d1Api';
import { subscribeRealtime } from '../utils/realtime';
import { AmberCanvas } from './AmberCanvas';
import { ProductModal } from './ProductModal';
import { TrimmedImage } from './TrimmedImage';
import { ShoppingBag, Eye, ExternalLink, ChevronLeft, ChevronRight, Search, X, Flame } from 'lucide-react';
import { smoothScrollToTarget } from '../utils/scroll';

export const MenuSection: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | number | 'all'>('all');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });

  useEffect(() => {
    let timeoutId: number | undefined;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsMobile(window.innerWidth < 640);
      }, 150);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Máximo de 4 cards por página no mobile e 6 no desktop
  const itemsPerPage = isMobile ? 4 : 6;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const categoryTrackRef = useRef<HTMLDivElement>(null);

  // Live Dynamic Menu from CardápioWeb (0ms hydration from in-memory / localStorage / IndexedDB)
  const [liveMenu, setLiveMenu] = useState(() => getLiveMenuData());

  useEffect(() => {
    // Check IndexedDB store asynchronously
    getLiveMenuDataAsync().then((stored) => {
      if (stored && Array.isArray(stored.products) && stored.products.length > 0) {
        setLiveMenu(stored);
      }
    });

    const unsub = subscribeRealtime('MENU_UPDATED', (payload) => {
      if (payload && Array.isArray(payload.categories) && Array.isArray(payload.products)) {
        setLiveMenu(payload);
      }
    });
    return () => unsub();
  }, []);

  const activeCategories = liveMenu.categories;
  const activeProducts = liveMenu.products;

  const scrollCategoryTrack = (direction: 'left' | 'right') => {
    if (!categoryTrackRef.current) return;
    const scrollAmount = direction === 'left' ? -220 : 220;
    categoryTrackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleSelectCategory = (id: string | number | 'all', name: string, targetEl?: HTMLElement | null) => {
    setSelectedCategoryId(id);
    setSelectedCategoryName(name);

    if (targetEl && categoryTrackRef.current) {
      const track = categoryTrackRef.current;
      const trackRect = track.getBoundingClientRect();
      const elRect = targetEl.getBoundingClientRect();
      const scrollOffset = (elRect.left - trackRect.left) + track.scrollLeft - (track.clientWidth / 2) + (elRect.width / 2);
      track.scrollTo({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  // Reset page when category, search or device mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, selectedCategoryName, searchQuery, isMobile]);

  // Search & Category Filter - Exact ID and clean name matching
  const filteredProducts = useMemo(() => {
    return activeProducts.filter((prod) => {
      // Category match: exact ID or exact/trimmed category name match
      const matchesCategory =
        selectedCategoryId === 'all' ||
        (prod.categoryId && prod.categoryId === selectedCategoryId) ||
        prod.category.trim().toLowerCase() === selectedCategoryName.trim().toLowerCase();

      // Search match (name or description)
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        prod.name.toLowerCase().includes(query) ||
        (prod.description && prod.description.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [activeProducts, selectedCategoryId, selectedCategoryName, searchQuery]);

  // Clean category display name matching live CardápioWeb catalogue
  const getCategoryDisplayName = (name: string) => {
    const lower = name.toLowerCase();
    if (lower === 'all') return 'Todos';
    if (lower.includes('combos')) return 'Combos';
    if (lower.includes('burrito bowl')) return 'Bowls';
    if (lower.includes('burritos')) return 'Burritos';
    if (lower.includes('antojitos') || lower.includes('entradas')) return 'Entradas';
    if (lower.includes('tacos')) return 'Tacos';
    if (lower.includes('quesadilla')) return 'Quesadillas';
    if (lower.includes('veggie')) return 'Veggie';
    if (lower.includes('salsas') || lower.includes('molhos')) return 'Salsas';
    if (lower.includes('postres') || lower.includes('sobremesa')) return 'Sobremesas';
    if (lower.includes('sucos')) return 'Sucos';
    if (lower.includes('cerveja')) return 'Cervejas';
    if (lower.includes('bebida') || lower.includes('refrigerante')) return 'Refrigerantes';
    return name.trim();
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    smoothScrollToTarget('menu-grid-top', 80);
  };

  // Format price
  const formatPrice = (price: string | number) => {
    if (typeof price === 'number') {
      return `R$ ${price.toFixed(2).replace('.', ',')}`;
    }
    return price;
  };

  // Generate page numbers array with ellipses
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxSimple = isMobile ? 5 : 7;
    if (totalPages <= maxSimple) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage, isMobile]);

  return (
    <section
      id="products-section"
      className="min-h-[100dvh] pt-20 pb-6 sm:py-24 bg-[#001219] relative overflow-hidden flex flex-col justify-center"
    >
      {/* Background with subtle animation */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 opacity-40 animate-ken-burns"
        style={{ backgroundImage: "url('/images/logos/top-sabores.webp')" }}
      />

      {/* Amber floating dust canvas */}
      <AmberCanvas />

      {/* Atmospheric lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-72 rounded-full bg-[#CA6702]/15 blur-[140px] pointer-events-none z-[1]" />

      <div className="max-w-[92rem] mx-auto px-3 sm:px-8 lg:px-12 relative z-10 w-full my-auto">
        
        {/* Header & Title - Compact on Mobile */}
        <div className="flex flex-col items-center text-center gap-1 sm:gap-3.5 mb-2.5 sm:mb-8">
          <h2 className="font-display font-black text-xl sm:text-4xl md:text-5xl lg:text-6xl text-white uppercase leading-none tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
            O CARDÁPIO <span className="text-[#EE9B00]">DO EL CHICANO</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-0.5 sm:mt-1">
            <p className="font-warmth text-xs sm:text-xl md:text-2xl text-[#EE9B00] -rotate-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] max-w-2xl">
              Receitas artesanais preparadas na brasa com o autêntico sabor mexicano
            </p>
            <a
              href={SITE_INFO.cardapioWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden group hidden sm:inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-xs uppercase tracking-wider rounded-xl border-2 border-[#001219] shadow-chicano hover:-translate-y-0.5 transition-all cursor-pointer shrink-0"
            >
              <span className="absolute inset-0 -translate-x-full animate-cta-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              <span className="relative z-10">FAZER PEDIDO ONLINE</span>
              <ShoppingBag className="w-3.5 h-3.5 relative z-10" />
            </a>
          </div>
        </div>

        {/* Real-time Search Input Bar - Compact on Mobile */}
        <div className="relative max-w-lg mx-auto mb-2 sm:mb-6 px-0.5 sm:px-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EE9B00] absolute left-3 sm:left-4 pointer-events-none" />
            <input
              type="text"
              aria-label="Buscar pratos, tacos, burritos, molhos no cardápio"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pratos, tacos, burritos, molhos..."
              className="w-full bg-[#FAF5E8] border sm:border-3 border-[#001219] text-[#001219] placeholder-[#001219]/50 text-xs sm:text-sm font-sans font-semibold rounded-lg sm:rounded-2xl pl-8 sm:pl-11 pr-7 sm:pr-10 py-1.5 sm:py-3 shadow-chicano-sm sm:shadow-chicano focus:outline-none focus:border-[#EE9B00] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 rounded-lg text-[#001219]/60 hover:text-[#001219] transition-colors cursor-pointer"
                aria-label="Limpar busca"
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation Bar - Compact on Mobile */}
        <div className="relative max-w-6xl mx-auto mb-2 sm:mb-10 px-0.5 sm:px-2">
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Left Scroll Arrow (Mobile only) */}
            <button
              type="button"
              onClick={() => scrollCategoryTrack('left')}
              className="md:hidden shrink-0 w-6 h-6 rounded-md bg-[#001f2d] hover:bg-[#EE9B00] text-[#94D2BD] hover:text-[#001219] border border-white/15 hover:border-[#001219] flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer"
              aria-label="Rolar categorias para esquerda"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>

            {/* Scrollable Track - Smooth horizontal-only scrolling without snap locks */}
            <div 
              ref={categoryTrackRef}
              className="flex-1 flex flex-nowrap md:flex-wrap items-center md:justify-center gap-1 sm:gap-2.5 overflow-x-auto md:overflow-visible no-scrollbar py-0.5 sm:py-2 px-0.5 scroll-smooth"
            >
              {/* 'Todos' Button */}
              <button
                type="button"
                onClick={(e) => handleSelectCategory('all', 'all', e.currentTarget)}
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md sm:rounded-xl text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shrink-0 whitespace-nowrap border sm:border-2 flex items-center gap-1 sm:gap-1.5 ${
                  selectedCategoryId === 'all'
                    ? 'bg-[#EE9B00] text-[#001219] border-[#001219] shadow-chicano-sm scale-102 font-black'
                    : 'bg-white/5 text-[#E9D8A6] border-white/10 hover:border-[#EE9B00]/60 hover:bg-white/10'
                }`}
              >
                <span>Todos</span>
                <span className={`px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded text-[8px] sm:text-[10px] font-black ${
                  selectedCategoryId === 'all' 
                    ? 'bg-[#001219] text-[#EE9B00]' 
                    : 'bg-white/10 text-[#94D2BD]'
                }`}>
                  {activeProducts.length}
                </span>
              </button>

              {/* Individual Categories */}
              {activeCategories.map((cat) => {
                const displayName = getCategoryDisplayName(cat.name);
                const isSelected = selectedCategoryId === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={(e) => handleSelectCategory(cat.id, cat.name, e.currentTarget)}
                    className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md sm:rounded-xl text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shrink-0 whitespace-nowrap border sm:border-2 flex items-center gap-1 sm:gap-1.5 ${
                      isSelected
                        ? 'bg-[#EE9B00] text-[#001219] border-[#001219] shadow-chicano-sm scale-102 font-black'
                        : 'bg-white/5 text-[#E9D8A6] border-white/10 hover:border-[#EE9B00]/60 hover:bg-white/10'
                    }`}
                  >
                    <span>{displayName}</span>
                    <span className={`px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded text-[8px] sm:text-[10px] font-black ${
                      isSelected 
                        ? 'bg-[#001219] text-[#EE9B00]' 
                        : 'bg-white/10 text-[#94D2BD]'
                    }`}>
                      {cat.items.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Scroll Arrow (Mobile only) */}
            <button
              type="button"
              onClick={() => scrollCategoryTrack('right')}
              className="md:hidden shrink-0 w-6 h-6 rounded-md bg-[#001f2d] hover:bg-[#EE9B00] text-[#94D2BD] hover:text-[#001219] border border-white/15 hover:border-[#001219] flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer"
              aria-label="Rolar categorias para direita"
            >
              <ChevronRight className="w-3 h-3" />
            </button>

          </div>
        </div>

        {/* Anchor for smooth page scroll */}
        <div id="menu-grid-top" className="scroll-mt-32" />

        {/* Top Info Bar (Item Count) */}
        <div className="flex items-center justify-between mb-2 sm:mb-6 px-1 sm:px-2 text-[10px] sm:text-xs font-mono">
          <span className="text-[#94D2BD] font-bold">
            Mostrando {filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} de {filteredProducts.length} pratos
          </span>
          {searchQuery && (
            <span className="text-[#EE9B00] font-bold">
              Filtrando por: "{searchQuery}"
            </span>
          )}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-10 sm:py-16 px-4 sm:px-6 bg-[#FAF5E8] border-2 sm:border-4 border-[#001219] rounded-2xl sm:rounded-3xl max-w-md mx-auto shadow-chicano-sm sm:shadow-chicano">
            <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-[#CA6702] mx-auto mb-2 sm:mb-3" />
            <p className="font-display font-black text-lg sm:text-xl text-[#001219] uppercase">Nenhum prato encontrado</p>
            <p className="font-sans text-xs text-[#001219]/75 mt-1">Tente buscar por outro termo ou selecione outra categoria.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryId('all');
                setSelectedCategoryName('all');
                setSearchQuery('');
              }}
              className="mt-3 sm:mt-4 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white rounded-lg sm:rounded-xl font-mono text-[11px] sm:text-xs uppercase font-bold border sm:border-2 border-[#001219] cursor-pointer transition-colors shadow-chicano-sm"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-8">
              {paginatedProducts.map((product) => {
                const imgUrl = product.imageUrl || product.thumbnailUrl || product.image || '/images/products/el-chicano-246.webp';

                return (
                  <div
                    key={product.id}
                    onClick={() => setActiveProduct(product)}
                    className="group bg-[#FAF5E8] border-2 sm:border-4 border-[#001219] rounded-xl sm:rounded-3xl overflow-hidden shadow-chicano-sm sm:shadow-chicano hover:shadow-chicano-lg hover:-translate-y-0.5 sm:hover:-translate-y-2 transition-all duration-300 flex flex-row sm:flex-col justify-between cursor-pointer will-change-transform h-[92px] sm:h-auto min-h-[92px] sm:min-h-0"
                  >
                    {/* Image Container: Left on mobile (larger 115px width and 92px height), Top on desktop (full width) */}
                    <div className="relative w-[115px] sm:w-full h-full sm:aspect-[16/10] shrink-0 bg-[#001219] overflow-hidden border-r-2 sm:border-r-0 sm:border-b-3 border-[#001219] order-first">
                      <TrimmedImage
                        src={imgUrl}
                        alt={product.name}
                        className="w-full h-full object-cover object-center scale-[1.18] sm:scale-100 group-hover:scale-125 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/products/el-chicano-246.webp';
                        }}
                      />
                      <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-[#001219]/70 via-transparent to-transparent pointer-events-none" />

                      {/* Top Category Badge (Desktop only) */}
                      <div className="hidden sm:block absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10">
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#001219]/80 backdrop-blur-md text-[#94D2BD] font-mono text-[8px] sm:text-[9px] uppercase font-black tracking-wider border border-white/10">
                          {product.category || 'Especialidade'}
                        </span>
                      </div>

                      {/* Quick View Icon on Hover (Desktop only) */}
                      <div className="hidden sm:block absolute top-2.5 right-2.5 sm:top-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF5E8] text-[#001219] border-2 border-[#001219] flex items-center justify-center shadow-sm">
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </span>
                      </div>
                    </div>

                    {/* Content Column: Right on mobile (flex-1), Bottom on desktop */}
                    <div className="flex-1 p-2.5 sm:p-6 text-left flex flex-col justify-between min-w-0 order-last h-full">
                      <div>
                        <h3 className="font-display font-black text-xs sm:text-xl text-[#001219] uppercase leading-tight sm:leading-snug group-hover:text-[#CA6702] transition-colors duration-200 line-clamp-2 sm:min-h-[3rem]">
                          {product.name}
                        </h3>

                        {/* Description: HIDDEN on mobile (guarantees same height for all cards), visible on desktop */}
                        <p className="hidden sm:block font-sans text-xs text-[#001219]/75 mt-2 line-clamp-2 leading-relaxed min-h-[2.4rem]">
                          {product.description || 'Preparado artesanalmente no fogo com ingredientes selecionados.'}
                        </p>
                      </div>

                      {/* Price & Action footer */}
                      <div className="pt-0.5 sm:pt-3 flex items-center justify-between sm:border-t sm:border-[#001219]/10 mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[7px] sm:text-[9px] font-mono uppercase tracking-widest text-[#001219]/50 font-black hidden sm:block">
                            Preço
                          </span>
                          <span className="font-mono font-black text-xs sm:text-lg text-[#CA6702]">
                            {formatPrice(product.price)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {/* Quick view Eye button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveProduct(product);
                            }}
                            className="w-8 h-8 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-white hover:bg-[#FAF5E8] text-[#001219] font-mono text-xs font-bold border border-[#001219] sm:border-2 shadow-sm flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EE9B00]"
                            title={`Ver prato ampliado: ${product.name}`}
                            aria-label={`Ver detalhes e foto de ${product.name}`}
                          >
                            <Eye className="w-4 h-4 sm:w-3.5 sm:h-3.5 stroke-[2.2px]" />
                          </button>

                          {/* Fazer Pedido button */}
                          <a
                            href={SITE_INFO.cardapioWebUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Fazer pedido de ${product.name} no CardápioWeb`}
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 sm:h-auto px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-[11px] sm:text-xs uppercase tracking-wider border border-[#001219] sm:border-2 shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center gap-1 sm:gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EE9B00]"
                          >
                            <span>Pedir</span>
                            <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls - Compact on Mobile */}
            {totalPages > 1 && (
              <div className="mt-3 sm:mt-12 flex flex-wrap items-center justify-center gap-1 sm:gap-3">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl border sm:border-2 font-mono text-[11px] sm:text-xs font-bold uppercase transition-all ${
                    currentPage === 1
                      ? 'opacity-30 border-white/10 text-white/40 cursor-not-allowed bg-transparent'
                      : 'bg-[#FAF5E8] text-[#001219] border-[#001219] shadow-sm sm:shadow-chicano-sm hover:-translate-x-0.5 cursor-pointer hover:bg-[#EE9B00]'
                  }`}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Anterior</span>
                </button>

                <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
                  {pageNumbers.map((page, idx) => {
                    if (page === '...') {
                      return (
                        <span key={`dots-${idx}`} className="px-1 text-white/40 font-mono text-[11px] sm:text-xs">
                          ...
                        </span>
                      );
                    }
                    const numPage = page as number;
                    const isActive = numPage === currentPage;

                    return (
                      <button
                        key={numPage}
                        type="button"
                        onClick={() => handlePageChange(numPage)}
                        className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl font-mono text-[11px] sm:text-xs font-bold border sm:border-2 transition-all cursor-pointer flex items-center justify-center ${
                          isActive
                            ? 'bg-[#EE9B00] text-[#001219] border-[#001219] shadow-sm sm:shadow-chicano-sm scale-105 font-black'
                            : 'bg-white/5 text-[#E9D8A6] border-white/15 hover:border-[#EE9B00] hover:text-white'
                        }`}
                      >
                        {numPage}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl border sm:border-2 font-mono text-[11px] sm:text-xs font-bold uppercase transition-all ${
                    currentPage === totalPages
                      ? 'opacity-30 border-white/10 text-white/40 cursor-not-allowed bg-transparent'
                      : 'bg-[#FAF5E8] text-[#001219] border-[#001219] shadow-sm sm:shadow-chicano-sm hover:translate-x-0.5 cursor-pointer hover:bg-[#EE9B00]'
                  }`}
                  aria-label="Próxima página"
                >
                  <span className="hidden xs:inline">Próxima</span>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}
          </>
        )}

      </div>

      {/* Product Detail Modal */}
      <ProductModal
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
      />

      {/* Immersive Transition to Respiro (Desktop only; mobile divider owned by Respiro) */}
      <div className="hidden sm:block absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent via-[#001219]/60 to-[#001219] pointer-events-none z-[2]" />
      <div className="hidden sm:block section-divider-warm" />
      <div className="hidden sm:block section-divider-glow-warm" />
    </section>
  );
};

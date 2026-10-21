import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product } from '../types';
import { FULL_MENU_CATEGORIES, ALL_MENU_PRODUCTS } from '../data/menu';
import { SITE_INFO } from '../data/constants';
import { AmberCanvas } from './AmberCanvas';
import { ProductModal } from './ProductModal';
import { ShoppingBag, Eye, ExternalLink, ChevronLeft, ChevronRight, Search, X, Flame } from 'lucide-react';
import { smoothScrollToTarget } from '../utils/scroll';

export const MenuSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const categoryTrackRef = useRef<HTMLDivElement>(null);

  const scrollCategoryTrack = (direction: 'left' | 'right') => {
    if (!categoryTrackRef.current) return;
    const scrollAmount = direction === 'left' ? -220 : 220;
    categoryTrackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const activeCategories = FULL_MENU_CATEGORIES;
  const activeProducts = ALL_MENU_PRODUCTS;

  // Search & Category Filter
  const filteredProducts = useMemo(() => {
    return activeProducts.filter((prod) => {
      // Category match
      const matchesCategory =
        selectedCategory === 'all' ||
        prod.category.toLowerCase().includes(selectedCategory.toLowerCase());

      // Search match (name or description)
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        prod.name.toLowerCase().includes(query) ||
        (prod.description && prod.description.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [activeProducts, selectedCategory, searchQuery]);

  // Clean category display name
  const getCategoryDisplayName = (name: string) => {
    const lower = name.toLowerCase();
    if (lower === 'all') return 'Todos';
    if (lower.includes('combos')) return 'Combos';
    if (lower.includes('burritos')) return 'Burritos';
    if (lower.includes('bowl')) return 'Bowls';
    if (lower.includes('antojitos') || lower.includes('entradas')) return 'Entradas';
    if (lower.includes('tacos')) return 'Tacos';
    if (lower.includes('quesadilla')) return 'Quesadillas';
    if (lower.includes('veggie')) return 'Veggie';
    if (lower.includes('salsas')) return 'Salsas';
    if (lower.includes('postres') || lower.includes('sobremesa')) return 'Sobremesas';
    if (lower.includes('sucos')) return 'Sucos';
    if (lower.includes('cervejas')) return 'Cervejas';
    if (lower.includes('bebidas')) return 'Bebidas';
    return name.trim();
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
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
    if (totalPages <= 7) {
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
  }, [totalPages, currentPage]);

  return (
    <section
      id="products-section"
      className="min-h-[100dvh] py-16 md:py-24 bg-[#001219] relative overflow-hidden flex flex-col justify-center"
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

      <div className="max-w-[92rem] mx-auto px-4 sm:px-8 lg:px-12 relative z-10 w-full my-auto">
        
        {/* Header & Title */}
        <div className="flex flex-col items-center text-center gap-3.5 mb-8">
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white uppercase leading-none tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
            O CARDÁPIO <span className="text-[#EE9B00]">DO EL CHICANO</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-1">
            <p className="font-warmth text-lg sm:text-xl md:text-2xl text-[#EE9B00] -rotate-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] max-w-2xl">
              Receitas artesanais preparadas na brasa com o autêntico sabor mexicano
            </p>
            <a
              href={SITE_INFO.cardapioWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden group inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-xs uppercase tracking-wider rounded-xl border-2 border-[#001219] shadow-chicano hover:-translate-y-0.5 transition-all cursor-pointer shrink-0"
            >
              <span className="absolute inset-0 -translate-x-full animate-cta-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              <span className="relative z-10">FAZER PEDIDO ONLINE</span>
              <ShoppingBag className="w-3.5 h-3.5 relative z-10" />
            </a>
          </div>
        </div>

        {/* Real-time Search Input Bar */}
        <div className="relative max-w-lg mx-auto mb-6 px-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#EE9B00] absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pratos, tacos, burritos, molhos..."
              className="w-full bg-[#FAF5E8] border-3 border-[#001219] text-[#001219] placeholder-[#001219]/50 text-xs sm:text-sm font-sans font-semibold rounded-2xl pl-11 pr-10 py-3 shadow-chicano focus:outline-none focus:border-[#EE9B00] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-1 rounded-lg text-[#001219]/60 hover:text-[#001219] transition-colors cursor-pointer"
                aria-label="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="relative max-w-6xl mx-auto mb-8 sm:mb-10 px-1 sm:px-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Left Scroll Arrow (Mobile only) */}
            <button
              type="button"
              onClick={() => scrollCategoryTrack('left')}
              className="md:hidden shrink-0 w-8 h-9 rounded-xl bg-[#001f2d] hover:bg-[#EE9B00] text-[#94D2BD] hover:text-[#001219] border-2 border-white/15 hover:border-[#001219] flex items-center justify-center transition-all shadow-chicano-sm active:scale-90 cursor-pointer"
              aria-label="Rolar categorias para esquerda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable Track */}
            <div 
              ref={categoryTrackRef}
              className="flex-1 flex flex-nowrap md:flex-wrap items-center md:justify-center gap-2 sm:gap-2.5 overflow-x-auto md:overflow-visible no-scrollbar py-2 px-1 scroll-smooth snap-x snap-mandatory"
            >
              {/* 'Todos' Button */}
              <button
                type="button"
                onClick={(e) => {
                  setSelectedCategory('all');
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shrink-0 snap-start whitespace-nowrap border-2 flex items-center gap-1.5 ${
                  selectedCategory === 'all'
                    ? 'bg-[#EE9B00] text-[#001219] border-[#001219] shadow-chicano-sm scale-102 font-black'
                    : 'bg-white/5 text-[#E9D8A6] border-white/10 hover:border-[#EE9B00]/60 hover:bg-white/10'
                }`}
              >
                <span>Todos</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                  selectedCategory === 'all' 
                    ? 'bg-[#001219] text-[#EE9B00]' 
                    : 'bg-white/10 text-[#94D2BD]'
                }`}>
                  {activeProducts.length}
                </span>
              </button>

              {/* Individual Categories */}
              {activeCategories.map((cat) => {
                const displayName = getCategoryDisplayName(cat.name);
                const isSelected = selectedCategory === cat.name;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={(e) => {
                      setSelectedCategory(cat.name);
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }}
                    className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shrink-0 snap-start whitespace-nowrap border-2 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#EE9B00] text-[#001219] border-[#001219] shadow-chicano-sm scale-102 font-black'
                        : 'bg-white/5 text-[#E9D8A6] border-white/10 hover:border-[#EE9B00]/60 hover:bg-white/10'
                    }`}
                  >
                    <span>{displayName}</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
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
              className="md:hidden shrink-0 w-8 h-9 rounded-xl bg-[#001f2d] hover:bg-[#EE9B00] text-[#94D2BD] hover:text-[#001219] border-2 border-white/15 hover:border-[#001219] flex items-center justify-center transition-all shadow-chicano-sm active:scale-90 cursor-pointer"
              aria-label="Rolar categorias para direita"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>
        </div>

        {/* Anchor for smooth page scroll */}
        <div id="menu-grid-top" className="scroll-mt-32" />

        {/* Top Info Bar (Item Count) */}
        <div className="flex items-center justify-between mb-6 px-2 text-xs font-mono">
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
          <div className="text-center py-16 px-6 bg-[#FAF5E8] border-4 border-[#001219] rounded-3xl max-w-md mx-auto shadow-chicano">
            <Flame className="w-10 h-10 text-[#CA6702] mx-auto mb-3" />
            <p className="font-display font-black text-xl text-[#001219] uppercase">Nenhum prato encontrado</p>
            <p className="font-sans text-xs text-[#001219]/75 mt-1">Tente buscar por outro termo ou selecione outra categoria.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white rounded-xl font-mono text-xs uppercase font-bold border-2 border-[#001219] cursor-pointer transition-colors shadow-chicano-sm"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {paginatedProducts.map((product) => {
                const imgUrl = product.imageUrl || product.thumbnailUrl || product.image || '/images/products/el-chicano-246.webp';

                return (
                  <div
                    key={product.id}
                    onClick={() => setActiveProduct(product)}
                    className="group bg-[#FAF5E8] border-4 border-[#001219] rounded-3xl overflow-hidden shadow-chicano hover:shadow-chicano-lg hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between cursor-pointer will-change-transform"
                  >
                    <div>
                      {/* Image Container with 16:10 ratio */}
                      <div className="relative aspect-[16/10] bg-[#001219] overflow-hidden border-b-3 border-[#001219]">
                        <img
                          src={imgUrl}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-108 group-hover:brightness-105 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/products/el-chicano-246.webp';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#001219]/70 via-transparent to-transparent pointer-events-none" />

                        {/* Top Category Badge */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className="px-2.5 py-1 rounded-full bg-[#001219]/80 backdrop-blur-md text-[#94D2BD] font-mono text-[9px] uppercase font-black tracking-wider border border-white/10">
                            {product.category || 'Especialidade'}
                          </span>
                        </div>

                        {/* Quick View Icon on Hover */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                          <span className="w-8 h-8 rounded-full bg-[#FAF5E8] text-[#001219] border-2 border-[#001219] flex items-center justify-center shadow-sm">
                            <Eye className="w-4 h-4" />
                          </span>
                        </div>
                      </div>

                      {/* Card Content with Fixed Heights for Mathematical Alignment */}
                      <div className="p-5 sm:p-6 text-left">
                        <h3 className="font-display font-black text-xl text-[#001219] uppercase leading-tight group-hover:text-[#CA6702] transition-colors duration-300 min-h-[3rem] line-clamp-2">
                          {product.name}
                        </h3>

                        <p className="font-sans text-xs text-[#001219]/75 mt-2 min-h-[2.4rem] line-clamp-2 leading-relaxed">
                          {product.description || 'Preparado artesanalmente no fogo com ingredientes selecionados.'}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer with Price and Pedir Agora Button */}
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-3 flex items-center justify-between border-t border-[#001219]/10 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-[#001219]/50 font-black">
                          Preço
                        </span>
                        <span className="font-mono font-black text-lg text-[#CA6702]">
                          {formatPrice(product.price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveProduct(product);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF5E8] text-[#001219] font-mono text-xs font-bold border-2 border-[#001219] shadow-chicano-sm transition-all"
                          title="Ver detalhes do prato"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={SITE_INFO.cardapioWebUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-3.5 py-1.5 rounded-xl bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-xs uppercase tracking-wider border-2 border-[#001219] shadow-chicano-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Pedir</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 font-mono text-xs font-bold uppercase transition-all ${
                    currentPage === 1
                      ? 'opacity-40 border-white/10 text-white/40 cursor-not-allowed bg-transparent'
                      : 'bg-[#FAF5E8] text-[#001219] border-[#001219] shadow-chicano-sm hover:-translate-x-0.5 cursor-pointer hover:bg-[#EE9B00]'
                  }`}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {pageNumbers.map((page, idx) => {
                    if (page === '...') {
                      return (
                        <span key={`dots-${idx}`} className="px-2 text-white/40 font-mono">
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
                        className={`w-10 h-10 rounded-xl font-mono text-xs font-bold border-2 transition-all cursor-pointer flex items-center justify-center ${
                          isActive
                            ? 'bg-[#EE9B00] text-[#001219] border-[#001219] shadow-chicano-sm scale-110 font-black'
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
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 font-mono text-xs font-bold uppercase transition-all ${
                    currentPage === totalPages
                      ? 'opacity-40 border-white/10 text-white/40 cursor-not-allowed bg-transparent'
                      : 'bg-[#FAF5E8] text-[#001219] border-[#001219] shadow-chicano-sm hover:translate-x-0.5 cursor-pointer hover:bg-[#EE9B00]'
                  }`}
                  aria-label="Próxima página"
                >
                  <span>Próxima</span>
                  <ChevronRight className="w-4 h-4" />
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

      {/* Immersive Transition to Respiro */}
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent via-[#001219]/60 to-[#001219] pointer-events-none z-[2]" />
      <div className="section-divider-warm" />
      <div className="section-divider-glow-warm" />
    </section>
  );
};

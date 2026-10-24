import React, { useState, useEffect } from 'react';
import { GalleryItem } from '../types';
import { SITE_INFO } from '../data/constants';
import { getD1GalleryPosts, D1GalleryPost } from '../services/d1Api';
import { LightboxModal } from './LightboxModal';
import { InstagramIcon } from './Icons';
import { Play, ShoppingBag, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { subscribeRealtime } from '../utils/realtime';

export interface GalleryCardConfig {
  id: string;
  isFixed: boolean;
  adminSlot: number | null;
}

// 8 total cards: Card 1 is permanently fixed with VIDEO 1.mp4.
// Cards 2 to 8 map directly to the 7 admin configurable slots (Slots 1 to 7).
const GALLERY_CARDS: GalleryCardConfig[] = [
  { id: 'fixed-video-1', isFixed: true, adminSlot: null },
  { id: 'admin-slot-1', isFixed: false, adminSlot: 1 },
  { id: 'admin-slot-2', isFixed: false, adminSlot: 2 },
  { id: 'admin-slot-3', isFixed: false, adminSlot: 3 },
  { id: 'admin-slot-4', isFixed: false, adminSlot: 4 },
  { id: 'admin-slot-5', isFixed: false, adminSlot: 5 },
  { id: 'admin-slot-6', isFixed: false, adminSlot: 6 },
  { id: 'admin-slot-7', isFixed: false, adminSlot: 7 },
];

const FIXED_VIDEO_POST: D1GalleryPost = {
  id: 'fixed-video-1',
  slot_number: 0,
  type: 'video',
  media_url: '/videos/galeria/video-1.mp4',
  thumbnail_url: '/videos/galeria/video-1.mp4',
  permalink: SITE_INFO.instagramUrl,
  caption: 'O começo do El Chicano',
  category: 'Vídeo Oficial',
  is_active: 1,
};

export const Gallery: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'video' | 'photo'>('all');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [d1Posts, setD1Posts] = useState<D1GalleryPost[]>([]);
  const [mobilePage, setMobilePage] = useState(0);

  const CARDS_PER_MOBILE_PAGE = 3;

  useEffect(() => {
    let isMounted = true;

    const refreshGallery = () => {
      getD1GalleryPosts().then((posts) => {
        if (isMounted && posts && Array.isArray(posts)) {
          setD1Posts(posts);
        }
      });
    };

    // 1. Initial hydration
    refreshGallery();

    // 2. Instant Real-Time Cross-Component & Cross-Tab Subscription
    const unsub = subscribeRealtime('GALLERY_UPDATED', (updatedPosts) => {
      if (isMounted && Array.isArray(updatedPosts) && updatedPosts.length > 0) {
        setD1Posts(updatedPosts);
      } else {
        refreshGallery();
      }
    });

    // 3. Tab Focus, Visibility & Storage Revalidation
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshGallery();
      }
    };

    window.addEventListener('focus', refreshGallery);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('storage', (e) => {
      if (e.key === 'elchicano_d1_gallery_store') {
        refreshGallery();
      }
    });

    return () => {
      isMounted = false;
      unsub();
      window.removeEventListener('focus', refreshGallery);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const toggleLike = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getPostForCard = (card: GalleryCardConfig): D1GalleryPost | undefined => {
    if (card.isFixed) {
      return FIXED_VIDEO_POST;
    }
    return d1Posts.find(
      (p) => Number(p.slot_number) === card.adminSlot && Boolean(p.media_url) && p.is_active !== 0
    );
  };

  // All active posts for LightboxModal
  const allActivePosts: D1GalleryPost[] = [
    FIXED_VIDEO_POST,
    ...d1Posts.filter((p) => Boolean(p.media_url) && p.is_active !== 0),
  ];

  const lightboxItems: GalleryItem[] = allActivePosts.map((p) => ({
    id: String(p.id || p.slot_number),
    type: p.type === 'video' ? 'video' : 'photo',
    src: p.media_url,
    thumbnail: p.thumbnail_url || p.media_url,
    caption: p.caption || 'Momento El Chicano Floripa',
    category: p.category || (p.type === 'video' ? 'Vídeo Oficial' : 'Instagram'),
    likes: (p.likes || 120) + (likedIds.has(String(p.id || p.slot_number)) ? 1 : 0),
  }));

  // Filtered cards across all 8 slots
  const displayedCards = GALLERY_CARDS.filter((card) => {
    if (filter === 'all') return true;
    const post = getPostForCard(card);
    if (post) return post.type === filter;
    return filter === 'photo'; // empty slots default to photos
  });

  // Reset pagination when filter changes
  useEffect(() => {
    setMobilePage(0);
  }, [filter]);

  const totalMobilePages = Math.ceil(displayedCards.length / CARDS_PER_MOBILE_PAGE);
  const mobileCards = displayedCards.slice(
    mobilePage * CARDS_PER_MOBILE_PAGE,
    (mobilePage + 1) * CARDS_PER_MOBILE_PAGE
  );

  const renderCard = (card: GalleryCardConfig) => {
    const post = getPostForCard(card);

    if (post) {
      const galleryItem: GalleryItem = {
        id: String(post.id || post.slot_number),
        type: post.type === 'video' ? 'video' : 'photo',
        src: post.media_url,
        thumbnail: post.thumbnail_url || post.media_url,
        caption: post.caption || 'Momento El Chicano Floripa',
        category: post.category || (post.type === 'video' ? 'Vídeo Oficial' : 'Instagram'),
        likes: post.likes || 120,
      };

      return (
        <div
          key={card.id}
          onClick={() => setActiveItem(galleryItem)}
          className="group relative bg-[#001219] border-4 border-[#001219] rounded-3xl overflow-hidden shadow-chicano hover:shadow-chicano-lg hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer flex flex-col justify-between will-change-transform"
        >
          {/* Media Content - Paused by default, no autoPlay without user interaction */}
          <div className="relative aspect-[4/3] bg-black overflow-hidden">
            {post.type === 'video' ? (
              <video
                src={post.media_url}
                loop
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-cover group-hover:scale-108 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              />
            ) : (
              <img
                src={post.media_url}
                alt={post.caption || 'Momento El Chicano Floripa'}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-108 group-hover:brightness-105 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#001219] via-transparent to-transparent opacity-80 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none" />

            {/* Video Badge / Play Icon */}
            {post.type === 'video' && (
              <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-[#EE9B00] text-[#001219] border-3 border-[#001219] shadow-md flex items-center justify-center group-hover:scale-115 group-hover:bg-[#CA6702] group-hover:text-white transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none">
                <Play className="w-6 h-6 ml-0.5 fill-current" />
              </div>
            )}
          </div>

          {/* Bottom Caption & Instagram Icon (NO like counter) */}
          <div className="p-4 bg-[#001f2d] flex items-center justify-between gap-3 text-left border-t border-white/5">
            <p className="font-sans text-xs text-[#FAF5E8]/90 font-medium line-clamp-1 flex-1">
              {post.caption || 'Momento El Chicano Floripa'}
            </p>
            <div className="w-7 h-7 rounded-full bg-white/5 text-white/60 flex items-center justify-center group-hover:bg-[#EE9B00] group-hover:text-[#001219] transition-all shrink-0">
              <InstagramIcon className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      );
    }

    // Fallback: Empty Structural Placeholder Slot (NO top tags, NO like counter)
    return (
      <a
        key={card.id}
        href={SITE_INFO.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative bg-[#001219] border-4 border-[#001219] rounded-3xl overflow-hidden shadow-chicano hover:shadow-chicano-lg hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between cursor-pointer will-change-transform"
      >
        {/* Empty Structural Media Box */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-[#001f2d] via-[#001824] to-[#001219] overflow-hidden flex flex-col items-center justify-center p-6 text-center">
          <div className="absolute inset-3 border-2 border-dashed border-[#94D2BD]/15 rounded-2xl pointer-events-none group-hover:border-[#EE9B00]/40 transition-colors duration-400" />
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#94D2BD]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#EE9B00]/10 transition-colors" />

          {/* Center Instagram Icon */}
          <div className="w-14 h-14 rounded-2xl bg-[#002636] border-2 border-[#94D2BD]/30 text-[#94D2BD] flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#EE9B00] group-hover:text-[#001219] group-hover:border-[#001219] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <InstagramIcon className="w-7 h-7" />
          </div>

          <p className="font-mono text-[10px] text-[#94D2BD]/80 uppercase tracking-wider font-bold mt-3 group-hover:text-white transition-colors">
            Aguardando Mídia
          </p>
          <p className="font-sans text-[11px] text-[#FAF5E8]/40 mt-0.5">
            Slot reservado para o feed
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="p-4 bg-[#001f2d] flex items-center justify-between gap-3 text-left border-t border-white/5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#E9D8A6]/70 group-hover:text-[#EE9B00] transition-colors">
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>@elchicanofloripa</span>
          </div>

          <div className="w-7 h-7 rounded-full bg-white/5 text-white/60 flex items-center justify-center group-hover:bg-[#EE9B00] group-hover:text-[#001219] transition-all shrink-0">
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </div>
      </a>
    );
  };

  return (
    <section
      id="gallery-section"
      className="min-h-[100dvh] py-16 md:py-24 relative overflow-hidden flex flex-col justify-center"
      style={{
        background: 'linear-gradient(180deg, #005F73 0%, #004754 50%, #003843 100%)',
      }}
    >
      {/* Background Dots Pattern & Glows */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#94D2BD_1px,transparent_1px)] [background-size:22px_22px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#94D2BD]/6 blur-[160px] pointer-events-none z-[1]" />
      <div className="absolute bottom-12 right-12 w-96 h-96 rounded-full bg-[#0A9396]/8 blur-[120px] pointer-events-none z-[1]" />

      {/* Texture Rupestre overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-[0.15] mix-blend-overlay"
        style={{ backgroundImage: "url('/images/sections/texture-rupestre.webp')" }}
      />

      <div className="max-w-[92rem] mx-auto px-4 sm:px-8 lg:px-12 relative z-10 w-full my-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="text-left flex flex-col gap-3">
            <span className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-white uppercase font-bold px-3.5 py-1.5 bg-[#0A9396] border-2 border-[#001219] rounded-full w-fit shadow-[2px_2px_0px_#001219]">
              <InstagramIcon className="w-3.5 h-3.5" />
              Feed Instagram
            </span>

            <h2 className="font-display font-black text-3xl md:text-5xl text-white uppercase leading-none tracking-tight">
              FEED DO <span className="text-[#94D2BD]">INSTAGRAM</span>
            </h2>

            <p className="font-sans text-sm md:text-base text-[#94D2BD]/90 mt-1 font-medium leading-relaxed max-w-xl">
              Últimas publicações e momentos direto de{' '}
              <a
                href={SITE_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[#EE9B00] text-white hover:text-[#EE9B00] transition-colors"
              >
                @elchicanofloripa
              </a>
              .
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-start md:self-end w-full md:w-auto">
            {/* Filter Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-black/40 border-2 border-white/10 rounded-2xl">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-[#EE9B00] text-[#001219] shadow-sm font-black'
                    : 'text-[#E9D8A6]/70 hover:text-white'
                }`}
              >
                Tudo
              </button>
              <button
                type="button"
                onClick={() => setFilter('video')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  filter === 'video'
                    ? 'bg-[#EE9B00] text-[#001219] shadow-sm font-black'
                    : 'text-[#E9D8A6]/70 hover:text-white'
                }`}
              >
                Vídeos
              </button>
              <button
                type="button"
                onClick={() => setFilter('photo')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  filter === 'photo'
                    ? 'bg-[#EE9B00] text-[#001219] shadow-sm font-black'
                    : 'text-[#E9D8A6]/70 hover:text-white'
                }`}
              >
                Fotos
              </button>
            </div>

            <a
              href={SITE_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-black/40 border-2 border-white/10 hover:border-[#EE9B00] rounded-2xl text-xs font-mono font-bold text-[#94D2BD] hover:text-[#EE9B00] transition-all cursor-pointer group shadow-chicano-sm shrink-0"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              <span>@elchicanofloripa</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </a>

            <a
              href={SITE_INFO.cardapioWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden group inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-[#001219] shadow-chicano hover:-translate-y-0.5 transition-all cursor-pointer shrink-0"
            >
              <span className="absolute inset-0 -translate-x-full animate-cta-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              <ShoppingBag className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">CardápioWeb</span>
            </a>
          </div>
        </div>

        {/* Mobile View: 3 items per page with Pagination */}
        <div className="block sm:hidden">
          <div className="grid grid-cols-1 gap-5">
            {mobileCards.map((card) => renderCard(card))}
          </div>

          {/* Mobile Pagination Controls */}
          {totalMobilePages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setMobilePage((p) => Math.max(0, p - 1))}
                disabled={mobilePage === 0}
                className="p-2.5 rounded-xl bg-black/40 border-2 border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#EE9B00] hover:text-[#EE9B00] transition-all cursor-pointer"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalMobilePages }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMobilePage(idx)}
                    className={`transition-all cursor-pointer rounded-full ${
                      mobilePage === idx
                        ? 'w-7 h-2.5 bg-[#EE9B00]'
                        : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/50'
                    }`}
                    aria-label={`Ir para página ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setMobilePage((p) => Math.min(totalMobilePages - 1, p + 1))}
                disabled={mobilePage >= totalMobilePages - 1}
                className="p-2.5 rounded-xl bg-black/40 border-2 border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#EE9B00] hover:text-[#EE9B00] transition-all cursor-pointer"
                aria-label="Próxima página"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Desktop / Tablet View: Full 8-card responsive grid (Fixed Video + 7 Admin Slots) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedCards.map((card) => renderCard(card))}
        </div>

      </div>

      {/* Lightbox Modal (active only when items exist) */}
      {lightboxItems.length > 0 && (
        <LightboxModal
          item={activeItem}
          items={lightboxItems}
          onClose={() => setActiveItem(null)}
          onNavigate={(nextItem) => setActiveItem(nextItem)}
          onToggleLike={(id) => toggleLike(id)}
          likedIds={likedIds}
        />
      )}

      {/* Immersive Transition to Units */}
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent via-[#003843]/60 to-[#004754]/50 pointer-events-none z-[2]" />
      <div className="section-divider-cool" />
      <div className="section-divider-glow-cool" />
    </section>
  );
};

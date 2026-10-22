import React, { useState, useEffect } from 'react';
import { GalleryItem } from '../types';
import { SITE_INFO } from '../data/constants';
import { getD1GalleryPosts, D1GalleryPost } from '../services/d1Api';
import { LightboxModal } from './LightboxModal';
import { InstagramIcon } from './Icons';
import { Play, Heart, ShoppingBag, Eye, ExternalLink } from 'lucide-react';
import { subscribeRealtime } from '../utils/realtime';

const EMPTY_INSTAGRAM_SLOTS = [
  { id: 1, label: 'Post #01' },
  { id: 2, label: 'Post #02' },
  { id: 3, label: 'Post #03' },
  { id: 4, label: 'Post #04' },
  { id: 5, label: 'Post #05' },
  { id: 6, label: 'Post #06' },
  { id: 7, label: 'Post #07' },
];

export const Gallery: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'video' | 'photo'>('all');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [d1Posts, setD1Posts] = useState<D1GalleryPost[]>([]);

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
    const unsub = subscribeRealtime('GALLERY_UPDATED', () => {
      // Always re-hydrate in local document context to ensure zero-stale cache & valid URLs
      refreshGallery();
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

  const activeD1Posts = d1Posts.filter((p) => p.media_url && p.is_active !== 0);
  const hasActivePosts = activeD1Posts.length > 0;

  // Convert active D1 posts to GalleryItem for LightboxModal if clicked
  const lightboxItems: GalleryItem[] = activeD1Posts.map((p) => ({
    id: `d1-${p.id || p.slot_number}`,
    type: p.type === 'video' ? 'video' : 'photo',
    src: p.media_url,
    thumbnail: p.media_url,
    caption: p.caption || `Momento El Chicano Floripa (Post #${p.slot_number})`,
    category: 'Instagram',
    likes: p.likes || 120,
  }));

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
              Últimas 7 publicações e momentos direto de{' '}
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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 self-start md:self-end w-full md:w-auto">
            {hasActivePosts ? (
              <div className="flex items-center gap-2 p-1 bg-black/40 border-2 border-white/10 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
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
                  className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
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
                  className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                    filter === 'photo'
                      ? 'bg-[#EE9B00] text-[#001219] shadow-sm font-black'
                      : 'text-[#E9D8A6]/70 hover:text-white'
                  }`}
                >
                  Fotos
                </button>
              </div>
            ) : (
              <a
                href={SITE_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black/40 border-2 border-white/10 hover:border-[#EE9B00] rounded-2xl text-xs font-mono font-bold text-[#94D2BD] hover:text-[#EE9B00] transition-all cursor-pointer group shadow-chicano-sm"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>@elchicanofloripa</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}

            <a
              href={SITE_INFO.cardapioWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden group inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#EE9B00] hover:bg-[#CA6702] text-[#001219] hover:text-white font-display font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-[#001219] shadow-chicano hover:-translate-y-0.5 transition-all cursor-pointer shrink-0"
            >
              <span className="absolute inset-0 -translate-x-full animate-cta-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              <ShoppingBag className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">CardápioWeb</span>
            </a>
          </div>
        </div>

        {/* Gallery Grid across full screen proportion (7 dynamic/structural slots + 1 community card) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {EMPTY_INSTAGRAM_SLOTS.map((slot) => {
            const post = d1Posts.find(
              (p) => Number(p.slot_number) === Number(slot.id) && Boolean(p.media_url) && p.is_active !== 0
            );
            const isLiked = likedIds.has(`slot-${slot.id}`);

            if (post) {
              const postLikes = (post.likes || 120) + (isLiked ? 1 : 0);
              const galleryItem: GalleryItem = {
                id: `d1-${post.id || slot.id}`,
                type: post.type === 'video' ? 'video' : 'photo',
                src: post.media_url,
                thumbnail: post.media_url,
                caption: post.caption || `Momento El Chicano Floripa (${slot.label})`,
                category: 'Instagram',
                likes: postLikes,
              };

              return (
                <div
                  key={`slot-active-${slot.id}`}
                  onClick={() => setActiveItem(galleryItem)}
                  className="group relative bg-[#001219] border-4 border-[#001219] rounded-3xl overflow-hidden shadow-chicano hover:shadow-chicano-lg hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer flex flex-col justify-between will-change-transform"
                >
                  {/* Media Content */}
                  <div className="relative aspect-[4/3] bg-black overflow-hidden">
                    {post.type === 'video' ? (
                      <video
                        src={post.media_url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover group-hover:scale-108 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      />
                    ) : (
                      <img
                        src={post.media_url}
                        alt={post.caption || slot.label}
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

                    {/* Top Slot Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#94D2BD] font-mono text-[9px] uppercase font-black tracking-wider border border-white/10 flex items-center gap-1.5">
                        <InstagramIcon className="w-3 h-3 text-[#EE9B00]" />
                        <span>{slot.label}</span>
                      </span>
                    </div>

                    {/* Hover Eye / Inspection indicator */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 -translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                      <span className="w-8 h-8 rounded-full bg-[#FAF5E8] text-[#001219] border-2 border-[#001219] flex items-center justify-center shadow-sm">
                        <Eye className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Bottom Caption & Link */}
                  <div className="p-4 bg-[#001f2d] flex items-center justify-between gap-3 text-left">
                    <p className="font-sans text-xs text-[#FAF5E8]/90 font-medium line-clamp-1 flex-1">
                      {post.caption || `Momento El Chicano Floripa (${slot.label})`}
                    </p>

                    <button
                      type="button"
                      onClick={(e) => toggleLike(`slot-${slot.id}`, e)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                        isLiked
                          ? 'bg-[#AE2012] text-white border-[#AE2012]'
                          : 'bg-white/5 text-[#E9D8A6]/70 border-white/10 hover:border-[#AE2012]/50 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{postLikes}</span>
                    </button>
                  </div>
                </div>
              );
            }

            // Fallback: Empty Structural Placeholder Slot (Aguardando Administrador preencher no /admin)
            return (
              <a
                key={`slot-empty-${slot.id}`}
                href={SITE_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-[#001219] border-4 border-[#001219] rounded-3xl overflow-hidden shadow-chicano hover:shadow-chicano-lg hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between cursor-pointer will-change-transform"
              >
                {/* Empty Structural Media Box */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-[#001f2d] via-[#001824] to-[#001219] overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                  {/* Subtle Dashed Inner Border */}
                  <div className="absolute inset-3 border-2 border-dashed border-[#94D2BD]/15 rounded-2xl pointer-events-none group-hover:border-[#EE9B00]/40 transition-colors duration-400" />
                  <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#94D2BD]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#EE9B00]/10 transition-colors" />

                  {/* Top Slot Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#94D2BD] font-mono text-[9px] uppercase font-black tracking-wider border border-white/10 group-hover:text-[#EE9B00] transition-colors">
                      {slot.label}
                    </span>
                  </div>

                  {/* Top Right Live Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-[#E9D8A6]/60 font-mono text-[8px] uppercase tracking-wider border border-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#94D2BD]/60 animate-pulse" />
                      Espaço Vazio
                    </span>
                  </div>

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

                  <div className="w-7 h-7 rounded-full bg-white/5 text-white/60 flex items-center justify-center group-hover:bg-[#EE9B00] group-hover:text-[#001219] transition-all">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </a>
            );
          })}

          {/* 8th Community Card (Always present to complete the 8-card grid) */}
          <a
            href={SITE_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-[#FAF5E8] border-4 border-[#001219] rounded-3xl p-6 shadow-chicano hover:shadow-chicano-lg hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between text-left overflow-hidden cursor-pointer will-change-transform"
          >
            <div className="absolute inset-2 border border-dashed border-[#001219]/15 rounded-2xl pointer-events-none" />
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#EE9B00]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#005F73] font-black px-2 py-0.5 rounded bg-[#005F73]/10 border border-[#005F73]/20 inline-block mb-3">
                Sua Foto Aqui
              </span>
              <h4 className="font-display font-black text-xl text-[#001219] uppercase leading-tight">
                VIVA LA EXPERIENCIA CHICANA!
              </h4>
              <p className="font-sans text-xs text-[#001219]/75 mt-2 leading-relaxed">
                Poste seus registros com a hashtag <strong className="text-[#CA6702]">#ElChicano</strong> e marque nosso perfil para aparecer na seleção da casa.
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-[#001219]/10 flex items-center justify-between font-mono text-xs font-black text-[#005F73] group-hover:text-[#CA6702] transition-colors">
              <span>@elchicanofloripa</span>
              <span className="text-base group-hover:translate-x-1 transition-transform duration-300">→</span>
            </div>
          </a>
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

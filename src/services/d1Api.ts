import { Product, MenuCategory } from '../types';
import { ALL_MENU_PRODUCTS, FULL_MENU_CATEGORIES } from '../data/menu';
import { SITE_INFO } from '../data/constants';

const CACHE_KEY_MENU = 'elchicano_d1_menu_cache';
const CACHE_KEY_SETTINGS = 'elchicano_d1_settings_cache';
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour client cache

interface CachedData<T> {
  data: T;
  timestamp: number;
}

/**
 * Returns initial products with 0ms delay (statically bundled fallback + localStorage).
 * Automatically checks Cloudflare D1 in the background for monthly updates.
 */
export async function getLiveProducts(onUpdate?: (products: Product[]) => void): Promise<Product[]> {
  // 1. Try localStorage cache
  let localProducts: Product[] = ALL_MENU_PRODUCTS;
  try {
    const raw = localStorage.getItem(CACHE_KEY_MENU);
    if (raw) {
      const parsed: CachedData<{ products: Product[] }> = JSON.parse(raw);
      if (Array.isArray(parsed.data?.products) && parsed.data.products.length > 0) {
        localProducts = parsed.data.products;
      }
    }
  } catch {
    // Fallback to static
  }

  // 2. Background Revalidation from Cloudflare D1
  if (typeof window !== 'undefined') {
    fetch('/api/menu')
      .then((res) => {
        if (!res.ok) throw new Error('D1 API offline or static hosting');
        return res.json();
      })
      .then((payload: { success: boolean; products: any[] }) => {
        if (payload?.success && Array.isArray(payload.products) && payload.products.length > 0) {
          const mapped: Product[] = payload.products.map((p) => ({
            id: Number(p.id) || p.id,
            name: p.name,
            description: p.description || '',
            price: Number(p.price) || 0,
            imageUrl: p.image_url || '',
            thumbnailUrl: p.image_url || '',
            category: p.category,
            tag: p.tag || undefined,
            isSignature: Boolean(p.is_featured),
            status: p.is_active ? 'ACTIVE' : 'INACTIVE',
          }));

          // Save cache
          localStorage.setItem(
            CACHE_KEY_MENU,
            JSON.stringify({ data: { products: mapped }, timestamp: Date.now() })
          );

          if (onUpdate) {
            onUpdate(mapped);
          }
        }
      })
      .catch(() => {
        // Silently preserve 0ms local data when running offline or in dev without worker
      });
  }

  return localProducts;
}

/**
 * Returns dynamic site settings (opening hours, announcements, phone numbers)
 */
export async function getLiveSettings(): Promise<Record<string, string>> {
  const fallbackSettings: Record<string, string> = {
    cardapio_web_url: SITE_INFO.cardapioWebUrl,
    whatsapp_floripa: SITE_INFO.whatsappFloripaUrl,
    whatsapp_laguna: SITE_INFO.whatsappLagunaUrl,
    unit_floripa_status: 'Aberto Hoje',
    unit_laguna_status: 'Fechado Temporariamente',
  };

  try {
    const raw = localStorage.getItem(CACHE_KEY_SETTINGS);
    if (raw) {
      const parsed: CachedData<Record<string, string>> = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        return parsed.data;
      }
    }

    const res = await fetch('/api/settings');
    if (!res.ok) return fallbackSettings;
    const payload = await res.json();
    if (payload?.success && payload.settings) {
      localStorage.setItem(
        CACHE_KEY_SETTINGS,
        JSON.stringify({ data: payload.settings, timestamp: Date.now() })
      );
      return payload.settings;
    }
  } catch {
    // Return fallback
  }

  return fallbackSettings;
}

// -----------------------------------------------------------------------------
// Franchise Leads API (Cloudflare D1 + localStorage fallback)
// -----------------------------------------------------------------------------

import { getActiveSessionToken, sanitizeString } from '../utils/security';

export interface FranchiseLead {
  id?: number | string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  capital: string;
  experience?: string;
  status?: 'novo' | 'em_contato' | 'qualificado' | 'negociacao' | 'fechado' | 'descartado';
  notes?: string;
  created_at?: string;
}

const LOCAL_STORAGE_LEADS_KEY = 'elchicano_d1_leads_store';

export async function submitFranchiseLead(lead: FranchiseLead): Promise<{ success: boolean; id?: number | string }> {
  const sanitizedLead: FranchiseLead = {
    ...lead,
    name: sanitizeString(lead.name),
    email: sanitizeString(lead.email),
    phone: sanitizeString(lead.phone),
    city: sanitizeString(lead.city),
    state: sanitizeString(lead.state),
    capital: sanitizeString(lead.capital),
    experience: sanitizeString(lead.experience || 'nao'),
    id: Date.now(),
    status: 'novo',
    created_at: new Date().toISOString(),
  };

  // 1. Always save in localStorage immediately (guaranteed instant persistence)
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEADS_KEY) || '[]');
    existing.unshift(sanitizedLead);
    localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Error saving lead to localStorage:', err);
  }

  // 2. Also send to Cloudflare D1
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedLead),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, id: data.id || sanitizedLead.id };
    }
  } catch {
    // Return local success
  }

  return { success: true, id: sanitizedLead.id };
}

export async function getFranchiseLeads(): Promise<FranchiseLead[]> {
  const token = getActiveSessionToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch('/api/leads', { headers });
    if (res.ok) {
      const payload = await res.json();
      if (payload?.success && Array.isArray(payload.leads)) {
        localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(payload.leads));
        return payload.leads;
      }
    }
  } catch {
    // Read from localStorage
  }

  try {
    const local = localStorage.getItem(LOCAL_STORAGE_LEADS_KEY);
    if (local) return JSON.parse(local);
  } catch {}

  return [];
}

export async function updateFranchiseLeadStatus(id: number | string, status: string): Promise<boolean> {
  const token = getActiveSessionToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Update in localStorage
  try {
    const existing: FranchiseLead[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEADS_KEY) || '[]');
    const updated = existing.map((l) => (String(l.id) === String(id) ? { ...l, status: status as any } : l));
    localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(updated));
  } catch {}

  // Update in D1
  try {
    await fetch('/api/leads', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ id, status: sanitizeString(status) }),
    });
  } catch {}

  return true;
}

// -----------------------------------------------------------------------------
// Gallery Posts API (Cloudflare D1 + localStorage fallback)
// -----------------------------------------------------------------------------

export interface D1GalleryPost {
  id?: number | string;
  slot_number: number;
  type: 'photo' | 'video';
  media_url: string;
  thumbnail_url?: string;
  permalink?: string;
  caption?: string;
  category?: string;
  likes?: number;
  is_active?: number;
  updated_at?: string;
}

import { getMediaFromDB, deleteMediaFromDB } from '../utils/mediaStorage';
import { broadcastRealtime } from '../utils/realtime';

const LOCAL_STORAGE_GALLERY_KEY = 'elchicano_d1_gallery_store';

const DEFAULT_GALLERY_SLOTS: D1GalleryPost[] = [1, 2, 3, 4, 5, 6, 7].map((num) => ({
  slot_number: num,
  type: 'photo',
  media_url: '',
  thumbnail_url: '',
  permalink: 'https://www.instagram.com/elchicanofloripa/',
  caption: `Post #${num}`,
  is_active: 1,
}));

export async function getD1GalleryPosts(): Promise<D1GalleryPost[]> {
  let posts: D1GalleryPost[] = [];

  try {
    const res = await fetch('/api/gallery');
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const payload = await res.json();
        if (payload?.success && Array.isArray(payload.posts) && payload.posts.length > 0) {
          posts = payload.posts;
          try {
            localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(payload.posts));
          } catch {}
        }
      }
    }
  } catch {
    // Read from localStorage
  }

  if (posts.length === 0) {
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_GALLERY_KEY);
      if (local) posts = JSON.parse(local);
    } catch {}
  }

  // Ensure all 7 slots exist in the working array
  const fullSlotsMap = new Map<number, D1GalleryPost>();
  DEFAULT_GALLERY_SLOTS.forEach((slot) => fullSlotsMap.set(slot.slot_number, { ...slot }));
  posts.forEach((p) => {
    const num = Number(p.slot_number);
    if (num >= 1 && num <= 7) {
      fullSlotsMap.set(num, { ...p, slot_number: num });
    }
  });

  const merged = Array.from(fullSlotsMap.values()).sort((a, b) => a.slot_number - b.slot_number);

  // Hydrate with local IndexedDB files if available
  const hydrated = await Promise.all(
    merged.map(async (p) => {
      const localMedia = await getMediaFromDB(`slot_${p.slot_number}`);
      if (localMedia) {
        return {
          ...p,
          media_url: localMedia,
          thumbnail_url: p.thumbnail_url || localMedia,
        };
      }
      return p;
    })
  );

  return hydrated;
}

export async function saveD1GalleryPost(post: D1GalleryPost): Promise<boolean> {
  const slotNum = Number(post.slot_number);

  // If media is not a local data/blob URL or is empty, remove any previous IndexedDB file to prevent stale cache
  if (!post.media_url || (!post.media_url.startsWith('data:') && !post.media_url.startsWith('blob:'))) {
    await deleteMediaFromDB(`slot_${slotNum}`);
  }

  // Update localStorage safely
  try {
    const existing: D1GalleryPost[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_GALLERY_KEY) || '[]');
    const filtered = existing.filter((p) => Number(p.slot_number) !== slotNum);
    
    // Store full post in localStorage if possible, else placeholder for IndexedDB
    const isLarge = (post.media_url?.length || 0) > 1500000;
    const postToStore = {
      ...post,
      slot_number: slotNum,
      media_url: isLarge ? '' : post.media_url,
      updated_at: new Date().toISOString(),
    };

    filtered.push(postToStore);
    filtered.sort((a, b) => a.slot_number - b.slot_number);
    localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('LocalStorage save warning:', err);
  }

  // Re-fetch hydrated list and broadcast instantly to all tabs and components
  try {
    const allHydrated = await getD1GalleryPosts();
    broadcastRealtime('GALLERY_UPDATED', allHydrated);
  } catch (e) {
    console.warn('Realtime broadcast error:', e);
  }

  // Optionally send to Cloudflare D1 if server is online
  try {
    const token = getActiveSessionToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if ((post.media_url?.length || 0) < 500000) {
      fetch('/api/gallery', {
        method: 'POST',
        headers,
        body: JSON.stringify(post),
      }).catch(() => {});
    }
  } catch {}

  return true;
}

/**
 * Completely clears / deletes a gallery slot, wiping IndexedDB and localStorage in real-time.
 */
export async function clearD1GallerySlot(slotNumber: number): Promise<boolean> {
  const slotNum = Number(slotNumber);

  // 1. Delete from IndexedDB immediately
  await deleteMediaFromDB(`slot_${slotNum}`);

  // 2. Clear in localStorage immediately
  const emptyPost: D1GalleryPost = {
    slot_number: slotNum,
    type: 'photo',
    media_url: '',
    thumbnail_url: '',
    permalink: 'https://www.instagram.com/elchicanofloripa/',
    caption: '',
    is_active: 0,
    updated_at: new Date().toISOString(),
  };

  try {
    const existing: D1GalleryPost[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_GALLERY_KEY) || '[]');
    const filtered = existing.filter((p) => Number(p.slot_number) !== slotNum);
    filtered.push(emptyPost);
    filtered.sort((a, b) => a.slot_number - b.slot_number);
    localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Error clearing slot in localStorage:', err);
  }

  // 3. Hydrate & Broadcast instantly across all components & tabs
  try {
    const allHydrated = await getD1GalleryPosts();
    broadcastRealtime('GALLERY_UPDATED', allHydrated);
  } catch (e) {
    console.warn('Realtime broadcast error on clear slot:', e);
  }

  // 4. Optionally clear in D1
  try {
    const token = getActiveSessionToken();
    if (token) {
      fetch('/api/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slot_number: slotNum }),
      }).catch(() => {});
    }
  } catch {}

  return true;
}

// -----------------------------------------------------------------------------
// Franchise Video Configuration (Cloudflare D1 / localStorage)
// -----------------------------------------------------------------------------

export interface FranchiseVideoConfig {
  isEnabled: boolean;
  videoUrl: string;
  posterUrl?: string;
  title?: string;
}

const LOCAL_STORAGE_VIDEO_KEY = 'elchicano_d1_franchise_video';

export async function getFranchiseVideoConfig(): Promise<FranchiseVideoConfig> {
  const DEFAULT_CONFIG: FranchiseVideoConfig = {
    isEnabled: false,
    videoUrl: '',
    posterUrl: '',
    title: 'Apresentação do Modelo El Chicano',
  };

  let config = DEFAULT_CONFIG;

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_VIDEO_KEY);
    if (raw) {
      config = JSON.parse(raw);
    }
  } catch {}

  // Hydrate video & poster from IndexedDB if available locally
  try {
    const localVideo = await getMediaFromDB('franchise_video');
    const localPoster = await getMediaFromDB('franchise_video_poster');

    if (localVideo) {
      config = { ...config, videoUrl: localVideo };
    }
    if (localPoster) {
      config = { ...config, posterUrl: localPoster };
    }
  } catch {}

  return config;
}

export async function saveFranchiseVideoConfig(config: FranchiseVideoConfig): Promise<boolean> {
  try {
    // If video or poster is external URL or empty, remove stale IndexedDB overrides
    if (!config.videoUrl || (!config.videoUrl.startsWith('data:') && !config.videoUrl.startsWith('blob:'))) {
      await deleteMediaFromDB('franchise_video');
    }
    if (!config.posterUrl || (!config.posterUrl.startsWith('data:') && !config.posterUrl.startsWith('blob:'))) {
      await deleteMediaFromDB('franchise_video_poster');
    }

    const isLargeVideo = (config.videoUrl?.length || 0) > 1500000;
    const isLargePoster = (config.posterUrl?.length || 0) > 1500000;

    const configToStore = {
      ...config,
      videoUrl: isLargeVideo ? '' : config.videoUrl,
      posterUrl: isLargePoster ? '' : config.posterUrl,
    };
    localStorage.setItem(LOCAL_STORAGE_VIDEO_KEY, JSON.stringify(configToStore));

    // Re-hydrate fresh config to ensure valid URLs and broadcast
    const freshConfig = await getFranchiseVideoConfig();
    broadcastRealtime('FRANCHISE_VIDEO_UPDATED', freshConfig);
    return true;
  } catch {
    return false;
  }
}

/**
 * Completely deletes / clears franchise video and poster from IndexedDB and storage.
 */
export async function clearFranchiseVideoConfig(): Promise<boolean> {
  try {
    await deleteMediaFromDB('franchise_video');
    await deleteMediaFromDB('franchise_video_poster');

    const clearedConfig: FranchiseVideoConfig = {
      isEnabled: false,
      videoUrl: '',
      posterUrl: '',
      title: 'Apresentação do Modelo El Chicano',
    };

    localStorage.setItem(LOCAL_STORAGE_VIDEO_KEY, JSON.stringify(clearedConfig));
    broadcastRealtime('FRANCHISE_VIDEO_UPDATED', clearedConfig);
    return true;
  } catch {
    return false;
  }
}




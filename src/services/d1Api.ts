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

import { getMediaFromDB } from '../utils/mediaStorage';

const LOCAL_STORAGE_GALLERY_KEY = 'elchicano_d1_gallery_store';

export async function getD1GalleryPosts(): Promise<D1GalleryPost[]> {
  let posts: D1GalleryPost[] = [];

  try {
    const res = await fetch('/api/gallery');
    if (res.ok) {
      const payload = await res.json();
      if (payload?.success && Array.isArray(payload.posts)) {
        posts = payload.posts;
        try {
          localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(payload.posts));
        } catch {
          // Ignore localStorage quota if large payload
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

  // Hydrate with local IndexedDB files if available
  const hydrated = await Promise.all(
    posts.map(async (p) => {
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
  // Update localStorage safely
  try {
    const existing: D1GalleryPost[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_GALLERY_KEY) || '[]');
    const filtered = existing.filter((p) => p.slot_number !== post.slot_number);
    
    // If media_url is a giant blob or dataUrl, avoid blowing localStorage limit
    const postToStore = {
      ...post,
      media_url: post.media_url?.startsWith('blob:') || (post.media_url?.length || 0) > 2000000 
        ? '' // IndexedDB holds the actual media
        : post.media_url,
      updated_at: new Date().toISOString(),
    };

    filtered.push(postToStore);
    filtered.sort((a, b) => a.slot_number - b.slot_number);
    localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('LocalStorage save warning:', err);
  }

  // Update D1
  try {
    const token = getActiveSessionToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Only send to D1 if URL is reasonable size or server is online
    if ((post.media_url?.length || 0) < 500000) {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers,
        body: JSON.stringify(post),
      });
      return res.ok;
    }
    return true;
  } catch {
    return true;
  }
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
    isEnabled: false, // Video removed from page by default as requested
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
    // If videoUrl is a blob or large dataUrl, don't break localStorage
    const configToStore = {
      ...config,
      videoUrl: config.videoUrl?.startsWith('blob:') || (config.videoUrl?.length || 0) > 2000000
        ? '' // IndexedDB holds the media
        : config.videoUrl,
      posterUrl: config.posterUrl?.startsWith('blob:') || (config.posterUrl?.length || 0) > 2000000
        ? ''
        : config.posterUrl,
    };
    localStorage.setItem(LOCAL_STORAGE_VIDEO_KEY, JSON.stringify(configToStore));
    return true;
  } catch {
    return false;
  }
}



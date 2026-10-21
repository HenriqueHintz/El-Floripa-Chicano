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
  const newLead: FranchiseLead = {
    ...lead,
    id: Date.now(),
    status: 'novo',
    created_at: new Date().toISOString(),
  };

  // 1. Always save in localStorage immediately (guaranteed instant persistence)
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEADS_KEY) || '[]');
    existing.unshift(newLead);
    localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Error saving lead to localStorage:', err);
  }

  // 2. Also send to Cloudflare D1
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, id: data.id || newLead.id };
    }
  } catch {
    // Return local success
  }

  return { success: true, id: newLead.id };
}

export async function getFranchiseLeads(): Promise<FranchiseLead[]> {
  try {
    const res = await fetch('/api/leads');
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
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

const LOCAL_STORAGE_GALLERY_KEY = 'elchicano_d1_gallery_store';

export async function getD1GalleryPosts(): Promise<D1GalleryPost[]> {
  try {
    const res = await fetch('/api/gallery');
    if (res.ok) {
      const payload = await res.json();
      if (payload?.success && Array.isArray(payload.posts)) {
        localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(payload.posts));
        return payload.posts;
      }
    }
  } catch {
    // Read from localStorage
  }

  try {
    const local = localStorage.getItem(LOCAL_STORAGE_GALLERY_KEY);
    if (local) return JSON.parse(local);
  } catch {}

  return [];
}

export async function saveD1GalleryPost(post: D1GalleryPost): Promise<boolean> {
  // Update localStorage
  try {
    const existing: D1GalleryPost[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_GALLERY_KEY) || '[]');
    const filtered = existing.filter((p) => p.slot_number !== post.slot_number);
    filtered.push({ ...post, updated_at: new Date().toISOString() });
    filtered.sort((a, b) => a.slot_number - b.slot_number);
    localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(filtered));
  } catch {}

  // Update D1
  try {
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    return res.ok;
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

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_VIDEO_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  return DEFAULT_CONFIG;
}

export async function saveFranchiseVideoConfig(config: FranchiseVideoConfig): Promise<boolean> {
  try {
    localStorage.setItem(LOCAL_STORAGE_VIDEO_KEY, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}


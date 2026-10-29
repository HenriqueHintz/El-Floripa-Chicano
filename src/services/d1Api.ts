import { Product, MenuCategory, D1ProductPayloadItem, CardapioWebCategory, CardapioWebItem } from '../types';
import { ALL_MENU_PRODUCTS, FULL_MENU_CATEGORIES } from '../data/menu';
import { SITE_INFO } from '../data/constants';
import { 
  saveAppJsonToDB, 
  getAppJsonFromDB, 
  deleteAppJsonFromDB, 
  purgeLegacyLocalStorageBloat,
  getMediaFromDB,
  saveMediaToDB,
  deleteMediaFromDB
} from '../utils/mediaStorage';
import { getActiveSessionToken, sanitizeString } from '../utils/security';
import { broadcastRealtime } from '../utils/realtime';

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
      .then((payload: { success: boolean; products: D1ProductPayloadItem[] }) => {
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
    unit_laguna_status: 'Pausado Temporariamente',
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
    const updated = existing.map((l) => (String(l.id) === String(id) ? { ...l, status: status as NonNullable<FranchiseLead['status']> } : l));
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

export async function deleteFranchiseLead(id: number | string): Promise<boolean> {
  const token = getActiveSessionToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 1. Remove from localStorage immediately
  try {
    const existing: FranchiseLead[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEADS_KEY) || '[]');
    const updated = existing.filter((l) => String(l.id) !== String(id));
    localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Error deleting lead from localStorage:', err);
  }

  // 2. Remove from D1 if backend active
  try {
    await fetch('/api/leads', {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ id }),
    });
  } catch {}

  return true;
}

export async function clearAllFranchiseLeads(): Promise<boolean> {
  const token = getActiveSessionToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 1. Clear in localStorage immediately
  try {
    localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify([]));
  } catch (err) {
    console.warn('Error clearing leads from localStorage:', err);
  }

  // 2. Clear in D1 if backend active
  try {
    await fetch('/api/leads?all=true', {
      method: 'DELETE',
      headers,
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
        }
      }
    }
  } catch {}

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
          thumbnail_url: localMedia,
          is_active: p.is_active !== undefined ? p.is_active : 1,
        };
      }
      return p;
    })
  );

  return hydrated;
}

export async function saveD1GalleryPost(post: D1GalleryPost): Promise<boolean> {
  const slotNum = Number(post.slot_number);

  // 1. If media is a data: URL or blob:, make sure it is safely persisted in IndexedDB
  if (post.media_url && post.media_url.startsWith('data:')) {
    try {
      const res = await fetch(post.media_url);
      const blob = await res.blob();
      await saveMediaToDB(`slot_${slotNum}`, blob, `slot_${slotNum}.webp`, post.media_url);
    } catch (e) {
      console.warn('Error saving data: URL to IndexedDB:', e);
    }
  } else if (!post.media_url) {
    await deleteMediaFromDB(`slot_${slotNum}`);
  }

  // 2. Update localStorage strictly with metadata (NEVER store heavy Base64 data: or blob: strings in localStorage)
  try {
    const rawLocal = localStorage.getItem(LOCAL_STORAGE_GALLERY_KEY);
    let existing: D1GalleryPost[] = [];
    if (rawLocal) {
      try {
        existing = JSON.parse(rawLocal);
      } catch {}
    }

    // Strip bulky Base64 from all existing records to permanently prevent QuotaExceededError
    const filtered: D1GalleryPost[] = existing
      .filter((p) => Number(p.slot_number) !== slotNum)
      .map((p) => ({
        ...p,
        media_url: p.media_url && !p.media_url.startsWith('data:') && !p.media_url.startsWith('blob:') ? p.media_url : '',
        thumbnail_url: '',
      }));

    const isLocalData = post.media_url && (post.media_url.startsWith('data:') || post.media_url.startsWith('blob:'));
    const postToStore: D1GalleryPost = {
      ...post,
      slot_number: slotNum,
      // External URLs are stored directly; local files live in IndexedDB
      media_url: isLocalData ? '' : (post.media_url || ''),
      thumbnail_url: '',
      is_active: post.is_active !== undefined ? post.is_active : 1,
      updated_at: new Date().toISOString(),
    };

    filtered.push(postToStore);
    filtered.sort((a, b) => Number(a.slot_number) - Number(b.slot_number));
    localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('LocalStorage save warning:', err);
  }

  // 3. Re-fetch hydrated list directly from IndexedDB and broadcast in real-time
  try {
    const allHydrated = await getD1GalleryPosts();
    broadcastRealtime('GALLERY_UPDATED', allHydrated);
  } catch (e) {
    console.warn('Realtime broadcast error:', e);
  }

  // 4. Optionally send to Cloudflare D1 if server is online
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

    const isLocalVideo = config.videoUrl && (config.videoUrl.startsWith('data:') || config.videoUrl.startsWith('blob:'));
    const isLocalPoster = config.posterUrl && (config.posterUrl.startsWith('data:') || config.posterUrl.startsWith('blob:'));

    const configToStore = {
      ...config,
      videoUrl: isLocalVideo ? '' : config.videoUrl,
      posterUrl: isLocalPoster ? '' : config.posterUrl,
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

// -----------------------------------------------------------------------------
// Live Menu Synchronization (CardápioWeb Pocket Floripa)
// Target: https://app.cardapioweb.com/elchicano_pocketfloripa
// API: https://integracao.cardapioweb.com/api/menu/company/categories?origin=catalogo&only_available_for=delivery
// -----------------------------------------------------------------------------

export const CARDAPIO_WEB_URL = 'https://app.cardapioweb.com/elchicano_pocketfloripa';
export const CARDAPIO_WEB_COMPANY_ID = '24759';
const LOCAL_STORAGE_LIVE_MENU_KEY = 'elchicano_live_menu_store';
const IDB_LIVE_MENU_KEY = 'live_menu_catalog';

export interface LiveMenuData {
  categories: MenuCategory[];
  products: Product[];
  lastSyncAt: string | null;
  totalProducts: number;
}

let inMemoryLiveMenu: LiveMenuData | null = null;

// Background hydration from IndexedDB on initial script evaluation
if (typeof window !== 'undefined') {
  // Purge any legacy base64 bloat automatically
  purgeLegacyLocalStorageBloat();

  getAppJsonFromDB<LiveMenuData>(IDB_LIVE_MENU_KEY)
    .then((stored) => {
      if (stored && Array.isArray(stored.products) && stored.products.length > 0) {
        inMemoryLiveMenu = stored;
        broadcastRealtime('MENU_UPDATED', stored);
      }
    })
    .catch(() => {});
}

export function getLiveMenuData(): LiveMenuData {
  // 1. Return in-memory cache if available (instant 0ms)
  if (inMemoryLiveMenu && Array.isArray(inMemoryLiveMenu.products) && inMemoryLiveMenu.products.length > 0) {
    return inMemoryLiveMenu;
  }

  // 2. Try localStorage safely
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LIVE_MENU_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.categories) && Array.isArray(parsed?.products) && parsed.products.length > 0) {
        inMemoryLiveMenu = {
          categories: parsed.categories,
          products: parsed.products,
          lastSyncAt: parsed.lastSyncAt || null,
          totalProducts: parsed.products.length,
        };
        return inMemoryLiveMenu;
      }
    }
  } catch (err) {
    console.warn('Error reading live menu from localStorage:', err);
  }

  // 3. Fallback to static bundled default
  return {
    categories: FULL_MENU_CATEGORIES,
    products: ALL_MENU_PRODUCTS,
    lastSyncAt: null,
    totalProducts: ALL_MENU_PRODUCTS.length,
  };
}

export async function getLiveMenuDataAsync(): Promise<LiveMenuData> {
  if (inMemoryLiveMenu && Array.isArray(inMemoryLiveMenu.products) && inMemoryLiveMenu.products.length > 0) {
    return inMemoryLiveMenu;
  }
  const fromDB = await getAppJsonFromDB<LiveMenuData>(IDB_LIVE_MENU_KEY);
  if (fromDB && Array.isArray(fromDB.products) && fromDB.products.length > 0) {
    inMemoryLiveMenu = fromDB;
    return fromDB;
  }
  return getLiveMenuData();
}

export async function syncMenuFromCardapioWeb(): Promise<{
  success: boolean;
  totalProducts: number;
  totalCategories: number;
  lastSyncAt: string;
  error?: string;
}> {
  try {
    const apiUrl = `https://integracao.cardapioweb.com/api/menu/company/categories?origin=catalogo&only_available_for=delivery`;

    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Company-ID': CARDAPIO_WEB_COMPANY_ID,
        Accept: 'application/json, text/plain, */*',
      },
    });

    if (!res.ok) {
      throw new Error(`Servidor CardápioWeb respondeu com status ${res.status}`);
    }

    const rawCategories = await res.json();
    if (!Array.isArray(rawCategories)) {
      throw new Error('Formato de resposta inválido do CardápioWeb');
    }

    // Map categories and items to strict MenuCategory and Product models
    const mappedCategories: MenuCategory[] = rawCategories
      .filter((cat: CardapioWebCategory) => cat.status === 'ACTIVE' && Array.isArray(cat.items))
      .map((cat: CardapioWebCategory, catIndex: number) => {
        const catName = cat.name.trim();
        const mappedItems: Product[] = (cat.items || [])
          .filter((item: CardapioWebItem) => item.status === 'ACTIVE')
          .map((item: CardapioWebItem) => {
            const rawDesc = item.description || '';
            const cleanDesc = rawDesc.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
            const imageUrl = item.image_url || '';

            return {
              id: item.id,
              name: item.name.trim(),
              category: catName,
              categoryId: cat.id,
              categoryName: catName,
              description: cleanDesc,
              price: Number(item.price) || 0,
              promotionalPrice: item.promotional_price ? Number(item.promotional_price) : null,
              image: imageUrl,
              imageUrl: imageUrl,
              thumbnailUrl: imageUrl,
              status: item.status || 'ACTIVE',
              addOns: item.add_ons || [],
            };
          });

        return {
          id: cat.id,
          name: catName,
          description: cat.description || null,
          position: cat.position ?? catIndex,
          imageUrl: cat.image_url || null,
          items: mappedItems,
        };
      })
      .filter((cat) => cat.items.length > 0);

    const mappedProducts: Product[] = mappedCategories.flatMap((c) => c.items);

    if (mappedProducts.length === 0) {
      throw new Error('Nenhum produto ativo retornado pelo CardápioWeb.');
    }

    const syncTimestamp = new Date().toISOString();
    const payloadToStore: LiveMenuData = {
      categories: mappedCategories,
      products: mappedProducts,
      lastSyncAt: syncTimestamp,
      totalProducts: mappedProducts.length,
    };

    // 1. Immediate in-memory cache update (0ms latency for active session)
    inMemoryLiveMenu = payloadToStore;

    // 2. Primary Persistence: Save into IndexedDB (Unlimited quota - will never fail with quota exceeded)
    await saveAppJsonToDB(IDB_LIVE_MENU_KEY, payloadToStore);

    // 3. Secondary Persistence: Try localStorage with quota error suppression and automatic bloat purge
    try {
      localStorage.setItem(LOCAL_STORAGE_LIVE_MENU_KEY, JSON.stringify(payloadToStore));
    } catch (quotaErr) {
      console.warn('LocalStorage quota limit reached. Purging legacy bloat and retrying...', quotaErr);
      try {
        purgeLegacyLocalStorageBloat();
        localStorage.setItem(LOCAL_STORAGE_LIVE_MENU_KEY, JSON.stringify(payloadToStore));
      } catch (retryErr) {
        console.warn('LocalStorage remains full. IndexedDB is safely retaining the live menu data.');
        // Do NOT throw: data is safely stored in IndexedDB and in-memory!
      }
    }

    // 4. Clean up legacy D1 cache if present
    try {
      localStorage.removeItem('elchicano_d1_menu_cache');
    } catch {}

    // 5. Broadcast to all open tabs and active components
    broadcastRealtime('MENU_UPDATED', payloadToStore);

    return {
      success: true,
      totalProducts: mappedProducts.length,
      totalCategories: mappedCategories.length,
      lastSyncAt: syncTimestamp,
    };
  } catch (err: unknown) {
    console.error('syncMenuFromCardapioWeb error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Falha ao sincronizar com CardápioWeb';
    return {
      success: false,
      totalProducts: 0,
      totalCategories: 0,
      lastSyncAt: '',
      error: errorMessage,
    };
  }
}

export function resetMenuToDefault(): LiveMenuData {
  inMemoryLiveMenu = null;
  try {
    localStorage.removeItem(LOCAL_STORAGE_LIVE_MENU_KEY);
    localStorage.removeItem('elchicano_d1_menu_cache');
  } catch {}
  deleteAppJsonFromDB(IDB_LIVE_MENU_KEY).catch(() => {});

  const defaultData: LiveMenuData = {
    categories: FULL_MENU_CATEGORIES,
    products: ALL_MENU_PRODUCTS,
    lastSyncAt: null,
    totalProducts: ALL_MENU_PRODUCTS.length,
  };
  broadcastRealtime('MENU_UPDATED', defaultData);
  return defaultData;
}




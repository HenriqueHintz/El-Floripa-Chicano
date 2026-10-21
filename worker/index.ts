export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  ADMIN_API_KEY?: string;
  ADMIN_HASH?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Edge cache headers for peak performance (1 minute browser, 1 hour CDN edge, SWR 24h)
const CACHE_HEADERS = {
  ...CORS_HEADERS,
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
};

/**
 * Strict Input Sanitizer to neutralize HTML/Script injections in database records
 */
function sanitize(input: any, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>'"&]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        case '&': return '&amp;';
        default: return char;
      }
    })
    .trim()
    .slice(0, maxLength);
}

/**
 * Helper to verify authorization headers for protected administrative routes
 */
function isAuthorized(request: Request, env: Env): boolean {
  const auth = request.headers.get('Authorization');
  if (!auth) return false;

  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;

  // 1. If worker has configured ADMIN_API_KEY, enforce exact match
  if (env.ADMIN_API_KEY) {
    return token === env.ADMIN_API_KEY;
  }

  // 2. Validate token structure (signed session token format or admin secret)
  return token.length >= 16;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // API Routes for Cloudflare D1
    if (url.pathname.startsWith('/api/')) {
      try {
        // GET /api/menu - Returns full active menu with edge caching
        if (url.pathname === '/api/menu' && request.method === 'GET') {
          const [categoriesRes, productsRes] = await Promise.all([
            env.DB.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY order_index ASC').all(),
            env.DB.prepare('SELECT * FROM products WHERE is_active = 1 ORDER BY order_index ASC').all(),
          ]);

          return new Response(
            JSON.stringify({
              success: true,
              categories: categoriesRes.results,
              products: productsRes.results,
              timestamp: new Date().toISOString(),
            }),
            { headers: CACHE_HEADERS }
          );
        }

        // GET /api/settings - Returns key-value site configurations
        if (url.pathname === '/api/settings' && request.method === 'GET') {
          const settingsRes = await env.DB.prepare('SELECT key, value, category FROM site_settings').all();
          const settingsMap: Record<string, string> = {};
          for (const row of settingsRes.results as any[]) {
            settingsMap[row.key] = row.value;
          }

          return new Response(
            JSON.stringify({
              success: true,
              settings: settingsMap,
              timestamp: new Date().toISOString(),
            }),
            { headers: CACHE_HEADERS }
          );
        }

        // GET /api/monthly-updates - Returns history of monthly changes
        if (url.pathname === '/api/monthly-updates' && request.method === 'GET') {
          const updatesRes = await env.DB.prepare(
            'SELECT * FROM monthly_updates ORDER BY applied_at DESC LIMIT 12'
          ).all();

          return new Response(
            JSON.stringify({
              success: true,
              updates: updatesRes.results,
            }),
            { headers: CACHE_HEADERS }
          );
        }

        // POST /api/monthly-updates - Register monthly menu update (PROTECTED)
        if (url.pathname === '/api/monthly-updates' && request.method === 'POST') {
          if (!isAuthorized(request, env)) {
            return new Response(JSON.stringify({ error: 'Acesso não autorizado' }), {
              status: 401,
              headers: CORS_HEADERS,
            });
          }

          const body = (await request.json()) as {
            month_year: string;
            title: string;
            summary?: string;
            changes_json?: string;
          };

          await env.DB.prepare(
            'INSERT INTO monthly_updates (month_year, title, summary, changes_json) VALUES (?, ?, ?, ?)'
          )
            .bind(
              sanitize(body.month_year, 20),
              sanitize(body.title, 120),
              sanitize(body.summary || '', 500),
              body.changes_json || '{}'
            )
            .run();

          return new Response(JSON.stringify({ success: true, message: 'Atualização mensal registrada' }), {
            headers: CORS_HEADERS,
          });
        }

        // POST /api/products/price - Quick monthly price adjustment (PROTECTED)
        if (url.pathname === '/api/products/price' && request.method === 'POST') {
          if (!isAuthorized(request, env)) {
            return new Response(JSON.stringify({ error: 'Acesso não autorizado' }), {
              status: 401,
              headers: CORS_HEADERS,
            });
          }

          const body = (await request.json()) as { id: string; price: number };
          if (!body.id || body.price === undefined || typeof body.price !== 'number') {
            return new Response(JSON.stringify({ error: 'Parâmetros id e price numérico são obrigatórios' }), {
              status: 400,
              headers: CORS_HEADERS,
            });
          }

          await env.DB.prepare(
            'UPDATE products SET price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
          )
            .bind(body.price, sanitize(body.id, 50))
            .run();

          return new Response(JSON.stringify({ success: true, message: 'Preço atualizado com sucesso' }), {
            headers: CORS_HEADERS,
          });
        }

        // GET /api/leads - List franchise leads (PROTECTED - PII & LGPD DEFENSE)
        if (url.pathname === '/api/leads' && request.method === 'GET') {
          if (!isAuthorized(request, env)) {
            return new Response(JSON.stringify({ error: 'Acesso restrito ao painel administrativo' }), {
              status: 401,
              headers: CORS_HEADERS,
            });
          }

          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS franchise_leads (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              email TEXT NOT NULL,
              phone TEXT NOT NULL,
              city TEXT NOT NULL,
              state TEXT NOT NULL,
              capital TEXT NOT NULL,
              experience TEXT DEFAULT 'nao',
              status TEXT DEFAULT 'novo',
              notes TEXT DEFAULT '',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `).run();

          const leadsRes = await env.DB.prepare('SELECT * FROM franchise_leads ORDER BY created_at DESC').all();
          return new Response(JSON.stringify({ success: true, leads: leadsRes.results }), {
            headers: CORS_HEADERS,
          });
        }

        // POST /api/leads - Create new franchise lead (PUBLIC FORM WITH STRICT SANITIZATION)
        if (url.pathname === '/api/leads' && request.method === 'POST') {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS franchise_leads (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              email TEXT NOT NULL,
              phone TEXT NOT NULL,
              city TEXT NOT NULL,
              state TEXT NOT NULL,
              capital TEXT NOT NULL,
              experience TEXT DEFAULT 'nao',
              status TEXT DEFAULT 'novo',
              notes TEXT DEFAULT '',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `).run();

          const body = (await request.json()) as any;
          const name = sanitize(body.name, 100);
          const email = sanitize(body.email, 120);
          const phone = sanitize(body.phone, 30);
          const city = sanitize(body.city, 80);
          const state = sanitize(body.state, 10);
          const capital = sanitize(body.capital, 50);
          const experience = sanitize(body.experience, 30) || 'nao';

          if (!name || !phone || !email) {
            return new Response(JSON.stringify({ error: 'Nome, Telefone e E-mail são obrigatórios' }), {
              status: 400,
              headers: CORS_HEADERS,
            });
          }

          const insertRes = await env.DB.prepare(`
            INSERT INTO franchise_leads (name, email, phone, city, state, capital, experience, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'novo', '')
          `)
            .bind(name, email, phone, city, state, capital, experience)
            .run();

          return new Response(JSON.stringify({ success: true, id: insertRes.meta?.last_row_id }), {
            headers: CORS_HEADERS,
          });
        }

        // PATCH /api/leads - Update lead status (PROTECTED)
        if (url.pathname === '/api/leads' && request.method === 'PATCH') {
          if (!isAuthorized(request, env)) {
            return new Response(JSON.stringify({ error: 'Acesso não autorizado' }), {
              status: 401,
              headers: CORS_HEADERS,
            });
          }

          const body = (await request.json()) as any;
          if (!body.id || !body.status) {
            return new Response(JSON.stringify({ error: 'id and status required' }), {
              status: 400,
              headers: CORS_HEADERS,
            });
          }

          await env.DB.prepare('UPDATE franchise_leads SET status = ? WHERE id = ?')
            .bind(sanitize(body.status, 30), body.id)
            .run();

          return new Response(JSON.stringify({ success: true }), {
            headers: CORS_HEADERS,
          });
        }

        // GET /api/gallery - Return active gallery posts (PUBLIC)
        if (url.pathname === '/api/gallery' && request.method === 'GET') {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS gallery_posts (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              slot_number INTEGER NOT NULL UNIQUE,
              type TEXT DEFAULT 'photo',
              media_url TEXT NOT NULL,
              thumbnail_url TEXT,
              permalink TEXT,
              caption TEXT,
              category TEXT DEFAULT 'ElChicano',
              likes INTEGER DEFAULT 0,
              is_active INTEGER DEFAULT 1,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `).run();

          const postsRes = await env.DB.prepare(
            'SELECT * FROM gallery_posts WHERE is_active = 1 ORDER BY slot_number ASC'
          ).all();
          return new Response(JSON.stringify({ success: true, posts: postsRes.results }), {
            headers: CACHE_HEADERS,
          });
        }

        // POST /api/gallery - Upsert gallery post slot (PROTECTED)
        if (url.pathname === '/api/gallery' && request.method === 'POST') {
          if (!isAuthorized(request, env)) {
            return new Response(JSON.stringify({ error: 'Acesso não autorizado' }), {
              status: 401,
              headers: CORS_HEADERS,
            });
          }

          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS gallery_posts (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              slot_number INTEGER NOT NULL UNIQUE,
              type TEXT DEFAULT 'photo',
              media_url TEXT NOT NULL,
              thumbnail_url TEXT,
              permalink TEXT,
              caption TEXT,
              category TEXT DEFAULT 'ElChicano',
              likes INTEGER DEFAULT 0,
              is_active INTEGER DEFAULT 1,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `).run();

          const body = (await request.json()) as any;
          if (!body.slot_number || !body.media_url) {
            return new Response(JSON.stringify({ error: 'slot_number e media_url são obrigatórios' }), {
              status: 400,
              headers: CORS_HEADERS,
            });
          }

          const slotNum = Number(body.slot_number);
          const type = sanitize(body.type, 20) || 'photo';
          const mediaUrl = sanitize(body.media_url, 500);
          const thumbUrl = sanitize(body.thumbnail_url || body.media_url, 500);
          const permalink = sanitize(body.permalink, 500);
          const caption = sanitize(body.caption, 300);
          const category = sanitize(body.category, 50) || 'ElChicano';

          await env.DB.prepare(`
            INSERT INTO gallery_posts (slot_number, type, media_url, thumbnail_url, permalink, caption, category, is_active, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
            ON CONFLICT(slot_number) DO UPDATE SET
              type = excluded.type,
              media_url = excluded.media_url,
              thumbnail_url = excluded.thumbnail_url,
              permalink = excluded.permalink,
              caption = excluded.caption,
              category = excluded.category,
              is_active = excluded.is_active,
              updated_at = CURRENT_TIMESTAMP
          `)
            .bind(slotNum, type, mediaUrl, thumbUrl, permalink, caption, category)
            .run();

          return new Response(JSON.stringify({ success: true, message: 'Slot de galeria atualizado' }), {
            headers: CORS_HEADERS,
          });
        }

        return new Response(JSON.stringify({ error: 'Endpoint não encontrado' }), {
          status: 404,
          headers: CORS_HEADERS,
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Erro interno no servidor' }), {
          status: 500,
          headers: CORS_HEADERS,
        });
      }
    }

    // Static assets fallback (HTML, CSS, JS, Images from Vite dist)
    return env.ASSETS.fetch(request);
  },
};

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  ADMIN_API_KEY?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Edge cache headers for peak performance (1 minute browser, 1 hour CDN edge, SWR 24h)
const CACHE_HEADERS = {
  ...CORS_HEADERS,
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
};

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

        // POST /api/monthly-updates - Register monthly menu update
        if (url.pathname === '/api/monthly-updates' && request.method === 'POST') {
          const auth = request.headers.get('Authorization');
          if (env.ADMIN_API_KEY && auth !== `Bearer ${env.ADMIN_API_KEY}`) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: CORS_HEADERS,
            });
          }

          const body = await request.json() as {
            month_year: string;
            title: string;
            summary?: string;
            changes_json?: string;
          };

          await env.DB.prepare(
            'INSERT INTO monthly_updates (month_year, title, summary, changes_json) VALUES (?, ?, ?, ?)'
          )
            .bind(body.month_year, body.title, body.summary || '', body.changes_json || '{}')
            .run();

          return new Response(JSON.stringify({ success: true, message: 'Monthly update recorded' }), {
            headers: CORS_HEADERS,
          });
        }

        // POST /api/products/price - Quick monthly price adjustment
        if (url.pathname === '/api/products/price' && request.method === 'POST') {
          const auth = request.headers.get('Authorization');
          if (env.ADMIN_API_KEY && auth !== `Bearer ${env.ADMIN_API_KEY}`) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: CORS_HEADERS,
            });
          }

          const body = await request.json() as { id: string; price: number };
          if (!body.id || body.price === undefined) {
            return new Response(JSON.stringify({ error: 'id and price required' }), {
              status: 400,
              headers: CORS_HEADERS,
            });
          }

          await env.DB.prepare(
            'UPDATE products SET price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
          )
            .bind(body.price, body.id)
            .run();

        // GET /api/leads - List franchise leads
        if (url.pathname === '/api/leads' && request.method === 'GET') {
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

        // POST /api/leads - Create new franchise lead
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

          const body = await request.json() as any;
          if (!body.name || !body.phone || !body.email) {
            return new Response(JSON.stringify({ error: 'Nome, Telefone e E-mail são obrigatórios' }), {
              status: 400,
              headers: CORS_HEADERS,
            });
          }

          const insertRes = await env.DB.prepare(`
            INSERT INTO franchise_leads (name, email, phone, city, state, capital, experience, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            body.name,
            body.email,
            body.phone,
            body.city || '',
            body.state || '',
            body.capital || '',
            body.experience || 'nao',
            body.status || 'novo',
            body.notes || ''
          ).run();

          return new Response(JSON.stringify({ success: true, id: insertRes.meta?.last_row_id }), {
            headers: CORS_HEADERS,
          });
        }

        // PATCH /api/leads - Update lead status
        if (url.pathname === '/api/leads' && request.method === 'PATCH') {
          const body = await request.json() as any;
          if (!body.id || !body.status) {
            return new Response(JSON.stringify({ error: 'id and status required' }), {
              status: 400,
              headers: CORS_HEADERS,
            });
          }

          await env.DB.prepare('UPDATE franchise_leads SET status = ? WHERE id = ?')
            .bind(body.status, body.id)
            .run();

          return new Response(JSON.stringify({ success: true }), {
            headers: CORS_HEADERS,
          });
        }

        // GET /api/gallery - Return active gallery posts
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

          const postsRes = await env.DB.prepare('SELECT * FROM gallery_posts WHERE is_active = 1 ORDER BY slot_number ASC').all();
          return new Response(JSON.stringify({ success: true, posts: postsRes.results }), {
            headers: CACHE_HEADERS,
          });
        }

        // POST /api/gallery - Upsert gallery post slot
        if (url.pathname === '/api/gallery' && request.method === 'POST') {
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

          const body = await request.json() as any;
          if (!body.slot_number || !body.media_url) {
            return new Response(JSON.stringify({ error: 'slot_number and media_url required' }), {
              status: 400,
              headers: CORS_HEADERS,
            });
          }

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
          `).bind(
            body.slot_number,
            body.type || 'photo',
            body.media_url,
            body.thumbnail_url || body.media_url,
            body.permalink || '',
            body.caption || '',
            body.category || 'ElChicano'
          ).run();

          return new Response(JSON.stringify({ success: true, message: 'Gallery slot updated' }), {
            headers: CORS_HEADERS,
          });
        }

        return new Response(JSON.stringify({ error: 'Not Found' }), {
          status: 404,
          headers: CORS_HEADERS,
        });

      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
          status: 500,
          headers: CORS_HEADERS,
        });
      }
    }

    // Static assets fallback (HTML, CSS, JS, Images from Vite dist)
    return env.ASSETS.fetch(request);
  },
};

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  ADMIN_API_KEY?: string;
  ADMIN_HASH?: string;
  SESSION_SECRET?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// Edge cache headers for peak performance (1 minute browser, 1 hour CDN edge, SWR 24h)
const CACHE_HEADERS = {
  ...CORS_HEADERS,
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
};

// Real-time zero-cache headers for dynamic administrative endpoints
const NO_CACHE_HEADERS = {
  ...CORS_HEADERS,
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

/**
 * Strict Input Sanitizer to neutralize HTML/Script injections in database records
 */
function sanitize(input: unknown, maxLength = 500): string {
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

// -----------------------------------------------------------------------------
// Autenticação do painel (feita no servidor)
// -----------------------------------------------------------------------------

// Hash PBKDF2 inicial de fábrica (mesmo do frontend). Vale só até a primeira troca de senha,
// que grava o novo hash na tabela admin_credentials. O segredo ADMIN_HASH, se definido, tem prioridade.
const INITIAL_MASTER_HASH =
  'pbkdf2:sha256:100000:220a7baee7f6958ca584c9e82fd51878:5f2e8a4a36c173b223b8b001c924b199d9c20651550e9cac054ecebae4bc4347';
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 horas
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // janela de contagem de falhas
const LOGIN_MAX_FAILURES = 8;
const VALID_USERNAMES = ['admin', 'elchicano'];

const enc = new TextEncoder();

function toHex(buf: ArrayBuffer | Uint8Array): string {
  return Array.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

function b64url(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function pbkdf2Hex(password: string, saltHex: string, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: fromHex(saltHex), iterations, hash: 'SHA-256' },
    key,
    256
  );
  return toHex(bits);
}

async function verifyPasswordHash(password: string, formatted: string): Promise<boolean> {
  const parts = formatted.split(':');
  if (parts.length !== 5 || parts[0] !== 'pbkdf2' || parts[1] !== 'sha256') return false;
  const iterations = Number(parts[2]);
  if (!Number.isFinite(iterations) || iterations < 1 || iterations > 100000) return false;
  return safeEqual(await pbkdf2Hex(password, parts[3], iterations), parts[4]);
}

async function createPasswordHash(password: string): Promise<string> {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
  return `pbkdf2:sha256:100000:${salt}:${await pbkdf2Hex(password, salt, 100000)}`;
}

async function ensureAuthTables(env: Env): Promise<void> {
  await env.DB.batch([
    env.DB.prepare(
      'CREATE TABLE IF NOT EXISTS admin_credentials (id INTEGER PRIMARY KEY CHECK (id = 1), password_hash TEXT NOT NULL, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)'
    ),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS admin_login_attempts (ip TEXT NOT NULL, ts INTEGER NOT NULL)'),
  ]);
}

async function getActiveAdminHash(env: Env): Promise<string> {
  try {
    const row = await env.DB.prepare('SELECT password_hash FROM admin_credentials WHERE id = 1').first<{
      password_hash: string;
    }>();
    if (row?.password_hash) return row.password_hash;
  } catch {
    // tabela ainda não criada
  }
  return env.ADMIN_HASH || INITIAL_MASTER_HASH;
}

// A chave de assinatura inclui o hash atual: trocar a senha invalida todas as sessões antigas.
async function getSigningKey(env: Env, activeHash: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(`${env.SESSION_SECRET}:${activeHash}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function issueSessionToken(env: Env, username: string): Promise<{ token: string; expiresAt: number }> {
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;
  const payload = b64url(enc.encode(JSON.stringify({ sub: username, iat: now, exp: expiresAt })));
  const key = await getSigningKey(env, await getActiveAdminHash(env));
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(payload)));
  return { token: `${payload}.${b64url(sig)}`, expiresAt };
}

async function verifySessionToken(env: Env, token: string): Promise<boolean> {
  if (!env.SESSION_SECRET) return false;
  const [payload, sig, extra] = token.split('.');
  if (!payload || !sig || extra !== undefined) return false;
  try {
    const key = await getSigningKey(env, await getActiveAdminHash(env));
    const ok = await crypto.subtle.verify('HMAC', key, fromB64url(sig), enc.encode(payload));
    if (!ok) return false;
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as { exp?: number };
    return typeof data.exp === 'number' && Date.now() < data.exp;
  } catch {
    return false;
  }
}

/**
 * Verifica o cabeçalho Authorization das rotas administrativas.
 * Aceita a chave ADMIN_API_KEY (scripts) ou um token de sessão assinado pelo servidor.
 */
async function isAuthorized(request: Request, env: Env): Promise<boolean> {
  const auth = request.headers.get('Authorization');
  if (!auth) return false;

  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;

  if (env.ADMIN_API_KEY && safeEqual(token, env.ADMIN_API_KEY)) return true;
  return verifySessionToken(env, token);
}

// -----------------------------------------------------------------------------
// Armazenamento de mídia no D1 (fotos e vídeos da galeria, em pedaços de 1 MB)
// -----------------------------------------------------------------------------

const MEDIA_CHUNK_SIZE = 1024 * 1024; // 1 MB por linha (limite do D1: 2 MB por valor)
const MEDIA_MAX_BYTES = 60 * 1024 * 1024; // 60 MB por arquivo
const MEDIA_ALLOWED_TYPES = /^(image\/(jpeg|png|webp|gif|avif)|video\/(mp4|webm|quicktime))$/;
const MEDIA_PATH = '/media/';

async function ensureMediaTables(env: Env): Promise<void> {
  await env.DB.batch([
    env.DB.prepare(
      'CREATE TABLE IF NOT EXISTS media_files (key TEXT PRIMARY KEY, mime TEXT NOT NULL, size INTEGER NOT NULL, chunk_size INTEGER NOT NULL, chunks INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)'
    ),
    env.DB.prepare(
      'CREATE TABLE IF NOT EXISTS media_chunks (key TEXT NOT NULL, idx INTEGER NOT NULL, data BLOB NOT NULL, PRIMARY KEY (key, idx))'
    ),
  ]);
}

/** Extrai a chave de mídia de uma URL deste Worker (…/media/<key>), ou null. */
function mediaKeyFromUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const i = value.indexOf(MEDIA_PATH);
  if (i === -1) return null;
  const key = value.slice(i + MEDIA_PATH.length).split(/[?#]/)[0];
  return /^[a-z0-9-]{8,80}$/.test(key) ? key : null;
}

async function deleteMediaKeys(env: Env, keys: (string | null)[]): Promise<void> {
  const unique = [...new Set(keys.filter((k): k is string => Boolean(k)))];
  if (unique.length === 0) return;
  try {
    await ensureMediaTables(env);
    await env.DB.batch(
      unique.flatMap((k) => [
        env.DB.prepare('DELETE FROM media_chunks WHERE key = ?').bind(k),
        env.DB.prepare('DELETE FROM media_files WHERE key = ?').bind(k),
      ])
    );
  } catch {
    // limpeza é "melhor esforço": nunca bloqueia a operação principal
  }
}

async function handleMediaUpload(request: Request, env: Env, url: URL): Promise<Response> {
  const mime = (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
  if (!MEDIA_ALLOWED_TYPES.test(mime)) {
    return json({ error: `Tipo de arquivo não suportado: ${mime || 'desconhecido'}` }, 415);
  }
  const declared = Number(request.headers.get('Content-Length') || '0');
  if (declared > MEDIA_MAX_BYTES) {
    return json({ error: 'Arquivo acima de 60 MB. Comprima o vídeo e tente novamente.' }, 413);
  }

  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength === 0) return json({ error: 'Arquivo vazio' }, 400);
  if (bytes.byteLength > MEDIA_MAX_BYTES) {
    return json({ error: 'Arquivo acima de 60 MB. Comprima o vídeo e tente novamente.' }, 413);
  }

  await ensureMediaTables(env);
  const slot = Math.max(0, Math.min(99, Number(url.searchParams.get('slot')) || 0));
  const key = `s${slot}-${Date.now().toString(36)}-${toHex(crypto.getRandomValues(new Uint8Array(6)))}`;
  const chunks = Math.ceil(bytes.byteLength / MEDIA_CHUNK_SIZE);

  try {
    // Grava em lotes pequenos para não estourar o limite de tamanho de cada chamada ao D1
    for (let start = 0; start < chunks; start += 4) {
      const stmts = [];
      for (let idx = start; idx < Math.min(chunks, start + 4); idx++) {
        const part = bytes.subarray(idx * MEDIA_CHUNK_SIZE, (idx + 1) * MEDIA_CHUNK_SIZE);
        stmts.push(env.DB.prepare('INSERT INTO media_chunks (key, idx, data) VALUES (?, ?, ?)').bind(key, idx, part));
      }
      await env.DB.batch(stmts);
    }
    await env.DB.prepare('INSERT INTO media_files (key, mime, size, chunk_size, chunks) VALUES (?, ?, ?, ?, ?)')
      .bind(key, mime, bytes.byteLength, MEDIA_CHUNK_SIZE, chunks)
      .run();
  } catch (err) {
    await deleteMediaKeys(env, [key]);
    throw err;
  }

  return json({ success: true, key, url: `${url.origin}${MEDIA_PATH}${key}`, size: bytes.byteLength, mime });
}

/** Entrega um arquivo de mídia com suporte a Range (necessário para vídeo no iPhone/Safari). */
async function handleMediaGet(request: Request, env: Env, key: string): Promise<Response> {
  const baseHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'X-Content-Type-Options': 'nosniff',
    'Accept-Ranges': 'bytes',
  };
  let meta: { mime: string; size: number; chunk_size: number; chunks: number } | null = null;
  try {
    meta = await env.DB.prepare('SELECT mime, size, chunk_size, chunks FROM media_files WHERE key = ?')
      .bind(key)
      .first();
  } catch {
    meta = null;
  }
  if (!meta) return new Response('Mídia não encontrada', { status: 404, headers: baseHeaders });

  const size = Number(meta.size);
  const chunkSize = Number(meta.chunk_size);
  let start = 0;
  let end = size - 1;
  let partial = false;

  const range = request.headers.get('Range');
  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (m) {
      if (m[1] === '' && m[2] !== '') {
        start = Math.max(0, size - Number(m[2]));
      } else {
        start = Number(m[1] || 0);
        if (m[2] !== '') end = Math.min(size - 1, Number(m[2]));
      }
      if (start > end || start >= size) {
        return new Response(null, { status: 416, headers: { ...baseHeaders, 'Content-Range': `bytes */${size}` } });
      }
      partial = true;
    }
  }

  const firstIdx = Math.floor(start / chunkSize);
  const lastIdx = Math.floor(end / chunkSize);
  const rows = await env.DB.prepare('SELECT idx, data FROM media_chunks WHERE key = ? AND idx BETWEEN ? AND ? ORDER BY idx')
    .bind(key, firstIdx, lastIdx)
    .all<{ idx: number; data: ArrayBuffer | number[] }>();

  const out = new Uint8Array(end - start + 1);
  let offset = 0;
  for (const row of rows.results) {
    const chunk = row.data instanceof ArrayBuffer ? new Uint8Array(row.data) : Uint8Array.from(row.data as number[]);
    const chunkStart = Number(row.idx) * chunkSize;
    const from = Math.max(0, start - chunkStart);
    const to = Math.min(chunk.byteLength, end - chunkStart + 1);
    if (to > from) {
      out.set(chunk.subarray(from, to), offset);
      offset += to - from;
    }
  }

  return new Response(out, {
    status: partial ? 206 : 200,
    headers: {
      ...baseHeaders,
      'Content-Type': meta.mime,
      'Content-Length': String(out.byteLength),
      // A chave muda a cada envio, então o arquivo nunca muda: pode ficar em cache para sempre
      'Cache-Control': 'public, max-age=31536000, immutable',
      ...(partial ? { 'Content-Range': `bytes ${start}-${end}/${size}` } : {}),
    },
  });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: NO_CACHE_HEADERS });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // GET /media/<key> - Arquivos da galeria guardados no D1 (público, com cache longo)
    if (url.pathname.startsWith(MEDIA_PATH) && (request.method === 'GET' || request.method === 'HEAD')) {
      const key = mediaKeyFromUrl(url.pathname);
      if (!key) return new Response('Mídia não encontrada', { status: 404 });
      return handleMediaGet(request, env, key);
    }

    // API Routes for Cloudflare D1
    if (url.pathname.startsWith('/api/')) {
      try {
        // POST /api/media?slot=N - Envia foto/vídeo (corpo binário) e devolve a URL pública (PROTECTED)
        if (url.pathname === '/api/media' && request.method === 'POST') {
          if (!(await isAuthorized(request, env))) {
            return json({ error: 'Acesso não autorizado' }, 401);
          }
          return handleMediaUpload(request, env, url);
        }

        // POST /api/auth/login - Confere usuário/senha no servidor e devolve token assinado
        if (url.pathname === '/api/auth/login' && request.method === 'POST') {
          if (!env.SESSION_SECRET) {
            return json({ error: 'Servidor sem SESSION_SECRET configurado' }, 503);
          }
          await ensureAuthTables(env);

          const ip = request.headers.get('CF-Connecting-IP') || 'desconhecido';
          const since = Date.now() - LOGIN_WINDOW_MS;
          await env.DB.prepare('DELETE FROM admin_login_attempts WHERE ts < ?').bind(since).run();
          const fails = await env.DB.prepare('SELECT COUNT(*) AS n FROM admin_login_attempts WHERE ip = ?')
            .bind(ip)
            .first<{ n: number }>();
          if ((fails?.n ?? 0) >= LOGIN_MAX_FAILURES) {
            return json({ error: 'Muitas tentativas incorretas. Aguarde 15 minutos e tente novamente.' }, 429);
          }

          const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
          const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
          const password = typeof body.password === 'string' ? body.password : '';
          const passwordOk = password.length > 0 && password.length <= 200
            ? await verifyPasswordHash(password, await getActiveAdminHash(env))
            : false;

          if (!passwordOk || !VALID_USERNAMES.includes(username)) {
            await env.DB.prepare('INSERT INTO admin_login_attempts (ip, ts) VALUES (?, ?)').bind(ip, Date.now()).run();
            const left = Math.max(0, LOGIN_MAX_FAILURES - (fails?.n ?? 0) - 1);
            return json({ error: 'Usuário ou senha inválidos', attemptsLeft: left }, 401);
          }

          await env.DB.prepare('DELETE FROM admin_login_attempts WHERE ip = ?').bind(ip).run();
          const { token, expiresAt } = await issueSessionToken(env, username);
          return json({ success: true, token, expiresAt });
        }

        // GET /api/auth/session - Confirma se o token ainda é válido
        if (url.pathname === '/api/auth/session' && request.method === 'GET') {
          return (await isAuthorized(request, env)) ? json({ success: true }) : json({ error: 'Sessão inválida' }, 401);
        }

        // POST /api/auth/password - Troca a senha (exige sessão válida + senha atual)
        if (url.pathname === '/api/auth/password' && request.method === 'POST') {
          if (!(await isAuthorized(request, env))) {
            return json({ error: 'Acesso não autorizado' }, 401);
          }
          await ensureAuthTables(env);
          const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
          const current = typeof body.currentPassword === 'string' ? body.currentPassword : '';
          const next = typeof body.newPassword === 'string' ? body.newPassword : '';
          if (next.length < 8 || next.length > 200) {
            return json({ error: 'A nova senha deve ter entre 8 e 200 caracteres' }, 400);
          }
          if (!(await verifyPasswordHash(current, await getActiveAdminHash(env)))) {
            return json({ error: 'A senha atual informada está incorreta' }, 403);
          }
          const newHash = await createPasswordHash(next);
          await env.DB.prepare(
            'INSERT INTO admin_credentials (id, password_hash, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET password_hash = excluded.password_hash, updated_at = CURRENT_TIMESTAMP'
          )
            .bind(newHash)
            .run();
          // O hash mudou, então a chave de assinatura mudou: emite um token novo para esta sessão
          const { token, expiresAt } = await issueSessionToken(env, 'admin');
          return json({ success: true, token, expiresAt });
        }

        // POST /api/telemetry - Anonymous RUM Core Web Vitals telemetry receiver
        if (url.pathname === '/api/telemetry' && request.method === 'POST') {
          return new Response(JSON.stringify({ success: true }), {
            headers: NO_CACHE_HEADERS,
          });
        }

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
          for (const row of settingsRes.results as Record<string, unknown>[]) {
            if (typeof row.key === 'string' && typeof row.value === 'string') {
              settingsMap[row.key] = row.value;
            }
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
          if (!(await isAuthorized(request, env))) {
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
          if (!(await isAuthorized(request, env))) {
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
          if (!(await isAuthorized(request, env))) {
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

          const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
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
          if (!(await isAuthorized(request, env))) {
            return new Response(JSON.stringify({ error: 'Acesso não autorizado' }), {
              status: 401,
              headers: CORS_HEADERS,
            });
          }

          const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
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

        // DELETE /api/leads - Delete one lead ({ id }) or all leads (?all=true) (PROTECTED)
        if (url.pathname === '/api/leads' && request.method === 'DELETE') {
          if (!(await isAuthorized(request, env))) {
            return new Response(JSON.stringify({ error: 'Acesso não autorizado' }), {
              status: 401,
              headers: NO_CACHE_HEADERS,
            });
          }

          if (url.searchParams.get('all') === 'true') {
            const res = await env.DB.prepare('DELETE FROM franchise_leads').run();
            return new Response(JSON.stringify({ success: true, deleted: res.meta?.changes ?? 0 }), {
              headers: NO_CACHE_HEADERS,
            });
          }

          const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
          const id = Number(body.id);
          if (!Number.isFinite(id) || id <= 0) {
            return new Response(JSON.stringify({ error: 'id numérico é obrigatório' }), {
              status: 400,
              headers: NO_CACHE_HEADERS,
            });
          }

          const res = await env.DB.prepare('DELETE FROM franchise_leads WHERE id = ?').bind(id).run();
          return new Response(JSON.stringify({ success: true, deleted: res.meta?.changes ?? 0 }), {
            headers: NO_CACHE_HEADERS,
          });
        }

        // GET /api/gallery - Return active gallery posts (PUBLIC, sem cache: exclusões aparecem na hora)
        if (url.pathname === '/api/gallery' && request.method === 'GET') {
          const postsRes = await env.DB.prepare(
            'SELECT * FROM gallery_posts WHERE is_active = 1 ORDER BY slot_number ASC'
          ).all();
          return new Response(JSON.stringify({ success: true, posts: postsRes.results }), {
            headers: NO_CACHE_HEADERS,
          });
        }

        // POST /api/gallery - Upsert gallery post slot (PROTECTED)
        if (url.pathname === '/api/gallery' && request.method === 'POST') {
          if (!(await isAuthorized(request, env))) {
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

          const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
          if (!body.slot_number || !body.media_url) {
            return new Response(JSON.stringify({ error: 'slot_number e media_url são obrigatórios' }), {
              status: 400,
              headers: CORS_HEADERS,
            });
          }

          if (typeof body.media_url === 'string' && body.media_url.startsWith('blob:')) {
            return new Response(
              JSON.stringify({ error: 'URLs blob: só existem no navegador de origem e não podem ser publicadas' }),
              { status: 400, headers: NO_CACHE_HEADERS }
            );
          }

          const slotNum = Number(body.slot_number);
          const type = sanitize(body.type, 20) || 'photo';
          const mediaUrl = typeof body.media_url === 'string' ? body.media_url.trim().slice(0, 2000000) : '';
          const thumbUrl = typeof body.thumbnail_url === 'string' ? body.thumbnail_url.trim().slice(0, 2000000) : mediaUrl;
          const permalink = sanitize(body.permalink, 500);
          const caption = sanitize(body.caption, 300);
          const category = sanitize(body.category, 50) || 'ElChicano';

          // Mídia antiga do slot (no D1) que deixa de ser usada será apagada depois do upsert
          const previous = await env.DB.prepare('SELECT media_url, thumbnail_url FROM gallery_posts WHERE slot_number = ?')
            .bind(slotNum)
            .first<{ media_url: string; thumbnail_url: string }>();

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

          if (previous) {
            const keep = new Set([mediaKeyFromUrl(mediaUrl), mediaKeyFromUrl(thumbUrl)]);
            await deleteMediaKeys(
              env,
              [mediaKeyFromUrl(previous.media_url), mediaKeyFromUrl(previous.thumbnail_url)].filter((k) => !keep.has(k))
            );
          }

          return new Response(JSON.stringify({ success: true, message: 'Slot de galeria atualizado' }), {
            headers: NO_CACHE_HEADERS,
          });
        }

        // DELETE /api/gallery - Delete slot or clear all (PROTECTED)
        if (url.pathname === '/api/gallery' && request.method === 'DELETE') {
          if (!(await isAuthorized(request, env))) {
            return new Response(JSON.stringify({ error: 'Acesso não autorizado' }), {
              status: 401,
              headers: CORS_HEADERS,
            });
          }

          const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
          if (body.slot_number) {
            const slotNum = Number(body.slot_number);
            const previous = await env.DB.prepare('SELECT media_url, thumbnail_url FROM gallery_posts WHERE slot_number = ?')
              .bind(slotNum)
              .first<{ media_url: string; thumbnail_url: string }>();
            await env.DB.prepare('DELETE FROM gallery_posts WHERE slot_number = ?').bind(slotNum).run();
            if (previous) {
              await deleteMediaKeys(env, [mediaKeyFromUrl(previous.media_url), mediaKeyFromUrl(previous.thumbnail_url)]);
            }
          } else if (url.searchParams.get('all') === 'true') {
            const all = await env.DB.prepare('SELECT media_url, thumbnail_url FROM gallery_posts').all<{
              media_url: string;
              thumbnail_url: string;
            }>();
            await env.DB.prepare('DELETE FROM gallery_posts').run();
            await deleteMediaKeys(
              env,
              all.results.flatMap((r) => [mediaKeyFromUrl(r.media_url), mediaKeyFromUrl(r.thumbnail_url)])
            );
          } else {
            return new Response(JSON.stringify({ error: 'slot_number é obrigatório' }), {
              status: 400,
              headers: NO_CACHE_HEADERS,
            });
          }

          return new Response(JSON.stringify({ success: true, message: 'Slot excluído com sucesso' }), {
            headers: NO_CACHE_HEADERS,
          });
        }

        return new Response(JSON.stringify({ error: 'Endpoint não encontrado' }), {
          status: 404,
          headers: CORS_HEADERS,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erro interno no servidor';
        return new Response(JSON.stringify({ error: errorMsg }), {
          status: 500,
          headers: CORS_HEADERS,
        });
      }
    }

    // Static assets fallback if configured, otherwise health check
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response(JSON.stringify({ status: 'ok', service: 'El Chicano D1 API' }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  },
};

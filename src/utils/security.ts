/**
 * Utilitários de segurança do El Chicano (frontend)
 *
 * A senha do painel NÃO é mais verificada no navegador: o login, a emissão do token
 * de sessão (HMAC assinado com segredo do servidor) e a troca de senha acontecem no
 * Cloudflare Worker (ver `src/services/authApi.ts` e `worker/index.ts`).
 * Aqui ficam apenas o armazenamento do token na sessão do navegador e a sanitização de entradas.
 */

const STORAGE_KEY_SESSION = 'elchicano_admin_session_token';
const LEGACY_KEYS_SESSION = ['elchicano_admin_auth'];
const LEGACY_KEYS_LOCAL = ['elchicano_admin_hash_store'];

/**
 * Lê o `exp` do token emitido pelo servidor (sem validar a assinatura — quem valida é o Worker).
 */
function readTokenExpiry(token: string): number | null {
  try {
    const [payload] = token.split('.');
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const data = JSON.parse(json) as { exp?: number };
    return typeof data.exp === 'number' ? data.exp : null;
  } catch {
    return null;
  }
}

/**
 * Guarda o token de sessão emitido pelo servidor.
 */
export function storeSessionToken(token: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY_SESSION, token);
}

/**
 * Encerra a sessão do painel e limpa resquícios do antigo login local.
 */
export function destroySession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY_SESSION);
  LEGACY_KEYS_SESSION.forEach((k) => sessionStorage.removeItem(k));
  try {
    LEGACY_KEYS_LOCAL.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

/**
 * Retorna o token de sessão ativo, se existir, tiver o formato do servidor e não tiver expirado.
 */
export function getActiveSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = sessionStorage.getItem(STORAGE_KEY_SESSION);
  if (!token) return null;
  const exp = readTokenExpiry(token);
  if (!exp || Date.now() >= exp) {
    sessionStorage.removeItem(STORAGE_KEY_SESSION);
    return null;
  }
  return token;
}

/**
 * Sanitizes input strings against XSS injection by escaping HTML entities.
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strict email format validation.
 */
export function validateEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(email.trim());
}

/**
 * Strict Brazilian phone format validation.
 */
export function validatePhone(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 11;
}

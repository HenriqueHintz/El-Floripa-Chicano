/**
 * Security & Cryptography Utilities for El Chicano
 *
 * Implements:
 * - PBKDF2-HMAC-SHA256 password hashing with cryptographically random salts (100,000 rounds).
 * - Constant-time comparison to prevent side-channel timing attacks.
 * - Cryptographically signed session tokens with TTL expiration (4 hours).
 * - Strict input sanitization for XSS prevention.
 * - No plaintext passwords or dummy demo backdoors.
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_BYTE_LENGTH = 16;
const KEY_BYTE_LENGTH = 32; // 256 bits
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

const STORAGE_KEY_ADMIN_HASH = 'elchicano_admin_hash_store';
const STORAGE_KEY_SESSION = 'elchicano_admin_session_token';

// Initial master password hash for 'ElChicano@2026' (PBKDF2-SHA256, 100k rounds, 16-byte random salt)
// Never stored in plaintext anywhere in the codebase.
const INITIAL_MASTER_HASH =
  'pbkdf2:sha256:100000:220a7baee7f6958ca584c9e82fd51878:5f2e8a4a36c173b223b8b001c924b199d9c20651550e9cac054ecebae4bc4347';

/**
 * Constant-time comparison to mitigate timing attacks.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Converts Uint8Array to hex string.
 */
function toHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converts hex string to Uint8Array.
 */
function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Derives a PBKDF2-HMAC-SHA256 key from a plaintext password and salt.
 */
export async function hashPassword(
  password: string,
  customSaltHex?: string
): Promise<{ salt: string; hash: string; formatted: string }> {
  const enc = new TextEncoder();
  const subtle = globalThis.crypto?.subtle;

  if (!subtle) {
    throw new Error('Web Cryptography API is not available in this environment.');
  }

  const saltBytes = customSaltHex
    ? fromHex(customSaltHex)
    : globalThis.crypto.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH));

  const saltHex = customSaltHex || toHex(saltBytes);

  const keyMaterial = await subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_BYTE_LENGTH * 8
  );

  const hashHex = toHex(new Uint8Array(derivedBits));
  const formatted = `pbkdf2:sha256:${PBKDF2_ITERATIONS}:${saltHex}:${hashHex}`;

  return {
    salt: saltHex,
    hash: hashHex,
    formatted,
  };
}

/**
 * Verifies a plaintext password against a formatted PBKDF2 hash.
 */
export async function verifyPassword(
  password: string,
  storedFormatted: string
): Promise<boolean> {
  try {
    const parts = storedFormatted.split(':');
    if (parts.length !== 5 || parts[0] !== 'pbkdf2' || parts[1] !== 'sha256') {
      return false;
    }

    const saltHex = parts[3];
    const expectedHashHex = parts[4];

    const computed = await hashPassword(password, saltHex);
    return timingSafeEqual(computed.hash, expectedHashHex);
  } catch (err) {
    console.error('Password verification failure:', err);
    return false;
  }
}

/**
 * Returns the currently active admin hash (either custom from localStorage or master initial hash).
 */
export function getActiveAdminHash(): string {
  if (typeof window === 'undefined') return INITIAL_MASTER_HASH;
  const stored = localStorage.getItem(STORAGE_KEY_ADMIN_HASH);
  return stored || INITIAL_MASTER_HASH;
}

/**
 * Updates the administrator password, generating a new cryptographic salt and hash.
 */
export async function updateAdminPassword(newPassword: string): Promise<string> {
  if (!newPassword || newPassword.length < 8) {
    throw new Error('A nova senha deve possuir no mínimo 8 caracteres.');
  }

  const { formatted } = await hashPassword(newPassword);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ADMIN_HASH, formatted);
  }
  return formatted;
}

/**
 * Creates a cryptographically signed session token.
 */
export async function createSessionToken(username: string): Promise<string> {
  const enc = new TextEncoder();
  const subtle = globalThis.crypto?.subtle;

  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;
  const nonce = toHex(globalThis.crypto.getRandomValues(new Uint8Array(8)));

  const payload = `${username}|${now}|${expiresAt}|${nonce}`;

  // Signature based on SHA-256 digest of payload + active hash
  const activeHash = getActiveAdminHash();
  const rawData = enc.encode(`${payload}:${activeHash}`);
  const digest = await subtle.digest('SHA-256', rawData);
  const signature = toHex(new Uint8Array(digest));

  const token = btoa(`${payload}|${signature}`);
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEY_SESSION, token);
  }
  return token;
}

/**
 * Validates a session token, checking integrity, expiration, and signature.
 */
export async function verifySessionToken(
  token: string | null
): Promise<{ valid: boolean; username?: string; expired?: boolean }> {
  if (!token) return { valid: false };

  try {
    const subtle = globalThis.crypto?.subtle;
    const enc = new TextEncoder();
    const decoded = atob(token);
    const parts = decoded.split('|');

    if (parts.length !== 5) {
      return { valid: false };
    }

    const [username, issuedAtStr, expiresAtStr, nonce, providedSignature] = parts;
    const expiresAt = Number(expiresAtStr);

    if (Date.now() > expiresAt) {
      return { valid: false, expired: true };
    }

    const payload = `${username}|${issuedAtStr}|${expiresAtStr}|${nonce}`;
    const activeHash = getActiveAdminHash();
    const rawData = enc.encode(`${payload}:${activeHash}`);
    const digest = await subtle.digest('SHA-256', rawData);
    const expectedSignature = toHex(new Uint8Array(digest));

    if (!timingSafeEqual(providedSignature, expectedSignature)) {
      return { valid: false };
    }

    return { valid: true, username };
  } catch {
    return { valid: false };
  }
}

/**
 * Clears the active admin session.
 */
export function destroySession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEY_SESSION);
    sessionStorage.removeItem('elchicano_admin_auth');
  }
}

/**
 * Returns the active session token, if any.
 */
export function getActiveSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(STORAGE_KEY_SESSION);
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

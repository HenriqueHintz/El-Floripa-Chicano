import { getApiUrl } from './d1Api';
import { getActiveSessionToken, storeSessionToken, destroySession } from '../utils/security';

export interface AuthResult {
  ok: boolean;
  error?: string;
  attemptsLeft?: number;
}

async function readError(res: Response, fallback: string): Promise<AuthResult> {
  try {
    const data = (await res.json()) as { error?: string; attemptsLeft?: number };
    return { ok: false, error: data.error || fallback, attemptsLeft: data.attemptsLeft };
  } catch {
    return { ok: false, error: fallback };
  }
}

/**
 * Faz login no servidor. A senha é conferida no Worker, que devolve um token assinado.
 */
export async function loginAdmin(username: string, password: string): Promise<AuthResult> {
  try {
    const res = await fetch(getApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    });
    if (!res.ok) return readError(res, 'Não foi possível entrar. Tente novamente.');
    const data = (await res.json()) as { token?: string };
    if (!data.token) return { ok: false, error: 'Resposta inválida do servidor.' };
    storeSessionToken(data.token);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Sem conexão com o servidor. Verifique sua internet.' };
  }
}

/**
 * Confirma com o servidor se a sessão atual ainda vale. Em caso de erro de rede,
 * mantém a sessão (o servidor recusa qualquer ação protegida se o token for inválido).
 */
export async function checkAdminSession(): Promise<boolean> {
  const token = getActiveSessionToken();
  if (!token) return false;
  try {
    const res = await fetch(getApiUrl('/api/auth/session'), {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (res.status === 401) {
      destroySession();
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

/**
 * Troca a senha do painel no servidor. Todas as outras sessões abertas são encerradas.
 */
export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
  const token = getActiveSessionToken();
  if (!token) return { ok: false, error: 'Sessão expirada. Entre novamente.' };
  try {
    const res = await fetch(getApiUrl('/api/auth/password'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword }),
      cache: 'no-store',
    });
    if (!res.ok) return readError(res, 'Não foi possível alterar a senha.');
    const data = (await res.json()) as { token?: string };
    if (data.token) storeSessionToken(data.token);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Sem conexão com o servidor. Verifique sua internet.' };
  }
}

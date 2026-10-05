// Camada de integracao de autenticacao com JWT, gerenciamento de cookies e dados mockados

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, AuthSession, CookieSession } from '@/@types/auth';

const STORAGE_KEYS = {
  AUTH_SESSION: '@app_pam:auth_session_v1',
  SESSION_COOKIE: '@app_pam:session_cookie_v1',
  USERS_DB: '@app_pam:users_db_v1',
};

// Base de usuarios iniciais (mockados)
const INITIAL_MOCK_USERS: Array<User & { passwordHash: string }> = [
  {
    id: 'usr_aluno_01',
    name: 'Aluno FATEC',
    email: 'aluno@fatec.br',
    passwordHash: 'fatec123',
    roles: ['USER'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_admin_01',
    name: 'Professor / Coordenador',
    email: 'admin@fatec.br',
    passwordHash: 'admin123',
    roles: ['ADMIN', 'USER'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: new Date().toISOString(),
  },
];

// Helper para codificacao Base64 URL-safe (sem dependencia externa pesada)
function base64UrlEncode(str: string): string {
  try {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let output = '';
    const bytes = new TextEncoder().encode(str);
    for (let i = 0; i < bytes.length; i += 3) {
      const b1 = bytes[i];
      const b2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
      const b3 = i + 2 < bytes.length ? bytes[i + 2] : 0;
      output += chars[b1 >> 2];
      output += chars[((b1 & 3) << 4) | (b2 >> 4)];
      output += i + 1 < bytes.length ? chars[((b2 & 15) << 2) | (b3 >> 6)] : '';
      output += i + 2 < bytes.length ? chars[b3 & 63] : '';
    }
    return output;
  } catch {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}

// Helper para decodificacao Base64 URL-safe
function base64UrlDecode(str: string): string {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const decoded = atob(base64);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return '{}';
  }
}

// Gerador de Token JWT assinado (Header + Payload + Signature)
export function generateJwtToken(user: User): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    iat: nowInSeconds,
    exp: nowInSeconds + 24 * 60 * 60, // 24 horas de validade
    iss: 'fatec-pam-fitness-auth',
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  // Assinatura deterministica simulada
  const signature = base64UrlEncode(`sig_${encodedHeader}.${encodedPayload}_pam_key_secret_2026`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Decodificador e validador do Token JWT
export function verifyJwtToken(token: string): { valid: boolean; payload?: any; error?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Token JWT em formato inválido' };
    }

    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < nowInSeconds) {
      return { valid: false, error: 'Token JWT expirado' };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'Falha ao processar assinatura do Token JWT' };
  }
}

// Simulador de gravacao de Cookie HTTP de sessao
export async function setSessionCookie(token: string): Promise<CookieSession> {
  const cookie: CookieSession = {
    name: 'session_token',
    value: token,
    path: '/',
    httpOnly: true,
    secure: true,
    maxAge: 86400,
  };
  await AsyncStorage.setItem(STORAGE_KEYS.SESSION_COOKIE, JSON.stringify(cookie));
  return cookie;
}

// Obter cookie de sessao atual
export async function getSessionCookie(): Promise<CookieSession | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_COOKIE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Limpar cookie de sessao
export async function clearSessionCookie(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.SESSION_COOKIE);
}

// Inicializar banco de usuarios mockados
async function getStoredUsers(): Promise<Array<User & { passwordHash: string }>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
    if (!raw) {
      await AsyncStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(INITIAL_MOCK_USERS));
      return INITIAL_MOCK_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_USERS;
  }
}

// Autenticar com e-mail e senha (Mock Login)
export async function login(email: string, password: string): Promise<AuthSession> {
  // Simular latencia de rede realista (400ms)
  await new Promise((resolve) => setTimeout(resolve, 400));

  const trimmedEmail = email.trim().toLowerCase();
  const users = await getStoredUsers();

  const userMatch = users.find(
    (u) => u.email.toLowerCase() === trimmedEmail && u.passwordHash === password
  );

  if (!userMatch) {
    throw new Error('E-mail ou senha inválidos. Tente "aluno@fatec.br" / "fatec123" ou "admin@fatec.br" / "admin123".');
  }

  const user: User = {
    id: userMatch.id,
    name: userMatch.name,
    email: userMatch.email,
    roles: userMatch.roles,
    avatar: userMatch.avatar,
    createdAt: userMatch.createdAt,
  };

  const token = generateJwtToken(user);
  await setSessionCookie(token);

  const session: AuthSession = {
    user,
    token,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  await AsyncStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
  return session;
}

// Cadastrar novo usuario (Mock Register)
export async function register(
  name: string,
  email: string,
  password: string,
  role: UserRole = 'USER'
): Promise<AuthSession> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const trimmedEmail = email.trim().toLowerCase();
  const users = await getStoredUsers();

  if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
    throw new Error('Este endereço de e-mail já está cadastrado.');
  }

  const newUser: User & { passwordHash: string } = {
    id: `usr_${Date.now()}`,
    name: name.trim(),
    email: trimmedEmail,
    passwordHash: password,
    roles: [role],
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await AsyncStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));

  const user: User = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    roles: newUser.roles,
    createdAt: newUser.createdAt,
  };

  const token = generateJwtToken(user);
  await setSessionCookie(token);

  const session: AuthSession = {
    user,
    token,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  await AsyncStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
  return session;
}

// Encerrar sessao (Logout)
export async function logout(): Promise<void> {
  await clearSessionCookie();
  await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
}

// Obter sessao ativa persistida
export async function getActiveSession(): Promise<AuthSession | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return null;

    const session: AuthSession = JSON.parse(raw);
    const verification = verifyJwtToken(session.token);

    if (!verification.valid) {
      await logout();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

// Endpoint protegido para obter mensagem autenticada (utilizado no dashboard da imagem)
export async function getMessage(): Promise<{ message: string; timestamp: string }> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const cookie = await getSessionCookie();
  if (!cookie || !cookie.value) {
    throw new Error('Sessão não autorizada: Cookie de sessão ausente.');
  }

  const verification = verifyJwtToken(cookie.value);
  if (!verification.valid) {
    throw new Error(`Acesso negado: ${verification.error}`);
  }

  const user = verification.payload;
  const isAdmin = user.roles && user.roles.includes('ADMIN');

  return {
    message: isAdmin
      ? `Olá Administrador ${user.name}! Painel de controle e auditoria liberado.`
      : `Bem-vindo de volta, ${user.name}! Bons treinos hoje no PAM Fitness.`,
    timestamp: new Date().toLocaleTimeString('pt-BR'),
  };
}

// Obter lista de usuarios cadastrados (acesso restrito para ADMIN)
export async function getAdminUsersList(): Promise<User[]> {
  const cookie = await getSessionCookie();
  if (!cookie || !cookie.value) throw new Error('Não autenticado');

  const verification = verifyJwtToken(cookie.value);
  if (!verification.valid || !verification.payload.roles.includes('ADMIN')) {
    throw new Error('Acesso restrito: Requer privilégios de Administrador.');
  }

  const users = await getStoredUsers();
  return users.map(({ id, name, email, roles, createdAt, avatar }) => ({
    id,
    name,
    email,
    roles,
    createdAt,
    avatar,
  }));
}

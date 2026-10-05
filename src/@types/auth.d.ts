// Definicoes de tipos globais de autenticacao e permissoes (RBAC)

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  avatar?: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

export interface CookieSession {
  name: string;
  value: string;
  path: string;
  httpOnly: boolean;
  secure?: boolean;
  maxAge: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

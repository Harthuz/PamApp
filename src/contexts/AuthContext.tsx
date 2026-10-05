// Contexto de autenticacao, gerenciamento de sessao e controle de acesso baseado em perfis (RBAC)

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '@/@types/auth';
import {
  getActiveSession,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from '@/integration/authIntegration';

export interface AuthState {
  user: User;
  token: string;
  roles: UserRole[];
}

interface AuthContextData {
  auth: AuthState | null;
  setAuth: React.Dispatch<React.SetStateAction<AuthState | null>>;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restaurar sessao e cookies ao carregar o aplicativo
  useEffect(() => {
    async function loadPersistedSession() {
      try {
        const session = await getActiveSession();
        if (session) {
          setAuth({
            user: session.user,
            token: session.token,
            roles: session.user.roles,
          });
        }
      } catch (err) {
        console.error('Erro ao restaurar sessão persistida:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPersistedSession();
  }, []);

  async function signIn(email: string, password: string) {
    setIsLoading(true);
    try {
      const session = await apiLogin(email, password);
      setAuth({
        user: session.user,
        token: session.token,
        roles: session.user.roles,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function signUp(
    name: string,
    email: string,
    password: string,
    role: UserRole = 'USER'
  ) {
    setIsLoading(true);
    try {
      const session = await apiRegister(name, email, password, role);
      setAuth({
        user: session.user,
        token: session.token,
        roles: session.user.roles,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    setIsLoading(true);
    try {
      await apiLogout();
      setAuth(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        isAuthenticated: !!auth,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}

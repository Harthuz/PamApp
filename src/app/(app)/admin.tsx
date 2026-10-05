// Painel de Administracao com controle de acesso baseado em funcao (RBAC: ADMIN)

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';
import { getAdminUsersList, getSessionCookie } from '@/integration/authIntegration';
import { User, CookieSession } from '@/@types/auth';

export default function AdminScreen() {
  const router = useRouter();
  const { auth } = useAuth();

  const isAdmin = !!auth?.roles.some((role) => role === 'ADMIN');

  const [users, setUsers] = useState<User[]>([]);
  const [cookieInfo, setCookieInfo] = useState<CookieSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      setError('Acesso negado: Este recurso requer perfil de ADMINISTRADOR.');
      setLoading(false);
      return;
    }

    async function loadAdminData() {
      try {
        const [usersList, cookie] = await Promise.all([
          getAdminUsersList(),
          getSessionCookie(),
        ]);
        setUsers(usersList);
        setCookieInfo(cookie);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar dados');
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, [isAdmin]);

  // Se nao for admin, renderiza tela de bloqueio
  if (!isAdmin) {
    return (
      <View style={styles.accessDeniedContainer}>
        <StatusBar style="light" />
        <View style={styles.accessDeniedCard}>
          <View style={styles.accessDeniedIcon}>
            <Ionicons name="lock-closed" size={48} color={Colors.danger} />
          </View>
          <Text style={styles.accessDeniedTitle}>Acesso Restrito</Text>
          <Text style={styles.accessDeniedText}>
            Seu perfil atual ({auth?.roles.join(', ') || 'Nenhum'}) não possui a
            permissão de ADMIN necessária para visualizar este painel.
          </Text>
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace('/(app)/dashboard')}>
            <Ionicons name="arrow-back" size={18} color="#000" />
            <Text style={styles.backButtonText}>Voltar ao Dashboard</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Cabecalho Admin */}
      <View style={styles.header}>
        <Pressable
          style={styles.headerBackButton}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </Pressable>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerBadge}>PAINEL RBAC</Text>
          <Text style={styles.headerTitle}>Administração do Sistema</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.admin} />
          <Text style={styles.loadingText}>Auditando permissões e sessões...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {/* Card de Status da Sessao / Cookies */}
              <View style={styles.adminCard}>
                <View style={styles.adminCardHeader}>
                  <Ionicons name="server-outline" size={20} color={Colors.admin} />
                  <Text style={styles.adminCardTitle}>
                    Sessão Ativa & Cookies HTTP
                  </Text>
                </View>

                <View style={styles.cookieDetailRow}>
                  <Text style={styles.cookieLabel}>Nome do Cookie:</Text>
                  <Text style={styles.cookieValue}>
                    {cookieInfo?.name || 'session_token'}
                  </Text>
                </View>

                <View style={styles.cookieDetailRow}>
                  <Text style={styles.cookieLabel}>Diretiva HttpOnly:</Text>
                  <Text style={[styles.cookieValue, { color: Colors.success }]}>
                    true (Protegido contra XSS)
                  </Text>
                </View>

                <View style={styles.cookieDetailRow}>
                  <Text style={styles.cookieLabel}>Caminho (Path):</Text>
                  <Text style={styles.cookieValue}>
                    {cookieInfo?.path || '/'}
                  </Text>
                </View>

                <View style={styles.cookieDetailRow}>
                  <Text style={styles.cookieLabel}>Assinatura JWT:</Text>
                  <Text style={[styles.cookieValue, { color: Colors.secondary }]}>
                    HS256 (HMAC-SHA256)
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>
                Usuários e Perfis Cadastrados ({users.length})
              </Text>
            </>
          }
          renderItem={({ item }) => (
            <View style={styles.userRowCard}>
              <View style={styles.userAvatar}>
                <Ionicons
                  name={item.roles.includes('ADMIN') ? 'shield-checkmark' : 'person'}
                  size={20}
                  color={item.roles.includes('ADMIN') ? Colors.admin : Colors.primary}
                />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userNameText}>{item.name}</Text>
                <Text style={styles.userEmailText}>{item.email}</Text>
              </View>
              <View style={styles.userRolesBox}>
                {item.roles.map((r) => (
                  <View
                    key={r}
                    style={[
                      styles.roleTag,
                      r === 'ADMIN' && styles.roleTagAdmin,
                    ]}>
                    <Text
                      style={[
                        styles.roleTagText,
                        r === 'ADMIN' && { color: Colors.admin },
                      ]}>
                      {r}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: '#0D0814',
    gap: 14,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    flex: 1,
  },
  headerBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.admin,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  listContent: {
    padding: 20,
  },
  adminCard: {
    backgroundColor: '#1E122E',
    borderWidth: 1,
    borderColor: '#6B21A8',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  adminCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4C1D95',
    paddingBottom: 8,
  },
  adminCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  cookieDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  cookieLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cookieValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  userRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  userEmailText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  userRolesBox: {
    flexDirection: 'row',
    gap: 6,
  },
  roleTag: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  roleTagAdmin: {
    backgroundColor: '#3B0764',
    borderColor: '#7E22CE',
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  accessDeniedContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  accessDeniedCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  accessDeniedIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#450A0A',
    borderWidth: 2,
    borderColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
  },
  accessDeniedText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
});

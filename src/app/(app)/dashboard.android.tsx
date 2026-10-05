import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getMessage, logout } from '@/integration/authIntegration';

export default function Dashboard() {
  const router = useRouter();
  const { auth, setAuth } = useAuth();

  const isAdmin = !!auth?.roles.some((role) => role === 'ADMIN');

  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    fetchMessage();
  }, []);

  async function fetchMessage() {
    setError('');
    setIsLoading(true);

    try {
      const data = await getMessage();
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao obter mensagem');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    Alert.alert(
      'Encerrar Sessão',
      'Deseja realmente sair e invalidar o cookie de autenticação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
              setAuth(null);
              router.replace('/(auth)');
            } catch (err) {
              Alert.alert('Erro', 'Não foi possível desconectar');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  }

  // Capturar foto com ImagePicker
  async function handlePickImage() {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissão', 'Permissão de câmera é necessária para registrar auditoria.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Erro', 'Falha ao acionar a câmera nativa.');
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cabecalho do Usuario */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>PAINEL PRINCIPAL</Text>
            <Text style={styles.userName}>{auth?.user.name ?? 'Atleta'}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.roleBadge, isAdmin && styles.adminRoleBadge]}>
                <Ionicons
                  name={isAdmin ? 'shield-checkmark' : 'person'}
                  size={12}
                  color={isAdmin ? Colors.admin : Colors.primary}
                />
                <Text
                  style={[
                    styles.roleBadgeText,
                    isAdmin && { color: Colors.admin },
                  ]}>
                  {isAdmin ? 'PERFIL: ADMIN' : 'PERFIL: USER'}
                </Text>
              </View>
              <Text style={styles.userEmail}>{auth?.user.email}</Text>
            </View>
          </View>

          <Pressable
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isLoggingOut}>
            {isLoggingOut ? (
              <ActivityIndicator size="small" color={Colors.danger} />
            ) : (
              <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
            )}
          </Pressable>
        </View>

        {/* Card de Mensagem Segura via JWT */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-outline" size={18} color={Colors.secondary} />
            <Text style={styles.cardTitle}>Comunicação Autenticada (JWT)</Text>
            {isLoading && <ActivityIndicator size="small" color={Colors.primary} />}
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable style={styles.retryButton} onPress={fetchMessage}>
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.messageText}>
              {message || 'Carregando mensagem autenticada da API...'}
            </Text>
          )}

          <View style={styles.jwtDetailsBox}>
            <Text style={styles.jwtLabel}>Token JWT e Cookie:</Text>
            <Text style={styles.jwtTokenValue} numberOfLines={2}>
              {auth?.token ? `${auth.token.substring(0, 48)}...` : 'Nenhum token'}
            </Text>
          </View>
        </View>

        {/* Auditoria Visual por Imagem (ImagePicker nativo) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="camera" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Auditoria Rápida com Câmera Nativa</Text>
          </View>

          {photoUri ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <Pressable
                style={styles.removePhotoButton}
                onPress={() => setPhotoUri(null)}>
                <Ionicons name="trash-outline" size={16} color="#FFF" />
                <Text style={styles.removePhotoText}>Remover</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.pickImageButton} onPress={handlePickImage}>
              <Ionicons name="camera-reverse-outline" size={28} color={Colors.primary} />
              <Text style={styles.pickImageText}>
                Registrar Foto de Equipamento / Carga
              </Text>
              <Text style={styles.pickImageSubtext}>
                Utiliza expo-image-picker integrado aos requisitos mobile
              </Text>
            </Pressable>
          )}
        </View>

        {/* Recursos de Operacao do Aplicativo */}
        <Text style={styles.sectionHeader}>Módulos do Aplicativo PAM</Text>

        <View style={styles.modulesGrid}>
          {/* Modulo 1: Treino com Sensores */}
          <Pressable
            style={styles.moduleCard}
            onPress={() => router.push('/treino')}>
            <View style={[styles.moduleIconBox, { backgroundColor: '#1C2E14' }]}>
              <Ionicons name="barbell" size={26} color={Colors.primary} />
            </View>
            <View style={styles.moduleTextBox}>
              <Text style={styles.moduleTitle}>Treino Ativo & Sensores</Text>
              <Text style={styles.moduleDesc}>
                Acelerômetro MEMS 3D, GPS e ritmo de Pacing
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </Pressable>

          {/* Modulo 2: Camera de Reps */}
          <Pressable
            style={styles.moduleCard}
            onPress={() => router.push('/camera')}>
            <View style={[styles.moduleIconBox, { backgroundColor: '#0C2D48' }]}>
              <Ionicons name="aperture-outline" size={26} color={Colors.secondary} />
            </View>
            <View style={styles.moduleTextBox}>
              <Text style={styles.moduleTitle}>Visor da Câmera Reps</Text>
              <Text style={styles.moduleDesc}>
                CameraView nativa, lanterna LED e anotações
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </Pressable>

          {/* Modulo 3: Historico Offline */}
          <Pressable
            style={styles.moduleCard}
            onPress={() => router.push('/historico')}>
            <View style={[styles.moduleIconBox, { backgroundColor: '#27272A' }]}>
              <Ionicons name="time-outline" size={26} color="#FBBF24" />
            </View>
            <View style={styles.moduleTextBox}>
              <Text style={styles.moduleTitle}>Histórico e Métricas</Text>
              <Text style={styles.moduleDesc}>
                Persistência local, fotos de séries e relatórios
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </Pressable>

          {/* Modulo 4: Painel de Administrador (Restrito por Role ADMIN) */}
          {isAdmin && (
            <Pressable
              style={[styles.moduleCard, styles.moduleCardAdmin]}
              onPress={() => router.push('/(app)/admin')}>
              <View style={[styles.moduleIconBox, { backgroundColor: '#3B0764' }]}>
                <Ionicons name="shield-checkmark" size={26} color={Colors.admin} />
              </View>
              <View style={styles.moduleTextBox}>
                <Text style={[styles.moduleTitle, { color: Colors.admin }]}>
                  Painel de Administração (RBAC)
                </Text>
                <Text style={styles.moduleDesc}>
                  Gestão de usuários, cookies de sessão e auditoria
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.admin} />
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 54,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  adminRoleBadge: {
    backgroundColor: '#2E1065',
    borderColor: '#581C87',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#271015',
    borderWidth: 1,
    borderColor: '#7F1D1D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  messageText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    backgroundColor: '#18181B',
    padding: 12,
    borderRadius: 8,
  },
  errorContainer: {
    backgroundColor: '#450A0A',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#FCA5A5',
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  jwtDetailsBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  jwtLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  jwtTokenValue: {
    fontSize: 11,
    color: Colors.secondary,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  removePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 10,
    gap: 6,
  },
  removePhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  pickImageButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 20,
  },
  pickImageText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
  },
  pickImageSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 10,
    marginBottom: 14,
  },
  modulesGrid: {
    gap: 12,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  moduleCardAdmin: {
    borderColor: '#7E22CE',
    backgroundColor: '#1E122E',
  },
  moduleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleTextBox: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  moduleDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
});

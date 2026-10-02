// tela de historico e desempenho de treinos com persistencia em asyncstorage

import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { clearAllSessions, deleteWorkoutSession, getWorkoutSessions } from '@/services/storage';
import { formatDuration } from '@/services/locationService';
import { Radius, Spacing } from '@/constants/theme';
import { WorkoutSession } from '@/types/workout';

export default function HistoryScreen() {
  // lista de treinos recuperados do asyncstorage
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  // estado de carregamento inicial
  const [loading, setLoading] = useState<boolean>(true);

  // modal para visualizacao da foto ampliada em tela cheia
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);

  // carrega as sessoes gravadas no armazenamento local
  const loadSessions = useCallback(async () => {
    setLoading(true);
    const data = await getWorkoutSessions();
    setSessions(data);
    setLoading(false);
  }, []);

  // recarrega os dados toda vez que o usuario navega para a aba de historico
  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [loadSessions])
  );

  // remove uma sessao apos confirmacao do usuario
  function handleDeleteSession(id: string) {
    Alert.alert('Excluir Treino', 'Tem certeza que deseja apagar este treino do histórico?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteWorkoutSession(id);
          loadSessions();
        },
      },
    ]);
  }

  // limpa todo o historico de treinos gravados
  function handleClearAll() {
    Alert.alert(
      'Limpar Todo o Histórico',
      'Essa ação não pode ser desfeita. Deseja apagar todas as sessões salvas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar Tudo',
          style: 'destructive',
          onPress: async () => {
            await clearAllSessions();
            loadSessions();
          },
        },
      ]
    );
  }

  // calcula o total agregado de repeticoes de todas as sessoes
  const totalRepsAggregated = sessions.reduce((acc, curr) => acc + (curr.totalReps || 0), 0);

  // calcula o total acumulado de quilometros
  const totalDistanceAggregated = sessions.reduce(
    (acc, curr) => acc + (curr.totalDistanceKm || 0),
    0
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* cabecalho da tela de historico */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Histórico de Treinos</Text>
            <Text style={styles.subtitle}>Evolução e registros dos sensores</Text>
          </View>

          {sessions.length > 0 && (
            <Pressable style={styles.clearAllButton} onPress={handleClearAll}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </Pressable>
          )}
        </View>

        {/* cards de estatisticas consolidadas no topo */}
        <View style={styles.aggregatedRow}>
          <View style={styles.aggregatedCard}>
            <Text style={styles.aggregatedLabel}>TREINOS</Text>
            <Text style={styles.aggregatedValue}>{sessions.length}</Text>
          </View>

          <View style={styles.aggregatedCard}>
            <Text style={styles.aggregatedLabel}>TOTAL REPS</Text>
            <Text style={[styles.aggregatedValue, { color: '#CCFF00' }]}>
              {totalRepsAggregated}
            </Text>
          </View>

          <View style={styles.aggregatedCard}>
            <Text style={styles.aggregatedLabel}>TOTAL DIST.</Text>
            <Text style={[styles.aggregatedValue, { color: '#38BDF8' }]}>
              {totalDistanceAggregated.toFixed(1)} km
            </Text>
          </View>
        </View>

        {/* lista de treinos salvos */}
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadSessions}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="fitness-outline" size={48} color="#27272A" />
              <Text style={styles.emptyTitle}>Nenhum treino registrado ainda</Text>
              <Text style={styles.emptySubtitle}>
                Inicie um treino na primeira aba para salvar métricas do braço, pacing e fotos.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.sessionCard}>
              {/* cabecalho do card com titulo e data */}
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleBox}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDate}>
                    {new Date(item.startTime).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                <Pressable
                  style={styles.deleteIconButton}
                  onPress={() => handleDeleteSession(item.id)}>
                  <Ionicons name="trash-outline" size={16} color="#64748B" />
                </Pressable>
              </View>

              {/* grid de metricas da sessao */}
              <View style={styles.metricsGrid}>
                {item.durationSeconds > 0 && (
                  <View style={styles.metricItem}>
                    <Text style={styles.metricItemLabel}>DURAÇÃO</Text>
                    <Text style={styles.metricItemValue}>{formatDuration(item.durationSeconds)}</Text>
                  </View>
                )}

                <View style={styles.metricItem}>
                  <Text style={styles.metricItemLabel}>REPETIÇÕES</Text>
                  <Text style={[styles.metricItemValue, { color: '#CCFF00' }]}>
                    {item.totalReps} reps
                  </Text>
                </View>

                {item.totalDistanceKm > 0 && (
                  <View style={styles.metricItem}>
                    <Text style={styles.metricItemLabel}>DISTÂNCIA</Text>
                    <Text style={styles.metricItemValue}>{item.totalDistanceKm.toFixed(2)} km</Text>
                  </View>
                )}

                {item.averagePace !== `--'--"` && (
                  <View style={styles.metricItem}>
                    <Text style={styles.metricItemLabel}>PACING</Text>
                    <Text style={[styles.metricItemValue, { color: '#38BDF8' }]}>
                      {item.averagePace} /km
                    </Text>
                  </View>
                )}
              </View>

              {/* exibicao de fotos anexadas a sessao */}
              {item.photos && item.photos.length > 0 && (
                <View style={styles.photosSection}>
                  <Text style={styles.photosSectionTitle}>Fotos do Treino ({item.photos.length}):</Text>
                  <View style={styles.photosRow}>
                    {item.photos.map((photo) => (
                      <Pressable
                        key={photo.id}
                        style={styles.thumbnailWrapper}
                        onPress={() => setSelectedPhotoUri(photo.uri)}>
                        <Image source={{ uri: photo.uri }} style={styles.thumbnailImage} />
                        <View style={styles.zoomBadge}>
                          <Ionicons name="expand" size={12} color="#FFFFFF" />
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* notas ou observacoes do treino */}
              {item.notes ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>{item.notes}</Text>
                </View>
              ) : null}
            </View>
          )}
        />

        {/* modal de zoom de foto em tela cheia */}
        <Modal visible={!!selectedPhotoUri} transparent animationType="fade">
          <View style={styles.photoModalBackdrop}>
            <Pressable
              style={styles.closeModalButton}
              onPress={() => setSelectedPhotoUri(null)}>
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </Pressable>

            {selectedPhotoUri && (
              <Image
                source={{ uri: selectedPhotoUri }}
                style={styles.modalFullImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  clearAllButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  aggregatedRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  aggregatedCard: {
    flex: 1,
    backgroundColor: '#141416',
    borderRadius: Radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  aggregatedLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 2,
  },
  aggregatedValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  listContent: {
    paddingBottom: 40,
    gap: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E2E8F0',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  sessionCard: {
    backgroundColor: '#141416',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#27272A',
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleBox: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  deleteIconButton: {
    padding: 6,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    backgroundColor: '#18181B',
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
  },
  metricItemLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 2,
  },
  metricItemValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  photosSection: {
    gap: 8,
  },
  photosSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  photosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  thumbnailWrapper: {
    position: 'relative',
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  thumbnailImage: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
  },
  zoomBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 3,
    borderRadius: 4,
  },
  notesBox: {
    backgroundColor: '#18181B',
    borderRadius: Radius.md,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#CCFF00',
  },
  notesText: {
    fontSize: 12,
    color: '#E2E8F0',
    fontStyle: 'italic',
  },
  photoModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFullImage: {
    width: '100%',
    height: '80%',
  },
});

// tela principal do treino ativo com sensores de braco, localizacao gps e pacing

import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { useArmMotionTracker } from '@/hooks/useArmMotionTracker';
import { useLocationTracker } from '@/hooks/useLocationTracker';
import { formatDuration } from '@/services/locationService';
import { saveWorkoutSession } from '@/services/storage';
import { Radius, Spacing } from '@/constants/theme';
import { WorkoutPhoto, WorkoutSession } from '@/types/workout';

export default function WorkoutScreen() {
  const router = useRouter();

  // aba de visualizacao selecionada no painel ao vivo
  const [activeTab, setActiveTab] = useState<'braco' | 'pacing'>('braco');

  // modal de finalizacao e resumo do treino
  const [finishModalVisible, setFinishModalVisible] = useState(false);

  // lista de fotos capturadas na sessao atual
  const [sessionPhotos, setSessionPhotos] = useState<WorkoutPhoto[]>([]);

  // hook de gerenciamento de tempo
  const timer = useWorkoutTimer();

  // hook do acelerometro do braco e contador de reps
  const arm = useArmMotionTracker(timer.isActive && !timer.isPaused);

  // hook do sensor de localizacao e ritmo de pacing
  const location = useLocationTracker(
    timer.isActive && !timer.isPaused,
    timer.seconds
  );

  // inicia uma nova sessao de treino
  function handleStartWorkout() {
    timer.start();
    arm.resetReps();
    location.resetMetrics();
    setSessionPhotos([]);
  }

  // abre a tela de camera para registrar foto do treino
  function handleNavigateToCamera() {
    router.push('/camera');
  }

  // abre o modal de confirmacao e resumo do treino
  function handleOpenFinishModal() {
    timer.pause();
    setFinishModalVisible(true);
  }

  // salva a sessao concluida no asyncstorage
  async function handleConfirmSaveWorkout() {
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      title: `Treino #${new Date().toLocaleDateString('pt-BR')}`,
      startTime: Date.now() - timer.seconds * 1000,
      endTime: Date.now(),
      durationSeconds: timer.seconds,
      totalReps: arm.reps,
      totalDistanceKm: location.metrics.distanceKm,
      averagePace: location.metrics.averagePace,
      averageSpeedKmh: location.metrics.averageSpeedKmh,
      photos: sessionPhotos,
    };

    // salva no armazenamento local
    const success = await saveWorkoutSession(newSession);

    if (success) {
      setFinishModalVisible(false);
      timer.reset();
      arm.resetReps();
      location.resetMetrics();
      Alert.alert('Treino Salvo!', 'O treino foi gravado no seu histórico.');
    } else {
      Alert.alert('Erro', 'Não foi possível salvar a sessão de treino.');
    }
  }

  // cancela a finalizacao e retoma o cronometro
  function handleCancelFinish() {
    setFinishModalVisible(false);
    timer.resume();
  }

  // descarta a sessao sem salvar
  function handleDiscardWorkout() {
    setFinishModalVisible(false);
    timer.reset();
    arm.resetReps();
    location.resetMetrics();
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* cabecalho com status de conexao dos sensores */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>PAM FITNESS</Text>
            <Text style={styles.appSubtitle}>Treino com Sensores</Text>
          </View>

          {/* badges de status dos sensores ativos */}
          <View style={styles.sensorStatusRow}>
            {/* badge do sensor de braco */}
            <View style={[styles.sensorBadge, timer.isActive && styles.sensorBadgeActive]}>
              <View
                style={[
                  styles.sensorDot,
                  { backgroundColor: timer.isActive ? '#CCFF00' : '#64748B' },
                ]}
              />
              <Text style={styles.sensorBadgeText}>Braço</Text>
            </View>

            {/* badge do sensor de localizacao gps */}
            <View
              style={[
                styles.sensorBadge,
                location.permissionGranted && timer.isActive && styles.sensorBadgeActiveGps,
              ]}>
              <View
                style={[
                  styles.sensorDot,
                  {
                    backgroundColor:
                      location.permissionGranted && timer.isActive ? '#38BDF8' : '#64748B',
                  },
                ]}
              />
              <Text style={styles.sensorBadgeText}>GPS</Text>
            </View>
          </View>
        </View>

        {/* visor principal do cronometro esportivo */}
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>TEMPO DECORRIDO</Text>
          <Text style={styles.timerValue}>{formatDuration(timer.seconds)}</Text>
          <View style={styles.timerStatusContainer}>
            <View
              style={[
                styles.statusPill,
                timer.isActive && !timer.isPaused
                  ? styles.statusPillActive
                  : timer.isPaused
                  ? styles.statusPillPaused
                  : styles.statusPillIdle,
              ]}>
              <Text style={styles.statusPillText}>
                {timer.isActive && !timer.isPaused
                  ? 'EM ANDAMENTO'
                  : timer.isPaused
                  ? 'PAUSADO'
                  : 'PRONTO PARA INICIAR'}
              </Text>
            </View>
          </View>
        </View>

        {/* seletor de visualizacao: braco reps vs gps pacing */}
        <View style={styles.tabSelector}>
          <Pressable
            style={[styles.tabButton, activeTab === 'braco' && styles.tabButtonActive]}
            onPress={() => setActiveTab('braco')}>
            <Ionicons
              name="fitness-outline"
              size={18}
              color={activeTab === 'braco' ? '#09090B' : '#94A3B8'}
            />
            <Text style={[styles.tabButtonText, activeTab === 'braco' && styles.tabButtonTextActive]}>
              Sensor de Braço
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabButton, activeTab === 'pacing' && styles.tabButtonActiveGps]}
            onPress={() => setActiveTab('pacing')}>
            <Ionicons
              name="navigate-outline"
              size={18}
              color={activeTab === 'pacing' ? '#09090B' : '#94A3B8'}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'pacing' && styles.tabButtonTextActiveGps,
              ]}>
              GPS & Pacing
            </Text>
          </Pressable>
        </View>

        {/* conteudo do modo braco / reps */}
        {activeTab === 'braco' ? (
          <View style={styles.modeCard}>
            {/* informacao de posicionamento da bracadeira */}
            <View style={styles.armHintRow}>
              <Ionicons name="information-circle-outline" size={16} color="#94A3B8" />
              <Text style={styles.armHintText}>
                Prenda o celular no braço para contagem automática de reps
              </Text>
            </View>

            {/* visor gigante de repeticoes */}
            <View style={styles.repsDisplayContainer}>
              <Text style={styles.repsNumber}>{arm.reps}</Text>
              <Text style={styles.repsUnit}>REPS</Text>
            </View>

            {/* fase do movimento e cadencia */}
            <View style={styles.motionStatsRow}>
              <View style={styles.motionStatItem}>
                <Text style={styles.motionStatLabel}>FASE DO BRAÇO</Text>
                <Text
                  style={[
                    styles.motionStatValue,
                    arm.motionState === 'subindo'
                      ? styles.motionStateUp
                      : arm.motionState === 'descendo'
                      ? styles.motionStateDown
                      : styles.motionStateIdle,
                  ]}>
                  {arm.motionState.toUpperCase()}
                </Text>
              </View>

              <View style={styles.motionStatDivider} />

              <View style={styles.motionStatItem}>
                <Text style={styles.motionStatLabel}>CADÊNCIA</Text>
                <Text style={styles.motionStatValue}>{arm.cadenceRpm} RPM</Text>
              </View>

              <View style={styles.motionStatDivider} />

              <View style={styles.motionStatItem}>
                <Text style={styles.motionStatLabel}>FORÇA G</Text>
                <Text style={styles.motionStatValue}>{arm.intensityG}g</Text>
              </View>
            </View>

            {/* monitor de aceleracao nos eixos x y z */}
            <View style={styles.axesContainer}>
              <Text style={styles.axesTitle}>Vetor de Aceleração Dinâmica</Text>
              <View style={styles.axesRow}>
                <View style={styles.axisBadge}>
                  <Text style={styles.axisLabel}>X:</Text>
                  <Text style={styles.axisValue}>{arm.axes.x.toFixed(2)}</Text>
                </View>
                <View style={styles.axisBadge}>
                  <Text style={styles.axisLabel}>Y:</Text>
                  <Text style={styles.axisValue}>{arm.axes.y.toFixed(2)}</Text>
                </View>
                <View style={styles.axisBadge}>
                  <Text style={styles.axisLabel}>Z:</Text>
                  <Text style={styles.axisValue}>{arm.axes.z.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* botoes de ajuste rapido de reps */}
            <View style={styles.manualRepsRow}>
              <Pressable
                style={styles.adjustButton}
                onPress={arm.removeManualRep}
                disabled={!timer.isActive}>
                <Ionicons name="remove" size={20} color="#FFFFFF" />
              </Pressable>

              <Pressable
                style={styles.resetRepsButton}
                onPress={arm.resetReps}
                disabled={!timer.isActive}>
                <Text style={styles.resetRepsText}>Zerar Série</Text>
              </Pressable>

              <Pressable
                style={styles.adjustButton}
                onPress={arm.addManualRep}
                disabled={!timer.isActive}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        ) : (
          /* conteudo do modo gps e pacing */
          <View style={styles.modeCard}>
            {/* destaque do ritmo de pacing em tempo real */}
            <View style={styles.paceHighlightBox}>
              <Text style={styles.paceHighlightLabel}>RITMO ATUAL (PACING)</Text>
              <Text style={styles.paceHighlightValue}>{location.metrics.currentPace}</Text>
              <Text style={styles.paceHighlightUnit}>min / km</Text>
            </View>

            {/* grid com distancia, velocidade e ritmo medio */}
            <View style={styles.gridStats}>
              <View style={styles.gridStatCard}>
                <Text style={styles.gridStatLabel}>DISTÂNCIA</Text>
                <Text style={styles.gridStatValue}>
                  {location.metrics.distanceKm.toFixed(2)}
                </Text>
                <Text style={styles.gridStatUnit}>km</Text>
              </View>

              <View style={styles.gridStatCard}>
                <Text style={styles.gridStatLabel}>VELOCIDADE</Text>
                <Text style={styles.gridStatValue}>
                  {location.metrics.currentSpeedKmh.toFixed(1)}
                </Text>
                <Text style={styles.gridStatUnit}>km/h</Text>
              </View>

              <View style={styles.gridStatCard}>
                <Text style={styles.gridStatLabel}>PACING MÉDIO</Text>
                <Text style={styles.gridStatValue}>{location.metrics.averagePace}</Text>
                <Text style={styles.gridStatUnit}>min/km</Text>
              </View>

              <View style={styles.gridStatCard}>
                <Text style={styles.gridStatLabel}>VELOC. MÉDIA</Text>
                <Text style={styles.gridStatValue}>
                  {location.metrics.averageSpeedKmh.toFixed(1)}
                </Text>
                <Text style={styles.gridStatUnit}>km/h</Text>
              </View>
            </View>

            {/* aviso de permissao gps caso necessaria */}
            {!location.permissionGranted && (
              <Pressable
                style={styles.permissionAlertButton}
                onPress={location.requestPermission}>
                <Ionicons name="location-outline" size={18} color="#38BDF8" />
                <Text style={styles.permissionAlertText}>
                  Toque para autorizar o GPS de alta precisão
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* botao de atalho rapido para camera */}
        <Pressable style={styles.quickCameraButton} onPress={handleNavigateToCamera}>
          <Ionicons name="camera" size={20} color="#CCFF00" />
          <Text style={styles.quickCameraText}>Tirar Foto do Treino / Reps</Text>
        </Pressable>

        {/* barra de controles principais de acao do treino */}
        <View style={styles.actionControls}>
          {!timer.isActive ? (
            <Pressable style={styles.startPrimaryButton} onPress={handleStartWorkout}>
              <Ionicons name="play" size={24} color="#09090B" />
              <Text style={styles.startPrimaryText}>INICIAR TREINO</Text>
            </Pressable>
          ) : (
            <View style={styles.activeActionsRow}>
              {timer.isPaused ? (
                <Pressable style={styles.resumeButton} onPress={timer.resume}>
                  <Ionicons name="play" size={20} color="#09090B" />
                  <Text style={styles.resumeButtonText}>RETOMAR</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.pauseButton} onPress={timer.pause}>
                  <Ionicons name="pause" size={20} color="#FFFFFF" />
                  <Text style={styles.pauseButtonText}>PAUSAR</Text>
                </Pressable>
              )}

              <Pressable style={styles.finishButton} onPress={handleOpenFinishModal}>
                <Ionicons name="stop" size={20} color="#FFFFFF" />
                <Text style={styles.finishButtonText}>FINALIZAR</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* modal de finalizacao e resumo do treino */}
      <Modal visible={finishModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Resumo do Treino</Text>
            <Text style={styles.modalSubtitle}>Confira seus resultados desta sessão</Text>

            <View style={styles.modalSummaryBox}>
              <View style={styles.modalSummaryRow}>
                <Text style={styles.modalSummaryLabel}>Duração:</Text>
                <Text style={styles.modalSummaryValue}>{formatDuration(timer.seconds)}</Text>
              </View>

              <View style={styles.modalSummaryRow}>
                <Text style={styles.modalSummaryLabel}>Total de Repetições:</Text>
                <Text style={[styles.modalSummaryValue, { color: '#CCFF00' }]}>
                  {arm.reps} reps
                </Text>
              </View>

              <View style={styles.modalSummaryRow}>
                <Text style={styles.modalSummaryLabel}>Distância Percorrida:</Text>
                <Text style={styles.modalSummaryValue}>
                  {location.metrics.distanceKm.toFixed(2)} km
                </Text>
              </View>

              <View style={styles.modalSummaryRow}>
                <Text style={styles.modalSummaryLabel}>Pacing Médio:</Text>
                <Text style={[styles.modalSummaryValue, { color: '#38BDF8' }]}>
                  {location.metrics.averagePace} /km
                </Text>
              </View>
            </View>

            {/* botoes de decisao no modal */}
            <Pressable style={styles.modalSaveButton} onPress={handleConfirmSaveWorkout}>
              <Text style={styles.modalSaveButtonText}>Salvar no Histórico</Text>
            </Pressable>

            <Pressable style={styles.modalResumeButton} onPress={handleCancelFinish}>
              <Text style={styles.modalResumeButtonText}>Continuar Treinando</Text>
            </Pressable>

            <Pressable style={styles.modalDiscardButton} onPress={handleDiscardWorkout}>
              <Text style={styles.modalDiscardButtonText}>Descartar Treino</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  appSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sensorStatusRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  sensorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  sensorBadgeActive: {
    borderColor: '#CCFF00',
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
  },
  sensorBadgeActiveGps: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  sensorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sensorBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
    textTransform: 'uppercase',
  },
  timerCard: {
    backgroundColor: '#141416',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  timerLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  timerValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 4,
    fontVariant: ['tabular-nums'],
  },
  timerStatusContainer: {
    marginTop: 4,
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
  },
  statusPillIdle: {
    backgroundColor: '#27272A',
  },
  statusPillActive: {
    backgroundColor: 'rgba(204, 255, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#CCFF00',
  },
  statusPillPaused: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#141416',
    borderRadius: Radius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
    borderRadius: Radius.md,
  },
  tabButtonActive: {
    backgroundColor: '#CCFF00',
  },
  tabButtonActiveGps: {
    backgroundColor: '#38BDF8',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabButtonTextActive: {
    color: '#09090B',
  },
  tabButtonTextActiveGps: {
    color: '#09090B',
  },
  modeCard: {
    backgroundColor: '#141416',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: '#27272A',
    gap: Spacing.lg,
  },
  armHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#18181B',
    padding: 10,
    borderRadius: Radius.md,
  },
  armHintText: {
    fontSize: 12,
    color: '#94A3B8',
    flex: 1,
  },
  repsDisplayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  repsNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: '#CCFF00',
    lineHeight: 76,
    fontVariant: ['tabular-nums'],
  },
  repsUnit: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 3,
  },
  motionStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#18181B',
    borderRadius: Radius.lg,
    paddingVertical: 12,
  },
  motionStatItem: {
    alignItems: 'center',
  },
  motionStatLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  motionStatValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  motionStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#27272A',
  },
  motionStateIdle: {
    color: '#94A3B8',
  },
  motionStateUp: {
    color: '#CCFF00',
  },
  motionStateDown: {
    color: '#38BDF8',
  },
  axesContainer: {
    gap: 6,
  },
  axesTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  axesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  axisBadge: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#18181B',
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  axisLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  axisValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  manualRepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetRepsButton: {
    flex: 1,
    backgroundColor: '#18181B',
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  resetRepsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  paceHighlightBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181B',
    borderRadius: Radius.xl,
    paddingVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  paceHighlightLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
    letterSpacing: 1.5,
  },
  paceHighlightValue: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 4,
    fontVariant: ['tabular-nums'],
  },
  paceHighlightUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 2,
  },
  gridStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  gridStatCard: {
    width: '48%',
    backgroundColor: '#18181B',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  gridStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 2,
  },
  gridStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  gridStatUnit: {
    fontSize: 11,
    color: '#94A3B8',
  },
  permissionAlertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    padding: 12,
    borderRadius: Radius.md,
  },
  permissionAlertText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#38BDF8',
  },
  quickCameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#141416',
    borderWidth: 1,
    borderColor: '#27272A',
    paddingVertical: 14,
    borderRadius: Radius.lg,
  },
  quickCameraText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionControls: {
    marginTop: Spacing.sm,
  },
  startPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#CCFF00',
    paddingVertical: 18,
    borderRadius: Radius.xl,
    shadowColor: '#CCFF00',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  startPrimaryText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#09090B',
    letterSpacing: 1,
  },
  activeActionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  pauseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#27272A',
    paddingVertical: 16,
    borderRadius: Radius.lg,
  },
  pauseButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  resumeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#CCFF00',
    paddingVertical: 16,
    borderRadius: Radius.lg,
  },
  resumeButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#09090B',
    letterSpacing: 1,
  },
  finishButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: Radius.lg,
  },
  finishButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: '#141416',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: '#27272A',
    gap: Spacing.md,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  modalSummaryBox: {
    backgroundColor: '#18181B',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  modalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  modalSummaryLabel: {
    fontSize: 13,
    color: '#94A3B8',
  },
  modalSummaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSaveButton: {
    backgroundColor: '#CCFF00',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  modalSaveButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#09090B',
  },
  modalResumeButton: {
    backgroundColor: '#27272A',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  modalResumeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalDiscardButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalDiscardButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
});

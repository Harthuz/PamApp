// tela de captura de foto do treino com sensor de camera expo camera

import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { saveWorkoutSession } from '@/services/storage';
import { Radius, Spacing } from '@/constants/theme';
import { WorkoutPhoto, WorkoutSession } from '@/types/workout';

export default function WorkoutCameraScreen() {
  const router = useRouter();

  // referencia para o componente nativo de camera
  const cameraRef = useRef<CameraView | null>(null);

  // hook de permissao de camera do expo
  const [permission, requestPermission] = useCameraPermissions();

  // orientacao da camera: traseira ou frontal
  const [facing, setFacing] = useState<CameraType>('back');

  // estado do flash: desligado ou ligado
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');

  // uri da foto recem capturada para visualizacao previa
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);

  // nota de texto associada a foto capturada
  const [photoNote, setPhotoNote] = useState<string>('Série de Reps');

  // indicador de processo de captura em andamento
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // alterna entre camera frontal e traseira
  function handleToggleFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  // alterna modo de flash
  function handleToggleFlash() {
    setFlashMode((current) => (current === 'off' ? 'on' : 'off'));
  }

  // captura foto em alta resolucao usando o sensor da camera
  async function handleTakePicture() {
    if (!cameraRef.current || isCapturing) {
      return;
    }

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (photo?.uri) {
        setCapturedPhotoUri(photo.uri);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    } finally {
      setIsCapturing(false);
    }
  }

  // descarta a foto capturada e volta ao visor da camera
  function handleRetakePhoto() {
    setCapturedPhotoUri(null);
  }

  // confirma e salva o registro fotográfico no historico
  async function handleSavePhoto() {
    if (!capturedPhotoUri) return;

    const newPhoto: WorkoutPhoto = {
      id: Date.now().toString(),
      uri: capturedPhotoUri,
      timestamp: Date.now(),
      repsAtCapture: 0,
      note: photoNote,
    };

    // cria uma sessao de registro avulso
    const session: WorkoutSession = {
      id: Date.now().toString(),
      title: `Registro Visual #${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      startTime: Date.now(),
      endTime: Date.now(),
      durationSeconds: 0,
      totalReps: 0,
      totalDistanceKm: 0,
      averagePace: `--'--"`,
      averageSpeedKmh: 0,
      photos: [newPhoto],
      notes: photoNote,
    };

    const saved = await saveWorkoutSession(session);
    if (saved) {
      Alert.alert('Foto Salva!', 'O registro fotográfico foi adicionado ao seu histórico.');
      setCapturedPhotoUri(null);
      router.push('/historico');
    } else {
      Alert.alert('Erro', 'Não foi possível salvar o registro fotográfico.');
    }
  }

  // se a permissao ainda estiver carregando
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Carregando permissões da câmera...</Text>
      </View>
    );
  }

  // se a permissao nao foi concedida
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color="#CCFF00" />
        <Text style={styles.permissionTitle}>Permissão de Câmera Necessária</Text>
        <Text style={styles.permissionText}>
          O aplicativo precisa acessar a câmera para fotografar seus treinos, cargas e repetições.
        </Text>
        <Pressable style={styles.grantButton} onPress={requestPermission}>
          <Text style={styles.grantButtonText}>Autorizar Câmera</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {capturedPhotoUri ? (
        // tela de confirmacao e pre-visualizacao da foto
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedPhotoUri }} style={styles.previewImage} />

          <View style={styles.previewOverlay}>
            <Text style={styles.previewTitle}>Foto do Treino Capturada</Text>

            {/* campo de anotacao rápida da serie ou carga */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nota da Série / Exercício:</Text>
              <TextInput
                style={styles.textInput}
                value={photoNote}
                onChangeText={setPhotoNote}
                placeholder="Ex: Supino 4x10 - 32kg cada lado"
                placeholderTextColor="#64748B"
              />
            </View>

            {/* botoes de salvar ou tirar outra */}
            <View style={styles.previewActionsRow}>
              <Pressable style={styles.retakeButton} onPress={handleRetakePhoto}>
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.retakeButtonText}>Tirar Outra</Text>
              </Pressable>

              <Pressable style={styles.savePhotoButton} onPress={handleSavePhoto}>
                <Ionicons name="checkmark" size={20} color="#09090B" />
                <Text style={styles.savePhotoButtonText}>Salvar Foto</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        // visor ao vivo da camera
        <View style={styles.cameraWrapper}>
          <CameraView
            ref={cameraRef}
            style={styles.cameraView}
            facing={facing}
            enableTorch={flashMode === 'on'}>
            {/* barra superior de controles: flash, inverter e voltar */}
            <View style={styles.topControlsBar}>
              <Pressable style={styles.iconCircleButton} onPress={() => router.back()}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </Pressable>

              <View style={styles.cameraStatusBadge}>
                <Text style={styles.cameraStatusText}>FOTO DE REPS & CARGA</Text>
              </View>

              <View style={styles.rightTopButtons}>
                <Pressable style={styles.iconCircleButton} onPress={handleToggleFlash}>
                  <Ionicons
                    name={flashMode === 'on' ? 'flash' : 'flash-off-outline'}
                    size={20}
                    color={flashMode === 'on' ? '#CCFF00' : '#FFFFFF'}
                  />
                </Pressable>

                <Pressable style={styles.iconCircleButton} onPress={handleToggleFacing}>
                  <Ionicons name="camera-reverse-outline" size={22} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>

            {/* reticulo esportivo central guia */}
            <View style={styles.viewfinderCenter}>
              <View style={styles.reticleCornerTopLeft} />
              <View style={styles.reticleCornerTopRight} />
              <View style={styles.reticleCornerBottomLeft} />
              <View style={styles.reticleCornerBottomRight} />
              <Text style={styles.reticleHint}>Enquadre a máquina, anilhas ou rep</Text>
            </View>

            {/* barra inferior com o disparador esportivo */}
            <View style={styles.bottomControlsBar}>
              <Pressable
                style={[styles.shutterButtonOuter, isCapturing && styles.shutterButtonDisabled]}
                onPress={handleTakePicture}
                disabled={isCapturing}>
                <View style={styles.shutterButtonInner} />
              </Pressable>
            </View>
          </CameraView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#09090B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  grantButton: {
    backgroundColor: '#CCFF00',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
  grantButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#09090B',
  },
  cameraWrapper: {
    flex: 1,
  },
  cameraView: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topControlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  iconCircleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cameraStatusBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.4)',
  },
  cameraStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#CCFF00',
    letterSpacing: 1,
  },
  rightTopButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  viewfinderCenter: {
    alignSelf: 'center',
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  reticleCornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#CCFF00',
  },
  reticleCornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#CCFF00',
  },
  reticleCornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 24,
    height: 24,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#CCFF00',
  },
  reticleCornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#CCFF00',
  },
  reticleHint: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  bottomControlsBar: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  shutterButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#CCFF00',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  shutterButtonInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
  },
  shutterButtonDisabled: {
    opacity: 0.5,
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(9, 9, 11, 0.92)',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderColor: '#27272A',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  inputContainer: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: '#18181B',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  previewActionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#27272A',
    paddingVertical: 14,
    borderRadius: Radius.lg,
  },
  retakeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  savePhotoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#CCFF00',
    paddingVertical: 14,
    borderRadius: Radius.lg,
  },
  savePhotoButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#09090B',
  },
});

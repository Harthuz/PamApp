// definicao dos tipos principais do aplicativo de treino e sensores

// estrutura de coordenadas geograficas registradas pelo gps
export interface LocationPoint {
  latitude: number;
  longitude: number;
  altitude: number | null;
  speed: number | null;
  timestamp: number;
}

// dados agregados de localizacao e ritmo de pacing
export interface LocationMetrics {
  currentPace: string;
  averagePace: string;
  distanceKm: number;
  currentSpeedKmh: number;
  averageSpeedKmh: number;
  accuracyMeters: number | null;
  route: LocationPoint[];
}

// dados lidos do acelerometro do braco nos tres eixos
export interface MotionSample {
  x: number;
  y: number;
  z: number;
  magnitude: number;
  timestamp: number;
}

// metricas de movimento e contagem de repeticoes com celular no braco
export interface ArmMotionMetrics {
  reps: number;
  cadenceRpm: number;
  intensityG: number;
  motionState: 'repouso' | 'subindo' | 'descendo';
  lastRepTimestamp: number | null;
}

// registro de foto capturada durante o treino
export interface WorkoutPhoto {
  id: string;
  uri: string;
  timestamp: number;
  repsAtCapture: number;
  note?: string;
}

// sessao completa de treino para persistencia no historico
export interface WorkoutSession {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  totalReps: number;
  totalDistanceKm: number;
  averagePace: string;
  averageSpeedKmh: number;
  photos: WorkoutPhoto[];
  notes?: string;
}

// hook para monitorar movimento do braco e detectar repeticoes com o acelerometro

import { useCallback, useEffect, useRef, useState } from 'react';
import { Accelerometer } from 'expo-sensors';

export function useArmMotionTracker(isActive: boolean) {
  // estado de contagem de repeticoes detectadas
  const [reps, setReps] = useState<number>(0);

  // estado dos valores nos tres eixos espaciais do acelerometro
  const [axes, setAxes] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

  // estado da intensidade da forca g calculada
  const [intensityG, setIntensityG] = useState<number>(1.0);

  // estado da cadencia calculada em repeticoes por minuto
  const [cadenceRpm, setCadenceRpm] = useState<number>(0);

  // estado da fase atual do movimento do braco
  const [motionState, setMotionState] = useState<'repouso' | 'subindo' | 'descendo'>('repouso');

  // referencia para a assinatura do evento do acelerometro
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);

  // referencia para registrar o timestamp da ultima repeticao contada
  const lastRepTimeRef = useRef<number>(0);

  // referencia para a maquina de estados de deteccao de pico e vale
  const repStateRef = useRef<'esperando_pico' | 'esperando_vale'>('esperando_pico');

  // referencia para lista de timestamps das repeticoes recentes para calculo de cadencia
  const recentRepsTimestampsRef = useRef<number[]>([]);

  // zera o contador de repeticoes
  const resetReps = useCallback(() => {
    setReps(0);
    setCadenceRpm(0);
    setMotionState('repouso');
    lastRepTimeRef.current = 0;
    repStateRef.current = 'esperando_pico';
    recentRepsTimestampsRef.current = [];
  }, []);

  // incrementa manualmente caso o usuario queira ajustar
  const addManualRep = useCallback(() => {
    setReps((prev) => prev + 1);
  }, []);

  // decrementa manualmente caso o sensor tenha contado uma rep a mais
  const removeManualRep = useCallback(() => {
    setReps((prev) => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    // verifica se o treino esta ativo para ligar o sensor
    if (!isActive) {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      return;
    }

    // define intervalo de amostragem em 100 milissegundos
    Accelerometer.setUpdateInterval(100);

    // inicia a escuta continua dos dados do acelerometro
    subscriptionRef.current = Accelerometer.addListener((data) => {
      const { x, y, z } = data;
      setAxes({ x, y, z });

      // calcula a magnitude resultante da aceleracao tridimensional
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      setIntensityG(Number(magnitude.toFixed(2)));

      const now = Date.now();

      // limiar superior para registrar contracao ou movimento de subida do braco
      const upperThreshold = 1.25;

      // limiar inferior para registrar extensao ou movimento de descida do braco
      const lowerThreshold = 0.85;

      // tempo minimo de debounce entre repeticoes para evitar contar tremor muscular (700ms)
      const minIntervalBetweenRepsMs = 700;

      // logica da maquina de estados de deteccao de ciclo completo de repeticao
      if (repStateRef.current === 'esperando_pico') {
        if (magnitude >= upperThreshold) {
          repStateRef.current = 'esperando_vale';
          setMotionState('subindo');
        }
      } else if (repStateRef.current === 'esperando_vale') {
        if (magnitude <= lowerThreshold) {
          // valida se decorreu o intervalo minimo desde a ultima rep
          if (now - lastRepTimeRef.current > minIntervalBetweenRepsMs) {
            lastRepTimeRef.current = now;
            setReps((prev) => prev + 1);
            setMotionState('descendo');

            // adiciona timestamp a lista recente para calcular ritmo de cadencia
            recentRepsTimestampsRef.current.push(now);

            // mantem apenas repeticoes ocorridas nos ultimos 30 segundos
            const cutoff = now - 30000;
            recentRepsTimestampsRef.current = recentRepsTimestampsRef.current.filter((t) => t > cutoff);

            // calcula cadencia aproximada em repeticoes por minuto
            const countLast30s = recentRepsTimestampsRef.current.length;
            const rpm = countLast30s * 2;
            setCadenceRpm(rpm);
          }
          // volta para estado inicial aguardando novo pico
          repStateRef.current = 'esperando_pico';
        }
      } else {
        setMotionState('repouso');
      }
    });

    // limpeza ao pausar treino ou desmontar componente
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [isActive]);

  return {
    reps,
    axes,
    intensityG,
    cadenceRpm,
    motionState,
    resetReps,
    addManualRep,
    removeManualRep,
  };
}

// hook para rastreamento de localizacao gps, distancia e ritmo de pacing

import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { LocationMetrics, LocationPoint } from '@/types/workout';
import {
  calculateDistanceKm,
  formatAveragePace,
  formatInstantPace,
  metersPerSecondToKmh,
} from '@/services/locationService';

export function useLocationTracker(isActive: boolean, elapsedSeconds: number) {
  // estado de permissao de acesso a localizacao
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  // estado consolidado das metricas de localizacao
  const [metrics, setMetrics] = useState<LocationMetrics>({
    currentPace: `--'--"`,
    averagePace: `--'--"`,
    distanceKm: 0,
    currentSpeedKmh: 0,
    averageSpeedKmh: 0,
    accuracyMeters: null,
    route: [],
  });

  // referencia para a assinatura do listener de posicao
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  // referencia para o ultimo ponto registrado para calculo de distancia incremental
  const lastPointRef = useRef<LocationPoint | null>(null);

  // referencia para a distancia total acumulada
  const accumulatedDistanceRef = useRef<number>(0);

  // referencia para a lista completa de pontos do percurso
  const routePointsRef = useRef<LocationPoint[]>([]);

  // solicita permissao de localizacao ao dispositivo
  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionGranted(status === 'granted');
      return status === 'granted';
    } catch {
      setPermissionGranted(false);
      return false;
    }
  }, []);

  // zera todas as metricas e rotas
  const resetMetrics = useCallback(() => {
    accumulatedDistanceRef.current = 0;
    lastPointRef.current = null;
    routePointsRef.current = [];
    setMetrics({
      currentPace: `--'--"`,
      averagePace: `--'--"`,
      distanceKm: 0,
      currentSpeedKmh: 0,
      averageSpeedKmh: 0,
      accuracyMeters: null,
      route: [],
    });
  }, []);

  // verifica permissao inicial ao montar
  useEffect(() => {
    Location.getForegroundPermissionsAsync().then((res) => {
      setPermissionGranted(res.granted);
    });
  }, []);

  // inicia ou encerra o rastreamento gps conforme o estado do treino
  useEffect(() => {
    if (!isActive) {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      return;
    }

    let isMounted = true;

    async function startTracking() {
      const hasPermission = await requestPermission();
      if (!hasPermission || !isMounted) {
        return;
      }

      // inicia captura continua com alta precisao
      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 2,
        },
        (loc) => {
          if (!isMounted) return;

          const point: LocationPoint = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            altitude: loc.coords.altitude,
            speed: loc.coords.speed,
            timestamp: loc.timestamp,
          };

          // calcula incremento de distancia se houver ponto anterior
          if (lastPointRef.current) {
            const increment = calculateDistanceKm(
              lastPointRef.current.latitude,
              lastPointRef.current.longitude,
              point.latitude,
              point.longitude
            );

            // descarta saltos de erro de gps maiores que 50 metros em 1 segundo
            if (increment < 0.05) {
              accumulatedDistanceRef.current += increment;
            }
          }

          lastPointRef.current = point;
          routePointsRef.current.push(point);

          const distanceKm = Number(accumulatedDistanceRef.current.toFixed(2));
          const currentSpeedKmh = metersPerSecondToKmh(point.speed);
          const currentPace = formatInstantPace(point.speed);

          // calcula velocidade media acumulada
          const hours = elapsedSeconds / 3600;
          const averageSpeedKmh = hours > 0 ? Number((distanceKm / hours).toFixed(1)) : 0;
          const averagePace = formatAveragePace(elapsedSeconds, distanceKm);

          setMetrics({
            currentPace,
            averagePace,
            distanceKm,
            currentSpeedKmh,
            averageSpeedKmh,
            accuracyMeters: loc.coords.accuracy ? Math.round(loc.coords.accuracy) : null,
            route: routePointsRef.current,
          });
        }
      );
    }

    startTracking();

    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [isActive, requestPermission, elapsedSeconds]);

  return {
    metrics,
    permissionGranted,
    requestPermission,
    resetMetrics,
  };
}

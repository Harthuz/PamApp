// hook para controle do cronometro da sessao de treino

import { useCallback, useEffect, useRef, useState } from 'react';

export function useWorkoutTimer() {
  // estado de tempo decorrido em segundos
  const [seconds, setSeconds] = useState<number>(0);

  // estado booleano de treino ativo
  const [isActive, setIsActive] = useState<boolean>(false);

  // estado booleano de treino pausado
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // referencia mutavel para guardar o id do timer de intervalo
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // efeito para incrementar o contador a cada 1000 milissegundos
  useEffect(() => {
    // verifica se o cronometro esta rodando e nao esta pausado
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      // limpa o intervalo ativo se for pausado ou inativado
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // funcao de limpeza ao desmontar ou alterar dependencias
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  // inicia o cronometro do zero
  const start = useCallback(() => {
    setSeconds(0);
    setIsActive(true);
    setIsPaused(false);
  }, []);

  // pausa temporariamente o cronometro mantendo os segundos atuais
  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  // retoma a contagem a partir dos segundos atuais
  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  // reseta e desativa completamente o cronometro
  const reset = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setSeconds(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return {
    seconds,
    isActive,
    isPaused,
    start,
    pause,
    resume,
    reset,
  };
}

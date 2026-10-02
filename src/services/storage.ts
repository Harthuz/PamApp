// servico de persistencia local de treinos utilizando asyncstorage

import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession } from '@/types/workout';

// chave fixa para armazenar a lista de sessoes no asyncstorage
const STORAGE_KEY = '@app_pam:workouts_v1';

// recupera todas as sessoes salvas ordenadas da mais recente para a mais antiga
export async function getWorkoutSessions(): Promise<WorkoutSession[]> {
  try {
    // busca a string serializada em json
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) {
      return [];
    }
    // faz o parse e garante tipagem
    const sessions: WorkoutSession[] = JSON.parse(json);
    return sessions.sort((a, b) => b.startTime - a.startTime);
  } catch {
    // retorna array vazio em caso de falha de leitura
    return [];
  }
}

// salva uma nova sessao de treino no historico
export async function saveWorkoutSession(session: WorkoutSession): Promise<boolean> {
  try {
    // obtem sessoes ja existentes
    const existing = await getWorkoutSessions();
    // adiciona a nova sessao no inicio
    const updated = [session, ...existing];
    // grava de volta no armazenamento local em formato json
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch {
    // retorna falso se nao conseguir gravar
    return false;
  }
}

// remove uma sessao especifica pelo id
export async function deleteWorkoutSession(id: string): Promise<boolean> {
  try {
    const existing = await getWorkoutSessions();
    const filtered = existing.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

// limpa todas as sessoes gravadas
export async function clearAllSessions(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

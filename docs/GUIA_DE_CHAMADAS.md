# Guia Completo de Chamadas de Função e Fluxo de Dados

Este documento lista todas as chamadas de funções, seus parâmetros, tipos de retorno, locais de chamada e o fluxo completo de dados do aplicativo **PAM Fitness**.

---

## 1. Módulo de Serviços Geográficos e Pacing (`src/services/locationService.ts`)

### 1. `calculateDistanceKm`
- **Assinatura**: `calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number`
- **O que faz**: Aplica a fórmula trigonométrica de Haversine para computar a distância esférica em quilômetros entre duas coordenadas GPS.
- **Chamada em**: `src/hooks/useLocationTracker.ts` dentro do callback do `watchPositionAsync`.
- **Retorno**: Distância incremental em quilômetros (`number`).

### 2. `metersPerSecondToKmh`
- **Assinatura**: `metersPerSecondToKmh(speedMps: number | null): number`
- **O que faz**: Converte a velocidade fornecida pelo chip de GPS (em metros por segundo) para quilômetros por hora ($\times 3.6$).
- **Chamada em**: `src/hooks/useLocationTracker.ts`.
- **Retorno**: Velocidade em km/h com 1 casa decimal (`number`).

### 3. `formatInstantPace`
- **Assinatura**: `formatInstantPace(speedMps: number | null): string`
- **O que faz**: Converte a velocidade instantânea em metros por segundo para o formato de ritmo de corrida/caminhada (minutos e segundos por quilômetro). Se a velocidade for inferior a $0.5 \, m/s$, retorna `--'--"`.
- **Chamada em**: `src/hooks/useLocationTracker.ts`.
- **Retorno**: String formatada (exemplo: `"05'24"`).

### 4. `formatAveragePace`
- **Assinatura**: `formatAveragePace(totalSeconds: number, distanceKm: number): string`
- **O que faz**: Calcula a média ponderada do ritmo de toda a sessão de treino dividindo o tempo acumulado em segundos pelos quilômetros percorridos.
- **Chamada em**: `src/hooks/useLocationTracker.ts` e exibição nas telas.
- **Retorno**: String de ritmo médio (exemplo: `"05'45"`).

### 5. `formatDuration`
- **Assinatura**: `formatDuration(totalSeconds: number): string`
- **O que faz**: Transforma um número inteiro de segundos no padrão de cronômetro esportivo `MM:SS` (ou `HH:MM:SS` caso ultrapasse 1 hora).
- **Chamada em**: `src/app/index.tsx` e `src/app/historico.tsx`.
- **Retorno**: String formatada (exemplo: `"14:32"` ou `"01:12:05"`).

---

## 2. Módulo de Armazenamento Local (`src/services/storage.ts`)

### 1. `getWorkoutSessions`
- **Assinatura**: `getWorkoutSessions(): Promise<WorkoutSession[]>`
- **O que faz**: Lê a chave serializada `@app_pam:workouts_v1` do AsyncStorage, faz o `JSON.parse` e ordena as sessões da mais recente para a mais antiga.
- **Chamada em**: `src/app/historico.tsx` e internamente ao salvar uma nova sessão.
- **Retorno**: Array de objetos do tipo `WorkoutSession`.

### 2. `saveWorkoutSession`
- **Assinatura**: `saveWorkoutSession(session: WorkoutSession): Promise<boolean>`
- **O que faz**: Obtém as sessões existentes, insere a nova sessão no início do array e serializa em JSON no AsyncStorage.
- **Chamada em**: `src/app/index.tsx` (ao finalizar treino) e `src/app/camera.tsx` (ao salvar foto avulsa).
- **Retorno**: `true` se gravou com sucesso, `false` se falhou.

### 3. `deleteWorkoutSession`
- **Assinatura**: `deleteWorkoutSession(id: string): Promise<boolean>`
- **O que faz**: Filtra o array removendo a sessão com o ID especificado e grava o array atualizado.
- **Chamada em**: `src/app/historico.tsx` (no botão de excluir treino).
- **Retorno**: Booleano indicando sucesso.

### 4. `clearAllSessions`
- **Assinatura**: `clearAllSessions(): Promise<boolean>`
- **O que faz**: Remove a chave inteira do AsyncStorage, apagando todos os registros locais.
- **Chamada em**: `src/app/historico.tsx` (no botão de limpar todo o histórico).
- **Retorno**: Booleano indicando sucesso.

---

## 3. Handlers de Interface e Fluxo de Execução

### 3.1. Tela de Treino Ativo (`src/app/index.tsx`)
1. **`handleStartWorkout()`**:
   - Dispara `timer.start()`.
   - Zera repetições com `arm.resetReps()`.
   - Zera métricas de GPS com `location.resetMetrics()`.
   - Ativa os ouvintes dos sensores em segundo plano.
2. **`handleNavigateToCamera()`**:
   - Invoca `router.push('/camera')`.
3. **`handleOpenFinishModal()`**:
   - Congela o timer com `timer.pause()`.
   - Abre o modal com o resumo de repetições, tempo, distância e pacing médio.
4. **`handleConfirmSaveWorkout()`**:
   - Monta o objeto `WorkoutSession` com timestamp de início e fim, reps totais, distância em km, pacing médio e fotos.
   - Invoca `saveWorkoutSession(newSession)`.
   - Reseta os estados e exibe alerta de confirmação.
5. **`handleCancelFinish()`**:
   - Fecha o modal e retoma a contagem de tempo com `timer.resume()`.
6. **`handleDiscardWorkout()`**:
   - Fecha o modal e reinicializa os sensores sem gravar no armazenamento.

### 3.2. Tela de Câmera (`src/app/camera.tsx`)
1. **`handleToggleFacing()`**:
   - Inverte a lente ativa (`back` $\leftrightarrow$ `front`).
2. **`handleToggleFlash()`**:
   - Liga ou desliga o LED (`off` $\leftrightarrow$ `on`).
3. **`handleTakePicture()`**:
   - Executa `cameraRef.current.takePictureAsync({ quality: 0.85 })`.
   - Salva a URI da imagem em `capturedPhotoUri` e exibe o modo de pré-visualização.
4. **`handleRetakePhoto()`**:
   - Anula a URI da foto e retorna ao visor ao vivo.
5. **`handleSavePhoto()`**:
   - Constrói o objeto `WorkoutPhoto` com a nota digitada pelo atleta.
   - Grava via `saveWorkoutSession()` e redireciona para a aba `/historico`.

### 3.3. Tela de Histórico (`src/app/historico.tsx`)
1. **`loadSessions()`**:
   - Busca treinos via `getWorkoutSessions()` e popula o estado `sessions`.
2. **`handleDeleteSession(id)`**:
   - Apresenta diálogo nativo de confirmação (`Alert.alert`) e chama `deleteWorkoutSession(id)`.
3. **`handleClearAll()`**:
   - Exibe alerta de aviso e chama `clearAllSessions()`.

---

## 4. Diagrama do Fluxo de Dados Completo

```text
[ Atleta no Braço ]
        │
        ├── Inicia Treino ──► [ useWorkoutTimer ] ──► Timer 1s (setInterval)
        │
        ├── Movimenta Braço ─► [ Accelerometer ] ─► [ useArmMotionTracker ]
        │                                                     │
        │                                                     ▼
        │                                      Calcula Magnitude sqrt(x²+y²+z²)
        │                                      FSM (Pico 1.25g / Vale 0.85g)
        │                                      Filtro Debounce 700ms
        │                                      Incrementa Reps (+1) & Cadência RPM
        │
        ├── Deslocamento ────► [ GPS Location ] ──► [ useLocationTracker ]
        │                                                     │
        │                                                     ▼
        │                                      Fórmula de Haversine (Distância km)
        │                                      Pacing Instantâneo (min/km)
        │                                      Velocidade Média (km/h)
        │
        ├── Tira Foto ──────► [ Expo Camera ] ───► Foto de Reps / Carga
        │                                                     │
        │                                                     ▼
        └── Finaliza Treino ──────────────────────► [ AsyncStorage ]
                                                              │
                                                              ▼
                                                   [ Tela de Histórico ]
```

# Funções e Hooks Específicos de React e Expo

Este documento serve como referência de estudo e catálogo explicativo de **todas as funções e hooks de React e Expo** utilizados no código do aplicativo PAM Fitness.

---

## 1. Hooks Nativos do React

### 1.1. `useState`
- **Definição**: Declara uma variável de estado reativa que, ao ser atualizada pela sua função modificadora, instrui o React a re-renderizar o componente com os novos dados.
- **Onde é utilizado no projeto**:
  - `src/hooks/useWorkoutTimer.ts`:
    - `const [seconds, setSeconds] = useState<number>(0)`: armazena a contagem de tempo do treino.
    - `const [isActive, setIsActive] = useState<boolean>(false)`: indica se o treino está em execução.
    - `const [isPaused, setIsPaused] = useState<boolean>(false)`: indica se o cronômetro está congelado.
  - `src/hooks/useArmMotionTracker.ts`:
    - `const [reps, setReps] = useState<number>(0)`: contagem atualizada de repetições realizadas.
    - `const [axes, setAxes] = useState<{ x; y; z }>`: valores dinâmicos dos 3 eixos espaciais.
    - `const [intensityG, setIntensityG] = useState<number>(1.0)`: intensidade total da força G.
    - `const [cadenceRpm, setCadenceRpm] = useState<number>(0)`: cadência estimada em repetições por minuto.
    - `const [motionState, setMotionState] = useState<'repouso' | 'subindo' | 'descendo'>`: fase física do movimento muscular.
  - `src/hooks/useLocationTracker.ts`:
    - `const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null)`: status da permissão de GPS concedida pelo usuário.
    - `const [metrics, setMetrics] = useState<LocationMetrics>(...)`: objeto consolidado com ritmo de pacing, distância, velocidade instantânea e velocidade média.
  - `src/app/index.tsx`:
    - `const [activeTab, setActiveTab] = useState<'braco' | 'pacing'>('braco')`: controla o seletor visual entre o modo de braço e modo GPS.
    - `const [finishModalVisible, setFinishModalVisible] = useState(false)`: abre ou fecha o modal de resumo final.
    - `const [sessionPhotos, setSessionPhotos] = useState<WorkoutPhoto[]>([])`: fotos capturadas durante a sessão ativa.
  - `src/app/camera.tsx`:
    - `const [facing, setFacing] = useState<CameraType>('back')`: câmera frontal ou traseira.
    - `const [flashMode, setFlashMode] = useState<'off' | 'on'>('off')`: estado do flash.
    - `const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null)`: URI temporária da foto capturada.
    - `const [photoNote, setPhotoNote] = useState<string>('Série de Reps')`: texto da anotação da foto.
    - `const [isCapturing, setIsCapturing] = useState<boolean>(false)`: desabilita o botão enquanto o hardware processa a foto.
  - `src/app/historico.tsx`:
    - `const [sessions, setSessions] = useState<WorkoutSession[]>([])`: lista de treinos lidos do AsyncStorage.
    - `const [loading, setLoading] = useState<boolean>(true)`: indicador de carregamento.
    - `const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null)`: foto aberta em tela cheia no modal.

---

### 1.2. `useEffect`
- **Definição**: Executa efeitos colaterais fora do fluxo puro de renderização (comunicação com APIs de hardware, timers e subscrições de eventos). Aceita um array de dependências e pode retornar uma função de limpeza (*cleanup*).
- **Onde é utilizado no projeto**:
  - `src/hooks/useWorkoutTimer.ts`:
    - Configura um `setInterval` a cada 1000ms quando o treino está ativo e não pausado.
    - **Função de limpeza**: executa `clearInterval` para evitar vazamento de memória (*memory leaks*) ao pausar ou desmontar a tela.
  - `src/hooks/useArmMotionTracker.ts`:
    - Conecta o ouvinte `Accelerometer.addListener` com amostragem de 100ms quando `isActive === true`.
    - **Função de limpeza**: executa `subscription.remove()` para desligar o acelerômetro ao parar o treino, economizando bateria do smartphone.
  - `src/hooks/useLocationTracker.ts`:
    - Inicia o ouvinte `Location.watchPositionAsync` para receber coordenadas de satélite contínuas.
    - **Função de limpeza**: cancela a assinatura de GPS ao finalizar a sessão.

---

### 1.3. `useRef`
- **Definição**: Retorna um objeto mutável cuja propriedade `.current` persiste durante todo o ciclo de vida do componente. Diferente do `useState`, **modificar o `.current` NÃO dispara nova renderização**, sendo ideal para guardar dados de alta frequência e referências a nós nativos.
- **Onde é utilizado no projeto**:
  - `src/hooks/useWorkoutTimer.ts`:
    - `intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)`: guarda o ID do temporizador nativo.
  - `src/hooks/useArmMotionTracker.ts`:
    - `subscriptionRef`: referência para a subscrição do acelerômetro.
    - `lastRepTimeRef = useRef<number>(0)`: armazena o timestamp da última repetição com precisão de milissegundos para o debounce de 700ms.
    - `repStateRef = useRef<'esperando_pico' | 'esperando_vale'>('esperando_pico')`: guarda o estado atual da FSM sem renderizar a cada 100ms.
    - `recentRepsTimestampsRef = useRef<number[]>([])`: lista rápida de reps recentes para cálculo de cadência.
  - `src/hooks/useLocationTracker.ts`:
    - `lastPointRef`: guarda a última coordenada para cálculo incremental da distância via Haversine.
    - `accumulatedDistanceRef`: acumula os quilômetros percorridos.
    - `routePointsRef`: lista de pontos de rota.
  - `src/app/camera.tsx`:
    - `cameraRef = useRef<CameraView | null>(null)`: permite invocar imperativamente o método `cameraRef.current.takePictureAsync()`.

---

### 1.4. `useCallback`
- **Definição**: Retorna uma versão memorizada da função fornecida, que só é recriada se alguma das dependências do array mudar. Evita que funções passadas para componentes filhos ou usadas em efeitos causem re-execuções desnecessárias.
- **Onde é utilizado no projeto**:
  - `src/hooks/useWorkoutTimer.ts`: memoriza `start()`, `pause()`, `resume()` e `reset()`.
  - `src/hooks/useArmMotionTracker.ts`: memoriza `resetReps()`, `addManualRep()` e `removeManualRep()`.
  - `src/hooks/useLocationTracker.ts`: memoriza `requestPermission()` e `resetMetrics()`.
  - `src/app/historico.tsx`: memoriza `loadSessions()` para uso seguro dentro do `useFocusEffect`.

---

## 2. Hooks Específicos do Expo e Expo Router

### 2.1. `useRouter` (de `expo-router`)
- **Definição**: Fornece controle programático de navegação entre as telas do aplicativo.
- **Uso no projeto**:
  - Em `src/app/index.tsx`: `router.push('/camera')` navega do treino ativo direto para o visor da câmera.
  - Em `src/app/camera.tsx`: `router.back()` retorna à tela anterior e `router.push('/historico')` redireciona após salvar uma foto.

### 2.2. `useFocusEffect` (de `expo-router`)
- **Definição**: Dispara um efeito sempre que a tela em questão entra em foco (torna-se a tela ativa visível ao usuário) e executa a limpeza quando a tela perde o foco.
- **Uso no projeto**:
  - Em `src/app/historico.tsx`: recarrega a lista de sessões do AsyncStorage automaticamente sempre que o atleta navega para a aba de histórico.

### 2.3. `useCameraPermissions` (de `expo-camera`)
- **Definição**: Hook nativo que retorna o status atual da permissão de câmera (`permission.granted`) e uma função assíncrona `requestPermission()` para solicitar a autorização nativa do Android e iOS.
- **Uso no projeto**:
  - Em `src/app/camera.tsx`: gerencia o fluxo de permissão de maneira declarativa e elegante.

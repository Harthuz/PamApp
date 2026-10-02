# Funcionamento dos Sensores de Hardware

Este documento detalha o funcionamento físico, matemático e computacional dos três sensores utilizados no projeto: **Sensor de Movimento**, **Sensor de Localização** e **Sensor de Câmera**.

---

## 1. Sensor de Movimento (Acelerômetro) — Celular no Braço

### 1.1. Princípio Físico e Eixos Espaciais
O acelerômetro mede a aceleração linear do dispositivo em três eixos perpendiculares entre si:
- **Eixo X**: aceleração lateral (esquerda/direita).
- **Eixo Y**: aceleração longitudinal (cima/baixo no plano do aparelho).
- **Eixo Z**: aceleração perpendicular à tela (frente/trás).

Quando o celular está parado sobre uma superfície, a aceleração estática da gravidade terrestre exerce aproximadamente $1.0g$ ($9.81 \, m/s^2$).

### 1.2. Magnitude Resultante
Como a orientação do celular na braçadeira esportiva pode variar dependendo de como o usuário o encaixa, o cálculo não pode depender de um único eixo isolado. Por isso, calculamos a **magnitude euclidiana tridimensional**:

$$\text{Magnitude} = \sqrt{x^2 + y^2 + z^2}$$

Dessa forma, independentemente da rotação angular da braçadeira no bíceps ou antebraço, qualquer movimento dinâmico gera uma variação na magnitude total.

### 1.3. Algoritmo de Detecção de Repetições
O hook `useArmMotionTracker` implementa uma máquina de estados finita (`Finite State Machine - FSM`) com filtragem de ruído:

```text
[ REPOUSO ] 
    │
    ▼ (Magnitude >= 1.25g)
[ ESPERANDO VALE (Fase Concêntrica / Subida) ]
    │
    ▼ (Magnitude <= 0.85g E tempo decorrido > 700ms)
[ REPETIÇÃO CONTADA (+1 REP) ]
    │
    ▼ (Atualiza Cadência RPM e retorna ao início)
[ ESPERANDO PICO ]
```

1. **Limiar de Subida (Pico - 1.25g)**: quando o músculo se contrai para erguer o peso, o braço acelera para cima, elevando a força resultante além de $1.25g$. O estado muda para `esperando_vale`.
2. **Limiar de Descida (Vale - 0.85g)**: ao chegar ao topo e iniciar a descida controlada (fase excêntrica), a força sobre o sensor diminui momentaneamente para valores inferiores a $0.85g$.
3. **Filtro de Debounce (700ms)**: nenhum exercício de musculação é executado com biomecânica válida em menos de 0.7 segundos. Se um pico e vale ocorrerem em intervalo menor, o sistema ignora, descartando tremores musculares ou pequenos ajustes de postura.
4. **Cálculo de Cadência (RPM)**: uma lista em memória armazena os timestamps das reps ocorridas nos últimos 30 segundos. A fórmula calcula:
   $$\text{RPM} = (\text{repetições nos últimos 30s}) \times 2$$

---

## 2. Sensor de Localização (GPS) e Ritmo de Pacing

### 2.1. Captura com Alta Precisão
Através do módulo `expo-location`, a função `watchPositionAsync` é iniciada com:
- `accuracy: Location.Accuracy.High` (triangulação GPS com alta resolução).
- `timeInterval: 1000` (atualização a cada 1 segundo).
- `distanceInterval: 2` (notificação a cada 2 metros de deslocamento).

### 2.2. Cálculo de Distância (Fórmula de Haversine)
A distância entre duas coordenadas esféricas consecutivas $(\text{lat}_1, \text{lon}_1)$ e $(\text{lat}_2, \text{lon}_2)$ é calculada pela fórmula de Haversine:

$$a = \sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1) \cdot \cos(\text{lat}_2) \cdot \sin^2\left(\frac{\Delta\text{lon}}{2}\right)$$
$$c = 2 \cdot \text{atan2}(\sqrt{a}, \sqrt{1-a})$$
$$\text{Distância (km)} = R \cdot c \quad (\text{onde } R = 6371 \, km)$$

Para evitar que erros de imprecisão de sinal de satélite gerem falsos quilômetros, saltos anômalos maiores que 50 metros em uma janela de 1 segundo são descartados.

### 2.3. Ritmo de Pacing (Minutos por Quilômetro)
O pacing representa quantos minutos e segundos o atleta leva para percorrer 1 quilômetro:
- Se a velocidade instantânea em metros por segundo for menor que $0.5 \, m/s$ ($1.8 \, km/h$), o aplicativo exibe `--'--"`, indicando repouso ou parada no semáforo.
- Se a velocidade for válida:
  $$\text{Segundos por km} = \frac{1000}{\text{velocidade (m/s)}}$$
  O valor é convertido para minutos inteiros e segundos restantes, formatado como:
  $$\text{MM'SS"} \quad (\text{exemplo: } 05'24" /km)$$

---

## 3. Sensor de Câmera (Expo Camera)

### 3.1. Arquitetura do `CameraView`
No Expo SDK 57, a API moderna de câmera utiliza o componente nativo `CameraView`:
- **Permissões em Tempo de Execução**: verificadas via `useCameraPermissions()`. Se negada, uma tela informativa permite re-solicitar a autorização nativa do sistema operacional (Android/iOS).
- **Controle de Hardware**:
  - `facing`: alterna entre a câmera traseira (`back`) para fotografar equipamentos/anilhas e a câmera frontal (`front`) para selfies pós-série.
  - `enableTorch`: ativa o LED contínuo do aparelho para ambientes com pouca iluminação.

### 3.2. Captura e Tratamento de Imagem
Ao disparar o botão do obturador:
1. `cameraRef.current.takePictureAsync({ quality: 0.85 })` captura a foto e armazena o arquivo temporário no cache do aplicativo.
2. A tela exibe uma pré-visualização instantânea para aprovação do usuário.
3. Um campo de texto permite adicionar anotações da série (ex: `"4x12 - 40kg cada lado"`).
4. O objeto fotográfico com id único, timestamp e URI é anexado à sessão e persistido no armazenamento local.

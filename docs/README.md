# PAM Fitness — Documentação da Arquitetura e Escopo

Aplicativo mobile desenvolvido em **React Native** com **Expo SDK 57** e **TypeScript**, focado em treinos com monitoramento por sensores de hardware do smartphone:
- **Sensor de Movimento (Acelerômetro)**: detecção e contagem de repetições no braço.
- **Sensor de Localização (GPS)**: distância, velocidade e ritmo de pacing em tempo real.
- **Sensor de Câmera**: registro fotográfico de cargas, repetições e equipamentos.

---

## 1. Definição Detalhada do Escopo

### Objetivo do Aplicativo
Oferecer ao atleta ou praticante de academia uma experiência esportiva completa, sem necessidade de smartwatches adicionais. O smartphone é colocado em uma braçadeira esportiva fixada no braço, servindo simultaneamente como:
1. **Contador biomecânico de repetições**: lê os eixos de movimentação do membro durante exercícios resistidos (rosca, elevação, supino, etc.).
2. **Computador de bordo de cardio/corrida**: calcula velocidade, distância acumulada e ritmo de pacing (min/km).
3. **Diário de bordo visual**: captura fotos com a câmera para comprovar e auditar séries, anilhas e máquinas utilizadas.

### Casos de Uso
1. **Treino de Força / Hipertrofia**:
   - Atleta prende o celular no braço.
   - Pressiona **Iniciar Treino**.
   - O acelerômetro monitora a contração e extensão muscular, incrementando as reps automaticamente e calculando a cadência em tempo real.
   - O usuário pode fotografar a carga na aba da câmera e salvar como anotação da série.
2. **Cardio / Corrida / Aquecimento**:
   - Na mesma sessão, o usuário alterna para a visualização de **GPS & Pacing**.
   - O GPS calcula a velocidade instantânea em km/h e converte para ritmo de pacing no padrão internacional de atletismo (`MM'SS" /km`).
   - Calcula a velocidade média e distância em quilômetros.
3. **Encerramento e Histórico**:
   - Ao finalizar, o usuário revisa o resumo consolidado no modal e confirma o salvamento.
   - Os dados são armazenados localmente no dispositivo via `@react-native-async-storage/async-storage`.
   - Na aba **Histórico**, o atleta acompanha a lista de treinos, fotos capturadas e totais agregados.

---

## 2. Estrutura de Pastas do Projeto

```text
App PAM/
├── docs/                           # documentacao completa do codigo e funcoes
│   ├── README.md                   # visao geral, arquitetura e escopo
│   ├── SENSORES.md                 # explicacao tecnica dos 3 sensores
│   ├── FUNCOES_REACT.md            # guia completo de funcoes e hooks react
│   └── GUIA_DE_CHAMADAS.md         # catalogo de funcoes e fluxo de dados
├── src/
│   ├── app/                        # telas e rotas do expo router
│   │   ├── _layout.tsx             # configuracao das abas nativas
│   │   ├── index.tsx               # tela principal: treino ativo e sensores
│   │   ├── camera.tsx              # tela de captura de foto com expo-camera
│   │   └── historico.tsx           # tela de historico e estatisticas
│   ├── constants/
│   │   └── theme.ts                # tokens de cores escuras atleticas e espacamentos
│   ├── hooks/                      # custom hooks de logica e sensores
│   │   ├── useWorkoutTimer.ts      # cronometro esportivo com pause/resume
│   │   ├── useArmMotionTracker.ts  # acelerometro e contador de repeticoes no braco
│   │   └── useLocationTracker.ts   # gps, distancia e ritmo de pacing
│   ├── services/                   # funcoes utilitarias e persistencia
│   │   ├── locationService.ts      # calculos de haversine, pacing e formatacao
│   │   └── storage.ts              # crud de sessoes via asyncstorage
│   └── types/
│       ├── workout.ts              # interfaces typescript de sessoes e sensores
│       └── declarations.d.ts       # declaracoes globais de tipos
├── app.json                        # configuracoes nativas e permissoes expo
└── package.json                    # dependencias e scripts
```

---

## 3. Padrão Visual e Tendências de Design Aplicadas

- **Minimalismo Esportivo Escuro (Dark Mode Atlântico)**:
  - Fundo `#09090B` e cartões `#141416` para economia de bateria e legibilidade sob luz de academia.
  - Acentos de alto contraste: **Neon Volt (`#CCFF00`)** para métricas de esforço e repetições, e **Cyber Cyan (`#38BDF8`)** para métricas de GPS.
- **Tipografia Funcional de Alta Escala**:
  - Dígitos em formato de 48px a 72px (`fontVariant: ['tabular-nums']`), permitindo leitura fácil mesmo com o celular fixado na braçadeira a 40cm do rosto.
- **Micro-indicadores Táteis**:
  - Pílulas de status e pontos luminosos em tempo real indicando se o GPS e o acelerômetro estão operando.

# PAM Fitness — Documentação da Arquitetura e Escopo

Aplicativo mobile desenvolvido em **React Native** com **Expo SDK 57** e **TypeScript**, focado em treinos com monitoramento por sensores de hardware do smartphone:
- **Sensor de Movimento (Acelerômetro MEMS)**: detecção e contagem automática de repetições e cadência no braço.
- **Sensor de Localização (GPS / GNSS)**: distância geodésica, velocidade e ritmo de pacing esportivo em tempo real.
- **Sensor Óptico (Câmera Nativa)**: registro fotográfico e auditoria de cargas, repetições e equipamentos.
- **Persistência Local Offline**: armazenamento local seguro no dispositivo via `@react-native-async-storage/async-storage`.

---

## 📸 Telas da Aplicação Real (Pasta `prints/`)

<table>
  <thead>
    <tr align="center">
      <th width="25%">Sensor de Braço (Reps)</th>
      <th width="25%">GPS & Pacing</th>
      <th width="25%">Câmera de Séries</th>
      <th width="25%">Histórico de Treinos</th>
    </tr>
  </thead>
  <tbody>
    <tr valign="top">
      <td>
        <img src="../prints/01_treino_sensor_braco.png" alt="Sensor de Braço" width="100%" />
        <br>
        <small>Detecção de repetições, cadência RPM e FSM de subida/descida.</small>
      </td>
      <td>
        <img src="../prints/02_treino_gps_pacing.png" alt="GPS & Pacing" width="100%" />
        <br>
        <small>Pacing instantâneo (min/km), velocidade e distância via Haversine.</small>
      </td>
      <td>
        <img src="../prints/03_camera_auditoria_reps.png" alt="Câmera de Séries" width="100%" />
        <br>
        <small>CameraView nativa, lanterna LED (torch) e anotações da série.</small>
      </td>
      <td>
        <img src="../prints/04_historico_sessoes.png" alt="Histórico" width="100%" />
        <br>
        <small>Totais agregados, persistência AsyncStorage e galeria de fotos.</small>
      </td>
    </tr>
  </tbody>
</table>

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
├── docs/                           # Documentação técnica e especificações acadêmicas
│   ├── PAM_Fitness_Documentacao_Completa.pdf # Manual técnico completo unificado em PDF
│   ├── build_documentation_pdf.py  # Script gerador do PDF consolidado
│   ├── README.md                   # Visão geral, arquitetura e escopo
│   ├── SENSORES.md                 # Explicação técnica dos 3 sensores
│   ├── FUNCOES_REACT.md            # Guia completo de funções e hooks React/Expo
│   └── GUIA_DE_CHAMADAS.md         # Catálogo de funções e fluxo de dados
├── prints/                         # Capturas de tela reais do aplicativo
│   ├── 01_treino_sensor_braco.png  # Tela principal: modo braço e reps
│   ├── 02_treino_gps_pacing.png    # Tela principal: modo GPS e pacing
│   ├── 03_camera_auditoria_reps.png # Tela da câmera: captura de foto de anilhas
│   └── 04_historico_sessoes.png    # Tela de histórico: métricas agregadas
├── src/
│   ├── app/                        # Telas e rotas do Expo Router
│   │   ├── _layout.tsx             # Configuração das abas nativas inferiores
│   │   ├── index.tsx               # Tela principal: treino ativo e sensores
│   │   ├── camera.tsx              # Tela de captura de foto com expo-camera
│   │   └── historico.tsx           # Tela de histórico e estatísticas
│   ├── constants/
│   │   └── theme.ts                # Tokens de cores escuras atléticas e espaçamentos
│   ├── hooks/                      # Custom hooks de lógica e sensores
│   │   ├── useWorkoutTimer.ts      # Cronômetro esportivo com pause/resume
│   │   ├── useArmMotionTracker.ts  # Acelerômetro e contador de repetições no braço
│   │   └── useLocationTracker.ts   # GPS, distância e ritmo de pacing
│   ├── services/                   # Funções utilitárias e persistência
│   │   ├── locationService.ts      # Cálculos de Haversine, pacing e formatação
│   │   └── storage.ts              # CRUD de sessões via AsyncStorage
│   └── types/
│       ├── workout.ts              # Interfaces TypeScript de sessões e sensores
│       └── declarations.d.ts       # Declarações globais de tipos
├── app.json                        # Configurações nativas e permissões Expo
└── package.json                    # Dependências e scripts
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

---

## 4. Manual Completo em PDF

O projeto dispõe de documentação técnica oficial unificada em PDF contendo árvores de arquitetura, diagrama de máquina de estados FSM, formulação matemática detalhada e checklist de avaliação:
- 📄 **[PAM_Fitness_Documentacao_Completa.pdf](PAM_Fitness_Documentacao_Completa.pdf)**

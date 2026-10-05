# 📐 Guia de Estrutura de Pastas e Arquitetura de Referência

> Este documento representa e detalha a estrutura de pastas e arquitetura observada no ambiente de desenvolvimento (IDE VS Code) da imagem de referência (`c078a731-1500-4d2a-a515-d5ec75e62bcf.jpeg`).  
> Esta estrutura atua como o **guia oficial** para mantermos a consistência e modularidade do nosso projeto React Native com Expo Router.

---

## 🗂️ 1. Representação da Estrutura de Pastas (IDE VS Code)

```text
ecommerce/
├── .expo/                               # Cache e metadados de compilação do Expo
├── .github/                             # Workflows de CI/CD e automações do GitHub
├── android/                             # Projeto nativo gerado para Android (CNG / Prebuild)
├── assets/                              # Recursos estáticos globais (imagens, ícones, splash)
├── ios/                                 # Projeto nativo gerado para iOS (CNG / Prebuild)
├── node_modules/                        # Dependências instaladas via npm / yarn
├── src/                                 # Código-fonte principal modularizado
│   ├── @types/                          # Tipagens globais e declarações TypeScript (.d.ts)
│   ├── app/                             # Roteamento baseado em arquivos (Expo Router)
│   │   ├── (app)/                       # Grupo de rotas protegidas (Usuários autenticados)
│   │   │   ├── admin.tsx                # Painel restrito para administradores (Role: ADMIN)
│   │   │   ├── dashboard.android.tsx    # Dashboard com otimizações nativas Android (Câmera, etc.)
│   │   │   └── dashboard.tsx            # Dashboard padrão / multiplataforma
│   │   ├── (auth)/                      # Grupo de rotas públicas de autenticação
│   │   │   ├── index.android.tsx        # Tela de Login com adaptações para Android
│   │   │   ├── index.tsx                # Tela de Login padrão / multiplataforma
│   │   │   └── register.tsx             # Tela de Cadastro de novos usuários
│   │   └── _layout.tsx                  # Layout raiz com providers globais e controle de rotas
│   ├── components/                      # Componentes visuais reutilizáveis de interface
│   ├── constants/                       # Constantes de design e configuração
│   │   └── colors.ts                    # Paleta de cores do sistema de design
│   ├── contexts/                        # Contextos do React para gerenciamento de estado global
│   │   └── AuthContext.tsx              # Contexto de autenticação, sessão, cookies e perfil/roles
│   └── integration/                     # Camada de comunicação com APIs e serviços externos
│       └── authIntegration.ts           # Integração de autenticação (JWT, cookies, mock endpoints)
├── .gitignore                           # Regras de exclusão do Git
├── AGENTS.md                            # Diretrizes de desenvolvimento para agentes de IA
├── app.json                             # Configurações do Expo e permissões nativas do app
├── package-lock.json                    # Bloqueio de versões exatas das dependências
├── package.json                         # Manifesto de dependências e scripts do projeto
└── tsconfig.json                        # Configuração do compilador TypeScript e aliases (@/*)
```

---

## 🔍 2. Detalhamento e Responsabilidade de Cada Diretório e Módulo

### 2.1. Raiz do Projeto
- **`app.json`**: Manifesto declarativo do Expo contendo o identificador do pacote, esquemas de navegação profunda, orientação de tela, ícones e declaração de permissões nativas (câmera, localização/GPS, armazenamento).
- **`tsconfig.json`**: Configurações de tipagem estrita do TypeScript e mapeamento de caminhos relativos para `@/*` apontando diretamente para `src/*`.
- **`AGENTS.md`**: Guia de boas práticas voltado à assistência inteligente de código (regras do Expo SDK, manuseio do Expo Router, EAS build).

### 2.2. Camada de Roteamento (`src/app/`)
Utiliza o **Expo Router** com o conceito de Route Groups (pastas entre parênteses que organizam a lógica sem alterar a URL pública):
1. **`_layout.tsx`**: Provedor mestre da aplicação. Envolve as rotas com o `AuthProvider` (`AuthContext`), gerenciando o redirecionamento automático entre o fluxo de autenticação `(auth)` e o fluxo autenticado `(app)`.
2. **Grupo `(auth)`**:
   - `index.tsx` / `index.android.tsx`: Ponto de entrada público para login de credenciais (e-mail/senha).
   - `register.tsx`: Formulário de registro de novos usuários.
3. **Grupo `(app)`**:
   - `dashboard.tsx` / `dashboard.android.tsx`: Painel principal acessado após autenticação bem-sucedida. Conforme observado no editor de código da imagem, integra chamada de serviço (`getMessage`), logout, verificação de roles (`isAdmin`) e recursos nativos (`expo-image-picker` / câmera).
   - `admin.tsx`: Rota protegida com controle de acesso baseado em função (RBAC), acessível somente se o usuário possuir o perfil `ADMIN`.

### 2.3. Camada de Estado e Autenticação (`src/contexts/` & `src/integration/`)
- **`AuthContext.tsx`**:
  - Fornece o hook `useAuth()`.
  - Mantém o estado da sessão: dados do usuário logado, roles/permissões (`USER`, `ADMIN`), tokens JWT.
  - Implementa persistência de sessão e cookies mockados/reais via storage seguro.
- **`authIntegration.ts`**:
  - Funções de integração assíncronas: `login(email, password)`, `register(...)`, `logout()`, `getMessage()`.
  - Simulação/geração de tokens JWT codificados.
  - Gerenciamento de cookies/cabeçalhos de autorização (`Authorization: Bearer <token>`).
  - Preparado para chaveamento transparente entre dados mockados e API REST externa.

### 2.4. Design Tokens (`src/constants/`)
- **`colors.ts`**: Exporta o objeto `Colors` contendo a paleta de cores primária, secundária, fundos e textos, garantindo consistência visual entre Android, iOS e Web.

---

## 💻 3. Análise do Código Aberto no Editor (`dashboard.android.tsx`)

Na imagem de referência, o arquivo aberto na IDE é o `src/app/(app)/dashboard.android.tsx`, no branch `feature/camera`:

```typescript
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getMessage, logout } from '@/integration/authIntegration';

export default function Dashboard() {
  const router = useRouter();
  const { auth, setAuth } = useAuth();

  const isAdmin = !auth?.roles.some((role) => role === 'ADMIN');

  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    fetchMessage();
  }, []);

  async function fetchMessage() {
    setError('');
    setIsLoading(true);

    try {
      const data = await getMessage();
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao obter mensagem');
    } finally {
      setIsLoading(false);
    }
  }
  // ...
}
```

### Principais Padrões Identificados:
1. **Controle de Acesso (RBAC):** `auth.roles.some((role) => role === 'ADMIN')` para habilitar ou restringir funcionalidades de administrador.
2. **Integração de Recursos Nativos:** Uso do `expo-image-picker` / câmera diretamente acoplado ao fluxo de fotos da dashboard.
3. **Comunicação Desacoplada:** Chamadas à camada `authIntegration` (`getMessage`, `logout`), mantendo a UI desacoplada da implementação de rede.
4. **Gerenciamento de Ciclo de Vida:** `useEffect` para busca de dados na montagem e controle explícito de estados de carregamento (`isLoading`, `isLoggingOut`).

---

## 🎯 4. Como Esta Guia Se Aplica ao Nosso Projeto

Para manter o nosso projeto (**PAM Fitness**) em total conformidade com esta estrutura de referência e com os requisitos:
1. Adotar a divisão de rotas em `(auth)` para login e registro, e `(app)` para o dashboard e painel de controle.
2. Integrar a camada de contexto `AuthContext` com autenticação JWT e gerenciamento de cookies/sessão.
3. Disponibilizar a rota `admin.tsx` com validação de perfil `ADMIN`.
4. Manter integrados os recursos nativos já desenvolvidos (GPS, Câmera e Acelerômetro de Treino) no dashboard e telas do aplicativo.
5. Centralizar tokens de cores em `src/constants/colors.ts`.

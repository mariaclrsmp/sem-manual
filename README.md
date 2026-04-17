# 🏠 Sem Manual

> **O app para quem está aprendendo a morar sozinho**
>
> 
> A vida adulta é um jogo Sem Manual e esse é o seu guia.

---

## 📱 Sobre o projeto

O **Sem Manual** é um assistente doméstico gamificado para quem está dando os primeiros passos morando sozinho. Em vez de apenas listas de tarefas, o app funciona como um companheiro de evolução: sugere o que fazer na casa hoje, ensina habilidades domésticas práticas, reage ao seu progresso e cresce junto com você.

A ideia central é simples: morar sozinho tem é um constante aprendizado e quase ninguém está preparado. O Sem Manual transforma esse processo em algo leve, guiado e até divertido.

---

## ✨ Funcionalidades

### 🎯 Diagnóstico de Vida Adulta

Ao entrar no app pela primeira vez, o usuário faz um quiz rápido que avalia seu nível de preparo doméstico. O resultado gera um card compartilhável com quatro níveis possíveis:

| Nível             | Descrição                                     |
| ----------------- | --------------------------------------------- |
| ☠️ Caos Total     | Atenção: a vida adulta é uma área de risco    |
| 🪴 Sobrevivendo   | Sabe o básico, mas ainda tem muito a aprender |
| 🏠 Independente   | Já tem a vida adulta bem encaminhada          |
| 👑 Mestre da Casa | Pronto para ensinar outras pessoas            |

### 🤖 Assistente Proativo

O app sugere automaticamente o que fazer com base nos seus hábitos:

- _"Faz 13 dias que você não limpa o banheiro"_
- _"Seu arroz deve estar acabando"_
- _"Sábado é dia de faxina geral"_

### 📋 Tarefas do Dia

Uma lista inteligente gerada automaticamente com base nas suas rotinas e no contexto do dia. Cada tarefa concluída dá XP e aproxima você do próximo nível.

### 🚨 Socorro Doméstico

Um botão de emergência para crises domésticas. O usuário toca, escolhe o problema e recebe uma solução em 30 segundos:

- Arroz queimou
- Mancha na roupa
- Ralo entupido
- Geladeira cheirando mal
- Queda de luz
- Cheiro de gás
- E muito mais

### 📚 Guias Práticos

Micro-tutoriais domésticos escritos para quem nunca aprendeu:

- Como limpar o fogão
- Como tirar cheiro da geladeira
- Como desentupir o ralo
- Como economizar no mercado
- Como trocar botijão de gás com segurança

### 🎮 Gamificação

- **XP** a cada tarefa concluída e guia lido
- **Níveis de evolução:** Iniciante → Aprendiz → Independente → Mestre
- **Conquistas** desbloqueáveis por comportamento real
- **Starter Pack compartilhável** gerado após o onboarding

### 📦 Starter Pack Personalizado

Após responder o onboarding, o app gera uma lista personalizada de itens essenciais baseada no seu perfil (tipo de moradia, se tem pet, estilo de vida). O resultado vira um card compartilhável.

---

## 🛠️ Stack Técnica

### Frontend

| Tecnologia                                                         | Uso                            |
| ------------------------------------------------------------------ | ------------------------------ |
| [Expo](https://expo.dev) + [React Native](https://reactnative.dev) | Framework mobile               |
| [Expo Router v3](https://expo.github.io/router)                    | Navegação file-based           |
| [TypeScript](https://www.typescriptlang.org)                       | Tipagem estática               |
| [NativeWind](https://www.nativewind.dev)                           | Estilização (Tailwind para RN) |
| [Zustand](https://zustand-demo.pmnd.rs)                            | Gerenciamento de estado        |
| [TanStack Query](https://tanstack.com/query)                       | Estado do servidor e cache     |
| [Nunito](https://fonts.google.com/specimen/Nunito)                 | Tipografia                     |

### Backend

| Tecnologia                                                              | Uso                                        |
| ----------------------------------------------------------------------- | ------------------------------------------ |
| [Supabase](https://supabase.com)                                        | Auth, banco de dados e API                 |
| PostgreSQL + RLS                                                        | Banco relacional com segurança por usuário |
| Supabase Edge Functions                                                 | Motor proativo e notificações              |
| [Expo Notifications](https://docs.expo.dev/push-notifications/overview) | Push notifications                         |
| [react-native-view-shot](https://github.com/gre/react-native-view-shot) | Cards compartilháveis                      |

---

## 🗂️ Estrutura do Projeto

```
sem-manual/
├── app/
│   ├── (auth)/
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/
│   │   ├── index.tsx        # Home — assistente do dia
│   │   ├── tasks.tsx
│   │   ├── guides.tsx
│   │   └── progress.tsx
│   ├── diagnostic/
│   │   ├── index.tsx        # Quiz de diagnóstico
│   │   └── result.tsx       # Resultado compartilhável
│   ├── emergency/
│   │   ├── index.tsx        # Socorro doméstico
│   │   └── [id].tsx         # Solução de emergência
│   ├── guides/
│   │   └── [id].tsx         # Guia individual
│   ├── onboarding/
│   │   ├── index.tsx
│   │   └── starter-pack.tsx # Starter pack compartilhável
│   └── _layout.tsx
│
├── src/
│   ├── components/
│   │   ├── ui/              # Button, Card, Badge, ProgressBar
│   │   └── features/        # ProactiveCard, TaskItem, XPNotification
│   ├── constants/           # theme, guides, achievements, diagnostic
│   ├── hooks/
│   ├── lib/
│   │   └── supabase.ts
│   ├── services/            # authService, tasksService, guidesService...
│   ├── stores/              # authStore, userStore, tasksStore...
│   └── types/               # database.ts, diagnostic.ts
│
├── supabase/
│   └── functions/
│       ├── generate-suggestions/
│       ├── process-xp/
│       └── send-notifications/
│
├── CLAUDE.md
├── .env.local               # não versionado
└── README.md
```

---

## 🗄️ Banco de Dados

| Tabela              | Descrição                                   |
| ------------------- | ------------------------------------------- |
| `profiles`          | Perfil, XP e nível de cada usuário          |
| `tasks`             | Tarefas do dia                              |
| `routines`          | Rotinas recorrentes                         |
| `events`            | Histórico de ações (base do motor proativo) |
| `achievements`      | Conquistas desbloqueadas                    |
| `guides_read`       | Guias já lidos                              |
| `daily_suggestions` | Sugestões geradas automaticamente           |
| `overdue_routines`  | View — rotinas atrasadas por usuário        |

Todas as tabelas utilizam **Row Level Security (RLS)** — cada usuário acessa apenas os próprios dados.

---

## 🚀 Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Expo CLI
- Conta no [Supabase](https://supabase.com)
- App [Expo Go](https://expo.dev/go) no celular (ou emulador)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/sem-manual.git
cd sem-manual

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Preencha EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY

# Inicie o projeto
npx expo start
```

### Configuração do Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute os scripts SQL da pasta `supabase/migrations/` no SQL Editor
3. Copie a **Project URL** e a **anon public key** para o `.env.local`
4. Habilite a extensão `pg_cron` em Database > Extensions (para o motor proativo)

---

## 🗺️ Roadmap

- [x] Design system e componentes base
- [x] Diagnóstico de vida adulta com card compartilhável
- [x] Tela home com assistente proativo
- [x] Socorro doméstico e guias práticos
- [x] Sistema de XP, níveis e conquistas
- [x] Starter Pack compartilhável
- [x] Integração com Supabase (auth + banco)
- [x] Motor de sugestões proativas (Edge Functions)
- [x] Push notifications
- [ ] Modo pet com controle de vacinas e ração
- [ ] Controle leve de gastos domésticos
- [ ] Modo mudança com controle de caixas e cômodos
- [ ] Sugestões de refeições simples e baratas
- [ ] Lista de mercado inteligente por receitas
- [ ] Versão premium

---

## 🎨 Identidade Visual

| Elemento              | Valor     |
| --------------------- | --------- |
| Verde principal       | `#5DBB8A` |
| Azul                  | `#4A6FA5` |
| Laranja (recompensas) | `#FF8C42` |
| Fundo                 | `#F6F7F9` |
| Texto                 | `#2E2E2E` |
| Tipografia            | Nunito    |
| Border radius padrão  | 16px      |

**Conceito:** a estética mistura o acolhedor de uma casa, o lúdico de um jogo e a limpeza de um app moderno — inspirado no Duolingo, Headspace e Todoist.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Se quiser sugerir uma feature, reportar um bug ou melhorar algo:

1. Faça um fork do repositório
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Faça commit das suas mudanças: `git commit -m 'feat: minha feature'`
4. Faça push: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

<div align="center">
  Feito com ❤️ e muito <code>npx expo start</code>
</div>

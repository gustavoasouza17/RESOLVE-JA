# Resolve Já
**Versão:** 0.2 — Draft  
**Status:** Em desenvolvimento  
**Última atualização:** 2026-05-30

---

## Visão Geral

- Marketplace web (mobile-first) que conecta clientes a profissionais autônomos de serviços locais, permitindo busca por categoria e localização, visualização de portfólio e avaliações, e início de contato via WhatsApp.

---

## Objetivos

- Permitir que clientes encontrem profissionais autônomos disponíveis na sua região em menos de 5 minutos
- Permitir que profissionais autônomos montem um perfil digital com portfólio e recebam solicitações sem precisar se divulgar ativamente
- Validar a hipótese de que clientes e profissionais se conectam pelo app (North Star: contatos via WhatsApp iniciados pelo app por semana)
- Reduzir a contratação de profissionais desconhecidos sem referências por meio de avaliações e fotos de trabalhos anteriores
- Oferecer uma interface acessível a usuários com baixa familiaridade digital

---

## Usuários

| Perfil | Descrição | Permissões |
|---|---|---|
| Cliente | Pessoa física que busca contratar um serviço | Buscar profissionais, visualizar perfis, iniciar contato via WhatsApp, avaliar profissional após serviço |
| Prestador | Profissional autônomo que oferece serviços | Criar perfil, adicionar foto e portfólio, definir categorias e área de atendimento, visualizar e responder solicitações, avaliar cliente |
| Administrador | Membro da equipe do Resolve Já | Visualizar todos os perfis, excluir contas, gerenciar categorias, visualizar e responder denúncias |

> ⚠️ Nota dos mockups: a tela de onboarding (S01) exibe uma dica "Você pode ter ambos os perfis! Prestadores também podem contratar outros profissionais." — confirmar se isso é suportado na v1 ou apenas comunicação de roadmap.

---

## Stack Técnica

| Camada | Tecnologia | Motivo |
|---|---|---|
| Frontend framework | React 18 + Vite | Build rápido via ESBuild; hot reload nativo; padrão atual para SPAs web |
| Linguagem | TypeScript | Tipagem estática reduz bugs em tempo de desenvolvimento; compatível com React |
| Estilização | CSS Modules ou Tailwind CSS | Escopo de estilos por componente; evita conflitos globais |
| Roteamento | React Router v6 | Roteamento client-side para SPA; suporte a rotas protegidas por perfil |
| Backend / BaaS | Firebase (Firestore, Storage, Auth, Functions) | Solução integrada gratuita no tier inicial; elimina necessidade de servidor próprio |
| Autenticação | Firebase Authentication (e-mail/senha + SMS) | Suporte nativo a múltiplos métodos; integração direta com Firestore |
| Armazenamento de imagens | Firebase Storage | Armazenamento de fotos de perfil e portfólio; integrado ao projeto Firebase |
| Geolocalização | Browser Geolocation API + Google Maps JS API | API nativa do browser (sem dependência extra); Maps JS API para mapa e distância |
| Hospedagem | Firebase Hosting | Deploy via CLI; integrado ao projeto Firebase; CDN global gratuito no tier Spark |

---

## Ambiente

- Plataforma: browser web (Chrome, Safari, Firefox — versões dos últimos 2 anos)
- Design: mobile-first; layout otimizado para smartphones
- Tamanho mínimo de tela: 375px de largura (iPhone SE)
- Dispositivos prioritários: smartphones Android e iOS via browser
- Conexão: deve funcionar em redes 3G lentas (público-alvo inclui regiões periféricas)
- Acesso admin: desktop (não é necessário layout mobile para o painel admin)

---

## Identidade Visual e Design System

### Paleta de Cores

| Token | Hex | Uso |
|---|---|---|
| `--color-primary` | `#FFD900` | Botões de ação principal, destaques, badges ativos |
| `--color-navy` | `#1A2B4C` | Navbar, cabeçalhos, textos sobre fundo claro |
| `--color-white` | `#FFFFFF` | Fundo principal das telas |
| `--color-bg-light` | `#F0F0F8` | Fundo secundário (lavanda claro, visto nos mockups) |
| `--color-text-body` | `#333333` | Texto corrido (inferido dos mockups) |
| `--color-text-muted` | `#888888` | Labels, subtítulos, placeholders |
| `--color-star` | `#FFB800` | Ícone de estrela de avaliação (inferido dos mockups) |

> ⚠️ As cores `--color-bg-light`, `--color-text-body`, `--color-text-muted` e `--color-star` foram inferidas dos mockups — confirmar valores exatos com o arquivo Figma.

### Tipografia

| Papel | Fonte | Peso | Uso |
|---|---|---|---|
| Títulos e marca | Montserrat | 700 (Bold) | H1, H2, nome da marca, títulos de tela |
| Subtítulos | Montserrat | 600 (SemiBold) | H3, labels de seção |
| Corpo e descrições | Roboto Regular | 400 | Parágrafos, descrições, conteúdo geral |
| Labels de interface | Roboto Regular | 400–500 | Botões, inputs, badges |

- Importar via Google Fonts: `Montserrat:wght@600;700` e `Roboto:wght@400;500`
- Aplicar via variáveis CSS:
  - `--font-heading: 'Montserrat', sans-serif`
  - `--font-body: 'Roboto', sans-serif`

### Regras de Uso da Marca

- Utilizar apenas as cores oficiais `#FFD900`, `#1A2B4C` e `#FFFFFF`
- Manter proporção original da logo; não distorcer, girar ou inclinar
- Aplicar sempre em fundos com bom contraste
- Não aplicar efeitos (sombra exagerada, degradê, filtros) sobre a logo
- Não alterar a tipografia original da logo

### Componentes Visuais Observados nos Mockups

- Botão primário: fundo `#FFD900` (ou `#7B2FF7` roxo — ver nota), texto escuro, border-radius grande (~24px), largura total no mobile
- Botão secundário: fundo branco, borda sutil, border-radius grande
- Cards de categoria: ícone em fundo roxo/gradiente, nome em bold, seta `→` à direita
- Cards de profissional: foto grande no topo, badge de avaliação `★ 4.9` sobreposto, nome, ícones de "serviços realizados" e "distância" abaixo
- Navbar superior: logo à esquerda + botão "Entrar / Cadastrar" à direita (visão pública)
- Background padrão: `#F0F0F8` (lavanda claro), não branco puro
- Banner de destaque: gradiente roxo→azul com estatísticas `500+ Profissionais | 5.0 Avaliação média | 10k+ Atendimentos`

> ⚠️ Os mockups mostram roxo (`#7B2FF7` aproximado) como cor primária de botões e ícones, divergindo do `#FFD900` definido no brandbook. Confirmar com o time qual paleta é a atual — o brandbook pode estar desatualizado em relação ao Figma.

---

## Estrutura de Navegação

| ID | Rota | Tela | Perfil de acesso | Descrição |
|---|---|---|---|---|
| S01 | `/` | OnboardingScreen | Público | Landing page com hero, estatísticas, toggle Mapa/Lista e categorias; botão "Entrar / Cadastrar" |
| S02 | `/login` | LoginScreen | Público | Login com e-mail/senha |
| S03 | `/cadastro` | RegisterScreen | Público | Seleção de perfil (cliente ou prestador) + formulário de cadastro |
| S04 | `/home` | HomeScreen | Cliente | Feed com profissionais próximos, mapa e barra de busca |
| S05 | `/buscar/:categoria` | SearchScreen | Cliente | Busca por palavra-chave e filtro por categoria e bairro/raio |
| S06 | `/profissional/:id` | ProfessionalProfileScreen | Cliente | Perfil completo do prestador |
| S07 | `/proposta/:profissionalId` | RequestScreen | Cliente | Envio de proposta/orçamento ao prestador |
| S08 | `/avaliar/:proposalId` | ReviewScreen | Cliente | Avaliação do serviço após conclusão |
| S09 | `/perfil` | ClientProfileScreen | Cliente | Perfil do cliente e histórico |
| S10 | `/prestador/home` | ProfessionalHomeScreen | Prestador | Feed de solicitações recebidas |
| S11 | `/prestador/perfil` | ProfessionalProfileEditScreen | Prestador | Edição de perfil, portfólio e disponibilidade |
| S12 | `/prestador/proposta/:proposalId` | ProposalScreen | Prestador | Visualização e resposta a proposta recebida |
| S13 | `/admin` | AdminDashboardScreen | Administrador | Painel de controle; acesso via botão "Acesso Admin" na navbar |

```
resolve-ja/
├── public/
│   └── favicon.ico
├── src/
│   ├── pages/
│   │   ├── public/
│   │   │   ├── OnboardingPage.tsx        # S01
│   │   │   ├── LoginPage.tsx             # S02
│   │   │   └── RegisterPage.tsx          # S03
│   │   ├── client/
│   │   │   ├── HomePage.tsx              # S04
│   │   │   ├── SearchPage.tsx            # S05
│   │   │   ├── ProfessionalProfilePage.tsx # S06
│   │   │   ├── RequestPage.tsx           # S07
│   │   │   ├── ReviewPage.tsx            # S08
│   │   │   └── ClientProfilePage.tsx     # S09
│   │   ├── professional/
│   │   │   ├── ProfessionalHomePage.tsx  # S10
│   │   │   ├── ProfessionalProfileEditPage.tsx # S11
│   │   │   └── ProposalPage.tsx          # S12
│   │   └── admin/
│   │       └── AdminDashboardPage.tsx    # S13
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── StarRating.tsx
│   │   │   └── Badge.tsx
│   │   ├── molecules/
│   │   │   ├── ProfessionalCard.tsx
│   │   │   ├── CategoryCard.tsx
│   │   │   ├── CategoryFilter.tsx
│   │   │   ├── PortfolioGrid.tsx
│   │   │   ├── ReviewCard.tsx
│   │   │   ├── ProposalCard.tsx
│   │   │   └── StatsBanner.tsx
│   │   └── organisms/
│   │       ├── Navbar.tsx
│   │       └── MapView.tsx
│   ├── router/
│   │   ├── AppRouter.tsx
│   │   └── ProtectedRoute.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLocation.ts
│   │   └── useProfessionals.ts
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── auth.ts
│   │   ├── professionals.ts
│   │   └── reviews.ts
│   ├── types/
│   │   └── index.ts
│   ├── constants/
│   │   └── categories.ts
│   ├── styles/
│   │   └── tokens.css          # variáveis CSS de cor, fonte, espaçamento
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Telas — Requisitos Detalhados

### S01 — OnboardingScreen (Landing Page Pública)

| Elemento | Tipo | Comportamento / Validação |
|---|---|---|
| Navbar | Organism | Logo "ResolvaJá" à esquerda; botão "Acesso Admin" à direita (apenas desktop); botão "Entrar / Cadastrar" à direita |
| Badge de boas-vindas | Texto | "✨ Conectando você aos melhores profissionais" [mockup only — confirmar] |
| Título hero | H1 | "Buscando qual **serviço?**" — "serviço?" em cor primária |
| Subtítulo | Texto | "Encontre profissionais qualificados, avaliados e próximos de você em segundos" |
| Toggle Mapa / Lista | SegmentedControl | Dois botões: "Ver Mapa" e "Ver Lista"; troca modo de exibição dos resultados abaixo |
| Grid de categorias | CategoryCard list | Ícone em fundo roxo/gradiente, nome da categoria, subtítulo "Profissionais verificados e avaliados", seta `→`; categorias visíveis: Pedreiro, Encanador, Marceneiro (e mais) |
| Banner de estatísticas | StatsBanner | Fundo gradiente roxo→azul; "Mais segurança em suas pesquisas!"; métricas: 500+ Profissionais, 5.0 Avaliação média, 10k+ Atendimentos [mockup only — confirmar valores reais] |
| Botão "Entrar / Cadastrar" (navbar) | Button | Navega para `/login` |

- Edge case: usuário já autenticado → redirecionar para `/home` (cliente) ou `/prestador/home` (prestador)
- Edge case (S03 mockup): exibir card informativo "💡 Você sabia? Você pode ter ambos os perfis! Prestadores também podem contratar outros profissionais." [mockup only — confirmar se suportado na v1]

---

### S02 — LoginScreen

| Elemento | Tipo | Comportamento / Validação |
|---|---|---|
| Badge "Bem-vindo ao nosso serviço" | Texto decorativo | Exibido acima do título hero [mockup only] |
| Título hero repetido | H1 | "Buscando qual serviço?" — mesmo da landing page, visível ao fundo no layout desktop |
| Card de login | Card | Container branco centralizado com título "Entrar" e subtítulo "Entre com suas credenciais" |
| Campo e-mail | Input (email) | Placeholder "seu@email.com"; obrigatório; validar formato |
| Campo senha | Input (password) | Placeholder "••••••••"; obrigatório; mínimo 6 caracteres |
| Botão "Entrar" | Button primário | Chama Firebase Auth; redireciona conforme perfil |
| Link "Esqueceu a senha?" | Link roxo | Envia e-mail de redefinição via Firebase Auth |
| Texto "Não tem uma conta?" | Texto + Link | Link "Criar Conta" com borda; navega para `/cadastro` |
| Banner de estatísticas | StatsBanner | Mesmo componente da S01; visível abaixo do card no mobile |

- Edge case: credenciais inválidas → mensagem inline "E-mail ou senha incorretos"
- Edge case: sem conexão → "Sem conexão. Tente novamente."
- Edge case: conta suspensa → "Conta suspensa. Entre em contato com o suporte."

---

### S03 — RegisterScreen

| Elemento | Tipo | Comportamento / Validação |
|---|---|---|
| Logo + subtítulo | Header | "Conecta Serviços" (nome provisório nos mockups); subtítulo "Conectando você aos melhores profissionais" |
| Título do card | H2 | "Bem-vindo!" |
| Subtítulo do card | Texto | "Como você deseja acessar a plataforma?" |
| Card "Sou Cliente" | SelectionCard | Ícone de pessoa (fundo roxo); "Preciso contratar um profissional"; seta `→` |
| Card "Sou Prestador de Serviço" | SelectionCard | Ícone de maleta (fundo gradiente roxo-rosa); "Quero oferecer meus serviços"; seta `→` |
| Dica "Você sabia?" | InfoCard | "💡 Você pode ter ambos os perfis! Prestadores também podem contratar outros profissionais." [mockup only — confirmar] |
| Formulário de cadastro | Form | Exibido após seleção do perfil (ou em tela separada) |
| Campo nome completo | Input (text) | Obrigatório; mínimo 3 caracteres |
| Campo e-mail | Input (email) | Obrigatório; validar formato; verificar unicidade no Firestore |
| Campo telefone | Input (tel) | Obrigatório; formato brasileiro (11 dígitos) |
| Campo CPF | Input (text) | Obrigatório; validar dígitos verificadores; impedir duplicatas |
| Campo senha | Input (password) | Obrigatório; mínimo 6 caracteres |
| Campo confirmação de senha | Input (password) | Obrigatório; deve coincidir com senha |
| Checkbox de aceite de termos | Checkbox | Obrigatório para prosseguir |
| Botão "Cadastrar" | Button primário | Valida todos os campos; cria conta no Firebase Auth e documento no Firestore |

- Edge case: CPF já cadastrado → "CPF já utilizado em outra conta"
- Edge case: e-mail já cadastrado → "E-mail já cadastrado. Faça login."
- Edge case: senhas não coincidem → inline error abaixo do campo de confirmação

---

### S04 — HomeScreen (Cliente)

| Elemento | Tipo | Comportamento / Validação |
|---|---|---|
| Navbar autenticada | Organism | Logo + nome do usuário + ícone de perfil |
| Saudação | Texto | "Olá, Cliente!" + subtítulo "O que você quer fazer hoje?" [mockup only] |
| Barra de busca | Input (search) | Navega para `/buscar/:categoria` ao submeter |
| Toggle Mapa / Lista | SegmentedControl | Mesmo da S01; troca visualização |
| Grid de categorias | CategoryCard list | Ícones por categoria; ao clicar navega para `/buscar/:categoria` |
| Mapa com pins de profissionais | MapView | Exibe prestadores próximos via Geolocation API; visível quando "Ver Mapa" selecionado |
| Lista de profissionais próximos | ProfessionalCard list | Visível quando "Ver Lista" selecionado |
| Botão de relocalizar | IconButton | Recentra o mapa na posição atual |

- Edge case: permissão de localização negada → exibir campo para digitar CEP ou bairro
- Edge case: nenhum profissional na área → "Nenhum profissional encontrado nesta área ainda."
- Edge case: sem conexão → resultados em cache com banner "Resultados offline"

---

### S05 — SearchScreen (Lista de Profissionais por Categoria)

| Elemento | Tipo | Comportamento / Validação |
|---|---|---|
| Navbar com botão "← Voltar" | Navbar | Título central com nome da categoria (ex.: "Pedreiro"); ícone de filtros `⊞` à direita |
| Título | H2 | "Profissionais perto de você" |
| Contador de resultados | Texto | "X profissionais encontrados" |
| Cards de profissional | ProfessionalCard | Foto grande (hero), badge de avaliação `★ X.X` sobreposto no canto; nome, ícone de maleta + "X serviços realizados", ícone de pin + "X.Xkm de distância"; link "Ver perfil completo →" |
| Filtro de ordem/categoria | Dropdown | Ordenar por: avaliação, distância [texto only — confirmar] |
| Estado vazio | Texto + ícone | "Nenhum profissional encontrado. Tente outra categoria ou área." |

- Edge case: busca sem resultados → sugestões de categorias próximas
- Edge case: campo de busca vazio → todos os profissionais por proximidade
- Nota dos mockups: cada ProfessionalCard mostra foto como imagem de capa (não avatar circular) — ajustar componente

---

### S06 — ProfessionalProfileScreen

| Elemento | Tipo | Comportamento / Validação |
|---|---|---|
| Foto de perfil | Avatar grande | Obrigatória; exibida em destaque |
| Nome e avaliação | H2 + StarRating | Ex.: "Carlos Mendes — ★ 4.8 (127 avaliações)" |
| Subtítulo de categoria | Texto | Ex.: "Pedreiro Profissional" |
| Dados rápidos | InfoRow | "12 anos de atuação", "R$ 240–380/dia" (ou similar) [mockup only — confirmar campos] |
| Agenda de disponibilidade | CalendarGrid | Mês atual com dias disponíveis marcados [mockup only — confirmar] |
| Portfólio | PortfolioGrid | Grade de fotos de trabalhos anteriores; clique abre fullscreen |
| Avaliações | ReviewCard list | Lista de avaliações com avatar, nome, estrelas e comentário |
| Botão "Enviar Proposta" | Button primário | Navega para `/proposta/:profissionalId` |
| Botão "Contatar no WhatsApp" | Button secundário | Abre `https://wa.me/<numero>` em nova aba |
| Botão "Denunciar perfil" | Link discreto | Abre modal de denúncia |

- Edge case: portfólio vazio → "Nenhuma foto adicionada ainda."
- Edge case: sem avaliações → "Ainda sem avaliações."
- Edge case: sem WhatsApp → ocultar botão de WhatsApp

---

### S07 — RequestScreen

| Elemento | Tipo | Comportamento / Validação |
|---|---|---|
| Campo de descrição do serviço | Input (textarea) | Obrigatório; mínimo 20 caracteres |
| Campo de endereço | Input (text) | Obrigatório; onde o serviço será realizado |
| Campo de data desejada | DatePicker | Obrigatório; não pode ser data passada |
| Campo de orçamento estimado | Input (number) | Opcional; valor em R$ |
| Botão "Enviar proposta" | Button primário | Cria documento em `proposals` no Firestore |

- Edge case: prestador offline há mais de 7 dias → aviso "Este profissional pode estar inativo"
- Edge case: proposta já enviada na mesma semana → "Você já enviou uma proposta recentemente."

---

### S08 — ReviewScreen

| Elemento | Tipo | Comportamento / Validação |
|---|---|---|
| Título | H2 | "Avaliar Profissional" [mockup only] |
| Pergunta | Texto | "Como foi o serviço prestado?" [mockup only] |
| Avaliação por estrelas | StarRating interativo | Obrigatório; 1 a 5 estrelas; estrelas ficam amarelas ao selecionar |
| Campo de comentário | Input (textarea) | Opcional; máximo 500 caracteres |
| Botão "Enviar Avaliação" | Button primário | Salva review no Firestore; atualiza média |
| Botão "Finalizar Avaliação" ou "Pular" | Button secundário | Permite dispensar avaliação |

- Edge case: avaliação já enviada → somente leitura
- Edge case: comentário ofensivo → filtro de palavras antes de salvar [texto only — confirmar]

---

### S09 — ClientProfileScreen

| Elemento | Tipo | Comportamento / Validação |
|---|---|---|
| Foto de perfil | Avatar | Upload opcional |
| Nome e cidade | Texto | Dados básicos do cliente |
| Histórico de serviços | Lista | Serviços com status: concluído, em andamento, cancelado |
| Avaliações recebidas | ReviewCard list | Avaliações de prestadores sobre o cliente |
| Botão "Editar perfil" | Button | Abre campos de edição |
| Botão "Sair" | Button | Logout no Firebase Auth; redireciona para `/` |

---

### S10 — ProfessionalHomeScreen

| Elemento | Tipo | Comportamento / Validação |
|---|---|---|
| Navbar com avatar | Organism | Avatar + nome + atalho para S11 |
| Seção "Novas Oportunidades" | H2 | [mockup only — confirmar label] |
| Feed de propostas recebidas | ProposalCard list | Nome do cliente, descrição do serviço, orçamento sugerido, botão de ação; badge com não lidas |
| Clientes próximos buscando o serviço | Card list | Clientes com demanda na categoria do prestador [texto only — confirmar] |
| Resumo de desempenho | StatsCard | "Desempenho Semanal: R$ 4.250 | 12 serviços | 85% satisfação" [mockup only — confirmar] |
| Banner premium | BannerCard | "Oportunidade Premium — Visibilidade Elite" [mockup only] |

- Edge case: nenhuma proposta → "Seu perfil está ativo. Aguarde novas solicitações."

---

### S11 — ProfessionalProfileEditScreen

| Elemento | Tipo | Comportamento / Validação |
|---|---|---|
| Upload de foto de perfil | ImageUpload | Obrigatório; JPEG/PNG; máximo 5MB |
| Campo de bio / descrição | Input (textarea) | Opcional; máximo 300 caracteres |
| Seleção de categorias | MultiSelect | Ao menos 1 categoria obrigatória |
| Upload de portfólio | ImageUpload (múltiplos) | 0 a 10 fotos (free) ou 30 (premium) |
| Campo de bairros de atendimento | TagsInput | Ao menos 1 bairro obrigatório |
| Grade de disponibilidade semanal | CheckboxGrid | Dias da semana × turnos (manhã / tarde / noite) |
| Campo de WhatsApp | Input (tel) | Obrigatório para habilitar botão de contato |
| Campo de valor por dia / hora | Input (number) | Opcional; exibido no perfil [mockup only] |
| Botão "Salvar" | Button primário | Valida campos obrigatórios; atualiza Firestore |

- Edge case: sem foto ao salvar → "Foto de perfil obrigatória para publicar o perfil."
- Edge case: falha no upload → "Erro ao enviar imagem. Tente novamente."

---

### S12 — ProposalScreen (Prestador)

| Elemento | Tipo | Comportamento / Validação |
|---|---|---|
| Dados do cliente | Avatar + nome + avaliação | Link para perfil do cliente |
| Descrição do serviço | Texto | Somente leitura |
| Endereço e data desejada | Texto | Somente leitura |
| Orçamento sugerido | Texto | Somente leitura; pode estar vazio |
| Campo de contra-proposta | Input (number) | Opcional; valor em R$ |
| Botão "Aceitar e chamar no WhatsApp" | Button primário | Registra match no Firestore; abre WhatsApp do cliente |
| Botão "Recusar" | Button secundário | Atualiza status para "recusada" |

---

### S13 — AdminDashboardScreen

| Elemento | Tipo | Comportamento / Validação |
|---|---|---|
| Navbar com logo | Organism | Link "Acesso Admin" visível na navbar da landing page |
| Cards de KPIs | StatsCard | Usuários totais, profissionais ativos, serviços realizados, receita total [mockup only — confirmar campos] |
| Gráfico de crescimento | LineChart | Evolução de cadastros ao longo do tempo [mockup only] |
| Lista de usuários recentes | DataTable | Foto, nome, perfil, status, ações |
| Lista de denúncias pendentes | DataTable | Denunciante, denunciado, motivo, data, botões de ação |
| Botão "Ver perfil" | Button | Abre perfil do denunciado |
| Botão "Suspender conta" | Button | Define `status: suspended` no Firestore |
| Botão "Excluir conta" | Button destrutivo | Exige confirmação; deleta Firestore + Firebase Auth |
| Gerenciamento de categorias | CRUD list | Adicionar, renomear ou desativar categorias |
| Campo de busca de perfis | Input (search) | Busca por nome, e-mail ou CPF |

- Edge case: suspender conta já suspensa → botão desabilitado
- Nota: layout admin pode ser desktop-first (sidebar lateral) — confirmar com o time

---

## Modelo de Dados

```json
// Coleção: users
{
  "uid": "abc123",
  "nome": "Alessandro Ferreira",
  "email": "alessan@email.com",
  "telefone": "11999990000",
  "cpf": "***.***.***-**",
  "perfil": "cliente",
  "fotoUrl": "https://storage.firebase.../foto.jpg",
  "cidade": "São Paulo",
  "status": "ativo",
  "criadoEm": "2026-01-15T10:00:00Z"
}
```

```json
// Coleção: professionals
{
  "uid": "def456",
  "userId": "def456",
  "nome": "Carlos Mendes",
  "bio": "Pedreiro com 12 anos de experiência em reformas residenciais.",
  "fotoUrl": "https://storage.firebase.../perfil.jpg",
  "whatsapp": "11988880000",
  "categorias": ["Pedreiro", "Reformas"],
  "bairrosAtendimento": ["Jardim São Paulo", "Vila Maria"],
  "portfolio": [
    "https://storage.firebase.../foto1.jpg",
    "https://storage.firebase.../foto2.jpg"
  ],
  "disponibilidade": {
    "segunda": ["manha", "tarde"],
    "terca": ["tarde"],
    "sabado": ["manha"]
  },
  "totalServicos": 203,
  "distanciaKm": 1.2,
  "avaliacaoMedia": 4.9,
  "totalAvaliacoes": 127,
  "valorDiaria": "R$ 240–380",
  "plano": "free",
  "status": "ativo",
  "criadoEm": "2026-01-10T08:00:00Z"
}
```

```json
// Coleção: proposals
{
  "id": "prop789",
  "clienteId": "abc123",
  "prestadorId": "def456",
  "descricao": "Reforma do banheiro — troca de azulejo e instalação de box.",
  "endereco": "Rua das Flores, 123 — Jardim São Paulo",
  "dataDesejada": "2026-02-10",
  "orcamentoCliente": 800.00,
  "contraPropostaPrestador": 950.00,
  "status": "aceita",
  "criadoEm": "2026-02-05T14:30:00Z",
  "atualizadoEm": "2026-02-05T16:00:00Z"
}
```

```json
// Coleção: reviews
{
  "id": "rev001",
  "autorId": "abc123",
  "destinatarioId": "def456",
  "proposalId": "prop789",
  "estrelas": 5,
  "comentario": "Ótimo profissional, pontual e resolveu o problema na hora.",
  "tipoAutor": "cliente",
  "criadoEm": "2026-02-11T09:00:00Z"
}
```

```json
// Coleção: reports
{
  "id": "rep001",
  "denuncianteId": "abc123",
  "denunciadoId": "def456",
  "motivo": "Perfil falso — fotos não correspondem ao serviço prestado.",
  "status": "pendente",
  "criadoEm": "2026-02-12T11:00:00Z"
}
```

```json
// Coleção: categories
{
  "id": "cat01",
  "nome": "Pedreiro",
  "icone": "hammer",
  "ativa": true
}
```

---

## Requisitos Funcionais

### Autenticação
1. O sistema deve permitir cadastro com nome, e-mail, telefone, CPF e senha
2. O CPF deve ser validado (dígitos verificadores) e único no sistema
3. O sistema deve permitir login com e-mail e senha
4. O sistema deve enviar e-mail de redefinição de senha
5. O perfil (cliente ou prestador) é definido no cadastro e não pode ser alterado pelo usuário na v1

### Perfil do Prestador
6. O prestador deve adicionar foto de perfil obrigatória para publicar o perfil
7. O prestador pode adicionar até 10 fotos de portfólio (plano free) ou 30 (plano premium)
8. O prestador deve definir ao menos 1 categoria e 1 bairro de atendimento
9. O prestador deve informar número de WhatsApp para habilitar o botão de contato
10. O prestador pode definir disponibilidade semanal por turno

### Busca e Match
11. O cliente pode buscar profissionais por palavra-chave e categoria
12. O sistema deve exibir profissionais próximos no mapa usando a Geolocation API do browser
13. O cliente pode informar CEP ou bairro manualmente caso recuse permissão de GPS
14. O sistema deve exibir distância e quantidade de serviços realizados nos cards de resultado

### Proposta e Contato
15. O cliente pode enviar uma proposta ao prestador com descrição, endereço, data desejada e orçamento
16. O prestador pode aceitar ou recusar propostas recebidas
17. Ao aceitar, o sistema deve registrar o match no Firestore e abrir o WhatsApp do cliente
18. O status da proposta deve ser atualizado no Firestore (pendente, aceita, recusada)

### Avaliação
19. Após conclusão de serviço, o cliente pode avaliar o prestador com 1 a 5 estrelas e comentário opcional
20. O prestador pode avaliar o cliente após o serviço
21. A avaliação média do prestador deve ser atualizada automaticamente
22. Cada usuário pode avaliar o outro apenas uma vez por proposta

### Denúncia e Moderação
23. Qualquer usuário pode denunciar um perfil informando o motivo
24. O administrador pode visualizar denúncias pendentes no painel
25. O administrador pode suspender ou excluir contas
26. Contas suspensas não conseguem fazer login
27. O administrador pode gerenciar (adicionar, editar, desativar) categorias

---

## Requisitos Não-Funcionais

| Categoria | Requisito |
|---|---|
| Performance | Páginas devem carregar em no máximo 5 segundos em conexão 3G |
| Performance | Busca deve retornar resultados em no máximo 5 segundos |
| Performance | Bundle JS inicial < 200KB gzipped (usar code splitting por rota via React Router lazy) |
| Segurança | Senhas gerenciadas pelo Firebase Auth (hash bcrypt) |
| Segurança | CPF armazenado com mascaramento parcial; acesso restrito ao Admin |
| Segurança | Regras do Firestore devem bloquear leitura/escrita não autorizada por perfil |
| Segurança | Firebase Storage com regras de acesso autenticado para portfólio |
| Responsividade | Layout mobile-first; largura mínima 375px |
| Responsividade | Componentes adaptam-se de 375px a 1440px sem overflow horizontal |
| Acessibilidade | Todos os botões e inputs com `aria-label` descritivo |
| Acessibilidade | Contraste mínimo 4.5:1 entre texto e fundo (WCAG AA) |
| Persistência | Dados de perfil, propostas e avaliações persistidos no Firestore |
| Persistência | Imagens persistidas no Firebase Storage com URL pública estável |
| LGPD | Exibir política de privacidade e solicitar aceite no cadastro |
| LGPD | Usuário pode solicitar exclusão total de conta e dados pelo sistema |

---

## Regras de Responsividade

| Breakpoint | Comportamento do layout |
|---|---|
| 375px (base mobile) | Coluna única; cards 100% da largura; padding horizontal 16px; mapa altura fixa 220px |
| 390px–428px | Mesmo layout; padding horizontal aumenta para 20px |
| 768px (tablet) | Grid de 2 colunas para cards de profissional; navbar com mais itens visíveis |
| 1024px+ (desktop) | Layout de 2 colunas na landing (hero + card de login); sidebar no painel admin; grid de 3 colunas para cards |

---

## Fora do Escopo (v1)

- Pagamento in-app (cartão, PIX ou carteira digital)
- Chat interno entre cliente e prestador (comunicação ocorre via WhatsApp)
- Geolocalização em tempo real do prestador durante execução do serviço
- Verificação de identidade por documento (reconhecimento facial ou upload de RG)
- Garantia financeira de serviço pela plataforma
- Mediação de disputas financeiras entre as partes
- Suporte a múltiplas cidades simultâneas no lançamento
- Notificações push
- Perfil para pessoa jurídica ou equipes
- Login via redes sociais (Google, Facebook)
- Exportação de histórico de serviços
- Sistema de fidelidade ou cashback
- Aplicativo nativo (iOS/Android via loja de apps) — v1 é web

---

## Questões em Aberto

| ID | Questão | Impacto |
|---|---|---|
| Q01 | O CPF será armazenado criptografado ou apenas mascarado na exibição? | Segurança e conformidade LGPD |
| Q02 | Qual é o limite de propostas simultâneas que um cliente pode enviar? | Regra de negócio; pode impactar plano premium |
| Q03 | O prestador pode ter mais de uma categoria? Quantas no plano free? | Modelo de dados e monetização |
| Q04 | Como o sistema sabe que o serviço foi concluído para liberar a avaliação? | Fluxo de ReviewScreen; atualmente manual |
| Q05 | O raio de busca padrão é quantos km? O usuário pode ajustar? | UX da SearchPage e HomePage |
| Q06 | Avaliações ofensivas: filtro automático ou moderação manual? | Segurança e carga de trabalho do admin |
| Q07 | A cor primária de botões é `#FFD900` (brandbook) ou roxo (mockups Figma)? | Design System — divergência identificada |
| Q08 | O card informativo "prestadores podem ter ambos os perfis" é funcionalidade real na v1? | Escopo de RegisterScreen |
| Q09 | Qual é o fluxo de recuperação de conta suspensa? O usuário pode recorrer? | Suporte e moderação |
| Q10 | O painel admin precisa de layout mobile ou apenas desktop? | Responsividade da AdminDashboardPage |
| Q11 | O nome da marca nos mockups aparece como "Conecta Serviços" — confirmar se o nome final é "Resolve Já" ou "Resolva Já" | Identidade da marca |

---

## Ordem de Desenvolvimento Sugerida

### Etapa 1 — Configuração do Ambiente

1. Instalar Node.js (versão LTS)
   - **Comando:** `node -v` para verificar após instalação
   - **Por quê antes do próximo:** todos os outros comandos dependem do Node.js instalado

2. Criar o projeto React + Vite + TypeScript
   - **Comando:** `npm create vite@latest resolve-ja -- --template react-ts`
   - **Por quê antes do próximo:** gera a estrutura base do projeto com hot reload já configurado

3. Instalar dependências e rodar o projeto
   - **Comando:** `cd resolve-ja && npm install && npm run dev`
   - **Por quê antes do próximo:** confirma que o ambiente funciona antes de qualquer código

4. Instalar React Router
   - **Comando:** `npm install react-router-dom`
   - **Por quê antes do próximo:** toda troca de páginas depende dessa biblioteca

5. Criar o arquivo de tokens de design
   - **Arquivo:** `src/styles/tokens.css` — declarar as variáveis `--color-primary: #FFD900`, `--color-navy: #1A2B4C`, `--font-heading`, `--font-body` etc.
   - **Por quê antes do próximo:** todos os componentes importam as cores e fontes deste arquivo; definir antes evita hardcode espalhado

6. Adicionar as fontes Montserrat e Roboto
   - **Arquivo:** `index.html` — adicionar `<link>` do Google Fonts com Montserrat e Roboto
   - **Por quê antes do próximo:** os componentes precisam que as fontes estejam carregadas antes de renderizar

---

### Etapa 2 — Estrutura de Pastas e Rotas Estáticas

7. Criar a estrutura de pastas conforme o código-bloco da seção "Estrutura de Navegação"
   - **Arquivo:** criar manualmente as pastas `src/pages/`, `src/components/`, `src/hooks/`, `src/services/`, `src/types/`, `src/constants/`, `src/styles/`, `src/router/`
   - **Por quê antes do próximo:** pastas criadas facilitam importações e evitam refatoração futura

8. Criar todos os arquivos de página como componentes vazios (`return <div />;`)
   - **Arquivo:** criar cada `.tsx` listado na estrutura de navegação
   - **Por quê antes do próximo:** permite configurar o router apontando para arquivos reais

9. Configurar o `AppRouter.tsx` com todas as rotas usando `<BrowserRouter>` e `<Routes>`
   - **Arquivo:** `src/router/AppRouter.tsx`
   - **Por quê antes do próximo:** sem rotas configuradas não é possível testar navegação entre páginas

10. Criar o componente `ProtectedRoute` que verifica se o usuário está logado
    - **Arquivo:** `src/router/ProtectedRoute.tsx`
    - **Por quê antes do próximo:** rotas de cliente, prestador e admin precisam bloquear acesso não autenticado desde o início

---

### Etapa 3 — Atoms (Componentes Mínimos)

11. Criar o componente `Button` com variantes primary e secondary, usando as variáveis CSS de cor
    - **Arquivo:** `src/components/atoms/Button.tsx`
    - **Por quê antes do próximo:** todos os outros componentes e páginas usam botões

12. Criar o componente `Input` com suporte a label, placeholder e mensagem de erro
    - **Arquivo:** `src/components/atoms/Input.tsx`
    - **Por quê antes do próximo:** formulários de login, cadastro e busca dependem deste componente

13. Criar o componente `Avatar` com fallback de iniciais quando não há foto
    - **Arquivo:** `src/components/atoms/Avatar.tsx`
    - **Por quê antes do próximo:** cards de profissional e perfis usam este componente

14. Criar o componente `StarRating` nas versões interativa (input) e somente leitura (display)
    - **Arquivo:** `src/components/atoms/StarRating.tsx`
    - **Por quê antes do próximo:** usado em avaliações e nos cards de profissional

15. Criar o componente `Badge` para categorias e status
    - **Arquivo:** `src/components/atoms/Badge.tsx`
    - **Por quê antes do próximo:** categorias e bairros de atendimento são exibidos como badges

---

### Etapa 4 — Layout Estático das Páginas (sem lógica)

16. Construir `OnboardingPage` com hero, toggle Mapa/Lista, grid de categorias e banner de estatísticas — dados fixos
    - **Arquivo:** `src/pages/public/OnboardingPage.tsx`
    - **Por quê antes do próximo:** é a primeira página que qualquer visitante vê; aprovação do layout define o tom visual do projeto

17. Construir `LoginPage` com card de login, campos e banner de estatísticas — sem validação ainda
    - **Arquivo:** `src/pages/public/LoginPage.tsx`
    - **Por quê antes do próximo:** depende de `Input` e `Button` já criados

18. Construir `RegisterPage` com os dois cards de seleção de perfil e formulário com dados fixos
    - **Arquivo:** `src/pages/public/RegisterPage.tsx`
    - **Por quê antes do próximo:** mesmo motivo do passo anterior

19. Construir `SearchPage` com header, contador de resultados e lista de cards de profissional fixos
    - **Arquivo:** `src/pages/client/SearchPage.tsx`
    - **Por quê antes do próximo:** é onde o cliente passa mais tempo; validar layout de card de profissional (foto hero + badge de avaliação) é crítico

20. Construir `ProfessionalProfilePage` com dados fixos de um prestador fictício
    - **Arquivo:** `src/pages/client/ProfessionalProfilePage.tsx`
    - **Por quê antes do próximo:** maior densidade de informação do app; aprovação do layout evita retrabalho

21. Construir as demais páginas com dados fixos
    - **Arquivos:** `RequestPage`, `ReviewPage`, `ClientProfilePage`, `ProfessionalHomePage`, `ProfessionalProfileEditPage`, `ProposalPage`, `AdminDashboardPage`
    - **Por quê antes do próximo:** ter todas as páginas estáticas permite revisar o fluxo completo antes de adicionar lógica

---

### Etapa 5 — Molecules e Organisms

22. Criar `Navbar` com variantes: pública (logo + botão entrar + "Acesso Admin"), autenticada cliente, autenticada prestador
    - **Arquivo:** `src/components/organisms/Navbar.tsx`
    - **Por quê antes do próximo:** aparece em todas as páginas; centralizar evita duplicação

23. Criar `ProfessionalCard` usando `Avatar`, `StarRating` e `Badge` — com foto hero como no mockup
    - **Arquivo:** `src/components/molecules/ProfessionalCard.tsx`
    - **Por quê antes do próximo:** usado em `SearchPage` e `HomePage`

24. Criar `CategoryCard` com ícone em fundo roxo, nome e seta
    - **Arquivo:** `src/components/molecules/CategoryCard.tsx`
    - **Por quê antes do próximo:** usado em `OnboardingPage` e `HomePage`

25. Criar `StatsBanner` com gradiente e três métricas
    - **Arquivo:** `src/components/molecules/StatsBanner.tsx`
    - **Por quê antes do próximo:** reutilizado em `OnboardingPage` e `LoginPage`

26. Criar `PortfolioGrid`, `ReviewCard` e `ProposalCard`
    - **Arquivos:** um arquivo por componente
    - **Por quê antes do próximo:** completam as páginas de perfil e propostas

---

### Etapa 6 — Dados Locais (Mock Data)

27. Criar arquivo de dados fictícios de profissionais seguindo o schema do Modelo de Dados
    - **Arquivo:** `src/constants/mockProfessionals.ts` — array com 10 profissionais fictícios
    - **Por quê antes do próximo:** substituir dados fixos nas páginas por `.map()` prepara o código para receber dados reais do Firebase

28. Criar arquivos de dados fictícios de propostas, avaliações e categorias
    - **Arquivos:** `src/constants/mockProposals.ts`, `src/constants/mockReviews.ts`, `src/constants/categories.ts`
    - **Por quê antes do próximo:** permite testar todos os fluxos sem Firebase

29. Substituir dados fixos em todas as páginas por `.map()` sobre os arrays mock
    - **Arquivos:** editar cada página criada na Etapa 4
    - **Por quê antes do próximo:** garante que o código está preparado para dados dinâmicos

---

### Etapa 7 — Interatividade e Estado

30. Adicionar validação de formulário em `LoginPage` com `useState`
    - **Arquivo:** `src/pages/public/LoginPage.tsx`
    - **Por quê antes do próximo:** validações devem funcionar com dados locais antes de conectar Firebase Auth

31. Adicionar validação de formulário em `RegisterPage`
    - **Arquivo:** `src/pages/public/RegisterPage.tsx`
    - **Por quê antes do próximo:** mesmo motivo do passo anterior

32. Implementar navegação real com `useNavigate` e `Link` em todas as páginas
    - **Arquivos:** todas as páginas com botões de navegação
    - **Por quê antes do próximo:** testar o fluxo completo antes de Firebase reduz variáveis em caso de bugs

33. Adicionar lógica de filtro local em `SearchPage` (filtrar array mock por categoria)
    - **Arquivo:** `src/pages/client/SearchPage.tsx`
    - **Por quê antes do próximo:** valida a lógica de filtro sem depender de queries no Firestore

34. Implementar toggle Mapa/Lista na `HomePage` e `OnboardingPage` com `useState`
    - **Arquivos:** as duas páginas
    - **Por quê antes do próximo:** é um dos elementos centrais da UX confirmado nos mockups

---

### Etapa Final — Firebase

35. Criar projeto no Firebase Console e instalar o SDK
    - **Comando:** `npm install firebase`
    - **Por quê antes do próximo:** sem o projeto criado não há credenciais para conectar

36. Criar o arquivo de configuração Firebase com as credenciais do Console
    - **Arquivo:** `src/services/firebase.ts`
    - **Por quê antes do próximo:** todas as operações de Auth, Firestore e Storage importam deste arquivo

37. Conectar Firebase Authentication em `LoginPage` e `RegisterPage`
    - **Arquivo:** `src/services/auth.ts` + editar as páginas de auth
    - **Por quê antes do próximo:** autenticação é pré-requisito para regras de segurança no Firestore

38. Criar hook `useAuth` para gerenciar estado de autenticação global e proteger rotas
    - **Arquivo:** `src/hooks/useAuth.ts` + `src/router/ProtectedRoute.tsx`
    - **Por quê antes do próximo:** todas as páginas precisam saber se o usuário está logado e qual é o perfil

39. Substituir dados mock de profissionais por leitura do Firestore
    - **Arquivo:** `src/services/professionals.ts` + `src/hooks/useProfessionals.ts`
    - **Por quê antes do próximo:** operação de leitura mais frequente do sistema

40. Adicionar escrita no Firestore para cadastro de prestador e envio de propostas
    - **Arquivos:** `src/services/professionals.ts` + `ProfessionalProfileEditPage.tsx` + `RequestPage.tsx`
    - **Por quê antes do próximo:** escrita deve ser testada depois de leitura confirmada

41. Configurar Firebase Storage para upload de fotos de perfil e portfólio
    - **Arquivo:** editar `ProfessionalProfileEditPage.tsx` para enviar ao Storage
    - **Por quê antes do próximo:** uploads dependem de Auth configurado e regras do Storage definidas

42. Conectar Geolocation API do browser e exibir profissionais próximos na `HomePage`
    - **Arquivo:** `src/hooks/useLocation.ts`
    - **Por quê antes do próximo:** geolocalização depende de dados reais de prestadores já no Firestore

43. Fazer build de produção e deploy no Firebase Hosting
    - **Comando:** `npm run build && npx firebase deploy`
    - **Por quê antes do próximo:** Firebase é conectado por último porque todas as páginas já funcionam com dados locais; isso facilita testar e depurar sem depender de internet ou de uma conta configurada

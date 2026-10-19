# Casos de Teste — RESOLVE-JÁ

| ID | Funcionalidade | Objetivo | Pré-condições | Passos | Resultado esperado | Resultado obtido | Aprovado/Reprovado | Data |
|----|----------------|----------|---------------|--------|--------------------|------------------|--------------------|------|
| CT-01 | Cadastro cliente | Criar conta de cliente com termo de consentimento | App aberto, e-mail não cadastrado | 1. Acessar /cadastro 2. Preencher dados + CPF válido 3. Aceitar termo 4. Enviar | Conta criada, redireciona para /home |  |  |  |
| CT-02 | Cadastro prestador | Criar conta de prestador | App aberto | 1. Cadastro perfil prestador 2. Categorias 3. Aceitar termo | Conta + doc professionals criado |  |  |  |
| CT-03 | CPF duplicado | Bloquear CPF já usado | CPF existente no banco | 1. Cadastrar com CPF existente | Erro "CPF já cadastrado" |  |  |  |
| CT-04 | Login | Autenticar | Usuário cadastrado | 1. /login 2. Credenciais 3. Entrar | Acesso à home do perfil |  |  |  |
| CT-05 | Logout | Encerrar sessão | Logado | 1. Clicar sair | Retorna para / |  |  |  |
| CT-06 | Geolocalização/CEP | Buscar endereço por CEP | Rede disponível | 1. Digitar CEP válido | Endereço preenchido |  |  |  |
| CT-07 | Busca profissionais | Filtrar por categoria/CEP | Profissionais cadastrados | 1. Buscar encanador perto do CEP | Lista ordenada por distância |  |  |  |
| CT-08 | Proposta direta | Enviar proposta a profissional | Cliente logado | 1. Perfil prof 2. Solicitar | Proposta criada status pendente |  |  |  |
| CT-09 | Proposta aberta | Criar solicitação aberta | Cliente logado | 1. /solicitacoes nova aberta | Proposta aberta visível a prestadores |  |  |  |
| CT-10 | Aceitar/Recusar | Prestador responde proposta | Proposta pendente | 1. /prestador/solicitacoes 2. Aceitar | Status atualizado, notificação cliente |  |  |  |
| CT-11 | Notificações | Receber notificação | Ação disparadora | 1. Ver /notificacoes | Lista exibida, marcar lida |  |  |  |
| CT-12 | Avaliação bidirecional | Avaliar após serviço | Proposta concluída | 1. /avaliar/:id ambos lados | Review criada, média atualizada |  |  |  |
EOF
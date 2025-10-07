# Guia de Uso - Send Emails Desk

## Instalação e Configuração Inicial

### 1. Instalação

```bash
# Clone o repositório
git clone https://github.com/SammMartins/send-emails-desk.git
cd send-emails-desk

# Instale as dependências
npm install

# Compile o projeto
npm run build
```

### 2. Executar o Aplicativo

```bash
# Para desenvolvimento
npm run dev  # Terminal 1 - Frontend
npm run start  # Terminal 2 - Electron

# Para produção
npm run build
npm run start
```

### 3. Configuração Inicial

Ao iniciar o aplicativo pela primeira vez:

1. **Acesse Settings** (⚙️ no menu lateral)
2. **Configure o SLA** de acordo com suas necessidades
3. **(Opcional)** Configure integrações

## Configurando Integrações

### Gmail API

**Pré-requisitos:**
- Conta Google
- Projeto no Google Cloud Console

**Passos:**

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)

2. Crie um novo projeto ou selecione existente

3. Ative a Gmail API:
   - Menu → APIs & Services → Library
   - Pesquise "Gmail API"
   - Clique em "Enable"

4. Crie credenciais OAuth 2.0:
   - Menu → APIs & Services → Credentials
   - Clique em "Create Credentials" → "OAuth client ID"
   - Tipo: "Web application"
   - Nome: "Send Emails Desk"
   - Authorized redirect URIs: `http://localhost:3001/api/gmail/auth/callback`
   - Clique em "Create"

5. Copie o Client ID e Client Secret

6. No aplicativo:
   - Vá em Settings → Gmail Integration
   - Cole o Client ID e Client Secret
   - Clique em "Initialize Gmail Authentication"
   - Uma URL será gerada
   - Abra a URL em um navegador
   - Faça login com sua conta Google
   - Autorize o aplicativo
   - Aguarde o redirecionamento de sucesso

7. Sincronize e-mails:
   - Clique em "🔄 Sync Gmail Now"
   - Tickets serão criados automaticamente

### OpenAI API

**Pré-requisitos:**
- Conta na OpenAI
- Créditos disponíveis

**Passos:**

1. Acesse [platform.openai.com](https://platform.openai.com/)

2. Crie uma API key:
   - Menu → API Keys
   - Clique em "Create new secret key"
   - Copie a chave (aparece apenas uma vez)

3. No aplicativo:
   - Vá em Settings → OpenAI Configuration
   - Cole sua API key
   - Clique em "Configure OpenAI"

4. Use a análise de IA:
   - Abra qualquer ticket
   - Clique em "🤖 Analyze with AI"
   - Aguarde a análise (5-10 segundos)

## Usando o Dashboard

### Visualizando Métricas

O Dashboard mostra automaticamente:

- **Tickets por Status:** Quantos tickets abertos, em progresso e fechados
- **Tickets por Prioridade:** Distribuição por urgência
- **SLA - Primeira Resposta:** 
  - Percentual dentro do SLA
  - Quantidade total vs dentro do SLA
  - Meta configurada
  - Tempo médio
- **SLA - Resolução:**
  - Percentual dentro do SLA
  - Quantidade total vs dentro do SLA
  - Meta configurada
  - Tempo médio
- **Gráfico de Tickets:** Criados nos últimos 30 dias
- **Top Remetentes:** 10 usuários com mais tickets

### Interpretando as Métricas

**SLA Verde (≥90%):** Excelente desempenho
**SLA Amarelo (70-89%):** Atenção necessária
**SLA Vermelho (<70%):** Ação urgente necessária

## Gerenciando Tickets

### Visualizando Tickets (Inbox)

1. Clique em **📥 Inbox** no menu lateral

2. Use os filtros:
   - **Busca:** Digite texto para procurar em assunto, descrição ou remetente
   - **Status:** Filtre por Aberto, Em Progresso ou Fechado
   - **Prioridade:** Filtre por Baixa, Média, Alta ou Urgente

3. Ordene clicando nos cabeçalhos das colunas

4. Use a paginação para navegar entre páginas

### Trabalhando com um Ticket

1. Clique em qualquer ticket da lista

2. No detalhe do ticket, você pode:
   - **Visualizar todas as informações**
   - **Alterar status:** Use o dropdown de Status
   - **Alterar prioridade:** Use o dropdown de Prioridade
   - **Adicionar anotações:** Use o campo de texto na parte inferior
   - **Analisar com IA:** Clique no botão "🤖 Analyze with AI"

### Fluxo Recomendado

```
Ticket Novo (Aberto)
    ↓
Adicione primeira anotação (registra first_response_at)
    ↓
Altere status para "Em Progresso"
    ↓
Trabalhe no ticket (adicione mais anotações conforme necessário)
    ↓
Resolva o problema
    ↓
Altere status para "Fechado" (registra resolved_at)
```

### Usando Análise de IA

A análise de IA ajuda a:

1. **Entender o sentimento** do cliente (Positivo, Neutro, Negativo)
2. **Identificar o tom** (Profissional, Urgente, Frustrado)
3. **Extrair palavras-chave** importantes
4. **Obter sugestões de resposta** profissionais

**Quando usar:**
- Tickets complexos ou ambíguos
- Mensagens de clientes insatisfeitos
- Para padronizar respostas
- Para treinar novos atendentes

## Gerenciando Contatos

### Visualizando Contatos

1. Clique em **👥 Contacts** no menu lateral

2. Use os filtros:
   - **Busca:** Digite nome ou e-mail
   - **Cidade:** Selecione uma cidade específica

### Adicionando/Editando Contatos

1. Clique em **+ Add Contact**

2. Preencha:
   - **Email:** (obrigatório, único)
   - **Nome**
   - **Telefone**
   - **Cidade**

3. Clique em **Save**

**Nota:** Contatos são criados automaticamente quando tickets são criados via Gmail.

### Organizando por Cidade

Use o filtro de cidade para:
- Ver contatos por região
- Identificar demanda por localização
- Facilitar comunicação regional

## Configurando SLA

### Ajustando Parâmetros

1. Vá em **⚙️ Settings**

2. Na seção **SLA Configuration**:
   - **First Response Time:** Tempo máximo para primeira resposta (em horas)
   - **Resolution Time:** Tempo máximo para resolução (em horas)
   - **Business Hours Only:** Marque para considerar apenas horário comercial

3. Clique em **Save SLA Configuration**

### Exemplos de Configuração

**Suporte Intensivo:**
- First Response: 1 hora
- Resolution: 8 horas
- Business Hours: Sim

**Suporte Standard:**
- First Response: 4 horas
- Resolution: 24 horas
- Business Hours: Sim

**Suporte Relaxado:**
- First Response: 8 horas
- Resolution: 48 horas
- Business Hours: Não

## Dados de Demonstração

Para testar o sistema com dados de exemplo:

```bash
# Execute o script de seed
node scripts/seed-database.js

# Um arquivo demo-helpdesk.db será criado
# Este arquivo já está incluído no repositório
```

O banco de demonstração inclui:
- 10 contatos de diferentes cidades
- 10 tickets com vários status e prioridades
- 7 anotações em diferentes tickets
- 3 análises de IA

## Solução de Problemas

### Erro ao conectar com Gmail

**Problema:** "OAuth client not initialized"
**Solução:** 
1. Verifique se Client ID e Secret estão corretos
2. Confirme que a URL de redirecionamento está configurada no Google Cloud
3. Tente inicializar novamente

### Erro ao usar IA

**Problema:** "OpenAI not initialized"
**Solução:**
1. Verifique se a API key está correta
2. Confirme que sua conta OpenAI tem créditos
3. Tente configurar novamente

### Tickets não aparecem

**Solução:**
1. Verifique os filtros ativos
2. Clique em "🔄 Refresh"
3. Tente limpar os filtros
4. Verifique se há dados no banco

### Performance lenta

**Solução:**
1. Reduza o número de tickets por página
2. Use filtros para limitar resultados
3. Feche e reabra o aplicativo
4. Verifique espaço em disco

## Boas Práticas

### Gerenciamento de Tickets

1. **Responda rapidamente:** Configure SLA realista e cumpra
2. **Use anotações:** Documente todas as interações
3. **Atualize status:** Mantenha o status sempre atualizado
4. **Priorize corretamente:** Use prioridades de forma consistente
5. **Use IA:** Aproveite sugestões para respostas melhores

### Organização

1. **Sincronize regularmente:** Se usar Gmail, sincronize diariamente
2. **Mantenha contatos atualizados:** Informações corretas facilitam comunicação
3. **Monitore métricas:** Verifique dashboard regularmente
4. **Ajuste SLA:** Revise metas conforme evolução da equipe

### Auditoria

1. **Revise logs:** Use audit_log para rastreabilidade
2. **Documente mudanças:** Especialmente em SLA
3. **Treine equipe:** Garanta uso consistente do sistema

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de dev do frontend
npm run start            # Inicia Electron

# Produção
npm run build           # Compila tudo
npm run build:main      # Compila apenas backend/Electron
npm run build:renderer  # Compila apenas frontend

# Utilitários
npm test                # Executa testes
node scripts/seed-database.js  # Cria banco demo
```

## Atalhos de Teclado (Sugeridos para futuras versões)

- `Ctrl/Cmd + N`: Novo ticket
- `Ctrl/Cmd + F`: Buscar tickets
- `Ctrl/Cmd + R`: Refresh
- `Escape`: Voltar/Fechar

## Suporte

Para questões, problemas ou sugestões:
1. Abra uma issue no GitHub
2. Consulte a documentação (README.md, FEATURES.md)
3. Verifique este guia de uso

## Recursos Adicionais

- **README.md:** Visão geral e instalação
- **FEATURES.md:** Descrição detalhada de funcionalidades
- **scripts/seed-database.js:** Script de dados de exemplo
- **demo-helpdesk.db:** Banco de dados de demonstração

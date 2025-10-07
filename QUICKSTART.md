# Quick Start Guide - Send Emails Desk

## 🚀 Início Rápido (5 minutos)

### 1. Instalar e Executar

```bash
# Clone o repositório
git clone https://github.com/SammMartins/send-emails-desk.git
cd send-emails-desk

# Instale dependências
npm install

# Compile o projeto
npm run build

# Execute o aplicativo
npm run start
```

### 2. Explorar com Dados Demo

O aplicativo já vem com um banco de dados de demonstração (`demo-helpdesk.db`) contendo:
- 10 contatos de várias cidades brasileiras
- 10 tickets com diferentes status e prioridades
- 7 anotações em diversos tickets
- 3 análises de IA pré-geradas

**Para usar os dados demo:**

O banco demo está incluído no repositório. Quando você executar o aplicativo pela primeira vez, ele criará um banco vazio. Para usar o banco demo:

1. Feche o aplicativo se estiver rodando
2. Localize o diretório de dados do usuário do Electron:
   - **Windows:** `%APPDATA%\send-emails-desk\`
   - **macOS:** `~/Library/Application Support/send-emails-desk/`
   - **Linux:** `~/.config/send-emails-desk/`
3. Copie `demo-helpdesk.db` para `helpdesk.db` neste diretório
4. Execute o aplicativo novamente

### 3. Navegar pelo Sistema

#### Dashboard 📊
- Clique em "📊 Dashboard" no menu lateral
- Veja métricas de desempenho e conformidade de SLA
- Identifique top remetentes e tendências

#### Inbox 📥
- Clique em "📥 Inbox"
- Use filtros para encontrar tickets
- Clique em qualquer ticket para ver detalhes

#### Detalhes do Ticket 🎫
- Veja todas as informações
- Altere status e prioridade
- Adicione anotações
- Use análise de IA (requer configuração)

#### Contatos 👥
- Clique em "👥 Contacts"
- Filtre por cidade
- Adicione ou edite contatos

#### Configurações ⚙️
- Clique em "⚙️ Settings"
- Ajuste SLA conforme necessário
- Configure integrações (opcional)

## 🎯 Funcionalidades Principais

### O que você pode fazer IMEDIATAMENTE (sem configuração):

✅ Visualizar e gerenciar tickets
✅ Adicionar e editar contatos
✅ Usar filtros avançados e busca
✅ Adicionar anotações a tickets
✅ Alterar status e prioridade de tickets
✅ Ver métricas de desempenho no dashboard
✅ Acompanhar compliance de SLA
✅ Configurar parâmetros de SLA

### O que requer configuração:

🔧 **Gmail Integration** (Opcional)
- Requer: Credenciais OAuth do Google Cloud
- Permite: Criação automática de tickets via e-mail
- [Ver guia completo](USAGE_GUIDE.md#gmail-api)

🔧 **AI Analysis** (Opcional)
- Requer: Chave API da OpenAI
- Permite: Análise de sentimento e sugestões de resposta
- [Ver guia completo](USAGE_GUIDE.md#openai-api)

## 📝 Exemplo Prático: Gerenciar um Ticket

1. **Abra a Inbox**
   ```
   Menu → 📥 Inbox
   ```

2. **Encontre um ticket urgente**
   ```
   Filtro Priority → Urgent
   ```

3. **Abra o ticket**
   ```
   Clique no ticket "Erro 500"
   ```

4. **Adicione uma anotação**
   ```
   Digite: "Investigando o problema. Conectado ao banco de dados."
   Clique: "Add Annotation"
   ```

5. **Atualize o status**
   ```
   Status → In Progress
   ```

6. **Resolva e feche**
   ```
   Digite: "Problema resolvido. Era uma query mal formada."
   Clique: "Add Annotation"
   Status → Closed
   ```

## 🎨 Interface Visual

### Cores dos Status
- 🔵 **Azul** = Aberto (Open)
- 🟠 **Laranja** = Em Progresso (In Progress)
- 🟢 **Verde** = Fechado (Closed)

### Cores das Prioridades
- ⚪ **Cinza** = Baixa (Low)
- 🔵 **Azul** = Média (Medium)
- 🟠 **Laranja** = Alta (High)
- 🔴 **Vermelho** = Urgente (Urgent)

### Indicadores de SLA
- 🟢 **Verde** (≥90%) = Excelente
- 🟡 **Amarelo** (70-89%) = Atenção
- 🔴 **Vermelho** (<70%) = Crítico

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento (com hot-reload)
npm run dev              # Terminal 1: Frontend
npm run start            # Terminal 2: Electron

# Produção
npm run build            # Compilar tudo
npm run start            # Executar

# Apenas backend
npm run build:main

# Apenas frontend
npm run build:renderer

# Criar novo banco demo
node scripts/seed-database.js
```

## 💡 Dicas Rápidas

### Atalhos Visuais
- **Dashboard:** Use para visão geral diária
- **Inbox:** Use para trabalho operacional
- **Contacts:** Use para gerenciar relacionamentos
- **Settings:** Use para ajustes e integrações

### Boas Práticas
1. **Responda rápido:** Configure SLA realista
2. **Documente tudo:** Use anotações
3. **Mantenha atualizado:** Atualize status constantemente
4. **Use filtros:** Encontre tickets rapidamente
5. **Monitore métricas:** Verifique dashboard diariamente

### Fluxo de Trabalho Sugerido
```
Manhã
├── Abra Dashboard → Veja métricas
├── Abra Inbox → Filtre "Open" + "Urgent"
└── Resolva tickets urgentes

Durante o Dia
├── Monitore novos tickets
├── Adicione anotações conforme progresso
└── Atualize status regularmente

Fim do Dia
├── Feche tickets resolvidos
├── Revise Dashboard → Verifique SLA
└── Planeje próximo dia
```

## 🐛 Problemas Comuns

### Aplicativo não inicia
```bash
# Limpe e recompile
rm -rf dist node_modules
npm install
npm run build
npm run start
```

### Nenhum ticket aparece
- Verifique filtros ativos
- Clique em "🔄 Refresh"
- Use dados demo (ver seção 2)

### Erro de permissão
```bash
# Linux/Mac: Certifique-se de ter permissões
chmod +x node_modules/.bin/*
```

## 📚 Próximos Passos

1. ✅ **Explore os dados demo**
2. 📖 **Leia [FEATURES.md](FEATURES.md)** para funcionalidades detalhadas
3. 📘 **Consulte [USAGE_GUIDE.md](USAGE_GUIDE.md)** para guia completo
4. 🔧 **Configure integrações** (Gmail, OpenAI) se necessário
5. 🎯 **Ajuste SLA** para suas necessidades

## 🤝 Suporte

- **Documentação:** README.md, FEATURES.md, USAGE_GUIDE.md
- **Issues:** GitHub Issues
- **Código:** Explore `src/` para entender implementação

## 🎉 Pronto!

Você está pronto para usar o Send Emails Desk!

**Tempo estimado para estar produtivo:** 5-10 minutos

**Comece agora:**
```bash
npm run start
```

E abra o Dashboard para explorar! 🚀

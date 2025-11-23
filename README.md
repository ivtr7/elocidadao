# Elo Cidadão - Plataforma de Participação Popular Municipal

Plataforma completa que integra WhatsApp + IA + Web + Supabase para participação cidadã municipal.

## 🚀 Tecnologias

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL + Realtime + Storage)
- **IA**: Google Gemini API
- **WhatsApp**: Baileys
- **Python**: Automações e scripts

## 📋 Funcionalidades

### Para Cidadãos (WhatsApp)
- ✅ Envio de mensagens, imagens, áudios e vídeos
- ✅ Categorização automática por IA
- ✅ Confirmação com protocolo
- ✅ Acompanhamento de status
- ✅ Votação em projetos
- ✅ Comentários em projetos
- ✅ Reclamações formais

### Para Administradores (Web)
- ✅ Dashboard com métricas
- ✅ Gestão de cidades
- ✅ Gestão de projetos
- ✅ IA simplifica linguagem jurídica
- ✅ Moderação de comentários
- ✅ Visualização de reclamações
- ✅ Rankings de engajamento
- ✅ Notificações em massa

### Automações (Python)
- ✅ Envio de notificações WhatsApp
- ✅ Geração de PDFs de reclamações
- ✅ Posts automáticos de blog
- ✅ Monitoramento de marcos

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd elo-cidadao4
```

### 2. Instale dependências
```bash
npm install
```

### 3. Configure variáveis de ambiente
Copie `.env.example` para `.env` e configure:

```env
# Backend
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
GOOGLE_API_KEY=your_gemini_api_key
PORT=3001
WHATSAPP_SESSION=elo_cidadao_session

# Frontend
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:3001
```

### 4. Configure Supabase
Execute as migrations no diretório `supabase/migrations/`:
- `001_create_tables.sql` - Cria tabelas
- `002_security_rls.sql` - Configura segurança
- `003_triggers_functions.sql` - Triggers e funções

### 5. Instale dependências Python
```bash
pip install supabase requests python-dotenv reportlab qrcode-terminal
```

### 6. Inicie o servidor
```bash
npm run dev
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- **cities** - Cidades cadastradas
- **citizens** - Cidadãos (via WhatsApp)
- **projects** - Projetos de lei municipal
- **votes** - Votos dos cidadãos
- **comments** - Comentários nos projetos
- **complaints** - Reclamações formais
- **conversations** - Conversas WhatsApp
- **messages** - Mensagens individuais

## 🎯 Fluxos de Uso

### 1. Cidadão → WhatsApp
1. Envia mensagem para número Elo Cidadão
2. IA identifica cidade e categoriza
3. Sistema responde com opções
4. Cidadão vota, comenta ou reclama
5. Tudo é registrado no Supabase

### 2. Admin → Dashboard
1. Cria projeto com texto jurídico
2. IA simplifica automaticamente
3. Publica e notifica cidadãos
4. Monitora votos e comentários
5. Gera relatórios e analytics

### 3. Automações
1. Python monitora mudanças
2. Envia notificações WhatsApp
3. Gera PDFs de reclamações
4. Cria posts de blog
5. Atualiza rankings

## 📱 Comandos WhatsApp

- `PROJETOS` - Lista projetos da cidade
- `VOTAR [número]` - Vota em um projeto
- `COMENTAR [número] [texto]` - Adiciona comentário
- `RECLAMAR [texto]` - Cria reclamação formal
- `RANKING` - Mostra seu posicionamento
- `AJUDA` - Mostra opções disponíveis

## 🔧 Desenvolvimento

### Scripts NPM
```bash
npm run dev          # Desenvolvimento completo
npm run client:dev   # Frontend apenas
npm run server:dev   # Backend apenas
npm run build        # Build produção
npm run lint         # Linting
npm run check        # TypeScript check
```

### Scripts Python
```bash
# Terminal 1: Notificações
python python/notify_citizens.py

# Terminal 2: PDFs
python python/generate_complaint_pdf.py

# Terminal 3: Blog
python python/blog_auto.py
```

## 🔐 Segurança

- RLS (Row Level Security) no Supabase
- Autenticação por JWT
- Criptografia TLS 1.3
- Rate limiting no WhatsApp
- Conformidade LGPD

## 📈 Métricas

- **Performance**: < 3s resposta IA
- **Disponibilidade**: 99.5% uptime
- **Escalabilidade**: 10k usuários simultâneos
- **Segurança**: 0 incidentes

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

Para suporte, abra uma issue no repositório ou entre em contato.

---

**Elo Cidadão** - Conectando cidadãos e representantes através da tecnologia.

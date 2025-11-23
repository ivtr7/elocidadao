# Elo Cidadão - Backend API

Backend Node.js + Express + TypeScript com integração Supabase e Google Gemini AI

## Instalação

```bash
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
GOOGLE_API_KEY=your_gemini_api_key
PORT=3001
```

## Scripts

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start
```

## Rotas da API

### Cidades
- `POST /api/cities` - Criar cidade
- `GET /api/cities` - Listar cidades
- `PUT /api/cities/:id` - Atualizar cidade

### Projetos
- `POST /api/projects` - Criar projeto (com IA)
- `GET /api/projects` - Listar projetos
- `GET /api/projects/:id` - Detalhes do projeto
- `POST /api/projects/:id/notify` - Notificar cidadãos

### Votos
- `POST /api/votes` - Registrar voto

### Comentários
- `POST /api/comments` - Adicionar comentário

### Reclamações
- `POST /api/complaints` - Criar reclamação (com IA)

### Conversas WhatsApp
- `GET /api/conversations` - Listar conversas
- `GET /api/conversations/:id` - Detalhes da conversa

### WhatsApp
- `GET /api/whatsapp/qr` - QR Code para conexão
- `POST /api/whatsapp/send` - Enviar mensagem

## Tecnologias

- Node.js + Express + TypeScript
- Supabase (PostgreSQL)
- Google Gemini AI
- Multer (upload de arquivos)
- CORS
- Dotenv
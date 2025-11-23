# Elo Cidadão - Scripts Python

Scripts de automação para o sistema Elo Cidadão

## Requisitos

```bash
pip install supabase requests python-dotenv reportlab qrcode-terminal
```

## Scripts Disponíveis

### 1. notify_citizens.py
Monitora fila de notificações e envia mensagens WhatsApp para cidadãos

```bash
python python/notify_citizens.py
```

**Funções:**
- Monitora fila de notificações no Supabase
- Envia mensagens via WhatsApp (1 msg/segundo)
- Atualiza status de entrega
- Suporta diferentes tipos de notificações

### 2. generate_complaint_pdf.py
Gera PDFs formais de reclamações cidadãs

```bash
python python/generate_complaint_pdf.py
```

**Funções:**
- Converte reclamações em documentos PDF oficiais
- Gera números de protocolo únicos
- Formata documento com layout profissional
- Salva no Supabase Storage (simulado)

### 3. blog_auto.py
Monitora mudanças e gera posts automáticos de blog

```bash
python python/blog_auto.py
```

**Funções:**
- Detecta novos projetos
- Identifica marcos de votação
- Monitora mudanças no ranking
- Cria posts automáticos

## Configuração

Crie um arquivo `.env` na pasta `python/`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
API_URL=http://localhost:3001
```

## Uso com Cron (Linux/Mac)

Adicione ao crontab para execução automática:

```bash
# Notificações a cada 5 minutos
*/5 * * * * cd /path/to/elo-cidadao4 && python python/notify_citizens.py

# PDFs a cada 10 minutos
*/10 * * * * cd /path/to/elo-cidadao4 && python python/generate_complaint_pdf.py

# Blog a cada 15 minutos
*/15 * * * * cd /path/to/elo-cidadao4 && python python/blog_auto.py
```

## Uso com Agendador de Tarefas (Windows)

Crie tarefas agendadas para executar os scripts nos intervalos desejados.
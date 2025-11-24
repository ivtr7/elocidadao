import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createHash } from 'crypto';
import { rateLimiter } from './middleware/rateLimiter.js';
import { validate } from './middleware/validation.js';
import { errorHandler, asyncHandler } from './middleware/errorHandler.js';
import { createCitySchema, createProjectSchema, createVoteSchema, createCommentSchema, createComplaintSchema } from './validations/projectValidation.js';

// Carregar variáveis de ambiente
dotenv.config();

// Garantir UTF-8 no ambiente Node.js
process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '') + ' --input-type=module --experimental-specifier-resolution=node';
if (process.stdout.setDefaultEncoding) {
  process.stdout.setDefaultEncoding('utf8');
}
if (process.stderr.setDefaultEncoding) {
  process.stderr.setDefaultEncoding('utf8');
}

const app = express();
const port = process.env.PORT || 3001;

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// Configuração do Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Middlewares
app.use(cors({
  origin: true, // Permitir todas as origens
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Accept-Charset', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate Limiting
app.use('/api', rateLimiter);

// Ensure UTF-8 encoding for all responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Accept-Charset', 'utf-8');
  res.charset = 'utf-8';
  next();
});

// Configuração do multer para upload de arquivos
const upload = multer({ storage: multer.memoryStorage() });

// Rotas de Cidades
app.post('/api/cities', validate(createCitySchema), asyncHandler(async (req, res) => {
  const { name, state, population, chamber_url, active } = req.body;
  
  const { data, error } = await supabase
    .from('cities')
    .insert([{ name, state, population, chamber_url, active: active !== undefined ? active : true }])
    .select()
    .single();

  if (error) throw error;
  res.json(data);
}));

app.get('/api/cities', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/cities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('cities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('cities')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Cidade excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rotas de Projetos
app.post('/api/projects', validate(createProjectSchema), asyncHandler(async (req, res) => {
  const { 
    city_id, 
    number, 
    title, 
    full_text, 
    tags,
    author,
    main_impacts,
    vote_date,
    original_url,
    status = 'em_análise'
  } = req.body;
    
    let simple_title = title;
    let summary = '';
    let who_benefits = '';
    let who_loses = '';
    
    // Tentar usar IA para simplificar linguagem jurídica (com fallback)
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      
      const simplificationPrompt = `Simplifique este texto jurídico para linguagem popular:

Título: ${title}
Texto: ${full_text.substring(0, 2000)}

Forneça:
1. Um título simplificado (máximo 100 caracteres)
2. Um resumo em linguagem simples (máximo 500 caracteres)
3. Quem se beneficia com este projeto
4. Quem pode ser prejudicado
5. Principais impactos esperados (lista de até 5 itens)

Formato de resposta:
TITULO_SIMPLIFICADO: [texto]
RESUMO: [texto]
BENEFICIADOS: [texto]
PREJUDICADOS: [texto]
IMPACTOS: [item1, item2, item3]`;

      const result = await model.generateContent(simplificationPrompt);
      const response = await result.response;
      const aiText = response.text();
      
      // Parse da resposta da IA
      simple_title = aiText.match(/TITULO_SIMPLIFICADO: (.+)/)?.[1] || title;
      summary = aiText.match(/RESUMO: (.+)/)?.[1] || '';
      who_benefits = aiText.match(/BENEFICIADOS: (.+)/)?.[1] || '';
      who_loses = aiText.match(/PREJUDICADOS: (.+)/)?.[1] || '';
      const impactsText = aiText.match(/IMPACTOS: (.+)/)?.[1] || '';
      let finalMainImpacts = main_impacts || [];
      if (impactsText && finalMainImpacts.length === 0) {
        const parsedImpacts = impactsText.split(',').map(i => i.trim()).filter(Boolean);
        if (parsedImpacts.length > 0) {
          finalMainImpacts = parsedImpacts;
        }
      }
      
      // Garantir que main_impacts seja um array
      if (!Array.isArray(finalMainImpacts)) {
        finalMainImpacts = finalMainImpacts ? [finalMainImpacts] : [];
      }
    } catch (aiError) {
      console.log('AI processing failed, using fallback:', aiError.message);
      // Usar fallback simples quando IA não está disponível
      summary = full_text.substring(0, 200) + '...';
      who_benefits = 'Cidadãos da cidade';
      who_loses = 'Nenhum grupo específico';
    }
    
    // Garantir que finalMainImpacts existe mesmo se o try falhar
    let finalMainImpacts = main_impacts || [];
    if (!Array.isArray(finalMainImpacts)) {
      finalMainImpacts = finalMainImpacts ? [finalMainImpacts] : [];
    }
    
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        city_id,
        number,
        title,
        simple_title,
        summary,
        full_text,
        who_benefits,
        who_loses,
        tags: tags || [],
        author: author || null,
        main_impacts: finalMainImpacts,
        vote_date: vote_date || null,
        original_url: original_url || null,
        status: status,
        notified: false
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Notificar cidadãos da cidade (assíncrono)
    notifyCitizens(city_id, 'new_project', { project_id: data.id });
    
    res.json(data);
}));

app.get('/api/projects', async (req, res) => {
  try {
    const { city_id, status } = req.query;
    
    let query = supabase.from('projects').select('*');
    
    if (city_id) {
      query = query.eq('city_id', city_id);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    
    // Garantir UTF-8 na resposta
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        votes (
          id, 
          position, 
          reasoning, 
          neighborhood,
          created_at,
          citizens (name)
        ),
        comments (
          id, 
          content, 
          moderation_status, 
          created_at,
          citizens (name, phone)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects/:id/notify', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obter projeto e cidade
    const { data: project } = await supabase
      .from('projects')
      .select('*, cities(name)')
      .eq('id', id)
      .single();

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    // Notificar cidadãos da cidade
    await notifyCitizens(project.city_id, 'project_notification', { 
      project_id: id,
      title: project.simple_title || project.title
    });

    // Atualizar flag de notificação
    await supabase
      .from('projects')
      .update({ notify_flag: true })
      .eq('id', id);

    res.json({ message: 'Notificações enviadas com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rotas de Votos
app.post('/api/votes', validate(createVoteSchema), asyncHandler(async (req, res) => {
  const { project_id, citizen_id, citizen_phone, city_id, position, reasoning, neighborhood } = req.body;
  
  // Verificar se o cidadão já votou neste projeto
  if (citizen_id) {
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('project_id', project_id)
      .eq('citizen_id', citizen_id)
      .single();

    if (existingVote) {
      return res.status(400).json({ error: 'Cidadão já votou neste projeto' });
    }
  }

  // Buscar city_id do projeto se não fornecido
  let finalCityId = city_id;
  if (!finalCityId && project_id) {
    const { data: project } = await supabase
      .from('projects')
      .select('city_id')
      .eq('id', project_id)
      .single();
    if (project) finalCityId = project.city_id;
  }

  const { data, error } = await supabase
    .from('votes')
    .insert([{ 
      project_id, 
      citizen_id, 
      citizen_phone: citizen_phone || null,
      city_id: finalCityId || null,
      position, 
      reasoning, 
      neighborhood,
      upvotes: 0,
      downvotes: 0,
      quality_score: 0
    }])
    .select()
    .single();

  if (error) throw error;
  res.json(data);
}));

// Rotas de Comentários
app.get('/api/comments', async (req, res) => {
  try {
    const { project_id, moderation_status } = req.query;
    
    let query = supabase
      .from('comments')
      .select(`
        *,
        citizens (name, phone),
        projects (title, simple_title)
      `);
    
    if (project_id) {
      query = query.eq('project_id', project_id);
    }
    
    if (moderation_status) {
      query = query.eq('moderation_status', moderation_status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/comments', validate(createCommentSchema), asyncHandler(async (req, res) => {
  const { project_id, citizen_id, citizen_phone, content, city_id } = req.body;
  
  const { data, error } = await supabase
    .from('comments')
    .insert([{ 
      project_id, 
      citizen_id, 
      citizen_phone: citizen_phone || null,
      city_id: city_id || null,
      content 
    }])
    .select()
    .single();

  if (error) throw error;
  res.json(data);
}));

app.put('/api/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { moderation_status } = req.body;
    
    const { data, error } = await supabase
      .from('comments')
      .update({ moderation_status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rotas de Cidadãos
app.get('/api/citizens', async (req, res) => {
  try {
    const { city_id } = req.query;
    
    let query = supabase.from('citizens').select('*');
    
    if (city_id) {
      query = query.eq('city_id', city_id);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/citizens/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('citizens')
      .select(`
        *,
        cities (name, state)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rotas de Reclamações
app.get('/api/complaints', async (req, res) => {
  try {
    const { city_id, status, category, project_id } = req.query;
    
    let query = supabase
      .from('complaints')
      .select(`
        *,
        citizens (name, phone),
        cities (name, state)
      `);
    
    if (city_id) {
      query = query.eq('city_id', city_id);
    }
    
    if (project_id) {
      query = query.eq('project_id', project_id);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/complaints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        citizens (name, phone),
        cities (name, state)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/complaints', validate(createComplaintSchema), asyncHandler(async (req, res) => {
  const { citizen_id, citizen_phone, city_id, project_id, original_complaint, original_text, category } = req.body;
    
    const complaintText = original_complaint || original_text;
    
    // Usar IA para processar reclamação
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const complaintPrompt = `Analise esta reclamação e forneça:

Reclamação: ${complaintText}

Forneça:
1. Categoria principal (iluminacao, asfalto, saude, educacao, transporte, seguranca, limpeza, meio_ambiente, outro)
2. Órgão responsável provável (prefeitura, camara, estado, outro)
3. Texto formal da reclamação

Formato de resposta:
CATEGORIA: [categoria]
ORGAO: [órgão]
TEXTO_FORMAL: [texto formal]`;

    const result = await model.generateContent(complaintPrompt);
    const response = await result.response;
    const aiText = response.text();
    
    // Parse da resposta da IA
    const finalCategory = aiText.match(/CATEGORIA: (.+)/)?.[1] || category || 'outro';
    const responsibleAgency = aiText.match(/ORGAO: (.+)/)?.[1] || 'prefeitura';
    const formalDocument = aiText.match(/TEXTO_FORMAL: (.+)/)?.[1] || complaintText;
    
    const { data, error } = await supabase
      .from('complaints')
      .insert([{
        citizen_id,
        citizen_phone: citizen_phone || null,
        city_id,
        project_id: project_id || null,
        original_complaint: complaintText,
        formal_document: formalDocument,
        category: finalCategory,
        responsible_agency: responsibleAgency,
        status: 'registrada',
        document_url: null,
        sent_date: null
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Gerar PDF (será implementado com Python)
    // await generateComplaintPDF(data.id);
    
    res.json(data);
}));

// Rotas do WhatsApp
import whatsappRoutes from './routes/whatsapp.js';
app.use('/api/whatsapp', whatsappRoutes);

// Rotas de Conversas WhatsApp
app.get('/api/conversations', async (req, res) => {
  try {
    const { citizen_phone, limit } = req.query;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : (typeof limit === 'number' ? limit : 50);
    
    let query = supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limitNum);
    
    if (citizen_phone) {
      query = query.eq('citizen_phone', citizen_phone);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Variável global para armazenar o socket do WhatsApp
let whatsappSocket: any = null;

// Rotas WhatsApp
app.get('/api/whatsapp/status', asyncHandler(async (req, res) => {
  try {
    const whatsappModule = await import('./whatsapp.js');
    const status = whatsappModule.getGlobalConnectionStatus();
    const qrCode = whatsappModule.getGlobalQRCode();
    
    res.json({
      status: status,
      qrCode: qrCode,
      connected: status === 'connected',
      socketExists: whatsappSocket !== null
    });
  } catch (error: any) {
    console.error('Erro ao buscar status WhatsApp:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar status' });
  }
}));

app.get('/api/whatsapp/qr', asyncHandler(async (req, res) => {
  try {
    const whatsappModule = await import('./whatsapp.js');
    const status = whatsappModule.getGlobalConnectionStatus();
    const qrCode = whatsappModule.getGlobalQRCode();
    
    if (qrCode) {
      res.json({ qrCode: qrCode, status: status });
    } else {
      res.json({ 
        qrCode: null, 
        status: status, 
        message: 'QR Code ainda não foi gerado. Inicie a conexão primeiro.' 
      });
    }
  } catch (error: any) {
    console.error('Erro ao buscar QR Code:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar QR Code' });
  }
}));

app.post('/api/whatsapp/connect', asyncHandler(async (req, res) => {
  try {
    const whatsappModule = await import('./whatsapp.js');
    const currentStatus = whatsappModule.getGlobalConnectionStatus();
    
    if (currentStatus === 'connected') {
      return res.json({ 
        success: true, 
        message: 'WhatsApp já está conectado', 
        status: currentStatus 
      });
    }

    if (currentStatus === 'connecting') {
      return res.json({ 
        success: false, 
        message: 'Conexão já em andamento', 
        status: currentStatus 
      });
    }

    // Importar e iniciar conexão WhatsApp (não aguardar, pois é assíncrono)
    whatsappModule.connectToWhatsApp().then((sock) => {
      whatsappSocket = sock;
      console.log('WhatsApp socket criado com sucesso');
    }).catch(async (err) => {
      console.error('Erro ao conectar WhatsApp:', err);
      // Atualizar status para disconnected em caso de erro
      try {
        const errorModule = await import('./whatsapp.js');
        errorModule.setGlobalConnectionStatus('disconnected');
      } catch (importError) {
        console.error('Erro ao atualizar status:', importError);
      }
    });

    res.json({ 
      success: true, 
      message: 'Conexão iniciada. Escaneie o QR Code quando aparecer.',
      status: 'connecting'
    });
  } catch (error: any) {
    console.error('Erro ao iniciar conexão WhatsApp:', error);
    res.status(500).json({ error: error.message || 'Erro ao iniciar conexão' });
  }
}));

app.post('/api/whatsapp/disconnect', asyncHandler(async (req, res) => {
  try {
    if (whatsappSocket) {
      try {
        await whatsappSocket.logout();
      } catch (err) {
        console.error('Erro ao fazer logout:', err);
      }
      whatsappSocket = null;
    }
    
    const whatsappModule = await import('./whatsapp.js');
    whatsappModule.setGlobalConnectionStatus('disconnected');
    whatsappModule.setGlobalQRCode(null);
    
    res.json({ 
      success: true, 
      message: 'WhatsApp desconectado com sucesso',
      status: 'disconnected'
    });
  } catch (error: any) {
    console.error('Erro ao desconectar WhatsApp:', error);
    res.status(500).json({ error: error.message || 'Erro ao desconectar' });
  }
}));

app.post('/api/whatsapp/send', asyncHandler(async (req, res) => {
  try {
    const whatsappModule = await import('./whatsapp.js');
    const currentStatus = whatsappModule.getGlobalConnectionStatus();
    
    if (currentStatus !== 'connected' || !whatsappSocket) {
      return res.status(400).json({ error: 'WhatsApp não está conectado' });
    }

    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ error: 'Telefone e mensagem são obrigatórios' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const jid = `${cleanPhone}@s.whatsapp.net`;
    
    await whatsappSocket.sendMessage(jid, { text: message });
    
    res.json({ success: true, phone: cleanPhone, sentMessage: message });
  } catch (error: any) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: error.message || 'Erro ao enviar mensagem' });
  }
}));

// Função auxiliar para notificar cidadãos
async function notifyCitizens(cityId: string, type: string, data: any) {
  try {
    // Obter cidadãos da cidade com notificações ativas
    const { data: citizens } = await supabase
      .from('citizens')
      .select('phone, name')
      .eq('city_id', cityId)
      .eq('notifications_enabled', true);

    if (!citizens || citizens.length === 0) return;

    // Criar mensagem baseada no tipo
    let message = '';
    if (type === 'new_project') {
      message = `📋 Novo projeto disponível para votação! Acesse e participe do processo democrático.`;
    } else if (type === 'project_notification') {
      message = `📢 Projeto: ${data.title}. Sua opinião é importante! Vote e comente.`;
    }

    // Enviar mensagens em fila (1 por segundo para evitar spam)
    for (const citizen of citizens) {
      setTimeout(async () => {
        try {
          // Implementar envio via Baileys
          console.log(`Enviando para ${citizen.phone}: ${message}`);
        } catch (error) {
          console.error(`Erro ao enviar para ${citizen.phone}:`, error);
        }
      }, citizens.indexOf(citizen) * 1000);
    }
  } catch (error) {
    console.error('Erro ao notificar cidadãos:', error);
  }
}

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    supabase: !!process.env.SUPABASE_URL,
    gemini: !!process.env.GOOGLE_API_KEY
  });
});

// Configurar encoding UTF-8 para todas as respostas JSON
app.use((req, res, next) => {
  // Garantir que todas as respostas JSON usem UTF-8
  if (res.getHeader('Content-Type')?.toString().includes('application/json')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  next();
});

// Error Handler Global (deve ser o último middleware)
app.use(errorHandler);

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log(`📊 Dashboard: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
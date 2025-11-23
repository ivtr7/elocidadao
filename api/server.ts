import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createHash } from 'crypto';

// Carregar variáveis de ambiente
dotenv.config();

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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do multer para upload de arquivos
const upload = multer({ storage: multer.memoryStorage() });

// Rotas de Cidades
app.post('/api/cities', async (req, res) => {
  try {
    const { name, state, population, chamber_url } = req.body;
    
    const { data, error } = await supabase
      .from('cities')
      .insert([{ name, state, population, chamber_url }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
app.post('/api/projects', async (req, res) => {
  try {
    const { city_id, number, title, full_text, tags } = req.body;
    
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

Formato de resposta:
TITULO_SIMPLIFICADO: [texto]
RESUMO: [texto]
BENEFICIADOS: [texto]
PREJUDICADOS: [texto]`;

      const result = await model.generateContent(simplificationPrompt);
      const response = await result.response;
      const aiText = response.text();
      
      // Parse da resposta da IA
      simple_title = aiText.match(/TITULO_SIMPLIFICADO: (.+)/)?.[1] || title;
      summary = aiText.match(/RESUMO: (.+)/)?.[1] || '';
      who_benefits = aiText.match(/BENEFICIADOS: (.+)/)?.[1] || '';
      who_loses = aiText.match(/PREJUDICADOS: (.+)/)?.[1] || '';
    } catch (aiError) {
      console.log('AI processing failed, using fallback:', aiError.message);
      // Usar fallback simples quando IA não está disponível
      summary = full_text.substring(0, 200) + '...';
      who_benefits = 'Cidadãos da cidade';
      who_loses = 'Nenhum grupo específico';
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
        tags: tags || []
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Notificar cidadãos da cidade (assíncrono)
    notifyCitizens(city_id, 'new_project', { project_id: data.id });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
app.post('/api/votes', async (req, res) => {
  try {
    const { project_id, citizen_id, position, reasoning, neighborhood } = req.body;
    
    // Verificar se o cidadão já votou neste projeto
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('project_id', project_id)
      .eq('citizen_id', citizen_id)
      .single();

    if (existingVote) {
      return res.status(400).json({ error: 'Cidadão já votou neste projeto' });
    }

    const { data, error } = await supabase
      .from('votes')
      .insert([{ project_id, citizen_id, position, reasoning, neighborhood }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

app.post('/api/comments', async (req, res) => {
  try {
    const { project_id, citizen_id, content } = req.body;
    
    const { data, error } = await supabase
      .from('comments')
      .insert([{ project_id, citizen_id, content }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

app.post('/api/complaints', async (req, res) => {
  try {
    const { citizen_id, city_id, project_id, original_text, category } = req.body;
    
    // Usar IA para processar reclamação
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const complaintPrompt = `Analise esta reclamação e forneça:

Reclamação: ${original_text}

Forneça:
1. Categoria principal (saúde, educação, infraestrutura, segurança, transporte, meio ambiente, outros)
2. Órgão responsável provável
3. Texto formal da reclamação

Formato de resposta:
CATEGORIA: [categoria]
ORGAO: [órgão]
TEXTO_FORMAL: [texto formal]`;

    const result = await model.generateContent(complaintPrompt);
    const response = await result.response;
    const aiText = response.text();
    
    // Parse da resposta da IA
    const finalCategory = aiText.match(/CATEGORIA: (.+)/)?.[1] || category || 'outros';
    const responsibleAgency = aiText.match(/ORGAO: (.+)/)?.[1] || 'Prefeitura Municipal';
    const formalDocument = aiText.match(/TEXTO_FORMAL: (.+)/)?.[1] || original_text;
    
    const { data, error } = await supabase
      .from('complaints')
      .insert([{
        citizen_id,
        city_id,
        project_id: project_id || null,
        original_text,
        formal_document,
        category: finalCategory,
        responsible_agency: responsibleAgency
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Gerar PDF (será implementado com Python)
    // await generateComplaintPDF(data.id);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rotas de Conversas WhatsApp
app.get('/api/conversations', async (req, res) => {
  try {
    const { citizen_phone, limit = 50 } = req.query;
    
    let query = supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
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

// Rotas WhatsApp
app.get('/api/whatsapp/qr', (req, res) => {
  // Implementar geração de QR code para WhatsApp
  res.json({ message: 'QR Code endpoint - implementar com Baileys' });
});

app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    // Implementar envio de mensagem via Baileys
    // Por enquanto, apenas simular
    
    res.json({ message: 'Mensagem enviada com sucesso', phone, message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log(`📊 Dashboard: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
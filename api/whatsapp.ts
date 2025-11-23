import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as qrcode from 'qrcode-terminal'
import dotenv from 'dotenv'

dotenv.config()

// Configurações
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

// Função principal do WhatsApp
async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info')
  const { version, isLatest } = await fetchLatestBaileysVersion()
  
  console.log(`Usando WA v${version.join('.')}, é a última: ${isLatest}`)

  const sock = makeWASocket({
    version,
    logger: { level: 'info' },
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, { level: 'info' })
    },
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: true,
    fireInitQueries: true,
    shouldIgnoreJid: (jid) => {
      // Ignorar grupos e broadcasts
      return jid.includes('@g.us') || jid.includes('@broadcast')
    }
  })

  // Evento de conexão
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update
    
    if (qr) {
      console.log('QR Code gerado, escaneie com seu WhatsApp')
      qrcode.generate(qr, { small: true })
    }
    
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('Conexão fechada devido a:', lastDisconnect?.error, ', reconectando:', shouldReconnect)
      
      if (shouldReconnect) {
        setTimeout(() => connectToWhatsApp(), 5000)
      }
    } else if (connection === 'open') {
      console.log('✅ WhatsApp conectado com sucesso!')
    }
  })

  // Salvar credenciais
  sock.ev.on('creds.update', saveCreds)

  // Processar mensagens
  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0]
    if (!msg.message || msg.key.fromMe) return

    const messageText = msg.message.conversation || 
                       msg.message.extendedTextMessage?.text || 
                       msg.message.imageMessage?.caption || ''

    const sender = msg.key.remoteJid
    if (!sender) return

    console.log(`Mensagem recebida de ${sender}: ${messageText}`)

    try {
      // Processar mensagem com IA
      await processMessageWithAI(sender, messageText, sock)
    } catch (error) {
      console.error('Erro ao processar mensagem:', error)
      await sendMessage(sock, sender, 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.')
    }
  })

  return sock
}

// Processar mensagem com IA
async function processMessageWithAI(sender: string, message: string, sock: any) {
  // Extrair número de telefone
  const phone = sender.replace('@s.whatsapp.net', '')
  
  // Buscar ou criar cidadão
  let citizen = await findOrCreateCitizen(phone, message)
  
  // Buscar conversa ativa ou criar nova
  let conversation = await findOrCreateConversation(phone)
  
  // Salvar mensagem do usuário
  await saveMessage(conversation.id, 'user', message)

  // Processar com IA
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })
  
  // Contexto da conversa
  const context = await getConversationContext(conversation.id)
  
  const systemPrompt = `Você é o Elo Cidadão, um assistente de participação popular municipal.
  
INFORMAÇÕES DO CIDADÃO:
- Nome: ${citizen.name}
- Cidade: ${citizen.city_name || 'Não identificada'}
- Telefone: ${phone}
- Nível de engajamento: ${citizen.engagement_level}

REGRAS IMPORTANTES:
1. Sempre identifique a cidade do cidadão antes de responder
2. Só mostre projetos da cidade dele
3. Explique projetos em linguagem simples
4. Sempre ofereça opções: votar, comentar ou reclamar
5. Todas as ações são registradas no sistema
6. Seja amigável e educado
7. Use emojis apropriados

HISTÓRICO DA CONVERSA:
${context}

MENSAGEM ATUAL DO CIDADÃO:
${message}

RESPONDA DE FORMA NATURAL E ÚTIL:`

  const result = await model.generateContent(systemPrompt)
  const response = await result.response
  const aiResponse = response.text()

  // Salvar resposta da IA
  await saveMessage(conversation.id, 'assistant', aiResponse)

  // Enviar resposta
  await sendMessage(sock, sender, aiResponse)

  // Atualizar última interação do cidadão
  await updateCitizenInteraction(phone)
}

// Funções auxiliares
async function findOrCreateCitizen(phone: string, firstMessage: string) {
  // Buscar cidadão por telefone
  const { data: existingCitizen } = await supabase
    .from('citizens')
    .select('*')
    .eq('phone', phone)
    .single()

  if (existingCitizen) {
    return existingCitizen
  }

  // Extrair nome da primeira mensagem ou usar padrão
  const name = extractNameFromMessage(firstMessage) || 'Cidadão'
  
  // Identificar cidade pela mensagem
  const cityId = await identifyCityFromMessage(firstMessage)

  // Criar novo cidadão
  const { data: newCitizen } = await supabase
    .from('citizens')
    .insert([{
      name,
      phone,
      city_id: cityId,
      engagement_level: 'beginner'
    }])
    .select()
    .single()

  return newCitizen
}

async function findOrCreateConversation(phone: string) {
  // Buscar conversa mais recente (últimas 24 horas)
  const { data: existingConversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('citizen_phone', phone)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existingConversation) {
    return existingConversation
  }

  // Criar nova conversa
  const { data: newConversation } = await supabase
    .from('conversations')
    .insert([{
      citizen_phone: phone,
      agent_name: 'elo_cidadao',
      metadata: { started_at: new Date().toISOString() }
    }])
    .select()
    .single()

  return newConversation
}

async function saveMessage(conversationId: string, role: string, content: string) {
  await supabase
    .from('messages')
    .insert([{
      conversation_id: conversationId,
      role,
      content
    }])
}

async function getConversationContext(conversationId: string) {
  const { data: messages } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(10)

  return messages?.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n') || ''
}

async function updateCitizenInteraction(phone: string) {
  await supabase
    .from('citizens')
    .update({ last_interaction: new Date().toISOString() })
    .eq('phone', phone)
}

async function sendMessage(sock: any, recipient: string, message: string) {
  try {
    await sock.sendMessage(recipient, { text: message })
    console.log(`Mensagem enviada para ${recipient}`)
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
  }
}

function extractNameFromMessage(message: string): string {
  // Tentar extrair nome de saudações comuns
  const greetings = ['oi', 'olá', 'bom dia', 'boa tarde', 'boa noite']
  const words = message.toLowerCase().split(' ')
  
  // Procurar por "meu nome é" ou "me chamo"
  const namePatterns = [
    /meu nome é ([a-zA-Z\s]+)/i,
    /me chamo ([a-zA-Z\s]+)/i,
    /sou ([a-zA-Z\s]+)/i,
    /meu nome ([a-zA-Z\s]+)/i
  ]
  
  for (const pattern of namePatterns) {
    const match = message.match(pattern)
    if (match) {
      return match[1].trim().split(' ')[0]
    }
  }
  
  return 'Cidadão'
}

async function identifyCityFromMessage(message: string): Promise<string | null> {
  // Buscar cidades mencionadas na mensagem
  const { data: cities } = await supabase
    .from('cities')
    .select('id, name')
    .eq('is_active', true)

  if (!cities) return null

  // Procurar por nome de cidade na mensagem
  for (const city of cities) {
    if (message.toLowerCase().includes(city.name.toLowerCase())) {
      return city.id
    }
  }

  return null
}

// Iniciar conexão
connectToWhatsApp().catch(console.error)
import { proto } from '@whiskeysockets/baileys'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { WASocket } from '@whiskeysockets/baileys'

// Configurações
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

// Estados da conversa
export enum ConversationState {
  INITIAL = 'initial',
  GREETING = 'greeting',
  LISTING_PROJECTS = 'listing_projects',
  VOTING = 'voting',
  COLLECTING_VOTE_REASON = 'collecting_vote_reason',
  COMPLAINING = 'complaining',
  PROCESSING_COMPLAINT = 'processing_complaint',
  MENU = 'menu',
  PROFILE = 'profile',
  ENDING = 'ending'
}

interface ConversationContext {
  state: ConversationState
  citizenId?: string
  cityId?: string
  currentProjectId?: string
  currentVotePosition?: 'support' | 'against'
  data?: Record<string, any>
}

// Cache de contextos de conversa
const conversationContexts = new Map<string, ConversationContext>()

/**
 * Extrai o número de telefone do JID do WhatsApp
 */
export function extractPhoneFromJid(jid: string): string {
  return jid.replace('@s.whatsapp.net', '').replace('+', '')
}

/**
 * Processa mensagem recebida do WhatsApp
 */
export async function processWhatsAppMessage(
  sock: WASocket,
  message: proto.IMessage,
  key: proto.IMessageKey
) {
  if (!key.remoteJid || key.fromMe) return

  const phone = extractPhoneFromJid(key.remoteJid)
  const messageText = extractMessageText(message)

  if (!messageText) return

  console.log(`📱 Mensagem de ${phone}: ${messageText}`)

  // Verificar comandos especiais
  const command = detectCommand(messageText)
  if (command) {
    await handleCommand(sock, phone, command, messageText)
    return
  }

  // Obter ou criar contexto de conversa
  const context = getOrCreateContext(phone)

  // Processar baseado no estado atual
  switch (context.state) {
    case ConversationState.INITIAL:
    case ConversationState.GREETING:
      await handleGreeting(sock, phone, messageText, context)
      break

    case ConversationState.LISTING_PROJECTS:
      await handleProjectSelection(sock, phone, messageText, context)
      break

    case ConversationState.VOTING:
      await handleVotePosition(sock, phone, messageText, context)
      break

    case ConversationState.COLLECTING_VOTE_REASON:
      await handleVoteReason(sock, phone, messageText, context)
      break

    case ConversationState.COMPLAINING:
    case ConversationState.PROCESSING_COMPLAINT:
      await handleComplaint(sock, phone, messageText, context)
      break

    default:
      await handleDefaultMessage(sock, phone, messageText, context)
  }
}

/**
 * PASSO 1: SAUDAÇÃO & CADASTRO
 */
async function handleGreeting(
  sock: WASocket,
  phone: string,
  message: string,
  context: ConversationContext
) {
  // Primeiro, verificar se estamos aguardando alguma informação
  if (context.data?.waitingFor === 'city') {
    // Processar seleção de cidade
    const cityInput = message.trim()
    const cityNumber = parseInt(cityInput)
    
    let selectedCity = null
    const cities = context.data.cities || []
    
    if (!isNaN(cityNumber) && cityNumber > 0 && cityNumber <= cities.length) {
      selectedCity = cities[cityNumber - 1]
    } else {
      // Buscar por nome
      selectedCity = cities.find(
        (c: any) => c.name.toLowerCase().includes(cityInput.toLowerCase())
      )
    }

    if (!selectedCity) {
      await sendMessage(sock, phone, `❌ Cidade não encontrada. Digite o número ou nome completo.`)
      conversationContexts.set(phone, context)
      return
    }

    // Criar cidadão
    const { data: newCitizen, error } = await supabase
      .from('citizens')
      .insert([{
        name: context.data.name,
        phone: phone,
        city_id: selectedCity.id,
        engagement_level: 'new'
      }])
      .select()
      .single()

    if (error || !newCitizen) {
      await sendMessage(sock, phone, `❌ Erro ao criar cadastro. Tente novamente.`)
      return
    }

    context.citizenId = newCitizen.id
    context.cityId = selectedCity.id
    context.data = {}
    context.state = ConversationState.MENU

      const citizenName = context.data.name || 'Cidadão'
      
      await sendMessage(
        sock,
        phone,
        `✅ *Cadastro concluído!*\n\n` +
        `👋 Olá, ${citizenName}! Bem-vindo ao Elo Cidadão!\n\n` +
        `Você está em *${selectedCity.name} - ${selectedCity.state}*.\n\n` +
        `O que você gostaria de fazer hoje?\n\n` +
        `📋 Digite */projetos* para ver projetos em votação\n` +
        `🗳️ Digite */votar* para votar em um projeto\n` +
        `📝 Digite */reclamar* para registrar uma reclamação\n` +
        `👤 Digite */perfil* para ver seu perfil completo\n` +
        `📖 Digite */menu* para ver todos os comandos`
      )
    conversationContexts.set(phone, context)
    return
  }

  if (context.data?.waitingFor === 'name') {
    // Processar nome fornecido
    const name = message.trim()
    if (name.length < 2) {
      await sendMessage(sock, phone, `❌ Por favor, digite um nome válido.`)
      conversationContexts.set(phone, context)
      return
    }

    // Listar cidades
    const { data: cities } = await supabase
      .from('cities')
      .select('id, name, state')
      .eq('is_active', true)
      .order('name')

    if (!cities || cities.length === 0) {
      await sendMessage(
        sock,
        phone,
        `❌ Desculpe, não há cidades cadastradas no momento.`
      )
      return
    }

    let citiesList = `Ótimo, ${name}! Agora preciso saber em qual cidade você mora.\n\n`
    citiesList += `*Escolha sua cidade:*\n\n`
    
    cities.slice(0, 10).forEach((city, index) => {
      citiesList += `${index + 1}. ${city.name} - ${city.state}\n`
    })

    citiesList += `\nDigite o *número* da sua cidade ou o *nome* completo.`

    await sendMessage(sock, phone, citiesList)

    context.data = { 
      waitingFor: 'city',
      name: name,
      cities: cities
    }
    context.state = ConversationState.GREETING
    conversationContexts.set(phone, context)
    return
  }

  // Buscar cidadão existente
  const { data: existingCitizen } = await supabase
    .from('citizens')
    .select('*, cities(name, state)')
    .eq('phone', phone)
    .single()

  if (existingCitizen) {
    // Cidadão existente - saudação personalizada
    context.citizenId = existingCitizen.id
    context.cityId = existingCitizen.city_id

    const cityName = (existingCitizen.cities as any)?.name || 'sua cidade'
    
    await sendMessage(
      sock,
      phone,
      `👋 Olá, ${existingCitizen.name}! Bem-vindo de volta ao Elo Cidadão!\n\n` +
      `Você está em *${cityName}*.\n\n` +
      `📊 Seu perfil:\n` +
      `• Votos: ${existingCitizen.total_votes || 0}\n` +
      `• Comentários: ${existingCitizen.total_comments || 0}\n` +
      `• Reclamações: ${existingCitizen.total_complaints || 0}\n` +
      `• Nível: ${existingCitizen.engagement_level || 'Iniciante'}\n\n` +
      `O que você gostaria de fazer hoje?\n\n` +
      `📋 Digite */projetos* para ver projetos em votação\n` +
      `🗳️ Digite */votar* para votar em um projeto\n` +
      `📝 Digite */reclamar* para registrar uma reclamação\n` +
      `👤 Digite */perfil* para ver seu perfil completo\n` +
      `📖 Digite */menu* para ver todos os comandos`
    )

    context.state = ConversationState.MENU
    conversationContexts.set(phone, context)
    return
  }

  // Novo cidadão - tentar extrair nome da mensagem
  const nameMatch = message.match(/meu nome é (.+)|eu sou (.+)|sou (.+)|chamo (.+)/i)
  const name = nameMatch ? (nameMatch[1] || nameMatch[2] || nameMatch[3] || nameMatch[4]) : null

  if (!name) {
    // Não encontrou nome, pedir
    await sendMessage(
      sock,
      phone,
      `👋 Olá! Bem-vindo ao *Elo Cidadão*!\n\n` +
      `Sou seu assistente de participação popular municipal.\n\n` +
      `Para começar, preciso saber seu nome. Como você se chama?`
    )
    context.data = { waitingFor: 'name' }
    context.state = ConversationState.GREETING
    conversationContexts.set(phone, context)
    return
  }

  // Nome encontrado, listar cidades
  const { data: cities } = await supabase
    .from('cities')
    .select('id, name, state')
    .eq('is_active', true)
    .order('name')

  if (!cities || cities.length === 0) {
    await sendMessage(
      sock,
      phone,
      `❌ Desculpe, não há cidades cadastradas no momento.`
    )
    return
  }

  let citiesList = `Ótimo, ${name}! Agora preciso saber em qual cidade você mora.\n\n`
  citiesList += `*Escolha sua cidade:*\n\n`
  
  cities.slice(0, 10).forEach((city, index) => {
    citiesList += `${index + 1}. ${city.name} - ${city.state}\n`
  })

  citiesList += `\nDigite o *número* da sua cidade ou o *nome* completo.`

  await sendMessage(sock, phone, citiesList)

  context.data = { 
    waitingFor: 'city',
    name: name.trim(),
    cities: cities
  }
  context.state = ConversationState.GREETING
  conversationContexts.set(phone, context)
}

/**
 * PASSO 2: LISTAR PROJETOS
 */
async function handleProjectListing(
  sock: WASocket,
  phone: string,
  context: ConversationContext
) {
  if (!context.cityId) {
    await sendMessage(sock, phone, `❌ Não foi possível identificar sua cidade. Use */menu* para recomeçar.`)
    return
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('id, number, title, simple_title, summary, author, total_support, total_against, total_comments, status')
    .eq('city_id', context.cityId)
    .eq('status', 'em_votação')
    .order('created_at', { ascending: false })
    .limit(5)

  if (!projects || projects.length === 0) {
    await sendMessage(
      sock,
      phone,
      `📋 Não há projetos em votação no momento em sua cidade.\n\n` +
      `Novos projetos aparecerão aqui quando forem publicados!`
    )
    context.state = ConversationState.MENU
    return
  }

  let projectsList = `📋 *Projetos em Votação*\n\n`
  
  projects.forEach((project, index) => {
    const title = project.simple_title || project.title
    const support = project.total_support || 0
    const against = project.total_against || 0
    const total = support + against

    projectsList += `*${index + 1}. Projeto ${project.number}*\n`
    projectsList += `📌 ${title}\n`
    if (project.summary) {
      projectsList += `📝 ${project.summary.substring(0, 100)}...\n`
    }
    if (project.author) {
      projectsList += `👤 Autor: ${project.author}\n`
    }
    projectsList += `👍 ${support} a favor | 👎 ${against} contra`
    if (total > 0) {
      const supportPercent = Math.round((support / total) * 100)
      projectsList += ` (${supportPercent}% a favor)`
    }
    projectsList += `\n\n`
  })

  projectsList += `*Para votar:* Digite o *número* do projeto (ex: 1, 2, 3...) ou */votar [número]*\n\n`
  projectsList += `*Para ver detalhes:* Digite */projeto [número]*`

  await sendMessage(sock, phone, projectsList)
  context.state = ConversationState.LISTING_PROJECTS
  conversationContexts.set(phone, context)
}

/**
 * PASSO 3: VOTAÇÃO (CORAÇÃO DO SISTEMA)
 */
async function handleProjectSelection(
  sock: WASocket,
  phone: string,
  message: string,
  context: ConversationContext
) {
  if (!context.cityId) {
    await sendMessage(sock, phone, `❌ Não foi possível identificar sua cidade. Use */menu* para recomeçar.`)
    return
  }

  // Extrair número do projeto
  const projectNumber = message.match(/\d+/)?.[0]
  if (!projectNumber) {
    await sendMessage(sock, phone, `❌ Por favor, digite o número do projeto (ex: 1, 2, 3...)`)
    return
  }

  const projectIndex = parseInt(projectNumber) - 1
  if (projectIndex < 0 || projectIndex >= 5) {
    await sendMessage(sock, phone, `❌ Número inválido. Escolha entre 1 e 5.`)
    return
  }

  // Buscar projetos novamente
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('city_id', context.cityId)
    .eq('status', 'em_votação')
    .order('created_at', { ascending: false })
    .limit(5)

  if (!projects || !projects[projectIndex]) {
    await sendMessage(sock, phone, `❌ Projeto não encontrado.`)
    return
  }

  const project = projects[projectIndex]
  context.currentProjectId = project.id

  // Mostrar detalhes do projeto
  let projectDetails = `📋 *Projeto ${project.number}*\n\n`
  projectDetails += `*${project.simple_title || project.title}*\n\n`
  
  if (project.summary) {
    projectDetails += `📝 *Resumo:*\n${project.summary}\n\n`
  }

  if (project.who_benefits) {
    projectDetails += `✅ *Quem se beneficia:*\n${project.who_benefits}\n\n`
  }

  if (project.who_loses) {
    projectDetails += `⚠️ *Impactos negativos:*\n${project.who_loses}\n\n`
  }

  projectDetails += `📊 *Votação atual:*\n`
  projectDetails += `👍 ${project.total_support || 0} a favor\n`
  projectDetails += `👎 ${project.total_against || 0} contra\n\n`

  projectDetails += `*Como você vota neste projeto?*\n\n`
  projectDetails += `✅ Digite *A FAVOR* ou *SIM*\n`
  projectDetails += `❌ Digite *CONTRA* ou *NÃO*`

  await sendMessage(sock, phone, projectDetails)
  context.state = ConversationState.VOTING
  conversationContexts.set(phone, context)
}

async function handleVotePosition(
  sock: WASocket,
  phone: string,
  message: string,
  context: ConversationContext
) {
  const isSupport = /a favor|sim|concordo|apoio|favorável/i.test(message)
  const isAgainst = /contra|não|discordo|rejeito/i.test(message)

  if (!isSupport && !isAgainst) {
    await sendMessage(
      sock,
      phone,
      `❌ Por favor, responda com:\n` +
      `• *A FAVOR* ou *SIM*\n` +
      `• *CONTRA* ou *NÃO*`
    )
    return
  }

  context.currentVotePosition = isSupport ? 'support' : 'against'

  await sendMessage(
    sock,
    phone,
    `✅ Voto registrado: *${isSupport ? 'A FAVOR' : 'CONTRA'}*\n\n` +
    `💭 *Opcional:* Quer adicionar uma justificativa para seu voto?\n\n` +
    `Digite sua justificativa ou *pular* para finalizar.`
  )

  context.state = ConversationState.COLLECTING_VOTE_REASON
  conversationContexts.set(phone, context)
}

async function handleVoteReason(
  sock: WASocket,
  phone: string,
  message: string,
  context: ConversationContext
) {
  if (/pular|não|não quero|skip/i.test(message)) {
    await finalizeVote(sock, phone, context, '')
    return
  }

  await finalizeVote(sock, phone, context, message)
}

/**
 * Finaliza voto e atualiza em cascata
 */
async function finalizeVote(
  sock: WASocket,
  phone: string,
  context: ConversationContext,
  reasoning: string
) {
  if (!context.currentProjectId || !context.currentVotePosition || !context.citizenId) {
    await sendMessage(sock, phone, `❌ Erro ao processar voto. Tente novamente.`)
    return
  }

  try {
    // 1. Criar voto
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert([{
        project_id: context.currentProjectId,
        citizen_id: context.citizenId,
        citizen_phone: phone,
        city_id: context.cityId,
        position: context.currentVotePosition,
        reasoning: reasoning || null,
        upvotes: 0,
        downvotes: 0,
        quality_score: 0
      }])
      .select()
      .single()

    if (voteError) throw voteError

    // 2. Atualizar projeto (incrementar contador)
    const { data: project } = await supabase
      .from('projects')
      .select('total_support, total_against')
      .eq('id', context.currentProjectId)
      .single()

    if (project) {
      const newSupport = context.currentVotePosition === 'support' 
        ? (project.total_support || 0) + 1 
        : (project.total_support || 0)
      
      const newAgainst = context.currentVotePosition === 'against'
        ? (project.total_against || 0) + 1
        : (project.total_against || 0)

      // Recalcular engagement_score
      const totalVotes = newSupport + newAgainst
      const totalComments = 0 // Será calculado por trigger
      const engagementScore = (newSupport * 2) + (newAgainst * 1.5) + (totalComments * 3)

      await supabase
        .from('projects')
        .update({
          total_support: newSupport,
          total_against: newAgainst,
          engagement_score: engagementScore
        })
        .eq('id', context.currentProjectId)
    }

    // 3. Atualizar cidadão (incrementar total_votes)
    const { error: citizenError } = await supabase.rpc('increment_citizen_votes', {
      citizen_id_param: context.citizenId
    })
    
    if (citizenError) {
      console.error('Erro ao incrementar votos do cidadão:', citizenError)
    }

    // 4. Buscar resultado atualizado
    const { data: updatedProject } = await supabase
      .from('projects')
      .select('number, title, simple_title, total_support, total_against')
      .eq('id', context.currentProjectId)
      .single()

    const total = (updatedProject?.total_support || 0) + (updatedProject?.total_against || 0)
    const supportPercent = total > 0 
      ? Math.round(((updatedProject?.total_support || 0) / total) * 100)
      : 0

    // 5. Confirmar voto
    await sendMessage(
      sock,
      phone,
      `✅ *Voto registrado com sucesso!*\n\n` +
      `📋 *Projeto ${updatedProject?.number}*\n` +
      `📌 ${updatedProject?.simple_title || updatedProject?.title}\n\n` +
      `📊 *Resultado atualizado:*\n` +
      `👍 ${updatedProject?.total_support || 0} a favor (${supportPercent}%)\n` +
      `👎 ${updatedProject?.total_against || 0} contra\n\n` +
      `${reasoning ? `💭 *Sua justificativa:*\n${reasoning}\n\n` : ''}` +
      `Obrigado por participar da democracia! 🗳️\n\n` +
      `Digite */projetos* para ver mais projetos ou */menu* para outras opções.`
    )

    // Limpar contexto de voto
    context.currentProjectId = undefined
    context.currentVotePosition = undefined
    context.state = ConversationState.MENU
    conversationContexts.set(phone, context)

  } catch (error) {
    console.error('Erro ao finalizar voto:', error)
    await sendMessage(
      sock,
      phone,
      `❌ Erro ao registrar voto. Tente novamente ou use */menu* para outras opções.`
    )
  }
}

/**
 * PASSO 4: RECLAMAÇÃO
 */
async function handleComplaint(
  sock: WASocket,
  phone: string,
  message: string,
  context: ConversationContext
) {
  if (context.state === ConversationState.COMPLAINING) {
    // Processar reclamação com IA
    context.data = { complaintText: message }
    context.state = ConversationState.PROCESSING_COMPLAINT

    await sendMessage(
      sock,
      phone,
      `⏳ Processando sua reclamação com IA...\n\n` +
      `Analisando categoria e órgão responsável...`
    )

    await processComplaintWithAI(sock, phone, message, context)
    return
  }

  // Iniciar processo de reclamação
  await sendMessage(
    sock,
    phone,
    `📝 *Registrar Reclamação*\n\n` +
    `Descreva o problema que você quer reportar.\n\n` +
    `Exemplos:\n` +
    `• "Falta de iluminação na rua X"\n` +
    `• "Buraco na rua Y"\n` +
    `• "Falta de médico no posto de saúde"\n\n` +
    `Digite sua reclamação:`
  )

  context.state = ConversationState.COMPLAINING
  conversationContexts.set(phone, context)
}

async function processComplaintWithAI(
  sock: WASocket,
  phone: string,
  complaintText: string,
  context: ConversationContext
) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `Analise a seguinte reclamação de um cidadão e identifique:

1. CATEGORIA (uma das opções):
- iluminacao
- asfalto
- saude
- educacao
- transporte
- seguranca
- limpeza
- meio_ambiente
- outro

2. ÓRGÃO RESPONSÁVEL (ex: Secretaria de Obras, Secretaria de Saúde, etc.)

3. DOCUMENTO FORMAL estruturado para envio oficial

RECLAMAÇÃO:
"${complaintText}"

Responda APENAS em JSON no formato:
{
  "category": "categoria",
  "responsible_agency": "nome do órgão",
  "formal_document": "documento formal estruturado"
}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const aiResponse = response.text()

    // Extrair JSON da resposta
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Resposta da IA não contém JSON válido')

    const analysis = JSON.parse(jsonMatch[0])

    // Criar reclamação
    const { data: complaint, error } = await supabase
      .from('complaints')
      .insert([{
        citizen_id: context.citizenId,
        citizen_phone: phone,
        city_id: context.cityId,
        original_complaint: complaintText,
        formal_document: analysis.formal_document,
        category: analysis.category,
        responsible_agency: analysis.responsible_agency,
        status: 'registrada'
      }])
      .select()
      .single()

    if (error) throw error

    // Atualizar cidadão
    const { error: citizenError } = await supabase.rpc('increment_citizen_complaints', {
      citizen_id_param: context.citizenId
    })
    
    if (citizenError) {
      console.error('Erro ao incrementar reclamações do cidadão:', citizenError)
    }

    await sendMessage(
      sock,
      phone,
      `✅ *Reclamação registrada com sucesso!*\n\n` +
      `📋 *Protocolo:* ${complaint.id.substring(0, 8).toUpperCase()}\n` +
      `📝 *Categoria:* ${analysis.category}\n` +
      `🏛️ *Órgão responsável:* ${analysis.responsible_agency}\n\n` +
      `*Sua reclamação:*\n${complaintText}\n\n` +
      `*Documento formal gerado:*\n${analysis.formal_document}\n\n` +
      `Sua reclamação será encaminhada ao órgão responsável. Você receberá atualizações sobre o status.\n\n` +
      `Digite */menu* para outras opções.`
    )

    context.state = ConversationState.MENU
    conversationContexts.set(phone, context)

  } catch (error) {
    console.error('Erro ao processar reclamação:', error)
    await sendMessage(
      sock,
      phone,
      `❌ Erro ao processar reclamação. Tente novamente ou use */menu* para outras opções.`
    )
  }
}

/**
 * Comandos especiais
 */
function detectCommand(message: string): string | null {
  const commands = {
    '/menu': 'menu',
    '/projetos': 'projetos',
    '/votar': 'votar',
    '/reclamar': 'reclamar',
    '/perfil': 'perfil',
    '/projeto': 'projeto'
  }

  for (const [cmd, action] of Object.entries(commands)) {
    if (message.toLowerCase().startsWith(cmd)) {
      return action
    }
  }

  return null
}

async function handleCommand(
  sock: WASocket,
  phone: string,
  command: string,
  message: string
) {
  const context = getOrCreateContext(phone)

  switch (command) {
    case 'menu':
      await sendMessage(
        sock,
        phone,
        `📖 *MENU PRINCIPAL*\n\n` +
        `📋 */projetos* - Ver projetos em votação\n` +
        `🗳️ */votar* - Votar em um projeto\n` +
        `📝 */reclamar* - Registrar reclamação\n` +
        `👤 */perfil* - Ver seu perfil\n` +
        `📖 */menu* - Ver este menu\n\n` +
        `*Comandos avançados:*\n` +
        `*/projeto [número]* - Ver detalhes de um projeto`
      )
      context.state = ConversationState.MENU
      break

    case 'projetos':
      await handleProjectListing(sock, phone, context)
      break

    case 'votar':
      const projectNum = message.match(/\d+/)?.[0]
      if (projectNum) {
        await handleProjectSelection(sock, phone, projectNum, context)
      } else {
        await handleProjectListing(sock, phone, context)
      }
      break

    case 'reclamar':
      await handleComplaint(sock, phone, message, context)
      break

    case 'perfil':
      await showProfile(sock, phone, context)
      break

    case 'projeto':
      const num = message.match(/\d+/)?.[0]
      if (num) {
        await handleProjectSelection(sock, phone, num, context)
      } else {
        await sendMessage(sock, phone, `❌ Use: */projeto [número]* (ex: /projeto 1)`)
      }
      break
  }

  conversationContexts.set(phone, context)
}

async function showProfile(
  sock: WASocket,
  phone: string,
  context: ConversationContext
) {
  if (!context.citizenId) {
    await sendMessage(sock, phone, `❌ Perfil não encontrado. Use */menu* para começar.`)
    return
  }

  const { data: citizen } = await supabase
    .from('citizens')
    .select('*, cities(name, state)')
    .eq('id', context.citizenId)
    .single()

  if (!citizen) {
    await sendMessage(sock, phone, `❌ Erro ao buscar perfil.`)
    return
  }

  const cityName = (citizen.cities as any)?.name || 'Não informada'

  await sendMessage(
    sock,
    phone,
    `👤 *SEU PERFIL*\n\n` +
    `👋 *Nome:* ${citizen.name}\n` +
    `📱 *Telefone:* ${phone}\n` +
    `🏙️ *Cidade:* ${cityName}\n\n` +
    `📊 *Estatísticas:*\n` +
    `🗳️ Votos: ${citizen.total_votes || 0}\n` +
    `💬 Comentários: ${citizen.total_comments || 0}\n` +
    `📝 Reclamações: ${citizen.total_complaints || 0}\n` +
    `⭐ Estrelas: ${citizen.stars || 0}\n` +
    `📈 Nível: ${citizen.engagement_level || 'Iniciante'}\n\n` +
    `Digite */menu* para outras opções.`
  )
}

async function handleDefaultMessage(
  sock: WASocket,
  phone: string,
  message: string,
  context: ConversationContext
) {
  // Processar com IA para resposta contextual
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const prompt = `Você é o Elo Cidadão, assistente de participação popular municipal.

Contexto:
- Estado da conversa: ${context.state}
- Cidadão está em: ${context.cityId ? 'cidade identificada' : 'sem cidade'}

Mensagem do cidadão: "${message}"

Responda de forma amigável e útil. Se não souber o que fazer, sugira usar */menu* para ver opções.

Mantenha a resposta curta (máximo 3 linhas).`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const aiResponse = response.text()

    await sendMessage(sock, phone, aiResponse)
  } catch (error) {
    await sendMessage(
      sock,
      phone,
      `Não entendi. Digite */menu* para ver as opções disponíveis.`
    )
  }
}

// Funções auxiliares
function getOrCreateContext(phone: string): ConversationContext {
  if (!conversationContexts.has(phone)) {
    conversationContexts.set(phone, {
      state: ConversationState.INITIAL,
      data: {}
    })
  }
  return conversationContexts.get(phone)!
}

function extractMessageText(message: proto.IMessage): string {
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    ''
  )
}

async function sendMessage(
  sock: WASocket,
  phone: string,
  text: string
) {
  const jid = `${phone}@s.whatsapp.net`
  await sock.sendMessage(jid, { text })
}


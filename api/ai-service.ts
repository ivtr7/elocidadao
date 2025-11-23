import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Configurações
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

// Função para simplificar texto jurídico
export async function simplifyLegalText(title: string, fullText: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    
    const prompt = `Você é um assistente especializado em simplificar linguagem jurídica para cidadãos comuns.

TÍTULO DO PROJETO:
${title}

TEXTO JURÍDICO COMPLETO:
${fullText.substring(0, 4000)}...

POR FAVOR, FORNEÇA:

1. **TÍTULO SIMPLIFICADO** (máximo 100 caracteres, linguagem cotidiana)
2. **RESUMO POPULAR** (máximo 500 caracteres, explicando o que o projeto faz em linguagem simples)
3. **QUEM SE BENEFICIA** (máximo 300 caracteres)
4. **QUEM PODE SER PREJUDICADO** (máximo 300 caracteres)
5. **TAGS/CATEGORIAS** (máximo 5, separadas por vírgula)

FORMATAÇÃO DA RESPOSTA:
TITULO_SIMPLIFICADO: [texto]
RESUMO: [texto]
BENEFICIADOS: [texto]
PREJUDICADOS: [texto]
TAGS: [tag1, tag2, tag3]

IMPORTANTE: Use linguagem simples, evite jargões jurídicos, seja objetivo e claro.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse da resposta
    const simpleTitle = extractField(text, 'TITULO_SIMPLIFICADO')
    const summary = extractField(text, 'RESUMO')
    const whoBenefits = extractField(text, 'BENEFICIADOS')
    const whoLoses = extractField(text, 'PREJUDICADOS')
    const tags = extractField(text, 'TAGS')?.split(',').map(tag => tag.trim()) || []

    return {
      simple_title: simpleTitle || title,
      summary: summary || '',
      who_benefits: whoBenefits || '',
      who_loses: whoLoses || '',
      tags: tags
    }
  } catch (error) {
    console.error('Erro ao simplificar texto jurídico:', error)
    return {
      simple_title: title,
      summary: '',
      who_benefits: '',
      who_loses: '',
      tags: []
    }
  }
}

// Função para processar reclamações
export async function processComplaint(text: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    
    const prompt = `Você é um assistente que analisa reclamações cidadãs e as categoriza.

RECLAMAÇÃO DO CIDADÃO:
${text}

POR FAVOR, FORNEÇA:

1. **CATEGORIA PRINCIPAL** (escolha uma: saúde, educação, infraestrutura, segurança, transporte, meio ambiente, administração, outros)
2. **ÓRGÃO RESPONSÁVEL** (qual departamento municipal provavelmente deve tratar isso)
3. **TEXTO FORMAL** (reescreva a reclamação em linguagem formal para documento oficial, máximo 1000 caracteres)
4. **PRIORIDADE** (alta, média, baixa)
5. **RESUMO** (máximo 200 caracteres)

FORMATAÇÃO DA RESPOSTA:
CATEGORIA: [categoria]
ORGAO: [órgão]
PRIORIDADE: [prioridade]
RESUMO: [resumo]
TEXTO_FORMAL: [texto formal]`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const responseText = response.text()

    return {
      category: extractField(responseText, 'CATEGORIA') || 'outros',
      responsible_agency: extractField(responseText, 'ORGAO') || 'Prefeitura Municipal',
      priority: extractField(responseText, 'PRIORIDADE') || 'média',
      summary: extractField(responseText, 'RESUMO') || text.substring(0, 200),
      formal_document: extractField(responseText, 'TEXTO_FORMAL') || text
    }
  } catch (error) {
    console.error('Erro ao processar reclamação:', error)
    return {
      category: 'outros',
      responsible_agency: 'Prefeitura Municipal',
      priority: 'média',
      summary: text.substring(0, 200),
      formal_document: text
    }
  }
}

// Função para gerar resposta do assistente
export async function generateAssistantResponse(
  message: string, 
  citizenName: string, 
  cityName: string,
  context: string
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    
    const prompt = `Você é o Elo Cidadão, assistente de participação popular municipal via WhatsApp.

INFORMAÇÕES DO CIDADÃO:
- Nome: ${citizenName}
- Cidade: ${cityName}

CONTEXTO DA CONVERSA:
${context}

MENSAGEM DO CIDADÃO:
${message}

COMO ASSISTENTE DO ELO CIDADÃO, VOCÊ DEVE:

1. **SEMPRE** identificar a cidade antes de fornecer informações
2. **SÓ** mostrar projetos da cidade do cidadão
3. **EXPLICAR** projetos em linguagem simples e clara
4. **SEMPRE** oferecer opções: votar, comentar ou reclamar
5. **REGISTRAR** todas as interações
6. **SER** amigável, educado e prestativo
7. **USAR** emojis apropriados para tornar a conversa mais amigável

REGRAS DE RESPOSTA:
- Se o cidadão não tiver cidade identificada, pergunte qual é a cidade dele
- Se ele quiser ver projetos, mostre apenas da cidade dele
- Explique o que é cada projeto antes de perguntar se ele quer votar
- Ofereça sempre as opções principais: votar, comentar, reclamar
- Se ele quiser votar, peça o número do projeto
- Se ele quiser comentar, peça sobre qual projeto
- Se ele quiser reclamar, peça detalhes da reclamação

MENSAGEM DE RESPOSTA:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Erro ao gerar resposta do assistente:', error)
    return 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.'
  }
}

// Função auxiliar para extrair campos do texto
function extractField(text: string, fieldName: string): string | null {
  const match = text.match(new RegExp(`${fieldName}: (.+)`, 'i'))
  return match ? match[1].trim() : null
}

// Função para gerar conteúdo do blog automaticamente
export async function generateBlogContent(type: string, data: any) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    
    let prompt = ''
    
    switch (type) {
      case 'new_project':
        prompt = `Crie um post de blog sobre um novo projeto municipal:
        
Projeto: ${data.title}
Cidade: ${data.city_name}
Resumo: ${data.summary}

Escreva um post de blog de 300-500 caracteres, em tom jornalístico e acessível.`
        break
        
      case 'voting_milestone':
        prompt = `Crie um post de blog sobre marco de votação:
        
Projeto: ${data.project_title}
Total de votos: ${data.total_votes}
Cidade: ${data.city_name}

Escreva um post de blog de 200-400 caracteres.`
        break
        
      case 'citizen_engagement':
        prompt = `Crie um post de blog sobre engajamento cidadão:
        
Cidadão: ${data.citizen_name}
Nível: ${data.engagement_level}
Ações: ${data.total_actions}

Escreva um post de blog de 200-300 caracteres.`
        break
    }

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Erro ao gerar conteúdo do blog:', error)
    return ''
  }
}
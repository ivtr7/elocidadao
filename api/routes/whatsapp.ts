import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'

const router = Router()
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

/**
 * GET /api/whatsapp/connect
 * Retorna URL para conectar WhatsApp ao agente
 */
router.get('/connect', async (req, res) => {
  try {
    // Em produção, isso geraria um link único via Base44 ou similar
    // Por enquanto, retornamos instruções
    res.json({
      message: 'Para conectar seu WhatsApp ao Elo Cidadão:',
      instructions: [
        '1. Inicie o servidor WhatsApp (npm run whatsapp)',
        '2. Escaneie o QR Code exibido no terminal',
        '3. Envie uma mensagem para o número conectado',
        '4. O agente responderá automaticamente'
      ],
      status: 'ready'
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/whatsapp/stats
 * Estatísticas do WhatsApp
 */
router.get('/stats', async (req, res) => {
  try {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .order('created_at', { ascending: false })

    const { data: messages } = await supabase
      .from('messages')
      .select('id')
      .order('created_at', { ascending: false })

    res.json({
      total_conversations: conversations?.length || 0,
      total_messages: messages?.length || 0,
      active_today: conversations?.filter((c: any) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return c.created_at && new Date(c.created_at) >= today
      }).length || 0
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router


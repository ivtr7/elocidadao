import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import { createClient } from '@supabase/supabase-js'
import * as qrcode from 'qrcode-terminal'
import dotenv from 'dotenv'

dotenv.config()

// Configurações
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)


// Variáveis globais para status (usando objeto para permitir mutação)
const statusState = {
  connectionStatus: 'disconnected' as 'disconnected' | 'connecting' | 'connected',
  qrCode: null as string | null
};

export const getGlobalConnectionStatus = () => statusState.connectionStatus;
export const getGlobalQRCode = () => statusState.qrCode;
export const setGlobalConnectionStatus = (status: 'disconnected' | 'connecting' | 'connected') => {
  statusState.connectionStatus = status;
};
export const setGlobalQRCode = (qr: string | null) => {
  statusState.qrCode = qr;
};

// Exportar para compatibilidade (atualizar quando mudar)
export let globalConnectionStatus = statusState.connectionStatus;
export let globalQRCode = statusState.qrCode;

// Função para atualizar as exportações
const updateExports = () => {
  globalConnectionStatus = statusState.connectionStatus;
  globalQRCode = statusState.qrCode;
};

// Função principal do WhatsApp
export async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info')
  const { version, isLatest } = await fetchLatestBaileysVersion()
  
  console.log(`Usando WA v${version.join('.')}, é a última: ${isLatest}`)
  setGlobalConnectionStatus('connecting');
  updateExports();

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys)
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
      setGlobalQRCode(qr);
      updateExports();
      qrcode.generate(qr, { small: true })
    }
    
    if (connection === 'close') {
      setGlobalConnectionStatus('disconnected');
      setGlobalQRCode(null);
      updateExports();
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('Conexão fechada devido a:', lastDisconnect?.error, ', reconectando:', shouldReconnect)
      
      if (shouldReconnect) {
        setTimeout(() => connectToWhatsApp(), 5000)
      }
    } else if (connection === 'open') {
      setGlobalConnectionStatus('connected');
      setGlobalQRCode(null);
      updateExports();
      console.log('✅ WhatsApp conectado com sucesso!')
    }
  })

  // Salvar credenciais
  sock.ev.on('creds.update', saveCreds)

  // Processar mensagens com o agente Elo Cidadão
  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0]
    if (!msg.message || msg.key.fromMe) return

    try {
      // Usar o agente completo com fluxo conversacional
      const { processWhatsAppMessage } = await import('./agents/elo-cidadao-agent.js')
      await processWhatsAppMessage(sock, msg.message, msg.key)
    } catch (error) {
      console.error('Erro ao processar mensagem:', error)
      const sender = msg.key.remoteJid
      if (sender) {
        await sock.sendMessage(sender, { 
          text: '❌ Desculpe, ocorreu um erro. Tente novamente ou digite */menu* para ver opções.' 
        })
      }
    }
  })

  return sock
}
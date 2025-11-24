import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { 
  MessageCircle, 
  QrCode, 
  Power, 
  PowerOff, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Send,
  RefreshCw,
  Settings,
  Info
} from 'lucide-react'

interface WhatsAppStatus {
  status: 'disconnected' | 'connecting' | 'connected'
  qrCode: string | null
  connected: boolean
  socketExists: boolean
}

export default function WhatsAppAgent() {
  const [status, setStatus] = useState<WhatsAppStatus>({
    status: 'disconnected',
    qrCode: null,
    connected: false,
    socketExists: false
  })
  const [loading, setLoading] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('')
  const [sendingTest, setSendingTest] = useState(false)

  // Usar proxy do Vite em desenvolvimento (vazio = usa proxy) ou URL direta em produção
  const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:3001')

  // Buscar status inicial
  useEffect(() => {
    fetchStatus()
    // Polling para atualizar status e QR Code
    const interval = setInterval(() => {
      fetchStatus()
    }, 3000) // Atualizar a cada 3 segundos

    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const url = `${apiUrl}/api/whatsapp/status`
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json; charset=utf-8',
          'Content-Type': 'application/json; charset=utf-8'
        },
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // Timeout de 5 segundos
      })
      
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      } else {
        console.error('Erro ao buscar status:', response.status, response.statusText)
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Erro ao buscar status:', error)
      }
      // Não mostrar erro para o usuário durante polling, apenas logar
    }
  }

  const handleConnect = async () => {
    setLoading(true)
    try {
      const url = `${apiUrl}/api/whatsapp/connect`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({})
      })

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      
      toast.success('Conexão iniciada!', {
        description: 'Escaneie o QR Code quando aparecer'
      })
      
      // Atualizar status imediatamente e continuar atualizando
      fetchStatus()
    } catch (error: any) {
      console.error('Erro completo ao conectar:', error)
      const errorMessage = error.message || 'Não foi possível conectar ao servidor'
      const isNetworkError = errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')
      
      toast.error('Erro ao conectar', {
        description: isNetworkError 
          ? 'Servidor não está respondendo. Verifique se o backend está rodando na porta 3001.'
          : errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${apiUrl}/api/whatsapp/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json; charset=utf-8'
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success('WhatsApp desconectado com sucesso')
        setStatus({
          status: 'disconnected',
          qrCode: null,
          connected: false,
          socketExists: false
        })
      } else {
        toast.error('Erro ao desconectar', {
          description: data.error || data.message
        })
      }
    } catch (error: any) {
      toast.error('Erro ao desconectar', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendTest = async () => {
    if (!testPhone || !testMessage) {
      toast.error('Preencha telefone e mensagem')
      return
    }

    setSendingTest(true)
    try {
      const response = await fetch(`${apiUrl}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          phone: testPhone,
          message: testMessage
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success('Mensagem enviada!', {
          description: `Enviada para ${testPhone}`
        })
        setTestMessage('')
      } else {
        toast.error('Erro ao enviar', {
          description: data.error || data.message
        })
      }
    } catch (error: any) {
      toast.error('Erro ao enviar', {
        description: error.message
      })
    } finally {
      setSendingTest(false)
    }
  }

  const getStatusBadge = () => {
    switch (status.status) {
      case 'connected':
        return <Badge variant="success" className="bg-green-600 text-white">Conectado</Badge>
      case 'connecting':
        return <Badge variant="warning" className="bg-yellow-600 text-white">Conectando...</Badge>
      default:
        return <Badge variant="destructive">Desconectado</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agente WhatsApp</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure e gerencie a conexão do WhatsApp com Baileys
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          <Button
            variant="outline"
            onClick={fetchStatus}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Status da Conexão
          </CardTitle>
          <CardDescription>
            Gerencie a conexão do WhatsApp e visualize o QR Code para autenticação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2 mb-2">
                {status.status === 'connected' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : status.status === 'connecting' ? (
                  <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-semibold text-gray-900 dark:text-white">Status</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {status.status === 'connected' && 'WhatsApp conectado e funcionando'}
                {status.status === 'connecting' && 'Aguardando escaneamento do QR Code'}
                {status.status === 'disconnected' && 'WhatsApp desconectado'}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900 dark:text-white">QR Code</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {status.qrCode ? 'Disponível para escaneamento' : 'Não disponível'}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-gray-900 dark:text-white">Socket</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {status.socketExists ? 'Ativo' : 'Inativo'}
              </p>
            </div>
          </div>

          {/* QR Code Display */}
          {status.qrCode && (
            <div className="p-6 rounded-lg bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Escaneie o QR Code</h3>
                </div>
                <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(status.qrCode)}`}
                    alt="QR Code WhatsApp"
                    className="w-64 h-64"
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
                  Abra o WhatsApp no seu celular, vá em <strong>Dispositivos conectados</strong> e escaneie este código
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {status.status === 'disconnected' ? (
              <Button
                onClick={handleConnect}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4 mr-2" />
                    Conectar WhatsApp
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleDisconnect}
                disabled={loading}
                variant="destructive"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Desconectando...
                  </>
                ) : (
                  <>
                    <PowerOff className="h-4 w-4 mr-2" />
                    Desconectar
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Message Card */}
      {status.status === 'connected' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Enviar Mensagem de Teste
            </CardTitle>
            <CardDescription>
              Teste o envio de mensagens através do WhatsApp conectado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Número do Telefone (com DDD, sem caracteres especiais)
              </label>
              <Input
                type="text"
                placeholder="5511999999999"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="max-w-md"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Exemplo: 5511999999999 (código do país + DDD + número)
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mensagem
              </label>
              <Input
                type="text"
                placeholder="Digite sua mensagem de teste..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendTest()
                  }
                }}
              />
            </div>

            <Button
              onClick={handleSendTest}
              disabled={sendingTest || !testPhone || !testMessage}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sendingTest ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Info className="h-5 w-5" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>
            <strong>• Autenticação:</strong> O QR Code expira após alguns minutos. Se expirar, desconecte e conecte novamente.
          </p>
          <p>
            <strong>• Persistência:</strong> Após conectar uma vez, o WhatsApp permanecerá conectado mesmo após reiniciar o servidor.
          </p>
          <p>
            <strong>• Segurança:</strong> As credenciais são armazenadas localmente na pasta <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">baileys_auth_info</code>.
          </p>
          <p>
            <strong>• Agente IA:</strong> O agente Elo Cidadão processa automaticamente todas as mensagens recebidas.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


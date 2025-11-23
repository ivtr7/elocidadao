import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings as SettingsIcon, 
  Bell,
  Database,
  Key,
  Globe,
  Save,
  CheckCircle
} from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState({
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    notifications: true,
    autoRefresh: true,
    refreshInterval: 30
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Aqui você pode salvar as configurações (localStorage, backend, etc.)
    localStorage.setItem('appSettings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema
          </p>
        </div>
        <Button onClick={handleSave}>
          {saved ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Salvo!
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Configurações básicas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Atualização Automática</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.autoRefresh}
                    onChange={(e) => handleChange('autoRefresh', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-muted-foreground">
                    Atualizar dados automaticamente
                  </span>
                </div>
              </div>

              {settings.autoRefresh && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Intervalo de Atualização (segundos)</label>
                  <Input
                    type="number"
                    value={settings.refreshInterval}
                    onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
                    min="10"
                    max="300"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configurações de API
              </CardTitle>
              <CardDescription>
                URLs e chaves de acesso das APIs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL da API</label>
                <Input
                  value={settings.apiUrl}
                  onChange={(e) => handleChange('apiUrl', e.target.value)}
                  placeholder="http://localhost:3001"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  URL do Supabase
                </label>
                <Input
                  value={settings.supabaseUrl}
                  onChange={(e) => handleChange('supabaseUrl', e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Chave Anônima do Supabase
                </label>
                <Input
                  value={settings.supabaseKey}
                  onChange={(e) => handleChange('supabaseKey', e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  type="password"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure as preferências de notificação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Notificações Ativas</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => handleChange('notifications', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-muted-foreground">
                    Receber notificações do sistema
                  </span>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm text-muted-foreground">
                  As notificações incluem alertas sobre novos projetos, atualizações de status e mensagens importantes.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


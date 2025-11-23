import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStore } from '@/store/appStore'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { useDebounce } from '@/hooks/useDebounce'
import { 
  Users, 
  Star, 
  MessageSquare, 
  Flag,
  Phone,
  MapPin,
  Search,
  TrendingUp
} from 'lucide-react'

interface Citizen {
  id: string
  name: string
  phone: string
  city_id: string
  stars: number
  total_votes: number
  total_comments: number
  total_complaints: number
  engagement_level: string
  notifications_enabled: boolean
  last_interaction?: string
  created_at: string
  cities?: {
    name: string
    state: string
  }
}

export default function Citizens() {
  const { citizens, cities, loading, fetchCitizens, currentCity } = useStore()
  const [filteredCitizens, setFilteredCitizens] = useState<Citizen[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [engagementFilter, setEngagementFilter] = useState<string>('all')

  // Auto-refresh
  useAutoRefresh()

  useEffect(() => {
    fetchCitizens(currentCity?.id)
  }, [currentCity])

  useEffect(() => {
    let filtered = citizens
    
    if (debouncedSearch) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.phone.includes(debouncedSearch)
      )
    }
    
    if (engagementFilter !== 'all') {
      filtered = filtered.filter(c => c.engagement_level === engagementFilter)
    }
    
    if (currentCity) {
      filtered = filtered.filter(c => c.city_id === currentCity.id)
    }
    
    setFilteredCitizens(filtered)
  }, [citizens, debouncedSearch, engagementFilter, currentCity])

  const getEngagementBadge = (level: string) => {
    const variants = {
      beginner: 'secondary',
      active: 'default',
      expert: 'warning',
      champion: 'success'
    }
    
    return variants[level as keyof typeof variants] || 'secondary'
  }

  const getEngagementLabel = (level: string) => {
    const labels = {
      beginner: 'Iniciante',
      active: 'Ativo',
      expert: 'Especialista',
      champion: 'Campeão'
    }
    
    return labels[level as keyof typeof labels] || level
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cidadãos</h1>
          <p className="text-muted-foreground">
            {currentCity ? `Cidade: ${currentCity.name}` : 'Todos os cidadãos cadastrados'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setEngagementFilter('all')}>Todos</TabsTrigger>
          <TabsTrigger value="beginner" onClick={() => setEngagementFilter('beginner')}>Iniciantes</TabsTrigger>
          <TabsTrigger value="active" onClick={() => setEngagementFilter('active')}>Ativos</TabsTrigger>
          <TabsTrigger value="expert" onClick={() => setEngagementFilter('expert')}>Especialistas</TabsTrigger>
          <TabsTrigger value="champion" onClick={() => setEngagementFilter('champion')}>Campeões</TabsTrigger>
        </TabsList>

        <TabsContent value={engagementFilter} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCitizens.map((citizen) => (
              <Card key={citizen.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{citizen.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {citizen.phone}
                      </CardDescription>
                    </div>
                    <Badge variant={getEngagementBadge(citizen.engagement_level)}>
                      {getEngagementLabel(citizen.engagement_level)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {citizen.cities && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {citizen.cities.name} - {citizen.cities.state}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center text-yellow-600">
                        <Star className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">{citizen.stars}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Estrelas</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-center text-blue-600">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">{citizen.total_votes}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Votos</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-center text-red-600">
                        <Flag className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">{citizen.total_complaints}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Reclamações</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Engajamento: {citizen.total_votes + citizen.total_comments + citizen.total_complaints}
                    </div>
                    {citizen.notifications_enabled && (
                      <Badge variant="outline" className="text-xs">
                        Notificações ativas
                      </Badge>
                    )}
                  </div>

                  {citizen.last_interaction && (
                    <p className="text-xs text-muted-foreground">
                      Última interação: {new Date(citizen.last_interaction).toLocaleDateString('pt-BR')}
                    </p>
                  )}

                  <Button variant="outline" size="sm" className="w-full">
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCitizens.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum cidadão encontrado</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm 
                    ? 'Nenhum cidadão corresponde à sua busca.' 
                    : 'Nenhum cidadão cadastrado ainda.'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}


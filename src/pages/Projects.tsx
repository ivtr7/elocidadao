import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStore } from '@/store/appStore'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { 
  FileText, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  TrendingUp,
  Calendar,
  User
} from 'lucide-react'

interface Project {
  id: string
  number: string
  title: string
  simple_title?: string
  summary?: string
  status: string
  total_support: number
  total_against: number
  total_comments: number
  engagement_score: number
  created_at: string
}

export default function Projects() {
  const { projects, loading, fetchProjects, currentCity } = useStore()
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Auto-refresh
  useAutoRefresh()

  useEffect(() => {
    fetchProjects(currentCity?.id)
  }, [currentCity])

  useEffect(() => {
    let filtered = projects
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }
    
    if (currentCity) {
      filtered = filtered.filter(p => p.city_id === currentCity.id)
    }
    
    setFilteredProjects(filtered)
  }, [projects, statusFilter, currentCity])

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      active: 'default',
      voting: 'warning',
      approved: 'success',
      rejected: 'destructive',
      archived: 'outline'
    }
    
    return variants[status as keyof typeof variants] || 'secondary'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Rascunho',
      active: 'Ativo',
      voting: 'Em Votação',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      archived: 'Arquivado'
    }
    
    return labels[status as keyof typeof labels] || status
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
          <h1 className="text-3xl font-bold">Projetos</h1>
          <p className="text-muted-foreground">
            {currentCity ? `Cidade: ${currentCity.name}` : 'Todas as cidades'}
          </p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setStatusFilter('all')}>Todos</TabsTrigger>
          <TabsTrigger value="active" onClick={() => setStatusFilter('active')}>Ativos</TabsTrigger>
          <TabsTrigger value="voting" onClick={() => setStatusFilter('voting')}>Em Votação</TabsTrigger>
          <TabsTrigger value="approved" onClick={() => setStatusFilter('approved')}>Aprovados</TabsTrigger>
          <TabsTrigger value="archived" onClick={() => setStatusFilter('archived')}>Arquivados</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="line-clamp-2">
                        {project.simple_title || project.title}
                      </CardTitle>
                      <CardDescription>
                        Projeto {project.number}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadge(project.status) as any}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {project.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {project.summary}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center text-green-600">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">{project.total_support}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">A favor</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-center text-red-600">
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">{project.total_against}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Contra</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-center text-blue-600">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">{project.total_comments}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Comentários</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(project.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    
                    <div className="flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Engajamento: {project.engagement_score}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Ver Detalhes
                    </Button>
                    {project.status === 'active' && (
                      <Button size="sm" className="flex-1">
                        Votar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum projeto encontrado</h3>
                <p className="text-muted-foreground text-center">
                  {statusFilter === 'all' 
                    ? 'Nenhum projeto cadastrado ainda.' 
                    : `Nenhum projeto com status "${getStatusLabel(statusFilter)}".`
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
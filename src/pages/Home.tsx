import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProjectCard } from '@/components/ProjectCard'
import { useStore } from '@/store/appStore'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { useDebounce } from '@/hooks/useDebounce'
import { 
  Search, 
  Filter,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const ITEMS_PER_PAGE = 12

export default function Home() {
  const { projects, loading, fetchProjects, currentCity } = useStore()
  const [filteredProjects, setFilteredProjects] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Auto-refresh
  useAutoRefresh()

  useEffect(() => {
    fetchProjects(currentCity?.id)
  }, [currentCity])

  useEffect(() => {
    let filtered = projects
    
    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }
    
    // Filtro por cidade
    if (currentCity) {
      filtered = filtered.filter(p => p.city_id === currentCity.id)
    }
    
    // Busca por texto
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase()
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(searchLower) ||
        p.simple_title?.toLowerCase().includes(searchLower) ||
        p.summary?.toLowerCase().includes(searchLower) ||
        p.number?.toLowerCase().includes(searchLower)
      )
    }
    
    // Ordenar por data (mais recentes primeiro)
    filtered = filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    setFilteredProjects(filtered)
    setCurrentPage(1) // Reset para primeira página ao filtrar
  }, [projects, statusFilter, debouncedSearch, currentCity])

  // Paginação
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

  const getStatusCount = (status: string) => {
    return projects.filter(p => p.status === status).length
  }

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold">Central de Projetos</h1>
          <p className="text-muted-foreground mt-2">
            Explore os projetos de lei e participe da democracia digital
          </p>
        </div>

        {/* Busca e Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar projetos por título, número ou conteúdo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtros:</span>
          </div>
        </div>
      </div>

      {/* Tabs de Status */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger 
            value="all" 
            onClick={() => setStatusFilter('all')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Todos ({projects.length})
          </TabsTrigger>
          <TabsTrigger 
            value="voting" 
            onClick={() => setStatusFilter('voting')}
          >
            Em Votação ({getStatusCount('voting')})
          </TabsTrigger>
          <TabsTrigger 
            value="active" 
            onClick={() => setStatusFilter('active')}
          >
            Ativos ({getStatusCount('active')})
          </TabsTrigger>
          <TabsTrigger 
            value="approved" 
            onClick={() => setStatusFilter('approved')}
          >
            Aprovados ({getStatusCount('approved')})
          </TabsTrigger>
          <TabsTrigger 
            value="draft" 
            onClick={() => setStatusFilter('draft')}
          >
            Rascunhos ({getStatusCount('draft')})
          </TabsTrigger>
          <TabsTrigger 
            value="archived" 
            onClick={() => setStatusFilter('archived')}
          >
            Arquivados ({getStatusCount('archived')})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="space-y-6">
          {/* Grid de Projetos */}
          {paginatedProjects.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paginatedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {startIndex + 1} - {Math.min(endIndex, filteredProjects.length)} de {filteredProjects.length} projetos
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-10"
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Próxima
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum projeto encontrado</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm 
                    ? 'Tente buscar com outros termos.' 
                    : statusFilter !== 'all'
                    ? `Nenhum projeto com status "${statusFilter}".`
                    : 'Nenhum projeto cadastrado ainda.'
                  }
                </p>
                {(searchTerm || statusFilter !== 'all') && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                    }}
                  >
                    Limpar Filtros
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

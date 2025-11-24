import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Hero } from '@/components/home/Hero'
import { StatsBar } from '@/components/home/StatsBar'
import { ProjectCardSkeleton } from '@/components/projects/ProjectCardSkeleton'
import { AlgorithmTransparency } from '@/components/transparency/AlgorithmTransparency'
import { useStore } from '@/store/appStore'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { useDebounce } from '@/hooks/useDebounce'
import { 
  Search, 
  Filter,
  FileText,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react'

const ITEMS_PER_PAGE = 9

export default function Home() {
  const { projects, cities, citizens, loading, fetchProjects, fetchCities, fetchCitizens, currentCity } = useStore()
  const [filteredProjects, setFilteredProjects] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortFilter, setSortFilter] = useState<string>('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Auto-refresh
  useAutoRefresh()

  useEffect(() => {
    fetchProjects(currentCity?.id)
    fetchCities()
    fetchCitizens()
  }, [currentCity])

  useEffect(() => {
    let filtered = [...projects]
    
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
        p.number?.toLowerCase().includes(searchLower) ||
        p.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
      )
    }
    
    // Ordenação
    switch (sortFilter) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'supported':
        filtered.sort((a, b) => (b.total_support || 0) - (a.total_support || 0))
        break
      case 'rejected':
        filtered.sort((a, b) => (b.total_against || 0) - (a.total_against || 0))
        break
      case 'commented':
        filtered.sort((a, b) => (b.total_comments || 0) - (a.total_comments || 0))
        break
      case 'relevant':
        filtered.sort((a, b) => (b.engagement_score || 0) - (a.engagement_score || 0))
        break
    }
    
    setFilteredProjects(filtered)
    setCurrentPage(1)
  }, [projects, sortFilter, debouncedSearch, currentCity])

  // Paginação
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

  // Featured project (mais recente ou mais engajado)
  const featuredProject = projects.length > 0 
    ? projects.sort((a, b) => (b.engagement_score || 0) - (a.engagement_score || 0))[0]
    : null

  // Stats
  const stats = {
    citizens: citizens.length,
    projects: projects.length,
    votes: projects.reduce((sum, p) => sum + (p.total_support || 0) + (p.total_against || 0), 0),
    complaints: 0 // TODO: fetch complaints
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'em_análise': 'secondary',
      'em_votação': 'default',
      'aprovado': 'success',
      'rejeitado': 'destructive',
      'arquivado': 'outline',
      'draft': 'secondary',
      'voting': 'default',
      'approved': 'success',
      'rejected': 'destructive',
      'archived': 'outline'
    }
    return variants[status] || 'secondary'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'em_análise': 'Em Análise',
      'em_votação': 'Em Votação',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado',
      'arquivado': 'Arquivado',
      'draft': 'Rascunho',
      'voting': 'Em Votação',
      'approved': 'Aprovado',
      'rejected': 'Rejeitado',
      'archived': 'Arquivado'
    }
    return labels[status] || status
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const day = date.getDate().toString().padStart(2, '0')
      const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                         'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
      const month = monthNames[date.getMonth()]
      const year = date.getFullYear()
      return `${day} de ${month} de ${year}`
    } catch {
      return new Date(dateString).toLocaleDateString('pt-BR')
    }
  }

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Hero />
        <StatsBar stats={{ citizens: 0, projects: 0, votes: 0, complaints: 0 }} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <Hero featuredProject={featuredProject || undefined} />
      
      {/* Stats Bar */}
      <StatsBar stats={stats} />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16" role="main" aria-label="Conteúdo principal">
        {/* Header Section */}
        <header className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Projetos em Destaque
              </h1>
              <p className="text-gray-600 dark:text-gray-400" role="doc-subtitle">
                Acompanhe os projetos de lei da sua cidade e participe da democracia
          </p>
        </div>

            {/* Search */}
            <div className="relative w-full sm:w-96" role="search" aria-label="Buscar projetos">
              <label htmlFor="project-search" className="sr-only">
                Buscar projetos por título, número ou conteúdo
              </label>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
            <Input
                id="project-search"
                type="search"
                placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
                aria-label="Campo de busca de projetos"
                aria-describedby="search-description"
              />
              <span id="search-description" className="sr-only">
                Digite palavras-chave para buscar projetos de lei
              </span>
        </div>
      </div>

          {/* Transparência Algorítmica */}
          <AlgorithmTransparency 
            sortMethod={sortFilter}
            totalItems={projects.length}
            filteredItems={filteredProjects.length}
          />

          {/* Tabs de Filtro */}
          <nav aria-label="Filtros de ordenação" role="tablist" className="mt-4">
            <Tabs value={sortFilter} onValueChange={setSortFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 lg:grid-cols-5" role="tablist">
          <TabsTrigger 
                  value="recent" 
            className="flex items-center gap-2"
                  role="tab"
                  aria-label="Ordenar por mais recentes"
          >
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Mais Recentes</span>
                  <span className="sm:hidden">Recentes</span>
          </TabsTrigger>
          <TabsTrigger 
                  value="supported" 
                  className="flex items-center gap-2"
                  role="tab"
                  aria-label="Ordenar por mais apoiados"
                >
                  <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Mais Apoiados</span>
                  <span className="sm:hidden">Apoiados</span>
          </TabsTrigger>
          <TabsTrigger 
                  value="rejected" 
                  className="flex items-center gap-2"
                  role="tab"
                  aria-label="Ordenar por mais rejeitados"
                >
                  <ThumbsDown className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Mais Rejeitados</span>
                  <span className="sm:hidden">Rejeitados</span>
          </TabsTrigger>
          <TabsTrigger 
                  value="commented" 
                  className="flex items-center gap-2"
                  role="tab"
                  aria-label="Ordenar por mais comentados"
                >
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Mais Comentados</span>
                  <span className="sm:hidden">Comentados</span>
          </TabsTrigger>
          <TabsTrigger 
                  value="relevant" 
                  className="flex items-center gap-2"
                  role="tab"
                  aria-label="Ordenar por mais relevantes"
                >
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Mais Relevantes</span>
                  <span className="sm:hidden">Relevantes</span>
          </TabsTrigger>
        </TabsList>
            </Tabs>
          </nav>
        </header>

        {/* Blog Grid - Projetos como Notícias */}
          {paginatedProjects.length > 0 ? (
            <>
            <section 
              aria-label="Lista de projetos de lei"
              className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8 sm:mb-12"
            >
              {paginatedProjects.map((project, index) => {
                const totalVotes = (project.total_support || 0) + (project.total_against || 0)
                const supportPercentage = totalVotes > 0 
                  ? Math.round(((project.total_support || 0) / totalVotes) * 100) 
                  : 0

                return (
                  <article 
                    key={project.id}
                    className="group"
                    itemScope
                    itemType="https://schema.org/Article"
                  >
                    <Link 
                      to={`/project/${project.id}`}
                      className="block h-full"
                      aria-label={`Ver detalhes do projeto ${project.number}: ${project.simple_title || project.title}`}
                    >
                      <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 hover:border-blue-300 dark:hover:border-blue-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
                        <CardContent className="p-6">
                          {/* Header do Artigo */}
                          <header className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge 
                                variant={getStatusBadge(project.status) as any}
                                aria-label={`Status: ${getStatusLabel(project.status)}`}
                              >
                                {getStatusLabel(project.status)}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400" itemProp="identifier">
                                {project.number}
                              </span>
                            </div>
                            {project.author && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <User className="h-3 w-3" aria-hidden="true" />
                                <span className="truncate max-w-[100px]" itemProp="author">
                                  {project.author}
                                </span>
                              </div>
                            )}
                          </header>

                          {/* Título do Artigo */}
                          <h2 
                            className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                            itemProp="headline"
                          >
                            {project.simple_title || project.title}
                          </h2>

                        {/* Resumo/Preview */}
                        {project.summary && (
                          <p 
                            className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm sm:text-base"
                            itemProp="description"
                          >
                            {project.summary}
                          </p>
                        )}

                        {/* Tags */}
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.tags.slice(0, 3).map((tag: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Estatísticas do Artigo */}
                        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                          {/* Barra de Progresso */}
                          {totalVotes > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                <span>Aprovação: {supportPercentage}%</span>
                                <span>{totalVotes} votos</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${supportPercentage}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Footer com Métricas */}
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4 text-green-600" />
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {project.total_support || 0}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4 text-blue-600" />
                                <span>{project.total_comments || 0}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span className="text-xs">
                                {formatDate(project.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Link para ler mais */}
                        <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 font-semibold text-sm">
                          <span>Ler mais</span>
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </div>
                        
                        {/* Metadata oculta para SEO */}
                        <meta itemProp="datePublished" content={project.created_at} />
                        <meta itemProp="dateModified" content={project.created_at} />
                      </CardContent>
                    </Card>
                    </Link>
                  </article>
                )
              })}
            </section>

              {/* Paginação */}
              {totalPages > 1 && (
              <nav 
                aria-label="Navegação de páginas"
                className="flex items-center justify-center gap-2"
              >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                  aria-label={`Ir para página ${currentPage - 1}`}
                  aria-disabled={currentPage === 1}
                      >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  <span>Anterior</span>
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
                        aria-label={`Ir para página ${pageNum}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
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
                  aria-label={`Ir para página ${currentPage + 1}`}
                  aria-disabled={currentPage === totalPages}
                      >
                  <span>Próxima</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Button>
              </nav>
              )}
            </>
          ) : (
          <section aria-label="Estado vazio" className="py-12">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mb-4" aria-hidden="true" />
                <h2 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                  Nenhum projeto encontrado
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  {searchTerm 
                    ? 'Tente buscar com outros termos.' 
                    : 'Nenhum projeto cadastrado ainda.'
                  }
                </p>
              </CardContent>
            </Card>
          </section>
          )}
      </main>
    </div>
  )
}

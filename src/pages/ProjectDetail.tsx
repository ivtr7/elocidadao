import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CommentsSection } from '@/components/projects/CommentsSection'
import { VoteReactions } from '@/components/projects/VoteReactions'
import { VotingChart } from '@/components/visualizations/VotingChart'
import { EngagementChart } from '@/components/visualizations/EngagementChart'
import { CategoryDistribution } from '@/components/visualizations/CategoryDistribution'
import { useStore } from '@/store/appStore'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { toast } from 'sonner'
// @ts-ignore - canvas-confetti types
import confetti from 'canvas-confetti'
import { 
  ArrowLeft,
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Calendar,
  User,
  TrendingUp,
  FileText,
  Eye,
  EyeOff,
  Flag,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Share2
} from 'lucide-react'

interface ProjectDetail {
  id: string
  number: string
  title: string
  simple_title?: string
  summary?: string
  full_text: string
  who_benefits?: string
  who_loses?: string
  tags?: string[]
  status: string
  total_support: number
  total_against: number
  total_comments: number
  engagement_score: number
  created_at: string
  author?: string
  original_url?: string
  vote_date?: string
  main_impacts?: string[]
  votes?: Vote[]
  comments?: Comment[]
  complaints?: Complaint[]
}

interface Vote {
  id: string
  position: 'support' | 'against'
  reasoning?: string
  neighborhood?: string
  created_at: string
  upvotes?: number
  downvotes?: number
  quality_score?: number
  citizens?: {
    name: string
  }
  citizen_name?: string
}

interface Comment {
  id: string
  content: string
  moderation_status: string
  created_at: string
  citizens?: {
    name: string
    phone: string
  }
  sentiment?: 'positive' | 'negative' | 'neutral'
}

interface Complaint {
  id: string
  original_text: string
  category: string
  status: string
  created_at: string
  citizens?: {
    name: string
  }
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { currentCity } = useStore()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [readingMode, setReadingMode] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showCharts, setShowCharts] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useAutoRefresh()

  useEffect(() => {
    if (id) {
      fetchProjectDetail()
    }
  }, [id])

  const fetchProjectDetail = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/projects/${id}`, {
        headers: {
          'Accept': 'application/json; charset=utf-8',
          'Accept-Charset': 'utf-8',
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
      if (!response.ok) throw new Error('Erro ao buscar projeto')
      const data = await response.json()
      setProject(data)

      // Buscar reclamações relacionadas
      if (id) {
        const complaintsResponse = await fetch(`${apiUrl}/api/complaints?project_id=${id}`, {
          headers: {
            'Accept': 'application/json; charset=utf-8',
            'Accept-Charset': 'utf-8',
            'Content-Type': 'application/json; charset=utf-8'
          }
        })
        if (complaintsResponse.ok) {
          const complaints = await complaintsResponse.json()
          setProject(prev => prev ? { ...prev, complaints } : null)
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      toast.error('Erro ao carregar projeto')
    } finally {
      setLoading(false)
    }
  }

  const analyzeSentiment = async (text: string): Promise<'positive' | 'negative' | 'neutral'> => {
    // Análise simples de sentimento baseada em palavras-chave
    const positiveWords = ['bom', 'ótimo', 'excelente', 'apoiar', 'concordo', 'favorável', 'benefício']
    const negativeWords = ['ruim', 'péssimo', 'contra', 'discordo', 'prejudicial', 'problema']
    
    const lowerText = text.toLowerCase()
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !id) return

    setSubmittingComment(true)
    const sentiment = await analyzeSentiment(commentText)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/comments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json; charset=utf-8',
          'Accept-Charset': 'utf-8'
        },
        body: JSON.stringify({
          project_id: id,
          citizen_id: 'temp-citizen-id', // TODO: usar ID real do cidadão logado
          content: commentText
        })
      })

      if (!response.ok) throw new Error('Erro ao enviar comentário')

      // Confetti para comentários positivos
      if (sentiment === 'positive') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        toast.success('Comentário enviado! 🎉', { description: 'Obrigado pela participação!' })
      } else {
        toast.success('Comentário enviado!', { description: 'Aguardando moderação' })
      }

      setCommentText('')
      fetchProjectDetail() // Recarregar comentários
    } catch (error: any) {
      toast.error('Erro ao enviar comentário', { description: error.message })
    } finally {
      setSubmittingComment(false)
    }
  }

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

  const getSentimentBadge = (sentiment?: string) => {
    if (!sentiment) return null
    const variants = {
      positive: { variant: 'default' as const, icon: CheckCircle, label: 'Positivo' },
      negative: { variant: 'destructive' as const, icon: XCircle, label: 'Negativo' },
      neutral: { variant: 'secondary' as const, icon: AlertCircle, label: 'Neutro' }
    }
    const config = variants[sentiment as keyof typeof variants]
    if (!config) return null
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Projeto não encontrado</h3>
            <Link to="/">
              <Button variant="outline">Voltar para Central de Projetos</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalVotes = project.total_support + project.total_against
  const supportPercentage = totalVotes > 0 
    ? Math.round((project.total_support / totalVotes) * 100) 
    : 0

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header com Botão Voltar */}
      <div className="flex items-center justify-between">
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCharts(!showCharts)}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {showCharts ? 'Ocultar' : 'Mostrar'} Gráficos
          </Button>
          <Button
            variant="outline"
            onClick={() => setReadingMode(!readingMode)}
          >
            {readingMode ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Sair do Modo Leitura
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Modo Leitura
              </>
            )}
          </Button>
          {project.original_url && (
            <a 
              href={project.original_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border-2 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Original
            </a>
          )}
        </div>
      </div>

      {/* Gráficos (Toggle) */}
      {showCharts && (
        <div className="grid lg:grid-cols-2 gap-6">
          <VotingChart 
            data={[
              { name: project.simple_title || project.title, support: project.total_support, against: project.total_against }
            ]}
            title="Votação do Projeto"
          />
          <EngagementChart 
            data={[]}
            title="Engajamento"
          />
        </div>
      )}

      {/* Card Principal do Projeto */}
      <Card className={readingMode ? 'max-w-4xl mx-auto' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getStatusBadge(project.status) as any}>
                  {getStatusLabel(project.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Projeto {project.number}
                </span>
                {project.author && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{project.author}</span>
                  </div>
                )}
              </div>
              <CardTitle className="text-3xl">
                {project.simple_title || project.title}
              </CardTitle>
              {project.summary && (
                <CardDescription className="text-base">
                  {project.summary}
                </CardDescription>
              )}
              {project.vote_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Votação prevista: {new Date(project.vote_date).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{project.total_support}</div>
              <div className="text-sm text-muted-foreground">A favor</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{project.total_against}</div>
              <div className="text-sm text-muted-foreground">Contra</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{project.total_comments}</div>
              <div className="text-sm text-muted-foreground">Comentários</div>
            </div>
          </div>

          {/* Barra de Progresso */}
          {totalVotes > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Aprovação: {supportPercentage}%</span>
                <span>{totalVotes} votos totais</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${supportPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="votes">Votos ({project.votes?.length || 0})</TabsTrigger>
              <TabsTrigger value="comments">Comentários ({project.comments?.length || 0})</TabsTrigger>
              <TabsTrigger value="complaints">Reclamações ({project.complaints?.length || 0})</TabsTrigger>
            </TabsList>

            {/* Tab: Visão Geral */}
            <TabsContent value="overview" className="space-y-4">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-2">Texto Completo</h3>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {project.full_text}
                </div>
              </div>

              {project.who_benefits && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Quem se Beneficia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{project.who_benefits}</p>
                  </CardContent>
                </Card>
              )}

              {project.who_loses && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      Quem pode ser Prejudicado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{project.who_loses}</p>
                  </CardContent>
                </Card>
              )}

              {/* Main Impacts */}
              {project.main_impacts && project.main_impacts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Principais Impactos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {project.main_impacts.map((impact, index) => (
                        <li key={index} className="text-sm">{impact}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab: Votos */}
            <TabsContent value="votes" className="space-y-4">
              {project.votes && project.votes.length > 0 ? (
                <div className="space-y-4">
                  {project.votes.map((vote) => (
                    <VoteReactions 
                      key={vote.id} 
                      vote={vote}
                      onReaction={(voteId, type) => {
                        // TODO: Implementar reação aos votos
                      }}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ThumbsUp className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum voto registrado ainda</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tab: Comentários */}
            <TabsContent value="comments">
              <CommentsSection 
                projectId={project.id}
                comments={project.comments || []}
                onCommentAdded={() => {
                  fetchProjectDetail()
                }}
              />
            </TabsContent>

            {/* Tab: Reclamações */}
            <TabsContent value="complaints" className="space-y-4">
              {project.complaints && project.complaints.length > 0 ? (
                <div className="space-y-3">
                  {project.complaints.map((complaint) => (
                    <Card key={complaint.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg capitalize">{complaint.category}</CardTitle>
                            <CardDescription>
                              {complaint.citizens?.name || 'Cidadão'}
                            </CardDescription>
                          </div>
                          <Badge variant={complaint.status === 'resolved' ? 'success' : 'warning'}>
                            {complaint.status === 'resolved' ? 'Resolvida' : 'Pendente'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{complaint.original_text}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(complaint.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Flag className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhuma reclamação relacionada</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}


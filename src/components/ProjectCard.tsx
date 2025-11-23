import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  ArrowRight
} from 'lucide-react'

interface ProjectCardProps {
  project: {
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
    city_id?: string
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
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

  const totalVotes = project.total_support + project.total_against
  const supportPercentage = totalVotes > 0 
    ? Math.round((project.total_support / totalVotes) * 100) 
    : 0

  return (
    <Link to={`/project/${project.id}`}>
      <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getStatusBadge(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Projeto {project.number}
                </span>
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                {project.simple_title || project.title}
              </CardTitle>
              {project.summary && (
                <CardDescription className="line-clamp-3 text-base">
                  {project.summary}
                </CardDescription>
              )}
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Estatísticas de Engajamento */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-green-600">
              <ThumbsUp className="h-4 w-4" />
              <div>
                <div className="font-semibold">{project.total_support}</div>
                <div className="text-xs text-muted-foreground">A favor</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-red-600">
              <ThumbsDown className="h-4 w-4" />
              <div>
                <div className="font-semibold">{project.total_against}</div>
                <div className="text-xs text-muted-foreground">Contra</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-blue-600">
              <MessageSquare className="h-4 w-4" />
              <div>
                <div className="font-semibold">{project.total_comments}</div>
                <div className="text-xs text-muted-foreground">Comentários</div>
              </div>
            </div>
          </div>

          {/* Barra de Progresso de Votos */}
          {totalVotes > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
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

          {/* Footer com Data e Engajamento */}
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(project.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Engajamento: {project.engagement_score}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}


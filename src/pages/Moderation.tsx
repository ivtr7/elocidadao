import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { toast } from 'sonner'
import { 
  MessageSquare, 
  User, 
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface Comment {
  id: string
  project_id: string
  citizen_id: string
  content: string
  moderation_status: string
  reports: number
  created_at: string
  citizens?: {
    name: string
    phone: string
  }
  projects?: {
    title: string
    simple_title?: string
  }
}

export default function Moderation() {
  const [comments, setComments] = useState<Comment[]>([])
  const [filteredComments, setFilteredComments] = useState<Comment[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [loading, setLoading] = useState(true)

  // Auto-refresh
  useAutoRefresh()

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/comments`)
      if (!response.ok) throw new Error('Erro ao buscar comentários')
      const data = await response.json()
      setComments(data)
      setFilteredComments(data.filter((c: Comment) => c.moderation_status === 'pending'))
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = comments
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.moderation_status === statusFilter)
    }
    
    setFilteredComments(filtered)
  }, [comments, statusFilter])

  const updateCommentStatus = async (commentId: string, status: string) => {
    // Optimistic update
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, moderation_status: status } : c
    ))
    
    const statusLabel = status === 'approved' ? 'aprovado' : status === 'blocked' ? 'bloqueado' : 'pendente'
    toast.success(`Comentário ${statusLabel}!`, { description: 'Atualizando...' })

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ moderation_status: status }),
      })
      
      if (!response.ok) throw new Error('Erro ao atualizar comentário')
      
      toast.success(`Comentário ${statusLabel} com sucesso!`)
    } catch (error: any) {
      console.error('Error updating comment:', error)
      
      // Reverter optimistic update
      fetchComments()
      
      toast.error('Erro ao atualizar comentário', { 
        description: error.message || 'Tente novamente' 
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      blocked: 'destructive'
    }
    
    return variants[status as keyof typeof variants] || 'secondary'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendente',
      approved: 'Aprovado',
      blocked: 'Bloqueado'
    }
    
    return labels[status as keyof typeof labels] || status
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'blocked':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
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
          <h1 className="text-3xl font-bold">Moderação de Comentários</h1>
          <p className="text-muted-foreground">
            Aprove ou bloqueie comentários dos cidadãos
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" onClick={() => setStatusFilter('pending')}>
            Pendentes ({comments.filter(c => c.moderation_status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved" onClick={() => setStatusFilter('approved')}>
            Aprovados ({comments.filter(c => c.moderation_status === 'approved').length})
          </TabsTrigger>
          <TabsTrigger value="blocked" onClick={() => setStatusFilter('blocked')}>
            Bloqueados ({comments.filter(c => c.moderation_status === 'blocked').length})
          </TabsTrigger>
          <TabsTrigger value="all" onClick={() => setStatusFilter('all')}>
            Todos
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="space-y-4">
          <div className="grid gap-4">
            {filteredComments.map((comment) => (
              <Card key={comment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">Comentário</CardTitle>
                        <Badge variant={getStatusBadge(comment.moderation_status)}>
                          {getStatusIcon(comment.moderation_status)}
                          <span className="ml-1">{getStatusLabel(comment.moderation_status)}</span>
                        </Badge>
                        {comment.reports > 0 && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {comment.reports} denúncia{comment.reports > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-4 flex-wrap">
                        {comment.citizens && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {comment.citizens.name}
                          </div>
                        )}
                        {comment.projects && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {comment.projects.simple_title || comment.projects.title}
                          </div>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm">{comment.content}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {comment.moderation_status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => updateCommentStatus(comment.id, 'approved')}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => updateCommentStatus(comment.id, 'blocked')}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Bloquear
                      </Button>
                    </div>
                  )}

                  {comment.moderation_status !== 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => updateCommentStatus(comment.id, 'pending')}
                        className="flex-1"
                      >
                        Reverter
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredComments.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum comentário encontrado</h3>
                <p className="text-muted-foreground text-center">
                  {statusFilter === 'all' 
                    ? 'Nenhum comentário cadastrado ainda.' 
                    : `Nenhum comentário com status "${getStatusLabel(statusFilter)}".`
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


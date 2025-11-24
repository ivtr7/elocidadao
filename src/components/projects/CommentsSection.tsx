import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, Flag, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface Comment {
  id: string
  content: string
  moderation_status: string
  created_at: string
  citizens?: {
    name: string
    phone: string
  }
  citizen_name?: string
  citizen_phone?: string
}

interface CommentsSectionProps {
  projectId: string
  comments: Comment[]
  onCommentAdded?: () => void
}

export function CommentsSection({ projectId, comments, onCommentAdded }: CommentsSectionProps) {
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const approvedComments = comments.filter(c => 
    c.moderation_status === 'approved' || c.moderation_status === 'approved'
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setSubmitting(true)
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
          project_id: projectId,
          citizen_id: 'temp-citizen-id', // TODO: usar ID real do cidadão logado
          content: commentText
        })
      })

      if (!response.ok) throw new Error('Erro ao enviar comentário')
      
      toast.success('Comentário enviado! Aguardando moderação.')
      setCommentText('')
      if (onCommentAdded) onCommentAdded()
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error('Erro ao enviar comentário')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'blocked':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovado'
      case 'blocked':
        return 'Bloqueado'
      default:
        return 'Aguardando moderação'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comentários ({approvedComments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form para novo comentário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                U
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Escreva seu comentário..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[80px]"
                disabled={submitting}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Seu comentário será moderado antes de ser publicado
                </p>
                <Button type="submit" disabled={!commentText.trim() || submitting}>
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Lista de comentários */}
        <div className="space-y-4">
          {approvedComments.length > 0 ? (
            approvedComments.map((comment) => {
              const citizenName = comment.citizens?.name || comment.citizen_name || 'Anônimo'
              return (
                <div 
                  key={comment.id}
                  className="flex gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      {getInitials(citizenName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {citizenName}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getStatusIcon(comment.moderation_status)}
                          <span className="ml-1">{getStatusLabel(comment.moderation_status)}</span>
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {comment.content}
                    </p>
                    
                    <div className="flex items-center gap-4 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <Flag className="h-3 w-3 mr-1" />
                        Reportar
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


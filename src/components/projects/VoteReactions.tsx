import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react'
import { toast } from 'sonner'

interface VoteReaction {
  id: string
  position: 'support' | 'against'
  reasoning?: string
  upvotes?: number
  downvotes?: number
  quality_score?: number
  citizens?: {
    name: string
  }
  citizen_name?: string
}

interface VoteReactionsProps {
  vote: VoteReaction
  onReaction?: (voteId: string, type: 'upvote' | 'downvote') => void
}

export function VoteReactions({ vote, onReaction }: VoteReactionsProps) {
  const [upvotes, setUpvotes] = useState(vote.upvotes || 0)
  const [downvotes, setDownvotes] = useState(vote.downvotes || 0)
  const [userReaction, setUserReaction] = useState<'upvote' | 'downvote' | null>(null)

  const handleReaction = (type: 'upvote' | 'downvote') => {
    if (userReaction === type) {
      // Remover reação
      setUserReaction(null)
      if (type === 'upvote') {
        setUpvotes(prev => Math.max(0, prev - 1))
      } else {
        setDownvotes(prev => Math.max(0, prev - 1))
      }
    } else {
      // Adicionar/alterar reação
      if (userReaction === 'upvote') {
        setUpvotes(prev => Math.max(0, prev - 1))
      } else if (userReaction === 'downvote') {
        setDownvotes(prev => Math.max(0, prev - 1))
      }

      setUserReaction(type)
      if (type === 'upvote') {
        setUpvotes(prev => prev + 1)
      } else {
        setDownvotes(prev => prev + 1)
      }
    }

    if (onReaction) {
      onReaction(vote.id, type)
    }
  }

  const citizenName = vote.citizens?.name || vote.citizen_name || 'Anônimo'
  const isHighlighted = vote.quality_score > 5

  return (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      isHighlighted 
        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700' 
        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900 dark:text-white">
              {citizenName}
            </span>
            <Badge 
              variant={vote.position === 'support' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {vote.position === 'support' ? 'A favor' : 'Contra'}
            </Badge>
            {isHighlighted && (
              <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-700 dark:text-yellow-400">
                <Star className="h-3 w-3 mr-1 fill-yellow-400" />
                Destaque
              </Badge>
            )}
          </div>
          
          {vote.reasoning && (
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {vote.reasoning}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleReaction('upvote')}
          className={`h-8 px-3 ${
            userReaction === 'upvote' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
              : ''
          }`}
        >
          <ThumbsUp className={`h-4 w-4 mr-1 ${userReaction === 'upvote' ? 'fill-current' : ''}`} />
          {upvotes}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleReaction('downvote')}
          className={`h-8 px-3 ${
            userReaction === 'downvote' 
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
              : ''
          }`}
        >
          <ThumbsDown className={`h-4 w-4 mr-1 ${userReaction === 'downvote' ? 'fill-current' : ''}`} />
          {downvotes}
        </Button>
      </div>
    </div>
  )
}


import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useStore } from '@/store/appStore'
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Users,
  Award,
  Crown
} from 'lucide-react'

interface RankingCitizen {
  id: string
  name: string
  phone: string
  stars: number
  total_votes: number
  total_comments: number
  total_complaints: number
  engagement_level: string
  city_name: string
}

export default function Rankings() {
  const { citizens, cities, loading, fetchCitizens } = useStore()
  const [rankings, setRankings] = useState<RankingCitizen[]>([])
  const [selectedCategory, setSelectedCategory] = useState<'stars' | 'votes' | 'comments' | 'engagement'>('stars')

  useEffect(() => {
    fetchCitizens()
  }, [])

  useEffect(() => {
    if (citizens.length > 0 && cities.length > 0) {
      const rankedCitizens = citizens.map(citizen => ({
        ...citizen,
        city_name: cities.find(c => c.id === citizen.city_id)?.name || 'Cidade não encontrada'
      }))

      const sorted = [...rankedCitizens].sort((a, b) => {
        switch (selectedCategory) {
          case 'stars':
            return b.stars - a.stars
          case 'votes':
            return b.total_votes - a.total_votes
          case 'comments':
            return b.total_comments - a.total_comments
          case 'engagement':
            return b.total_votes + b.total_comments + b.total_complaints - 
                   (a.total_votes + a.total_comments + a.total_complaints)
          default:
            return 0
        }
      })

      setRankings(sorted.slice(0, 50)) // Top 50
    }
  }, [citizens, cities, selectedCategory])

  const getCategoryLabel = (category: string) => {
    const labels = {
      stars: 'Estrelas',
      votes: 'Votos',
      comments: 'Comentários',
      engagement: 'Engajamento Total'
    }
    return labels[category as keyof typeof labels]
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Award className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-orange-600" />
    return <TrendingUp className="h-4 w-4 text-muted-foreground" />
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-200'
    if (rank === 2) return 'bg-gray-50 border-gray-200'
    if (rank === 3) return 'bg-orange-50 border-orange-200'
    return ''
  }

  const getEngagementColor = (level: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-blue-100 text-blue-800',
      advanced: 'bg-purple-100 text-purple-800',
      expert: 'bg-red-100 text-red-800'
    }
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'
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
          <h1 className="text-3xl font-bold">Ranking de Cidadãos</h1>
          <p className="text-muted-foreground">Top cidadãos mais engajados</p>
        </div>
        <Trophy className="h-8 w-8 text-yellow-500" />
      </div>

      {/* Categorias */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias de Ranking</CardTitle>
          <CardDescription>Selecione a categoria para visualizar o ranking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { key: 'stars', icon: Star, label: 'Estrelas' },
              { key: 'votes', icon: Users, label: 'Votos' },
              { key: 'comments', icon: Users, label: 'Comentários' },
              { key: 'engagement', icon: TrendingUp, label: 'Engajamento' }
            ].map(({ key, icon: Icon, label }) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                className="w-full"
                onClick={() => setSelectedCategory(key as any)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Top {rankings.length} - {getCategoryLabel(selectedCategory)}</CardTitle>
          <CardDescription>Cidadãos ordenados por {getCategoryLabel(selectedCategory).toLowerCase()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rankings.map((citizen, index) => (
              <Card key={citizen.id} className={`${getRankColor(index + 1)} transition-all hover:shadow-md`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      
                      <Avatar>
                        <AvatarFallback className="bg-primary/10">
                          {citizen.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <p className="font-medium">{citizen.name}</p>
                        <p className="text-sm text-muted-foreground">{citizen.city_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Pontuação principal */}
                      <div className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {getRankIcon(index + 1)}
                          <span className="text-lg font-bold">
                            {selectedCategory === 'stars' && citizen.stars}
                            {selectedCategory === 'votes' && citizen.total_votes}
                            {selectedCategory === 'comments' && citizen.total_comments}
                            {selectedCategory === 'engagement' && 
                              (citizen.total_votes + citizen.total_comments + citizen.total_complaints)
                            }
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getCategoryLabel(selectedCategory)}
                        </p>
                      </div>

                      {/* Nível de engajamento */}
                      <Badge className={`${getEngagementColor(citizen.engagement_level)} border-0`}>
                        {citizen.engagement_level.toUpperCase()}
                      </Badge>

                      {/* Estatísticas detalhadas */}
                      <div className="hidden md:flex items-center space-x-3 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          {citizen.stars}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {citizen.total_votes}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {citizen.total_comments}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {rankings.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum cidadão encontrado</h3>
                <p className="text-muted-foreground text-center">
                  Ainda não há cidadãos cadastrados no sistema para exibir o ranking.
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle>Legenda dos Níveis</CardTitle>
          <CardDescription>Entenda os níveis de engajamento dos cidadãos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { level: 'beginner', label: 'Iniciante', desc: '0-4 ações' },
              { level: 'intermediate', label: 'Intermediário', desc: '5-19 ações' },
              { level: 'advanced', label: 'Avançado', desc: '20-49 ações' },
              { level: 'expert', label: 'Expert', desc: '50+ ações' }
            ].map(({ level, label, desc }) => (
              <div key={level} className="text-center">
                <Badge className={`${getEngagementColor(level)} mb-2`}>
                  {label.toUpperCase()}
                </Badge>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
import { Card, CardContent } from '@/components/ui/card'
import { Users, FileText, Vote, AlertCircle } from 'lucide-react'

interface StatsBarProps {
  stats: {
    citizens: number
    projects: number
    votes: number
    complaints: number
  }
}

export function StatsBar({ stats }: StatsBarProps) {
  const statItems = [
    {
      label: 'Cidadãos',
      value: stats.citizens,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: 'Projetos',
      value: stats.projects,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      label: 'Votos',
      value: stats.votes,
      icon: Vote,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      label: 'Reclamações',
      value: stats.complaints,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ]

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon
          return (
            <Card 
              key={item.label}
              className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-105"
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-1">
                      {item.label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {(item.value ?? 0).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className={`${item.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${item.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}


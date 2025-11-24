import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface VotingData {
  name: string
  support: number
  against: number
}

interface VotingChartProps {
  data: VotingData[]
  title?: string
  description?: string
}

export function VotingChart({ data, title = 'Top 10 Projetos por Votos', description }: VotingChartProps) {
  // Limitar a top 10 e ordenar por total de votos
  const chartData = data
    .map(item => ({
      ...item,
      total: item.support + item.against
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map(item => ({
      name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
      'A favor': item.support,
      'Contra': item.against
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="A favor" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Contra" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


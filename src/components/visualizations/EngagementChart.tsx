import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface EngagementData {
  date: string
  votes: number
  comments: number
}

interface EngagementChartProps {
  data: EngagementData[]
  title?: string
  description?: string
}

export function EngagementChart({ 
  data, 
  title = 'Engajamento nos Últimos 14 Dias',
  description 
}: EngagementChartProps) {
  // Se não houver dados, criar dados de exemplo baseados nos últimos 14 dias
  const chartData = data.length > 0 ? data : (() => {
    const days = []
    const today = new Date()
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      days.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        votes: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 30)
      })
    }
    return days
  })()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
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
            <Line 
              type="monotone" 
              dataKey="votes" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              name="Votos"
            />
            <Line 
              type="monotone" 
              dataKey="comments" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', r: 4 }}
              name="Comentários"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


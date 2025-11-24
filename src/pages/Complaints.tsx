import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStore } from '@/store/appStore'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { 
  Flag, 
  User, 
  MapPin,
  Calendar,
  FileText,
  Building2,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'

interface Complaint {
  id: string
  citizen_id: string
  city_id: string
  original_text: string
  formal_document?: string
  category: string
  responsible_agency: string
  status: string
  pdf_url?: string
  created_at: string
  citizens?: {
    name: string
    phone: string
  }
  cities?: {
    name: string
    state: string
  }
}

export default function Complaints() {
  const { cities, loading, currentCity } = useStore()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Auto-refresh
  useAutoRefresh()

  useEffect(() => {
    fetchComplaints()
  }, [currentCity])

  const fetchComplaints = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const url = currentCity 
        ? `${apiUrl}/api/complaints?city_id=${currentCity.id}` 
        : `${apiUrl}/api/complaints`
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json; charset=utf-8',
          'Accept-Charset': 'utf-8',
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
      if (!response.ok) throw new Error('Erro ao buscar reclamações')
      const data = await response.json()
      setComplaints(data)
      setFilteredComplaints(data)
    } catch (error) {
      console.error('Error fetching complaints:', error)
    }
  }

  useEffect(() => {
    let filtered = complaints
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(c => c.category === categoryFilter)
    }
    
    setFilteredComplaints(filtered)
  }, [complaints, statusFilter, categoryFilter])

  const getStatusBadge = (status: string) => {
    const variants = {
      new: 'default',
      sent: 'warning',
      resolved: 'success'
    }
    
    return variants[status as keyof typeof variants] || 'secondary'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      new: 'Nova',
      sent: 'Enviada',
      resolved: 'Resolvida'
    }
    
    return labels[status as keyof typeof labels] || status
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="h-4 w-4" />
      case 'sent':
        return <FileText className="h-4 w-4" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <XCircle className="h-4 w-4" />
    }
  }

  const categories = ['saúde', 'educação', 'infraestrutura', 'segurança', 'transporte', 'meio ambiente', 'outros']

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
          <h1 className="text-3xl font-bold">Reclamações</h1>
          <p className="text-muted-foreground">
            {currentCity ? `Cidade: ${currentCity.name}` : 'Todas as reclamações'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setStatusFilter('all')}>Todas</TabsTrigger>
          <TabsTrigger value="new" onClick={() => setStatusFilter('new')}>Novas</TabsTrigger>
          <TabsTrigger value="sent" onClick={() => setStatusFilter('sent')}>Enviadas</TabsTrigger>
          <TabsTrigger value="resolved" onClick={() => setStatusFilter('resolved')}>Resolvidas</TabsTrigger>
        </TabsList>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('all')}
          >
            Todas as categorias
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </div>

        <TabsContent value={statusFilter} className="space-y-4">
          <div className="grid gap-4">
            {filteredComplaints.map((complaint) => (
              <Card key={complaint.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg capitalize">{complaint.category}</CardTitle>
                        <Badge variant={getStatusBadge(complaint.status) as any}>
                          {getStatusIcon(complaint.status)}
                          <span className="ml-1">{getStatusLabel(complaint.status)}</span>
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4 flex-wrap">
                        {complaint.citizens && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {complaint.citizens.name}
                          </div>
                        )}
                        {complaint.cities && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {complaint.cities.name} - {complaint.cities.state}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {complaint.responsible_agency}
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Reclamação Original:</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      {complaint.original_text}
                    </p>
                  </div>

                  {complaint.formal_document && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Documento Formal:</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {complaint.formal_document}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(complaint.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    {complaint.pdf_url && (
                      <a 
                        href={complaint.pdf_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center border-2 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Ver PDF
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {complaint.status === 'new' && (
                      <Button size="sm">
                        Enviar Reclamação
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredComplaints.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Flag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma reclamação encontrada</h3>
                <p className="text-muted-foreground text-center">
                  {statusFilter === 'all' 
                    ? 'Nenhuma reclamação cadastrada ainda.' 
                    : `Nenhuma reclamação com status "${getStatusLabel(statusFilter)}".`
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


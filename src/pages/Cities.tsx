import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useStore } from '@/store/appStore'
import { useDebounce } from '@/hooks/useDebounce'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { toast } from 'sonner'
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2,
  Search,
  Building2,
  Users,
  Globe,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface City {
  id: string
  name: string
  state: string
  population?: number
  chamber_url?: string
  is_active: boolean
  created_at: string
}

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

export default function Cities() {
  const { 
    cities, 
    loading, 
    fetchCities,
    addCityOptimistic,
    updateCityOptimistic,
    removeCityOptimistic
  } = useStore()
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [showForm, setShowForm] = useState(false)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    population: '',
    chamber_url: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Auto-refresh
  useAutoRefresh()

  useEffect(() => {
    fetchCities()
  }, [])

  useEffect(() => {
    let filtered = cities
    
    if (debouncedSearch) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.state.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    }
    
    setFilteredCities(filtered)
  }, [cities, debouncedSearch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const url = editingCity 
      ? `${apiUrl}/api/cities/${editingCity.id}`
      : `${apiUrl}/api/cities`
    
    const method = editingCity ? 'PUT' : 'POST'
    
    const payload = {
      name: formData.name,
      state: formData.state.toUpperCase(),
      population: formData.population ? parseInt(formData.population) : null,
      chamber_url: formData.chamber_url || null
    }

    let tempId: string | null = null

    // Optimistic update
    if (editingCity) {
      updateCityOptimistic(editingCity.id, payload as Partial<City>)
      toast.success('Cidade atualizada!', { description: 'Atualizando dados...' })
    } else {
      tempId = `temp-${Date.now()}`
      const newCity: City = {
        id: tempId,
        name: payload.name,
        state: payload.state,
        population: payload.population || undefined,
        chamber_url: payload.chamber_url || undefined,
        is_active: true,
        created_at: new Date().toISOString()
      }
      addCityOptimistic(newCity)
      toast.success('Cidade cadastrada!', { description: 'Salvando dados...' })
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar cidade')
      }

      const savedCity = await response.json()

      // Atualizar com dados reais do servidor
      if (editingCity) {
        updateCityOptimistic(editingCity.id, savedCity)
      } else if (tempId) {
        removeCityOptimistic(tempId)
        addCityOptimistic(savedCity)
      }

      // Limpar formulário
      setFormData({ name: '', state: '', population: '', chamber_url: '' })
      setShowForm(false)
      setEditingCity(null)
      
      // Refresh silencioso
      fetchCities(true)
      
      toast.success(
        editingCity ? 'Cidade atualizada com sucesso!' : 'Cidade cadastrada com sucesso!'
      )
    } catch (error: any) {
      console.error('Error saving city:', error)
      
      // Reverter optimistic update
      if (editingCity) {
        fetchCities(true) // Recarregar para reverter
      } else if (tempId) {
        removeCityOptimistic(tempId)
      }
      
      toast.error('Erro ao salvar cidade', { 
        description: error.message || 'Tente novamente' 
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (city: City) => {
    setEditingCity(city)
    setFormData({
      name: city.name,
      state: city.state,
      population: city.population?.toString() || '',
      chamber_url: city.chamber_url || ''
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCity(null)
    setFormData({ name: '', state: '', population: '', chamber_url: '' })
  }

  const handleDelete = async (cityId: string) => {
    const city = cities.find(c => c.id === cityId)
    if (!confirm(`Tem certeza que deseja excluir ${city?.name}? Esta ação não pode ser desfeita.`)) {
      return
    }

    // Optimistic update
    removeCityOptimistic(cityId)
    toast.success('Cidade excluída!', { description: 'Removendo dados...' })

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/cities/${cityId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir cidade')
      }

      // Refresh silencioso para garantir sincronização
      fetchCities(true)
      toast.success('Cidade excluída com sucesso!')
    } catch (error: any) {
      console.error('Error deleting city:', error)
      
      // Reverter optimistic update
      fetchCities(true)
      
      toast.error('Erro ao excluir cidade', { 
        description: error.message || 'Tente novamente' 
      })
    }
  }

  if (loading && cities.length === 0) {
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
          <h1 className="text-3xl font-bold">Cidades</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie as cidades do sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Cancelar' : 'Nova Cidade'}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCity ? 'Editar Cidade' : 'Cadastrar Nova Cidade'}
            </CardTitle>
            <CardDescription>
              Preencha os dados da cidade para cadastrá-la no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome da Cidade *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: São Paulo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado (UF) *</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="flex h-11 w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-500 ring-offset-white transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    required
                  >
                    <option value="">Selecione o estado</option>
                    {brazilianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">População</label>
                  <Input
                    type="number"
                    value={formData.population}
                    onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                    placeholder="Ex: 1234567"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">URL da Câmara Municipal</label>
                  <Input
                    type="url"
                    value={formData.chamber_url}
                    onChange={(e) => setFormData({ ...formData, chamber_url: e.target.value })}
                    placeholder="https://www.camara.sp.gov.br"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Salvando...' : editingCity ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCities.map((city) => (
          <Card key={city.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary-600" />
                    {city.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="font-medium">{city.state}</span>
                    {city.population && (
                      <>
                        <span>•</span>
                        <span>{city.population.toLocaleString('pt-BR')} habitantes</span>
                      </>
                    )}
                  </CardDescription>
                </div>
                <Badge variant={city.is_active ? 'default' : 'secondary'}>
                  {city.is_active ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativa
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Inativa
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {city.chamber_url && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Globe className="h-4 w-4 mr-2" />
                  <a 
                    href={city.chamber_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary-600 underline truncate"
                  >
                    Site da Câmara
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Building2 className="h-3 w-3 mr-1" />
                  Cadastrada em {new Date(city.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEdit(city)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDelete(city.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCities.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? 'Nenhuma cidade encontrada' : 'Nenhuma cidade cadastrada'}
            </h3>
            <p className="text-muted-foreground text-center">
              {searchTerm 
                ? 'Tente buscar com outros termos.' 
                : 'Comece cadastrando a primeira cidade do sistema.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


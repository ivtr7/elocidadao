import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useStore } from '@/store/appStore'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { Building2, Users, FileText, TrendingUp, Plus, MessageCircle, MapPin, ArrowUpRight, Activity } from 'lucide-react'

export default function Dashboard() {
  const { cities, projects, citizens, loading, fetchCities, fetchProjects, fetchCitizens } = useStore()
  const [stats, setStats] = useState({
    totalCities: 0,
    totalProjects: 0,
    totalCitizens: 0,
    activeProjects: 0
  })

  // Auto-refresh
  useAutoRefresh()

  useEffect(() => {
    fetchCities()
    fetchProjects()
    fetchCitizens()
  }, [])

  useEffect(() => {
    setStats({
      totalCities: cities.length,
      totalProjects: projects.length,
      totalCitizens: citizens.length,
      activeProjects: projects.filter(p => p.status === 'active').length
    })
  }, [cities, projects, citizens])

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Visão geral do sistema Elo Cidadão</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
          >
            <Activity className="mr-2 h-4 w-4" />
            Relatórios
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Cidade
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Cidades</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCities}</div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">+12% este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Projetos</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProjects}</div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">+8% este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Projetos Ativos</CardTitle>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeProjects}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Em votação no momento</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Cidadãos Ativos</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCitizens}</div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">+15% este mês</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cities */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Cidades Ativas</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Gerencie as cidades do sistema</CardDescription>
              </div>
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cities.slice(0, 5).map((city) => (
                <div key={city.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{city.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{city.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{city.state} • {city.population?.toLocaleString()} habitantes</p>
                    </div>
                  </div>
                  <Badge variant={city.is_active ? "default" : "secondary"}>
                    {city.is_active ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              ))}
            </div>
            {cities.length > 5 && (
              <Button variant="ghost" className="w-full mt-4 text-blue-600 hover:text-blue-700">
                Ver todas as cidades
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Projetos Recentes</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Últimos projetos cadastrados</CardDescription>
              </div>
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projects.slice(0, 6).map((project) => (
                <div key={project.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">{project.simple_title || project.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{project.summary || project.full_text}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Projeto {project.number}</span>
                        <span>•</span>
                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {project.total_comments} comentários
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{project.total_support + project.total_against}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">votos</div>
                      <Progress 
                        value={(project.total_support / (project.total_support + project.total_against || 1)) * 100} 
                        className="w-20 mt-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {projects.length > 6 && (
              <Button variant="ghost" className="w-full mt-4 text-blue-600 hover:text-blue-700">
                Ver todos os projetos
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">Ações Rápidas</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Funções administrativas principais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Novo Projeto
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageCircle className="mr-2 h-4 w-4" />
              Moderar Comentários
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MapPin className="mr-2 h-4 w-4" />
              Gerenciar Cidades
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              Ver Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
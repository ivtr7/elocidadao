import { create } from 'zustand'

interface City {
  id: string
  name: string
  state: string
  population?: number
  chamber_url?: string
  is_active: boolean
  created_at: string
}

interface Project {
  id: string
  city_id: string
  number: string
  title: string
  simple_title?: string
  summary?: string
  full_text: string
  who_benefits?: string
  who_loses?: string
  tags?: string[]
  status: string
  total_support: number
  total_against: number
  total_comments: number
  engagement_score: number
  notify_flag: boolean
  created_at: string
}

interface Citizen {
  id: string
  name: string
  phone: string
  city_id: string
  stars: number
  total_votes: number
  total_comments: number
  total_complaints: number
  engagement_level: string
  notifications_enabled: boolean
  last_interaction?: string
  created_at: string
}

interface AppState {
  // Estado global
  currentCity: City | null
  cities: City[]
  projects: Project[]
  citizens: Citizen[]
  loading: boolean
  error: string | null
  
  // Cache e timestamps
  lastFetch: {
    cities?: number
    projects?: number
    citizens?: number
  }
  autoRefresh: boolean
  refreshInterval: number
  
  // Ações
  setCurrentCity: (city: City | null) => void
  setCities: (cities: City[]) => void
  setProjects: (projects: Project[]) => void
  setCitizens: (citizens: Citizen[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setAutoRefresh: (enabled: boolean) => void
  setRefreshInterval: (interval: number) => void
  
  // Ações assíncronas
  fetchCities: (force?: boolean) => Promise<void>
  fetchProjects: (cityId?: string, force?: boolean) => Promise<void>
  fetchCitizens: (cityId?: string, force?: boolean) => Promise<void>
  
  // Optimistic updates
  addCityOptimistic: (city: City) => void
  updateCityOptimistic: (id: string, updates: Partial<City>) => void
  removeCityOptimistic: (id: string) => void
  addProjectOptimistic: (project: Project) => void
  updateProjectOptimistic: (id: string, updates: Partial<Project>) => void
}

const CACHE_DURATION = 5000 // 5 segundos de cache

export const useStore = create<AppState>((set, get) => ({
  // Estado inicial
  currentCity: null,
  cities: [],
  projects: [],
  citizens: [],
  loading: false,
  error: null,
  lastFetch: {},
  autoRefresh: true,
  refreshInterval: 10, // 10 segundos padrão
  
  // Ações síncronas
  setCurrentCity: (city) => set({ currentCity: city }),
  setCities: (cities) => set({ cities, lastFetch: { ...get().lastFetch, cities: Date.now() } }),
  setProjects: (projects) => set({ projects, lastFetch: { ...get().lastFetch, projects: Date.now() } }),
  setCitizens: (citizens) => set({ citizens, lastFetch: { ...get().lastFetch, citizens: Date.now() } }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),
  setRefreshInterval: (interval) => set({ refreshInterval: interval }),
  
  // Optimistic updates
  addCityOptimistic: (city) => set((state) => ({ 
    cities: [...state.cities, city].sort((a, b) => a.name.localeCompare(b.name))
  })),
  
  updateCityOptimistic: (id, updates) => set((state) => ({
    cities: state.cities.map(city => city.id === id ? { ...city, ...updates } : city)
  })),
  
  removeCityOptimistic: (id) => set((state) => ({
    cities: state.cities.filter(city => city.id !== id)
  })),
  
  addProjectOptimistic: (project) => set((state) => ({
    projects: [project, ...state.projects]
  })),
  
  updateProjectOptimistic: (id, updates) => set((state) => ({
    projects: state.projects.map(project => project.id === id ? { ...project, ...updates } : project)
  })),
  
  // Ações assíncronas com cache inteligente
  fetchCities: async (force = false) => {
    const state = get()
    const now = Date.now()
    const lastFetch = state.lastFetch.cities || 0
    
    // Verificar cache
    if (!force && lastFetch && (now - lastFetch) < CACHE_DURATION) {
      return // Usar dados em cache
    }
    
    set({ loading: true, error: null })
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/cities`, {
        cache: 'no-cache',
        headers: { 
          'Cache-Control': 'no-cache',
          'Accept': 'application/json; charset=utf-8',
          'Accept-Charset': 'utf-8',
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
      if (!response.ok) throw new Error('Erro ao buscar cidades')
      const cities = await response.json()
      set({ cities, loading: false, lastFetch: { ...state.lastFetch, cities: Date.now() } })
    } catch (error) {
      console.error('Error fetching cities:', error)
      set({ error: error.message, loading: false })
    }
  },
  
  fetchProjects: async (cityId, force = false) => {
    const state = get()
    const now = Date.now()
    const lastFetch = state.lastFetch.projects || 0
    
    // Verificar cache
    if (!force && lastFetch && (now - lastFetch) < CACHE_DURATION) {
      return // Usar dados em cache
    }
    
    set({ loading: true, error: null })
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const url = cityId ? `${apiUrl}/api/projects?city_id=${cityId}` : `${apiUrl}/api/projects`
      const response = await fetch(url, {
        cache: 'no-cache',
        headers: { 
          'Cache-Control': 'no-cache',
          'Accept': 'application/json; charset=utf-8',
          'Accept-Charset': 'utf-8',
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
      if (!response.ok) throw new Error('Erro ao buscar projetos')
      const projects = await response.json()
      set({ projects, loading: false, lastFetch: { ...state.lastFetch, projects: Date.now() } })
    } catch (error) {
      console.error('Error fetching projects:', error)
      set({ error: error.message, loading: false })
    }
  },
  
  fetchCitizens: async (cityId, force = false) => {
    const state = get()
    const now = Date.now()
    const lastFetch = state.lastFetch.citizens || 0
    
    // Verificar cache
    if (!force && lastFetch && (now - lastFetch) < CACHE_DURATION) {
      return // Usar dados em cache
    }
    
    set({ loading: true, error: null })
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/citizens${cityId ? `?city_id=${cityId}` : ''}`, {
        cache: 'no-cache',
        headers: { 
          'Cache-Control': 'no-cache',
          'Accept': 'application/json; charset=utf-8',
          'Accept-Charset': 'utf-8',
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
      if (!response.ok) throw new Error('Erro ao buscar cidadãos')
      const citizens = await response.json()
      set({ citizens, loading: false, lastFetch: { ...state.lastFetch, citizens: Date.now() } })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  }
}))
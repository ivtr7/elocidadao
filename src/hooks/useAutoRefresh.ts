import { useEffect, useRef } from 'react'
import { useStore } from '@/store/appStore'

export function useAutoRefresh() {
  const { autoRefresh, refreshInterval, fetchCities, fetchProjects, fetchCitizens, currentCity } = useStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!autoRefresh) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Função de refresh
    const refresh = () => {
      fetchCities(true)
      fetchProjects(currentCity?.id, true)
      fetchCitizens(currentCity?.id, true)
    }

    // Refresh imediato ao montar
    refresh()

    // Configurar intervalo
    const interval = refreshInterval * 1000 // Converter para milissegundos
    intervalRef.current = setInterval(refresh, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [autoRefresh, refreshInterval, currentCity, fetchCities, fetchProjects, fetchCitizens])
}


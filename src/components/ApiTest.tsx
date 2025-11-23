import { useEffect } from 'react'

export function ApiTest() {
  useEffect(() => {
    // Test API connection
    const testApi = async () => {
      console.log('Testing API connection...')
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        console.log('Using API URL:', apiUrl)
        
        const response = await fetch(`${apiUrl}/api/cities`)
        console.log('API Response Status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ API Connection Successful! Cities:', data)
        } else {
          console.error('❌ API Error:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('❌ API Connection Failed:', error)
      }
    }
    
    testApi()
  }, [])
  
  return null
}
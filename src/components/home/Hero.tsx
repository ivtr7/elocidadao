import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MessageCircle, TrendingUp, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface HeroProps {
  featuredProject?: {
    id: string
    simple_title?: string
    title: string
    number: string
    summary?: string
    total_support: number
    total_against: number
  }
}

export function Hero({ featuredProject }: HeroProps) {
  return (
    <section 
      className="relative min-h-[500px] bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden"
      aria-label="Seção principal de boas-vindas"
    >
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" aria-hidden="true"></div>
      
      {/* Blob Animations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob" aria-hidden="true"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000" aria-hidden="true"></div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-6 sm:space-y-8">
            <header className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Participe da{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Democracia Digital
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 leading-relaxed" style={{ color: 'hsl(222.2, 47.4%, 11.2%)' }}>
                Conheça os projetos de lei da sua cidade, vote, comente e faça sua voz ser ouvida. 
                Transforme sua participação cidadã em ação.
              </p>
            </header>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="https://wa.me/5511999999999" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Participar via WhatsApp"
              >
                <MessageCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                Participar via WhatsApp
              </a>
              <Link 
                to="/rankings"
                className="inline-flex items-center justify-center border-2 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-8 py-6 text-lg font-semibold rounded-lg text-gray-700 dark:text-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Ver rankings de projetos"
              >
                Ver Rankings
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
            
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">+1.2k</span> cidadãos ativos
                </span>
              </div>
            </div>
          </div>
          
          {/* Right: Featured Project Card */}
          {featuredProject && (
            <aside className="lg:pl-8" aria-label="Projeto em destaque">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-2 border-blue-200 dark:border-blue-800 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <CardContent className="p-6 sm:p-8">
                  <article className="space-y-4">
                    <header className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-full">
                        Destaque
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {featuredProject.number}
                      </span>
                    </header>
                    
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white line-clamp-2">
                      {featuredProject.simple_title || featuredProject.title}
                    </h2>
                    
                    {featuredProject.summary && (
                      <p className="text-gray-700 dark:text-gray-200 line-clamp-3">
                        {featuredProject.summary}
                      </p>
                    )}
                    
                    <footer className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4" aria-label="Estatísticas de votação">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600" aria-label={`${featuredProject.total_support} votos a favor`}>
                            {featuredProject.total_support}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">A favor</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600" aria-label={`${featuredProject.total_against} votos contra`}>
                            {featuredProject.total_against}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Contra</div>
                        </div>
                      </div>
                      
                      <Link 
                        to={`/project/${featuredProject.id}`}
                        className="inline-flex items-center justify-center border-2 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 text-sm font-semibold rounded-lg text-gray-700 dark:text-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label={`Ver detalhes do projeto ${featuredProject.number}`}
                      >
                        Ver Projeto
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                      </Link>
                    </footer>
                  </article>
                </CardContent>
              </Card>
            </aside>
          )}
        </div>
      </div>
    </section>
  )
}


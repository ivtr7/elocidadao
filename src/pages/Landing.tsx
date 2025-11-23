import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Heart, 
  Users, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  Shield,
  Zap,
  Globe,
  CheckCircle,
  ArrowRight,
  Star,
  BarChart3,
  Vote,
  Bell,
  Sparkles
} from 'lucide-react'

export default function Landing() {
  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
    
    // Intersection Observer para animações ao scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up')
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('.scroll-animate')
    elements.forEach((el) => observer.observe(el))

    return () => {
      elements.forEach((el) => observer.unobserve(el))
    }
  }, [])

  const features = [
    {
      icon: Vote,
      title: 'Votação Digital',
      description: 'Participe de forma simples e direta nas decisões da sua cidade',
      color: 'text-blue-600'
    },
    {
      icon: MessageSquare,
      title: 'Comentários Públicos',
      description: 'Expresse sua opinião e veja o que outros cidadãos pensam',
      color: 'text-green-600'
    },
    {
      icon: FileText,
      title: 'Projetos Simplificados',
      description: 'IA transforma linguagem jurídica em texto fácil de entender',
      color: 'text-purple-600'
    },
    {
      icon: TrendingUp,
      title: 'Rankings de Engajamento',
      description: 'Veja os cidadãos mais ativos e os projetos mais debatidos',
      color: 'text-orange-600'
    },
    {
      icon: Bell,
      title: 'Notificações Inteligentes',
      description: 'Receba avisos sobre novos projetos e atualizações importantes',
      color: 'text-pink-600'
    },
    {
      icon: Shield,
      title: 'Moderação Automática',
      description: 'Sistema inteligente garante um ambiente respeitoso e seguro',
      color: 'text-red-600'
    }
  ]

  const benefits = [
    'Democracia mais acessível e transparente',
    'Participação cidadã em tempo real',
    'Transparência total nas decisões municipais',
    'IA que simplifica textos jurídicos complexos',
    'Sistema de engajamento e gamificação',
    'Integração com WhatsApp para maior alcance'
  ]

  const steps = [
    {
      number: '01',
      title: 'Cadastre-se',
      description: 'Registre-se com seu telefone e cidade'
    },
    {
      number: '02',
      title: 'Explore Projetos',
      description: 'Navegue pela Central de Projetos e leia sobre as leis'
    },
    {
      number: '03',
      title: 'Participe',
      description: 'Vote, comente e compartilhe sua opinião'
    },
    {
      number: '04',
      title: 'Acompanhe',
      description: 'Veja os resultados e impactos das suas participações'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-all duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-20 text-center">
          <div className="mb-8 inline-block">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Elo Cidadão
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-2">
              Democracia Digital
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>Transformando participação cidadã</span>
            </div>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Sua voz importa na
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              construção da sua cidade
            </span>
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Plataforma inovadora que conecta cidadãos aos projetos de lei municipais, 
            tornando a democracia mais acessível, transparente e participativa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/home">
              <Button size="lg" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
                Explorar Projetos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Saiba Mais
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { label: 'Cidades', value: '50+', icon: Globe },
              { label: 'Projetos', value: '200+', icon: FileText },
              { label: 'Cidadãos', value: '5K+', icon: Users },
              { label: 'Votos', value: '10K+', icon: Vote }
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <div 
                  key={index}
                  className="scroll-animate opacity-0"
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <Icon className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="features"
        ref={featuresRef}
        className="py-20 bg-white dark:bg-gray-900"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 scroll-animate opacity-0">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Funcionalidades
              <span className="block text-blue-600">Poderosas</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Tudo que você precisa para participar ativamente da democracia digital
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card 
                  key={index}
                  className="scroll-animate opacity-0 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
                >
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color.replace('text-', 'bg-')} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-7 w-7 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 scroll-animate opacity-0">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Em 4 passos simples, você já está participando
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="scroll-animate opacity-0 relative"
              >
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white dark:bg-gray-800">
                  <CardHeader>
                    <div className="text-6xl font-bold text-blue-600/20 mb-4">
                      {step.number}
                    </div>
                    <CardTitle className="text-2xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="scroll-animate opacity-0">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Por que escolher o
                <span className="block text-blue-600">Elo Cidadão?</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Uma plataforma completa que revoluciona a participação cidadã
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-lg text-gray-700 dark:text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="scroll-animate opacity-0">
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <CardHeader>
                  <CardTitle className="text-3xl mb-4">Tecnologia de Ponta</CardTitle>
                  <CardDescription className="text-blue-100 text-lg">
                    Utilizamos inteligência artificial para simplificar textos jurídicos complexos, 
                    tornando a participação acessível a todos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <Zap className="h-8 w-8 mb-2" />
                      <div className="text-2xl font-bold">IA</div>
                      <div className="text-sm text-blue-100">Inteligência Artificial</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <Globe className="h-8 w-8 mb-2" />
                      <div className="text-2xl font-bold">100%</div>
                      <div className="text-sm text-blue-100">Digital</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <Shield className="h-8 w-8 mb-2" />
                      <div className="text-2xl font-bold">Seguro</div>
                      <div className="text-sm text-blue-100">Proteção de Dados</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <BarChart3 className="h-8 w-8 mb-2" />
                      <div className="text-2xl font-bold">Real-time</div>
                      <div className="text-sm text-blue-100">Atualizações</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <div className="scroll-animate opacity-0 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pronto para fazer a diferença?
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              Junte-se a milhares de cidadãos que já estão participando ativamente da democracia digital
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/home">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6 shadow-xl">
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/10"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Explorar Funcionalidades
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-red-500" />
                <span className="text-xl font-bold text-white">Elo Cidadão</span>
              </div>
              <p className="text-sm">
                Democracia digital para todos. Transformando participação cidadã.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/home" className="hover:text-white transition-colors">Central de Projetos</Link></li>
                <li><Link to="/projects" className="hover:text-white transition-colors">Projetos</Link></li>
                <li><Link to="/rankings" className="hover:text-white transition-colors">Rankings</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Recursos</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/citizens" className="hover:text-white transition-colors">Cidadãos</Link></li>
                <li><Link to="/complaints" className="hover:text-white transition-colors">Reclamações</Link></li>
                <li><Link to="/settings" className="hover:text-white transition-colors">Configurações</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Contato</h3>
              <p className="text-sm">
                Suporte e informações
                <br />
                <a href="mailto:contato@elocidadao.com" className="hover:text-white transition-colors">
                  contato@elocidadao.com
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Elo Cidadão. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


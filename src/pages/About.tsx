import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, Users, FileText, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function About() {
  const features = [
    {
      icon: MessageCircle,
      title: 'Participação via WhatsApp',
      description: 'Envie mensagens, vote em projetos e faça reclamações diretamente pelo WhatsApp'
    },
    {
      icon: FileText,
      title: 'Projetos Simplificados',
      description: 'IA transforma linguagem jurídica complexa em textos simples e acessíveis'
    },
    {
      icon: TrendingUp,
      title: 'Democracia Digital',
      description: 'Acompanhe votações em tempo real e veja o impacto da sua participação'
    },
    {
      icon: Users,
      title: 'Comunidade Engajada',
      description: 'Conecte-se com outros cidadãos e participe ativamente da vida municipal'
    }
  ]

  const steps = [
    {
      number: '01',
      title: 'Cadastre-se',
      description: 'Entre no WhatsApp e envie uma mensagem para o Elo Cidadão. Você será cadastrado automaticamente.'
    },
    {
      number: '02',
      title: 'Explore Projetos',
      description: 'Receba notificações sobre novos projetos de lei e explore o blog de notícias.'
    },
    {
      number: '03',
      title: 'Participe',
      description: 'Vote, comente e faça reclamações. Sua voz importa na construção da cidade.'
    },
    {
      number: '04',
      title: 'Acompanhe Resultados',
      description: 'Veja como sua participação impacta as decisões e acompanhe o progresso dos projetos.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative min-h-[400px] bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        {/* Blob Animations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Sobre o Elo Cidadão
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 leading-relaxed">
              Uma plataforma inovadora que conecta cidadãos e governos através da tecnologia, 
              tornando a participação democrática mais acessível e eficiente.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card 
                key={index}
                className="hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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

      {/* Como Funciona - Timeline */}
      <div className="bg-white dark:bg-gray-800 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Em 4 passos simples, você já está participando da democracia digital
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className="flex gap-6 sm:gap-8"
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mx-auto mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Missão */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Nossa Missão
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              Democratizar o acesso à participação cívica, tornando mais fácil para todos os cidadãos 
              entenderem, votarem e influenciarem os projetos de lei que impactam suas vidas. 
              Acreditamos que a tecnologia pode aproximar as pessoas do poder público e fortalecer 
              a democracia participativa.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 mt-12">
              {[
                { label: 'Cidadãos Ativos', value: '1.2k+' },
                { label: 'Projetos Analisados', value: '500+' },
                { label: 'Votos Registrados', value: '5k+' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Pronto para participar?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de cidadãos que já estão transformando suas cidades através da participação digital.
          </p>
          <a 
            href="https://wa.me/5511999999999" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Participar via WhatsApp
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  )
}


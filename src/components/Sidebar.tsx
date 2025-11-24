import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { 
  Home, 
  FileText, 
  Trophy, 
  Users,
  Settings,
  MessageSquare,
  Flag,
  BarChart3,
  Heart,
  MapPin
} from 'lucide-react'

const sidebarItems = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    description: 'Visão geral do sistema'
  },
  {
    title: 'Cidades',
    icon: MapPin,
    href: '/dashboard/cities',
    description: 'Cadastrar e gerenciar cidades'
  },
  {
    title: 'Projetos',
    icon: FileText,
    href: '/dashboard/projects',
    description: 'Gerenciar projetos municipais'
  },
  {
    title: 'Cidadãos',
    icon: Users,
    href: '/dashboard/citizens',
    description: 'Participantes da cidade'
  },
  {
    title: 'Reclamações',
    icon: Flag,
    href: '/dashboard/complaints',
    description: 'Solicitações da população'
  },
  {
    title: 'Moderação',
    icon: MessageSquare,
    href: '/dashboard/moderation',
    description: 'Aprovar conteúdo'
  },
  {
    title: 'Agente WhatsApp',
    icon: MessageSquare,
    href: '/dashboard/whatsapp',
    description: 'Configurar conexão WhatsApp'
  },
  {
    title: 'Configurações',
    icon: Settings,
    href: '/dashboard/settings',
    description: 'Preferências do sistema'
  }
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">Elo Cidadão</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Democracia Digital</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-l-4 border-primary-500 shadow-sm" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  isActive 
                    ? "bg-primary-100 dark:bg-primary-800/30 text-primary-600 dark:text-primary-400" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-200">Sistema Online</p>
            <p className="text-xs text-green-600 dark:text-green-400">Todos os serviços ativos</p>
          </div>
        </div>
      </div>
    </div>
  )
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Info, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface AlgorithmTransparencyProps {
  sortMethod: string
  totalItems: number
  filteredItems: number
}

export function AlgorithmTransparency({ sortMethod, totalItems, filteredItems }: AlgorithmTransparencyProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getSortDescription = (method: string) => {
    const descriptions: Record<string, string> = {
      recent: 'Os projetos são ordenados pela data de criação, do mais recente para o mais antigo. Esta ordem é neutra e não influencia sua decisão.',
      supported: 'Os projetos são ordenados pelo número de votos a favor. Esta ordenação mostra popularidade, mas não deve influenciar seu voto.',
      rejected: 'Os projetos são ordenados pelo número de votos contra. Esta ordenação mostra rejeição, mas não deve influenciar seu voto.',
      commented: 'Os projetos são ordenados pelo número de comentários. Mais comentários indicam maior discussão, não necessariamente qualidade.',
      relevant: 'Os projetos são ordenados por um score de engajamento calculado. Este score considera votos, comentários e tempo, mas é apenas uma métrica.'
    }
    return descriptions[method] || 'Os projetos são ordenados de forma neutra.'
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-base">Transparência Algorítmica</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Ocultar informações' : 'Mostrar informações'}
          >
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription className="text-sm">
          Como os projetos são ordenados e exibidos
        </CardDescription>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Método de ordenação atual:</strong> {getSortDescription(sortMethod)}
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total de projetos:</span>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">{totalItems}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">Exibindo:</span>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">{filteredItems}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Importante:</strong> A ordem de exibição não reflete qualidade ou importância. 
              Cada projeto deve ser avaliado individualmente com base em seu conteúdo e impacto.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}


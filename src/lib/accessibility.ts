/**
 * Utilitários de acessibilidade
 */

/**
 * Gera um ID único para elementos ARIA
 */
export function generateAriaId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Props padrão para elementos acessíveis
 */
export interface AccessibleProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  role?: string
  tabIndex?: number
}

/**
 * Cria props de acessibilidade para botões
 */
export function getButtonA11yProps(label: string, describedBy?: string): AccessibleProps {
  return {
    'aria-label': label,
    'aria-describedby': describedBy,
    role: 'button',
    tabIndex: 0
  }
}

/**
 * Cria props de acessibilidade para cards clicáveis
 */
export function getCardA11yProps(title: string, description?: string): AccessibleProps {
  const id = generateAriaId('card')
  return {
    role: 'article',
    'aria-labelledby': `${id}-title`,
    'aria-describedby': description ? `${id}-description` : undefined,
    tabIndex: 0
  }
}

/**
 * Anuncia mudanças para leitores de tela
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Classes para elementos visíveis apenas para leitores de tela
 */
export const srOnly = 'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0'


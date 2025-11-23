import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg text-sm font-medium ring-offset-white dark:ring-offset-gray-950 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] shadow-sm hover:shadow-md'
    
    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
      destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      outline: 'border-2 border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-700 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-400 dark:hover:bg-gray-700',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
      ghost: 'hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-100',
      link: 'text-blue-600 underline-offset-4 hover:underline hover:text-blue-700'
    }
    
    const sizes = {
      default: 'h-11 px-5 py-2.5',
      sm: 'h-9 rounded-md px-4 py-2 text-sm',
      lg: 'h-12 rounded-lg px-6 py-3 text-base',
      icon: 'h-10 w-10 rounded-lg'
    }

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
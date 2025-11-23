import * as React from "react"
import { cn } from "@/lib/utils"

export interface TabsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, children, defaultValue, value, onValueChange, ...props }, ref) => {
    const [activeValue, setActiveValue] = React.useState(value || defaultValue || "")
    
    React.useEffect(() => {
      if (value !== undefined) {
        setActiveValue(value)
      }
    }, [value])
    
    const handleValueChange = (newValue: string) => {
      setActiveValue(newValue)
      onValueChange?.(newValue)
    }
    
    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement, {
              activeValue,
              onValueChange: handleValueChange
            } as any)
          }
          return child
        })}
      </div>
    )
  }
)
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { activeValue?: string; onValueChange?: (value: string) => void }>(
  ({ className, children, activeValue, onValueChange, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-xl bg-gray-100 p-1.5 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.props.value) {
          return React.cloneElement(child as React.ReactElement, {
            activeValue,
            onValueChange
          } as any)
        }
        return child
      })}
    </div>
  )
)
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string; activeValue?: string; onValueChange?: (value: string) => void }>(
  ({ className, value, activeValue, onValueChange, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold ring-offset-white dark:ring-offset-gray-950 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        activeValue === value && "bg-white text-blue-600 shadow-md dark:bg-gray-900 dark:text-blue-400",
        activeValue !== value && "hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100",
        className
      )}
      onClick={() => onValueChange?.(value)}
      {...props}
    />
  )
)
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string; activeValue?: string }>(
  ({ className, value, activeValue, children, ...props }, ref) => {
    if (activeValue !== value) return null
    
    return (
      <div
        ref={ref}
        className={cn(
          "mt-4 ring-offset-white dark:ring-offset-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 animate-in fade-in-0 duration-300",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
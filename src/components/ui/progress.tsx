import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min((value / max) * 100, 100)

    return (
      <div
        ref={ref}
        className={cn(
          'relative h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
          className
        )}
        {...props}
      >
        <div
          className="h-full flex-1 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-gray-200 shadow-sm dark:border-gray-700",
        className
      )}
      {...props}
    />
  )
)
Avatar.displayName = "Avatar"

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-semibold text-lg dark:from-blue-900 dark:to-blue-800 dark:text-blue-200",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarFallback }
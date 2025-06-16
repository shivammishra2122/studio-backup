// src/components/layout/responsive-container.tsx
import { cn } from "@/lib/utils"

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveContainer({ 
  children, 
  className 
}: ResponsiveContainerProps) {
  return (
    <div className={cn(
      "w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl",
      className
    )}>
      {children}
    </div>
  )
}
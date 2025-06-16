// src/components/layout/responsive-grid.tsx
import { cn } from "@/lib/utils"

interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: string
}

export function ResponsiveGrid({ 
  children, 
  className,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = "4"
}: ResponsiveGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  }

  return (
    <div className={cn(
      "grid",
      gridCols[cols.sm as keyof typeof gridCols],
      `md:${gridCols[cols.md as keyof typeof gridCols]}`,
      `lg:${gridCols[cols.lg as keyof typeof gridCols]}`,
      `xl:${gridCols[cols.xl as keyof typeof gridCols]}`,
      `gap-${gap}`,
      className
    )}>
      {children}
    </div>
  )
}
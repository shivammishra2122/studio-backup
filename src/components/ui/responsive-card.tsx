// src/components/ui/responsive-card.tsx
import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface ResponsiveCardProps {
  title?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  footerClassName?: string
}

export function ResponsiveCard({
  title,
  children,
  footer,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
}: ResponsiveCardProps) {
  return (
    <Card className={cn("w-full h-full flex flex-col", className)}>
      {title && (
        <CardHeader className={cn("pb-2", headerClassName)}>
          {typeof title === 'string' ? (
            <h3 className="text-lg font-semibold">{title}</h3>
          ) : (
            title
          )}
        </CardHeader>
      )}
      <CardContent className={cn("flex-1", contentClassName)}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className={cn("pt-2", footerClassName)}>
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}
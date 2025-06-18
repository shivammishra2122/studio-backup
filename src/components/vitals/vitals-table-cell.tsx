'use client';

import { cn } from '@/lib/utils';

interface VitalsTableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  className?: string;
}

export function VitalsTableCell({ 
  children, 
  className = '',
  ...props 
}: VitalsTableCellProps) {
  return (
    <td 
      className={cn(
        'py-1.5 px-3 text-sm',
        className
      )}
      {...props}
    >
      <span className="contents">{children}</span>
    </td>
  );
}

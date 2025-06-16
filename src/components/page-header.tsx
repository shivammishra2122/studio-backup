import type { ReactNode } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex w-full flex-col gap-y-3 sm:flex-row sm:items-center sm:justify-between sm:gap-y-0">
      <div className="flex w-full items-start gap-2 sm:items-center">
        {/* SidebarTrigger is now only visible on mobile (md:hidden) */}
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 truncate text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="mt-2 flex-shrink-0 sm:mt-0">
          {action}
        </div>
      )}
    </div>
  );
}


import type { ReactNode } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-y-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        {/* SidebarTrigger is now only visible on mobile (md:hidden) */}
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

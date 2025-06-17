'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { PanelLeft, PanelRight } from 'lucide-react';
import { Button } from './button';

interface CollapsibleButtonProps {
  children: React.ReactNode;
  side?: 'left' | 'right';
  className?: string;
  collapsedWidth?: string;
  floatingButtonClass?: string;
}

export function CollapsibleButton({
  children,
  side = 'left',
  className = '',
  collapsedWidth = 'w-12',
  floatingButtonClass = '',
}: CollapsibleButtonProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Add a small delay before showing the floating button to prevent flash
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const Icon = side === 'left' ? PanelLeft : PanelRight;
  const oppositeSide = side === 'left' ? 'right-0' : 'left-0';
  const translateDirection = side === 'left' ? 'translate-x-1/2' : '-translate-x-1/2';

  return (
    <div 
      className={cn(
        'relative transition-all duration-300 ease-in-out',
        isCollapsed ? collapsedWidth : 'w-full',
        className
      )}
      onMouseEnter={() => !isCollapsed && setIsHovered(true)}
      onMouseLeave={() => !isCollapsed && setIsHovered(false)}
    >
      {/* Main content */}
      <div 
        className={cn(
          'h-full transition-opacity duration-200',
          isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100',
          'overflow-hidden'
        )}
      >
        {children}
      </div>

      {/* Collapse button (visible when expanded) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleCollapse}
        className={cn(
          'absolute top-1/2 -translate-y-1/2',
          'h-8 w-8 rounded-full p-0',
          'bg-background border border-border shadow-md',
          'hover:bg-accent hover:text-accent-foreground',
          'transition-all duration-200',
          'flex items-center justify-center',
          'z-20',
          side === 'left' ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2',
          isCollapsed ? 'opacity-0' : 'opacity-100',
          isHovered ? 'scale-110' : 'scale-100'
        )}
        aria-label={isCollapsed ? 'Expand' : 'Collapse'}
      >
        <Icon className="h-4 w-4" />
      </Button>

      {/* Floating expand button (visible when collapsed) */}
      {isCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className={cn(
            'absolute top-1/2 -translate-y-1/2',
            'h-10 w-10 rounded-full p-0',
            'bg-primary text-primary-foreground shadow-lg',
            'hover:bg-primary/90 hover:scale-110',
            'transition-all duration-200',
            'flex items-center justify-center',
            'z-30',
            side === 'left' ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2',
            'animate-in fade-in-20 zoom-in-90',
            floatingButtonClass,
            {
              'opacity-0': !isMounted,
              'opacity-100': isMounted,
            }
          )}
          aria-label="Expand"
        >
          <Icon className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

export default CollapsibleButton;

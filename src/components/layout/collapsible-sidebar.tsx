"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PanelLeft, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

interface CollapsibleSidebarProps {
  children: React.ReactNode;
  className?: string;
  collapsedWidth?: string;
  expandedWidth?: string;
  floatingButtonClass?: string;
  side?: "left" | "right";
}

export function CollapsibleSidebar({
  children,
  className = "",
  collapsedWidth = "w-16",
  expandedWidth = "w-64",
  floatingButtonClass = "",
  side = "left",
}: CollapsibleSidebarProps) {
  const { state, toggleSidebar } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  const isCollapsed = state === "collapsed";

  // Add a small delay before showing the floating button to prevent flash
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const Icon = side === "left" ? PanelLeft : PanelRight;
  const positionClass = side === "left" ? "left-0" : "right-0";
  const translateClass = side === "left" ? "translate-x-1/2" : "-translate-x-1/2";

  return (
    <div
      className={cn(
        "relative h-full bg-[#1a365d] text-white transition-all duration-300 ease-in-out overflow-hidden",
        isCollapsed ? collapsedWidth : expandedWidth,
        className
      )}
    >
      {/* Main content */}
      <div
        className={cn(
          "h-full transition-opacity duration-200",
          isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        {children}
      </div>

      {/* Collapse button (visible when expanded) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={cn(
          "absolute top-4 -translate-y-1/2",
          "h-8 w-8 rounded-full p-0",
          "bg-background/80 border border-border shadow-md",
          "hover:bg-background hover:text-foreground",
          "transition-all duration-200",
          "flex items-center justify-center",
          "z-20",
          side === "left" ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2",
          isCollapsed ? "opacity-0" : "opacity-100"
        )}
        aria-label={isCollapsed ? "Expand" : "Collapse"}
      >
        <Icon className="h-4 w-4" />
      </Button>

      {/* Floating expand button (visible when collapsed) */}
      {isCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            `fixed ${side === "left" ? "left-4" : "right-4"} bottom-6`,
            "h-12 w-12 rounded-full p-0",
            "bg-blue-600 text-white shadow-lg hover:bg-blue-700",
            "transition-all duration-200",
            "flex items-center justify-center",
            "z-50",
            "animate-in fade-in-20 zoom-in-90",
            floatingButtonClass,
            {
              "opacity-0": !isMounted,
              "opacity-100": isMounted,
            }
          )}
          aria-label="Expand sidebar"
        >
          <Icon className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}

export default CollapsibleSidebar;

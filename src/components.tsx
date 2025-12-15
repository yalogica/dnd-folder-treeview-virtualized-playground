import React from "react"
import { useTreeStore } from "@/use-tree-store"
import { cn } from "@/utils"

export const DropIndicator = ({ className }: { className?: string }) => (
  <div className={cn("absolute left-0 right-0 h-0.5 bg-blue-500 z-50 pointer-events-none", className)}>
    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 border border-background shadow-sm" />
  </div>
);

export const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-primary text-primary-foreground shadow", className)}>
    {children}
  </span>
);

export const StateVisualizer = () => {
  const { selectedIds, expandedIds, draggedIds, searchQuery, viewMode } = useTreeStore();
  
  return (
    <pre className="text-xs font-mono bg-zinc-100 dark:bg-zinc-950 p-4 rounded-md overflow-auto border border-zinc-200 dark:border-zinc-800">
      {JSON.stringify({
        search: searchQuery,
        mode: viewMode,
        selected: Array.from(selectedIds),
        dragging: draggedIds.length > 0 ? draggedIds : 'None'
      }, null, 2)}
    </pre>
  );
};
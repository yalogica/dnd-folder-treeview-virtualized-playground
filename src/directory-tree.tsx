import React, { useState, useMemo, useRef, useEffect } from "react"
import { Folder, FolderOpen, ChevronDown, ChevronRight, Check, GripVertical, X, Search, ListTree, ListIcon } from "lucide-react"
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
  DragMoveEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  defaultDropAnimationSideEffects,
  DropAnimation,
  MeasuringStrategy,
  Active,
  Over
} from "@dnd-kit/core"
import { ITEM_HEIGHT, CONTAINER_HEIGHT, DirectoryNode } from "@/types"
import { cn, createSearchRegex, filterTreeData, getFlatList, flattenTree, findNodeDeep } from "@/utils"
import { DropIndicator, Badge } from "@/components"
import { useTreeStore } from "@/use-tree-store"


interface TreeNodeProps {
  node: DirectoryNode;
  isSelected: boolean;
  isGhost?: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  flattenedNodes: DirectoryNode[];
  activeDragId: string | null;
  dragOverInfo: { id: string, position: "before" | "after" | "inside" } | null;
  isDraggable: boolean;
  hideExpander?: boolean;
  style?: React.CSSProperties; // Added style prop for virtualization
}

const TreeNode = ({
  node,
  isSelected,
  isGhost,
  onToggle,
  onClick,
  activeDragId,
  dragOverInfo,
  isDraggable,
  hideExpander,
  style
}: TreeNodeProps) => {
  const { toggleExpand, expandedIds, renameNode } = useTreeStore();
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children && node.children.length > 0;

  // --- Renaming State ---
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditName(node.name);
  };

  const commitRename = () => {
    if (editName.trim().length > 0 && editName !== node.name) {
      renameNode(node.id, editName.trim());
    } else {
      setEditName(node.name);
    }
    setIsEditing(false);
  };

  const cancelRename = () => {
    setIsEditing(false);
    setEditName(node.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      commitRename();
    } else if (e.key === "Escape") {
      cancelRename();
    }
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: node.id,
    data: { type: node.type, node },
    disabled: isEditing || !isDraggable
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: node.id,
    data: { node },
    disabled: !isDraggable
  });

  const isTarget = dragOverInfo?.id === node.id;
  const dropPosition = isTarget ? dragOverInfo?.position : null;

  const Icon = isExpanded ? FolderOpen : Folder;

  if (isGhost) {
    return (
      <div className="flex items-center gap-2 p-2 bg-background border border-border rounded-md shadow-xl opacity-90 w-64 z-50">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium truncate">{node.name}</span>
      </div>
    );
  }

  return (
    <div
      className="relative isolate box-border"
      id={`node-${node.id}`}
      // Merge styles for virtualization (height/transform)
      style={{
        height: `${ITEM_HEIGHT}px`,
        ...style
      }}
    >
      {dropPosition === "before" && (
        <DropIndicator className="top-0" />
      )}

      <div
        ref={(node) => { setNodeRef(node); setDroppableRef(node); }}
        style={{
          paddingLeft: `${(node.depth || 0) * 1.5 + 0.5}rem`,
          opacity: isDragging ? 0.5 : 1,
          height: "100%" // Ensure inner div takes full height
        }}
        className={cn(
          "group flex items-center gap-1 pr-2 text-sm select-none outline-none transition-colors duration-100 relative box-border",
          isDraggable ? "cursor-pointer" : "cursor-default",
          isSelected && !isEditing ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-foreground",
          dropPosition === "inside" && "bg-blue-500/50 rounded-md",
          activeDragId === node.id && "pointer-events-none opacity-50",
          isEditing && "cursor-default bg-transparent"
        )}
        onClick={!isEditing ? onClick : undefined}
        onDoubleClick={handleDoubleClick}
        {...attributes}
        {...listeners}
      >
        {/* Expander */}
        <div
          className={cn(
            "p-0.5 rounded-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center h-6 w-6",
            (!hasChildren || isEditing || hideExpander) && "invisible pointer-events-none"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(e);
          }}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
        </div>

        <Icon
          className={cn(
            "w-4 h-4 shrink-0",
            "text-blue-500 fill-blue-500/20",
            isEditing && "text-muted-foreground"
          )}
        />

        {/* Name or Input */}
        <div className="flex-1 min-w-0 ml-1 flex items-center h-full">
          {isEditing ? (
            <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
              <input
                ref={inputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={handleKeyDown}
                className="h-6 w-full rounded-sm border bg-background px-2 text-xs outline-none transition-all"
                onPointerDown={(e) => e.stopPropagation()}
              />
              <div className="flex items-center gap-0.5" onPointerDown={(e) => e.stopPropagation()}>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={commitRename}
                  className="h-6 w-6 flex items-center justify-center rounded-sm bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
                  title="Save (Enter)"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={cancelRename}
                  className="h-6 w-6 flex items-center justify-center rounded-sm bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                  title="Cancel (Esc)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <span className="truncate block leading-tight">{node.name}</span>
          )}
        </div>

        {!isEditing && isDraggable && (
          <GripVertical className="w-3 h-3 text-zinc-300 opacity-0 group-hover:opacity-100" />
        )}
      </div>

      {dropPosition === "after" && (
        <DropIndicator className="bottom-0" />
      )}
    </div>
  );
};

const DragPreview = ({ count, firstId, nodes }: { count: number, firstId: string, nodes: DirectoryNode[] }) => {
  const node = findNodeDeep(nodes, firstId);
  if (!node) return null;

  return (
    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-background shadow-md cursor-grabbing z-[100]">
      <span className="bg-primary text-primary-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
        {count}
      </span>
      <div className="flex items-center gap-2">
        <Folder className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-medium">{node.name}</span>
        {count > 1 && <span className="text-xs text-muted-foreground ml-1">(+{count - 1} others)</span>}
      </div>
    </div>
  );
};

export const DirectoryTree = () => {
  const store = useTreeStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const flattenedNodes = useMemo(() => {
    const hasSearch = !!store.searchQuery.trim();
    const regex = hasSearch ? createSearchRegex(store.searchQuery) : null;

    if (store.viewMode === 'flat') {
      return getFlatList(store.data, regex);
    } else {
      if (hasSearch && regex) {
        const { nodes: filtered, keptIds } = filterTreeData(store.data, regex);
        const searchExpandedIds = new Set([...store.expandedIds, ...keptIds]);
        return flattenTree(filtered, searchExpandedIds);
      } else {
        return flattenTree(store.data, store.expandedIds);
      }
    }
  }, [store.data, store.expandedIds, store.searchQuery, store.viewMode]);

  const visibleIds = useMemo(() => flattenedNodes.map(n => n.id), [flattenedNodes]);

  // --- Virtualization Logic ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Handle scroll event
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Calculate virtual slice
  const totalCount = flattenedNodes.length;
  const totalHeight = totalCount * ITEM_HEIGHT;

  // Buffer items (prevent flickering)
  const overscan = 10;

  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - overscan);
  const endIndex = Math.min(totalCount, Math.ceil((scrollTop + CONTAINER_HEIGHT) / ITEM_HEIGHT) + overscan);

  const virtualNodes = flattenedNodes.slice(startIndex, endIndex);

  // --- DND Logic ---
  const isDragDisabled = store.viewMode === "flat";
  const [dragOverInfo, setDragOverInfo] = useState<{ id: string, position: "before" | "after" | "inside" } | null>(null);

  const { setNodeRef: setRootNodeRef, isOver: isOverRoot } = useDroppable({
    id: "ROOT",
    disabled: isDragDisabled
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;

    if (!store.selectedIds.has(activeId)) {
      store.selectNode(activeId, false, false);
      store.setDraggedIds([activeId]);
    } else {
      store.setDraggedIds(Array.from(store.selectedIds));
    }
  };

  const handleDragMove = (event: DragMoveEvent) => {
    if (isDragDisabled) return;

    const { over, active } = event;

    if (!over) {
      setDragOverInfo(null);
      return;
    }

    if (over.id === "ROOT") {
      if (flattenedNodes.length > 0) {
        const lastNode = flattenedNodes[flattenedNodes.length - 1];
        setDragOverInfo({ id: lastNode.id, position: "after" });
      } else {
        setDragOverInfo({ id: "ROOT", position: "inside" });
      }
      return;
    }

    // Try to find the element in DOM
    // Note: With virtualization, document.getElementById will FAIL if element is scrolled out.
    // However, dnd-kit collision detection works on *rendered* elements.
    // If you drag over something, it MUST be rendered, so getElementById should work.
    const overId = over.id as string;
    const overElement = document.getElementById(`node-${overId}`);

    if (overElement && active.rect.current.translated) {
      const rect = overElement.getBoundingClientRect();
      const pointerY = active.rect.current.translated.top + (active.rect.current.translated.height / 2);

      const relativeY = pointerY - rect.top;
      const height = rect.height;

      if (relativeY < height * 0.25) {
        setDragOverInfo({ id: overId, position: "before" });
      } else if (relativeY > height * 0.75) {
        setDragOverInfo({ id: overId, position: "after" });
      } else {
        setDragOverInfo({ id: overId, position: "inside" });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    store.setDraggedIds([]);
    setDragOverInfo(null);

    if (isDragDisabled) return;

    const { active, over } = event;
    if (!over) return;

    const sourceIds = store.selectedIds.has(active.id as string)
      ? Array.from(store.selectedIds)
      : [active.id as string];

    if (sourceIds.includes(over.id as string)) return;

    let targetId = over.id as string;
    let position: "before" | "after" | "inside" = "inside";

    if (targetId === "ROOT") {
      store.moveNodes(sourceIds, "ROOT", "inside");
      return;
    }

    const overElement = document.getElementById(`node-${targetId}`);
    if (overElement && active.rect.current.translated) {
      const rect = overElement.getBoundingClientRect();
      const pointerY = active.rect.current.translated.top + (active.rect.current.translated.height / 2);
      const relativeY = pointerY - rect.top;
      const height = rect.height;

      if (relativeY < height * 0.25) position = "before";
      else if (relativeY > height * 0.75) position = "after";
      else position = "inside";
    }

    store.moveNodes(sourceIds, targetId, position);
  };

  const handleClick = (e: React.MouseEvent, id: string) => {
    if (e.metaKey || e.ctrlKey) {
      store.selectNode(id, true, false);
    } else if (e.shiftKey) {
      store.selectNode(id, true, true, visibleIds);
    } else {
      store.selectNode(id, false, false);
    }
  };

  const dropAnimationConfig: DropAnimation = {
    keyframes: ({ transform }) => [
      { opacity: 1, transform: `translate3d(${transform.initial.x}px, ${transform.initial.y}px, 0)` },
      { opacity: 0, transform: `translate3d(${transform.initial.x}px, ${transform.initial.y}px, 0)` },
    ],
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0",
        },
      },
    }),
    duration: 250,
    easing: "ease-out",
  };

  return (
    <div className="w-full border border-border rounded-lg bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col" style={{ height: CONTAINER_HEIGHT + 50 }}>
      {/* Header with Search */}
      <div className="p-4 border-b border-border bg-muted/40 flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Directory Browser</h2>
          {
            store.selectedIds.size > 0 && (<Badge className="ml-auto">{store.selectedIds.size} Selected</Badge>)
          }
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="w-full h-8 pl-8 pr-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring transition-shadow"
              placeholder="Search (e.g., *utils)"
              value={store.searchQuery}
              onChange={(e) => store.setSearchQuery(e.target.value)}
            />
            {
              store.searchQuery &&
              (
                <button
                  onClick={() => store.setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )
            }
          </div>
          <div className="flex bg-background border border-input rounded-md overflow-hidden shrink-0">
            <button
              onClick={() => store.setViewMode("tree")}
              className={cn("p-1.5 hover:bg-accent transition-colors", store.viewMode === "tree" ? "bg-accent text-accent-foreground" : "text-muted-foreground")}
              title="Tree view"
            >
              <ListTree className="w-4 h-4" />
            </button>
            <button
              onClick={() => store.setViewMode('flat')}
              className={cn("p-1.5 hover:bg-accent transition-colors", store.viewMode === 'flat' ? "bg-accent text-accent-foreground" : "text-muted-foreground")}
              title="Flat view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={setRootNodeRef}
        className={cn("flex-1 overflow-hidden relative", isOverRoot && !isDragDisabled && "bg-muted/10")}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto p-2 bg-background relative"
          >
            {/* Virtualization Spacer */}
            <div
              style={{ height: totalHeight + 40, position: "relative" }} // +40 for buffer/bottom padding
              className="w-full"
            >
              {/* Rendered Slice */}
              <div
                style={{
                  transform: `translateY(${startIndex * ITEM_HEIGHT}px)`,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0
                }}
              >
                {virtualNodes.map((node) => (
                  <TreeNode
                    key={node.id}
                    node={node}
                    flattenedNodes={flattenedNodes}
                    isSelected={store.selectedIds.has(node.id)}
                    activeDragId={store.draggedIds.length > 0 ? store.draggedIds[0] : null}
                    dragOverInfo={dragOverInfo}
                    onToggle={(e) => store.toggleExpand(node.id)}
                    onClick={(e) => handleClick(e, node.id)}
                    isDraggable={!isDragDisabled}
                    hideExpander={store.viewMode === "flat"}
                  />
                ))}

                {flattenedNodes.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {store.searchQuery ? "Nothing found" : "No folders"}
                  </div>
                )}

                {flattenedNodes.length > 0 && flattenedNodes.length === 0 && dragOverInfo?.id === "ROOT" && (
                  <div className="relative mt-2">
                    <DropIndicator />
                    <span className="text-xs text-muted-foreground ml-4">Drop here to add to root</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DragOverlay dropAnimation={dropAnimationConfig}>
            {store.draggedIds.length > 0 ? (
              <DragPreview
                count={store.draggedIds.length}
                firstId={store.draggedIds[0]}
                nodes={store.data}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <div className="p-2 border-t border-border bg-muted/20 text-xs text-muted-foreground shrink-0">
        <div className="flex flex-col gap-1">
          {isDragDisabled ? (
            <p className="text-amber-600 dark:text-amber-500 font-medium flex items-center gap-1">
              Drag and drop is disabled in flat mode
            </p>
          ) : (
            <>
              <p>• <strong>Double Click</strong> to rename folder</p>
              <p>• <strong>Virtualization Active</strong> ({totalCount} items)</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
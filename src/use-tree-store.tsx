import { create } from "zustand"
import { DirectoryNode, ViewMode } from "@/types"
import { findNodeDeep, removeNodes, insertNodes, updateNodeNameRecursive } from "@/utils"
import { INITIAL_DATA } from "@/data"

interface TreeState {
  data: DirectoryNode[];
  expandedIds: Set<string>;
  selectedIds: Set<string>;
  selectionAnchor: string | null; 
  draggedIds: string[];
  
  // Search State
  searchQuery: string;
  viewMode: ViewMode;

  // Actions
  toggleExpand: (id: string) => void;
  selectNode: (id: string, multi: boolean, range: boolean, visibleOrder?: string[]) => void;
  moveNodes: (sourceIds: string[], targetId: string, position: "before" | "after" | "inside") => void;
  renameNode: (id: string, newName: string) => void;
  
  setData: (data: DirectoryNode[]) => void;
  setDraggedIds: (ids: string[]) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: ViewMode) => void;
}

export const useTreeStore = create<TreeState>((set, get) => {
  return {
    data: INITIAL_DATA,
    expandedIds: new Set(["root-src", "components"]), 
    selectedIds: new Set(),
    selectionAnchor: null,
    draggedIds: [],

    searchQuery: "",
    viewMode: "tree",

    toggleExpand: (id) => set((state) => {
      const newExpanded = new Set(state.expandedIds);
      if (newExpanded.has(id)) newExpanded.delete(id);
      else newExpanded.add(id);
      return { expandedIds: newExpanded };
    }),
    selectNode: (id, multi, range, visibleOrder) => set((state) => {
      const newSelected = new Set(multi ? state.selectedIds : []);
      let newAnchor = state.selectionAnchor;

      if (range && visibleOrder && state.selectionAnchor) {
        const anchorIndex = visibleOrder.indexOf(state.selectionAnchor);
        const currentIndex = visibleOrder.indexOf(id);
        
        if (anchorIndex !== -1 && currentIndex !== -1) {
          const start = Math.min(anchorIndex, currentIndex);
          const end = Math.max(anchorIndex, currentIndex);
          const rangeIds = visibleOrder.slice(start, end + 1);
          
          newSelected.clear();
          rangeIds.forEach(rid => newSelected.add(rid));
        }
      } else {
        if (multi) {
          if (newSelected.has(id)) newSelected.delete(id);
          else newSelected.add(id);
          newAnchor = id;
        } else {
          newSelected.clear();
          newSelected.add(id);
          newAnchor = id;
        }
      }

      return { selectedIds: newSelected, selectionAnchor: newAnchor };
    }),
    moveNodes: (sourceIds, targetId, position) => set((state) => {
      const sources: DirectoryNode[] = [];
      sourceIds.forEach(id => {
        const node = findNodeDeep(state.data, id);
        if(node) sources.push(node);
      });

      const cleanData = removeNodes(state.data, new Set(sourceIds));
      const finalData = insertNodes(cleanData, targetId, sources, position);

      const newExpanded = new Set(state.expandedIds);
      if (position === 'inside') {
        newExpanded.add(targetId);
      }

      return { data: finalData, expandedIds: newExpanded };
    }),
    renameNode: (id, newName) => set((state) => ({
      data: updateNodeNameRecursive(state.data, id, newName)
    })),
    
    setData: (data) => set({ data }),
    setDraggedIds: (ids) => set({ draggedIds: ids }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setViewMode: (mode) => set({ viewMode: mode }),    
  }
});
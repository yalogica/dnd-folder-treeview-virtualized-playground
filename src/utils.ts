import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DirectoryNode } from "@/types"

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const createSearchRegex = (query: string) => {
  try {
    const escaped = query.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const pattern = escaped.replace(/\*/g, '.*');
    return new RegExp(pattern, 'i');
  } catch (e) {
    return new RegExp(query, 'i'); // fallback
  }
};

export const flattenTree = (
  nodes: DirectoryNode[], 
  expandedIds: Set<string>, 
  depth = 0, 
  parentId: string | null = null
): DirectoryNode[] => {
  let flat: DirectoryNode[] = [];
  
  for (const node of nodes) {
    flat.push({ ...node, depth, parentId });
    if (expandedIds.has(node.id) && node.children) {
      flat = flat.concat(flattenTree(node.children, expandedIds, depth + 1, node.id));
    }
  }
  return flat;
};

export const filterTreeData = (nodes: DirectoryNode[], regex: RegExp): { nodes: DirectoryNode[], keptIds: Set<string> } => {
  const keptIds = new Set<string>();
  
  const recursiveFilter = (nodes: DirectoryNode[]): DirectoryNode[] => {
    const result: DirectoryNode[] = [];
    
    for (const node of nodes) {
      const children = node.children ? recursiveFilter(node.children) : [];
      const isMatch = regex.test(node.name);
      
      if (isMatch || children.length > 0) {
        result.push({ ...node, children });
        if (children.length > 0) {
            keptIds.add(node.id);
        }
      }
    }
    return result;
  };

  const filtered = recursiveFilter(nodes);
  return { nodes: filtered, keptIds };
};

export const getFlatList = (nodes: DirectoryNode[], regex: RegExp | null): DirectoryNode[] => {
  let result: DirectoryNode[] = [];
  
  for (const node of nodes) {
    if (!regex || regex.test(node.name)) {
      result.push({ ...node, depth: 0, children: [] });
    }
    if (node.children) {
      result = result.concat(getFlatList(node.children, regex));
    }
  }
  return result;
};

export const findNodeDeep = (nodes: DirectoryNode[], id: string): DirectoryNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeDeep(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const updateNodeNameRecursive = (nodes: DirectoryNode[], id: string, newName: string): DirectoryNode[] => {
  return nodes.map(node => {
    if (node.id === id) {
      return { ...node, name: newName };
    }
    if (node.children) {
      return { ...node, children: updateNodeNameRecursive(node.children, id, newName) };
    }
    return node;
  });
};

export const removeNodes = (nodes: DirectoryNode[], idsToRemove: Set<string>): DirectoryNode[] => {
  return nodes
    .filter(node => !idsToRemove.has(node.id))
    .map(node => ({
      ...node,
      children: node.children ? removeNodes(node.children, idsToRemove) : undefined
    }));
};

export const insertNodes = (
  nodes: DirectoryNode[], 
  targetId: string, 
  nodesToInsert: DirectoryNode[], 
  position: 'before' | 'after' | 'inside'
): DirectoryNode[] => {
  if (targetId === 'ROOT') {
    return [...nodes, ...nodesToInsert];
  }

  let newNodes: DirectoryNode[] = [];

  for (const node of nodes) {
    if (node.id === targetId) {
      if (position === 'before') {
        newNodes.push(...nodesToInsert, node);
      } else if (position === 'after') {
        newNodes.push(node, ...nodesToInsert);
      } else if (position === 'inside') {
        newNodes.push({
          ...node,
          children: [...(node.children || []), ...nodesToInsert],
        });
      }
    } else {
      newNodes.push({
        ...node,
        children: node.children ? insertNodes(node.children, targetId, nodesToInsert, position) : node.children
      });
    }
  }
  return newNodes;
};
export const ITEM_HEIGHT = 32;

export type ViewMode = "tree" | "flat";

export type NodeType = "folder";

export interface DirectoryNode {
  id: string;
  name: string;
  type: NodeType;
  children?: DirectoryNode[];
  // Flattened properties
  depth?: number;
  parentId?: string | null;
}
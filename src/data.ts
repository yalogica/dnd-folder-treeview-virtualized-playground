import { DirectoryNode } from "@/types"

const createLargeDataset = (count: number, parentId: string): DirectoryNode[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${parentId}-${i}`,
    name: `Test Folder ${i + 1}`,
    type: "folder",
    children: []
  }));
};

export const INITIAL_DATA: DirectoryNode[] = [
  {
    id: 'root-src',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: 'components',
        name: 'components',
        type: 'folder',
        children: [
          { id: 'ui-folder', name: 'ui', type: 'folder', children: [] },
          { id: 'layouts', name: 'layouts', type: 'folder', children: [] },
          { id: 'widgets', name: 'widgets', type: 'folder', children: [] },
        ]
      },
      { id: 'hooks', name: 'hooks', type: 'folder', children: [] },
      { id: 'utils', name: 'utils', type: 'folder', children: [] },
      { id: 'services', name: 'services', type: 'folder', children: [] }
    ]
  },
  {
    id: 'public-folder',
    name: 'public',
    type: 'folder',
    children: [
      { id: 'assets', name: 'assets', type: 'folder', children: [] },
      { id: 'images', name: 'images', type: 'folder', children: [] },
    ]
  },
  { id: 'config', name: 'config', type: 'folder', children: [] },
  { id: 'scripts', name: 'scripts', type: 'folder', children: [] },
  { id: 'docs', name: 'docs', type: 'folder', children: [] },
  {
    id: 'load-test',
    name: 'Load Test (1000 items)',
    type: 'folder',
    children: createLargeDataset(1000, 'load-test')
  }
];
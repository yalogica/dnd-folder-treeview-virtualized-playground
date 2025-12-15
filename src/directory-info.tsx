import { ITEM_HEIGHT } from "@/types"
import { useTreeStore } from "@/use-tree-store";

export const DirectoryInfo = () => {
  const { selectedIds, expandedIds, draggedIds, searchQuery, viewMode } = useTreeStore();

  return (
    <div className="p-4 flex flex-col gap-4 border rounded shadow-sm">
      <h3 className="font-semibold uppercase">System State</h3>
      <pre className="text-xs font-mono bg-zinc-100 dark:bg-zinc-950 p-4 rounded-md overflow-auto border border-zinc-200 dark:border-zinc-800">
        {
          JSON.stringify({
            search: searchQuery,
            mode: viewMode,
            selected: Array.from(selectedIds),
            dragging: draggedIds.length > 0 ? draggedIds : 'None'
          }, null, 2)
        }
      </pre>
      <div>
        <h4 className="font-semibold">Performance Features:</h4>
        <ul className="pl-4 text-sm list-disc">
          <li><strong>Virtual Scrolling:</strong> Only visible items are rendered.</li>
          <li><strong>Load Test:</strong> Added a folder with 1000 items to demonstrate speed.</li>
          <li><strong>Fixed Height:</strong> Rows are locked to {ITEM_HEIGHT}px for math.</li>
        </ul>
      </div>
    </div>
  )
}
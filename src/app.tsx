import { ITEM_HEIGHT } from "@/types"
import { StateVisualizer } from "@/components"
import { ThemeToggle } from "@/theme-toggle"
import { DirectoryTree } from "@/directory-tree"

export const App = () => {
    return (
      <div className="h-full flex items-center justify-center p-8 font-sans bg-background text-foreground rounded">
        <ThemeToggle />

        <div className="grid gap-8 w-full grid-cols-2">
          <div className="flex flex-col gap-4">
            <DirectoryTree />
          </div>

          <div className="p-4 flex flex-col gap-4 border rounded shadow-sm">
            <h3 className="font-semibold uppercase">System State</h3>
            <StateVisualizer />
            <div>
              <h4 className="font-semibold">Performance Features:</h4>
              <ul className="pl-4 text-sm list-disc">
                <li><strong>Virtual Scrolling:</strong> Only visible items are rendered.</li>
                <li><strong>Load Test:</strong> Added a folder with 1000 items to demonstrate speed.</li>
                <li><strong>Fixed Height:</strong> Rows are locked to {ITEM_HEIGHT}px for math.</li>
              </ul>
            </div>
          </div>
      </div>
      </div>
    
  );
}
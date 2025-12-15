import { ThemeToggle } from "@/theme-toggle"
import { DirectoryTree } from "@/directory-tree"
import { DirectoryInfo } from "@/directory-info"

export const App = () => {
    return (
      <div className="h-full flex items-center justify-center p-8 font-sans bg-background text-foreground rounded">
        <div className="w-full h-full grid grid-cols-2 gap-8">
            <DirectoryTree />
            <DirectoryInfo />
        </div>
        <ThemeToggle />
      </div>
  );
}
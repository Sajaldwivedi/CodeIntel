import { Moon, Search, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/MobileNav";
import { useAppStore } from "@/store/appStore";

/** Top navigation bar: centered command-palette search and theme toggle. */
export function Topbar() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const setCommandOpen = useAppStore((s) => s.setCommandOpen);

  return (
    <header className="sticky top-0 z-20 grid h-16 grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-white/10 bg-background/70 px-3 backdrop-blur-xl md:grid-cols-[1fr_minmax(0,28rem)_1fr] md:gap-3 md:px-6">
      <MobileNav />

      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        aria-label="Open command palette"
        aria-keyshortcuts="Control+K Meta+K"
        className="group flex h-9 w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-muted-foreground transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <span className="flex-1 truncate text-left">Search or jump to…</span>
        <kbd className="hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium tracking-widest sm:inline">
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center justify-end">
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun aria-hidden /> : <Moon aria-hidden />}
        </Button>
      </div>
    </header>
  );
}

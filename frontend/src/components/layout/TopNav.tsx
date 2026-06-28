import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Search, Command, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import { mockRepositories } from '@/data/mock';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/upload': 'Upload Repository',
  '/repository': 'Repository Overview',
  '/architecture': 'Architecture',
  '/graph': 'Dependency Graph',
  '/chat': 'Repository Chat',
  '/settings': 'Settings',
};

export function TopNav() {
  const location = useLocation();
  const selectedRepoId = useAppStore((s) => s.selectedRepoId);
  const selectedRepo = mockRepositories.find((r) => r.id === selectedRepoId);

  const title =
    pageTitles[location.pathname] ??
    Object.entries(pageTitles).find(([path]) => location.pathname.startsWith(path))?.[1] ??
    'CodeMind';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-white/[0.06] bg-surface/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4 min-w-0">
        <motion.h2
          key={title}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="truncate text-lg font-semibold text-ink"
        >
          {title}
        </motion.h2>
        {selectedRepo && location.pathname !== '/dashboard' && location.pathname !== '/upload' && (
          <span className="hidden items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1 text-xs text-ink-muted sm:flex">
            <span className="font-mono text-accent-cyan">{selectedRepo.owner}</span>
            <span>/</span>
            <span className="font-mono">{selectedRepo.name}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-ink-muted transition-all hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-ink-secondary md:flex">
          <Search className="h-4 w-4" />
          <span>Search...</span>
          <kbd className="ml-4 flex items-center gap-0.5 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-ink-muted hover:text-ink-secondary transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent-violet" />
        </motion.button>

        <Link to="/upload">
          <Button size="sm" variant="primary">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Repo</span>
          </Button>
        </Link>

        <div className="ml-1 h-8 w-8 rounded-full bg-gradient-to-br from-accent-violet to-accent-cyan p-[1px]">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-raised text-xs font-semibold text-ink">
            S
          </div>
        </div>
      </div>
    </header>
  );
}

import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Upload,
  FolderGit2,
  Network,
  GitBranch,
  MessageSquare,
  Settings,
  ChevronLeft,
  Sparkles,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { mockRepositories } from '@/data/mock';
import { StatusBadge } from '@/components/ui/Badge';

const mainNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload', icon: Upload, label: 'Upload Repository' },
];

const repoNav = [
  { to: '/repository', icon: FolderGit2, label: 'Overview' },
  { to: '/architecture', icon: Layers, label: 'Architecture' },
  { to: '/graph', icon: GitBranch, label: 'Dependency Graph' },
  { to: '/chat', icon: MessageSquare, label: 'Repository Chat' },
];

const bottomNav = [{ to: '/settings', icon: Settings, label: 'Settings' }];

function NavItem({
  to,
  icon: Icon,
  label,
  collapsed,
}: {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  collapsed: boolean;
}) {
  return (
    <NavLink to={to} end={to === '/dashboard'}>
      {({ isActive }) => (
        <motion.div
          whileHover={{ x: collapsed ? 0 : 2 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
            isActive
              ? 'bg-white/[0.08] text-ink shadow-sm'
              : 'text-ink-muted hover:bg-white/[0.04] hover:text-ink-secondary',
            collapsed && 'justify-center px-2',
          )}
        >
          {isActive && (
            <motion.div
              layoutId="sidebar-active"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-violet/10 to-accent-blue/5 ring-1 ring-white/[0.08]"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <Icon
            className={cn(
              'relative h-[18px] w-[18px] shrink-0 transition-colors',
              isActive ? 'text-accent-violet' : 'text-ink-muted group-hover:text-ink-secondary',
            )}
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="relative truncate"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const selectedRepoId = useAppStore((s) => s.selectedRepoId);
  const selectedRepo = mockRepositories.find((r) => r.id === selectedRepoId);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative z-30 flex h-full shrink-0 flex-col border-r border-white/[0.06] bg-surface-raised/60 backdrop-blur-2xl"
    >
      <div className={cn('flex h-16 items-center gap-3 border-b border-white/[0.06] px-4', collapsed && 'justify-center px-2')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-violet to-accent-blue shadow-glow-sm">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="min-w-0"
            >
              <p className="truncate text-sm font-semibold text-ink">CodeMind</p>
              <p className="truncate text-[11px] text-ink-muted">AI Software Engineer</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-6">
        <div className="space-y-1">
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
              General
            </p>
          )}
          {mainNav.map((item) => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
              Repository
            </p>
          )}
          {selectedRepo && !collapsed && (
            <div className="mb-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05]">
                  <Network className="h-4 w-4 text-accent-cyan" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ink">
                    {selectedRepo.owner}/{selectedRepo.name}
                  </p>
                  <StatusBadge status={selectedRepo.status} />
                </div>
              </div>
            </div>
          )}
          {repoNav.map((item) => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      <div className="border-t border-white/[0.06] p-3 space-y-1">
        {bottomNav.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-muted',
            'hover:bg-white/[0.04] hover:text-ink-secondary transition-colors',
            collapsed && 'justify-center',
          )}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft className="h-[18px] w-[18px]" />
          </motion.div>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}

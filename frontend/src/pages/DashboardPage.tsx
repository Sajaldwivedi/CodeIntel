import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderGit2,
  MessageSquare,
  GitBranch,
  Layers,
  ArrowUpRight,
  Activity,
  Database,
  Cpu,
} from 'lucide-react';
import { PageHeader, staggerContainer, staggerItem } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { mockRepositories, mockActivity } from '@/data/mock';
import { formatRelativeTime, cn } from '@/lib/utils';

const activityIcons = {
  index: Database,
  chat: MessageSquare,
  analysis: Layers,
  graph: GitBranch,
};

const activityColors = {
  index: 'text-accent-blue',
  chat: 'text-accent-violet',
  analysis: 'text-accent-emerald',
  graph: 'text-accent-cyan',
};

export function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Monitor indexed repositories, recent activity, and system health."
        action={
          <Link to="/upload">
            <Button variant="primary" size="md">
              <FolderGit2 className="h-4 w-4" />
              New Repository
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <GlassCard key={i} padding="md" hover={false}>
              <div className="space-y-3 animate-pulse">
                <div className="h-3 w-20 rounded bg-white/5" />
                <div className="h-8 w-16 rounded bg-white/5" />
              </div>
            </GlassCard>
          ))
        ) : (
          <>
            <StatCard label="Repositories" value={mockRepositories.length} change="+1 this week" changeType="positive" icon={FolderGit2} delay={0} />
            <StatCard label="Total Symbols" value="15.1K" change="+2.4K indexed" changeType="positive" icon={Cpu} iconColor="text-accent-blue" delay={0.05} />
            <StatCard label="Graph Nodes" value="8.2K" change="Neo4j active" changeType="neutral" icon={GitBranch} iconColor="text-accent-cyan" delay={0.1} />
            <StatCard label="Queries Today" value={47} change="+12% vs yesterday" changeType="positive" icon={Activity} iconColor="text-accent-emerald" delay={0.15} />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <GlassCard className="lg:col-span-3" padding="none">
          <div className="border-b border-white/[0.06] px-6 py-4">
            <h3 className="font-semibold text-ink">Repositories</h3>
            <p className="text-sm text-ink-muted">Your indexed codebases</p>
          </div>
          <div className="divide-y divide-white/[0.04] px-6">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <TableRowSkeleton key={i} />)
              : mockRepositories.map((repo, i) => (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="group flex items-center gap-4 py-4"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] ring-1 ring-white/[0.08]">
                      <FolderGit2 className="h-5 w-5 text-ink-muted group-hover:text-accent-violet transition-colors" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-ink">
                          <span className="text-ink-muted">{repo.owner}/</span>
                          {repo.name}
                        </p>
                        <StatusBadge status={repo.status} />
                      </div>
                      <p className="truncate text-sm text-ink-muted">
                        {repo.fileCount} files · {repo.symbolCount.toLocaleString()} symbols ·{' '}
                        {repo.language}
                      </p>
                    </div>
                    <Link
                      to="/repository"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Button variant="ghost" size="sm">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </motion.div>
                ))}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2" padding="none">
          <div className="border-b border-white/[0.06] px-6 py-4">
            <h3 className="font-semibold text-ink">Recent Activity</h3>
            <p className="text-sm text-ink-muted">Latest events across repos</p>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-1 p-4"
          >
            {mockActivity.map((item) => {
              const Icon = activityIcons[item.type];
              return (
                <motion.div
                  key={item.id}
                  variants={staggerItem}
                  className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-white/[0.03]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
                    <Icon className={cn('h-4 w-4', activityColors[item.type])} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-ink">{item.title}</p>
                    <p className="text-xs text-ink-muted">
                      {item.repo} · {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </GlassCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { to: '/architecture', icon: Layers, label: 'Architecture', desc: 'Module structure & patterns', color: 'from-accent-violet/20 to-accent-violet/5' },
          { to: '/graph', icon: GitBranch, label: 'Dependency Graph', desc: 'Visualize code relationships', color: 'from-accent-cyan/20 to-accent-cyan/5' },
          { to: '/chat', icon: MessageSquare, label: 'Ask AI', desc: 'Chat about your codebase', color: 'from-accent-blue/20 to-accent-blue/5' },
        ].map((action, i) => (
          <Link key={action.to} to={action.to}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              whileHover={{ y: -3, scale: 1.01 }}
              className={cn(
                'group rounded-2xl border border-white/[0.06] bg-gradient-to-br p-6 transition-all',
                'hover:border-white/[0.12] hover:shadow-glow-sm',
                action.color,
              )}
            >
              <action.icon className="mb-4 h-6 w-6 text-ink-secondary group-hover:text-ink transition-colors" />
              <p className="font-semibold text-ink">{action.label}</p>
              <p className="mt-1 text-sm text-ink-muted">{action.desc}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

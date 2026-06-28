import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  RefreshCw,
  Trash2,
  FileCode,
  GitBranch,
  Clock,
  MessageSquare,
  Layers,
  Network,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBorder } from '@/components/ui/GradientBorder';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { useAppStore } from '@/store/useAppStore';
import { mockRepositories } from '@/data/mock';
import { formatRelativeTime } from '@/lib/utils';

export function RepositoryOverviewPage() {
  const selectedRepoId = useAppStore((s) => s.selectedRepoId);
  const repo = mockRepositories.find((r) => r.id === selectedRepoId) ?? mockRepositories[0];

  const languageEntries = Object.entries(repo.languages).sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Repository Overview"
        description={repo.description}
        badge={<StatusBadge status={repo.status} />}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <RefreshCw className="h-4 w-4" />
              Reindex
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4 text-accent-rose" />
            </Button>
          </div>
        }
      />

      <GradientBorder variant="subtle">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] ring-1 ring-white/[0.1]">
              <Network className="h-7 w-7 text-accent-cyan" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-ink">
                  <span className="text-ink-muted">{repo.owner}/</span>
                  {repo.name}
                </h2>
                <a href={repo.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 text-ink-muted hover:text-ink transition-colors" />
                </a>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
                <span className="flex items-center gap-1">
                  <GitBranch className="h-3.5 w-3.5" />
                  {repo.branch}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Indexed {formatRelativeTime(repo.indexedAt)}
                </span>
              </div>
            </div>
          </div>
          <Link to="/chat">
            <Button>
              <MessageSquare className="h-4 w-4" />
              Ask about this repo
            </Button>
          </Link>
        </div>
      </GradientBorder>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Files" value={repo.fileCount} icon={FileCode} iconColor="text-accent-blue" />
        <StatCard label="Symbols" value={repo.symbolCount.toLocaleString()} icon={Network} iconColor="text-accent-violet" delay={0.05} />
        <StatCard label="Primary Language" value={repo.language} icon={Layers} iconColor="text-accent-cyan" delay={0.1} />
        <StatCard label="Branch" value={repo.branch} icon={GitBranch} iconColor="text-accent-emerald" delay={0.15} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard padding="md">
          <h3 className="mb-6 font-semibold text-ink">Language Breakdown</h3>
          <div className="space-y-4">
            {languageEntries.map(([lang, pct], i) => (
              <motion.div
                key={lang}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-ink-secondary">{lang}</span>
                  <span className="font-mono text-ink-muted">{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-accent-violet to-accent-blue"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        <GlassCard padding="md">
          <h3 className="mb-6 font-semibold text-ink">Quick Actions</h3>
          <div className="grid gap-3">
            {[
              { to: '/architecture', icon: Layers, label: 'View Architecture', desc: 'Module structure and boundaries' },
              { to: '/graph', icon: GitBranch, label: 'Explore Graph', desc: 'Dependency visualization' },
              { to: '/chat', icon: MessageSquare, label: 'Start Chat', desc: 'Ask architectural questions' },
            ].map((action, i) => (
              <Link key={action.to} to={action.to}>
                <motion.div
                  whileHover={{ x: 4 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.05]">
                    <action.icon className="h-5 w-5 text-accent-violet" />
                  </div>
                  <div>
                    <p className="font-medium text-ink">{action.label}</p>
                    <p className="text-sm text-ink-muted">{action.desc}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

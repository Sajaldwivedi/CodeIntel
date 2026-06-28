import { motion } from 'framer-motion';
import {
  Github,
  GitBranch,
  Hash,
  HardDrive,
  FileCode,
  User,
  FileArchive,
  FolderOpen,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/Badge';
import { cn, formatBytes, truncateHash } from '@/lib/utils';
import type { Repository } from '@/types/repository.types';

const SOURCE_LABEL = {
  github: { icon: Github, label: 'GitHub' },
  zip: { icon: FileArchive, label: 'ZIP Archive' },
  folder: { icon: FolderOpen, label: 'Local Folder' },
};

interface RepositoryInfoCardProps {
  repository: Repository;
}

export function RepositoryInfoCard({ repository }: RepositoryInfoCardProps) {
  const source = SOURCE_LABEL[repository.source];
  const SourceIcon = source.icon;

  const stats = [
    {
      icon: FileCode,
      label: 'Files',
      value: repository.file_count.toLocaleString(),
      color: 'text-accent-blue',
    },
    {
      icon: HardDrive,
      label: 'Size',
      value: formatBytes(repository.total_size_bytes),
      color: 'text-accent-violet',
    },
    {
      icon: GitBranch,
      label: 'Branch',
      value: repository.branch ?? '—',
      color: 'text-accent-cyan',
    },
    {
      icon: Hash,
      label: 'Commit',
      value: truncateHash(repository.commit_hash, 8),
      color: 'text-accent-emerald',
    },
  ];

  return (
    <div className="space-y-6">
      <GlassCard padding="md" glow={repository.status === 'ready'}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] ring-1 ring-white/[0.08]">
              <SourceIcon className="h-6 w-6 text-ink-secondary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-ink">
                  {repository.source === 'github' ? (
                    <>
                      <span className="text-ink-muted">{repository.owner}/</span>
                      {repository.name}
                    </>
                  ) : (
                    repository.name
                  )}
                </h3>
                <StatusBadge
                  status={
                    repository.status === 'ready'
                      ? 'ready'
                      : repository.status === 'failed'
                        ? 'failed'
                        : 'indexing'
                  }
                />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {repository.owner}
                </span>
                <span className="flex items-center gap-1">
                  <SourceIcon className="h-3.5 w-3.5" />
                  {source.label}
                </span>
                {repository.primary_language && (
                  <span className="rounded-md bg-white/[0.05] px-2 py-0.5 font-mono text-xs">
                    {repository.primary_language}
                  </span>
                )}
              </div>
              {repository.url && (
                <a
                  href={repository.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-mono text-xs text-accent-cyan hover:underline"
                >
                  {repository.url}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <stat.icon className={cn('mb-2 h-4 w-4', stat.color)} />
              <p className="text-xs text-ink-muted">{stat.label}</p>
              <p className="mt-0.5 font-mono text-sm font-medium text-ink">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {repository.languages.length > 0 && (
        <GlassCard padding="md">
          <h4 className="mb-4 text-sm font-semibold text-ink">Language breakdown</h4>
          <div className="space-y-3">
            {repository.languages.slice(0, 8).map((lang, i) => (
              <motion.div
                key={lang.language}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-ink-secondary">{lang.language}</span>
                  <span className="font-mono text-ink-muted">
                    {lang.percentage}% · {lang.files} files
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${lang.percentage}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className="h-full rounded-full bg-gradient-to-r from-accent-violet to-accent-blue"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Loader2,
  Circle,
  XCircle,
  Github,
  FileArchive,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IndexStatus, Repository, UploadSource } from '@/types/repository.types';
import { STAGE_LABELS } from '@/hooks/useRepositoryUpload';

const PIPELINE: { status: IndexStatus; label: string }[] = [
  { status: 'validating', label: 'Validate' },
  { status: 'cloning', label: 'Clone / Extract' },
  { status: 'scanning', label: 'Scan files' },
  { status: 'ready', label: 'Complete' },
];

const SOURCE_ICON: Record<UploadSource, typeof Github> = {
  github: Github,
  zip: FileArchive,
  folder: FolderOpen,
};

function stageIndex(status: IndexStatus): number {
  if (status === 'pending') return -1;
  if (status === 'validating') return 0;
  if (status === 'cloning' || status === 'extracting') return 1;
  if (status === 'scanning') return 2;
  if (status === 'ready') return 3;
  return -1;
}

interface UploadProgressProps {
  repository: Repository;
}

export function UploadProgress({ repository }: UploadProgressProps) {
  const activeIdx = stageIndex(repository.status);
  const failed = repository.status === 'failed';
  const done = repository.status === 'ready';
  const SourceIcon = SOURCE_ICON[repository.source];

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center">
        <motion.div
          animate={
            done
              ? { scale: [1, 1.05, 1] }
              : failed
                ? {}
                : { rotate: 360 }
          }
          transition={
            done
              ? { duration: 0.5 }
              : failed
                ? {}
                : { duration: 2, repeat: Infinity, ease: 'linear' }
          }
          className={cn(
            'mb-6 flex h-20 w-20 items-center justify-center rounded-2xl shadow-glow',
            failed
              ? 'bg-accent-rose/20 ring-1 ring-accent-rose/30'
              : done
                ? 'bg-accent-emerald/20 ring-1 ring-accent-emerald/30'
                : 'bg-gradient-to-br from-accent-violet to-accent-cyan',
          )}
        >
          {failed ? (
            <XCircle className="h-10 w-10 text-accent-rose" />
          ) : done ? (
            <CheckCircle2 className="h-10 w-10 text-accent-emerald" />
          ) : (
            <Sparkles className="h-10 w-10 text-white" />
          )}
        </motion.div>

        <h3 className="text-xl font-semibold text-ink">
          {failed
            ? 'Upload failed'
            : done
              ? 'Repository ready'
              : repository.current_stage ?? 'Processing...'}
        </h3>
        <p className="mt-2 text-sm text-ink-muted">
          {failed
            ? repository.error_message
            : done
              ? `${repository.file_count.toLocaleString()} files indexed and ready for analysis`
              : 'Please wait while we process your repository'}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <SourceIcon className="h-3.5 w-3.5" />
            {STAGE_LABELS[repository.status]}
          </span>
          <span className="font-mono">{repository.progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className={cn(
              'h-full rounded-full',
              failed
                ? 'bg-accent-rose'
                : 'bg-gradient-to-r from-accent-violet via-accent-blue to-accent-cyan',
            )}
            animate={{ width: `${repository.progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PIPELINE.map((step, i) => {
          const complete = activeIdx > i || done;
          const current = activeIdx === i && !done && !failed;

          return (
            <motion.div
              key={step.label}
              animate={current ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 1.5, repeat: current ? Infinity : 0 }}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium',
                complete && 'border-accent-emerald/25 bg-accent-emerald/5 text-accent-emerald',
                current && 'border-accent-violet/30 bg-accent-violet/10 text-accent-violet',
                !complete && !current && 'border-white/[0.06] bg-white/[0.02] text-ink-muted',
                failed && i > activeIdx && 'opacity-40',
              )}
            >
              {complete ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              ) : current ? (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0" />
              )}
              {step.label}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

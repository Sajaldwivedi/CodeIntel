import { motion } from 'framer-motion';
import {
  Github,
  FileCode,
  Sparkles,
  Network,
  CheckCircle2,
  GitBranch,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STAGES = [
  { id: 'clone', label: 'Cloning', icon: Github },
  { id: 'parse', label: 'Parsing AST', icon: FileCode },
  { id: 'embed', label: 'Embedding', icon: Sparkles },
  { id: 'graph', label: 'Building Graph', icon: Network },
];

export function UploadAnimation() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="absolute -inset-8 rounded-3xl bg-gradient-to-r from-accent-violet/20 via-accent-blue/10 to-accent-cyan/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0a0a0c]/90 shadow-glow backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="ml-2 font-mono text-[11px] text-ink-muted">index — repository</span>
        </div>

        <div className="p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06]">
              <Github className="h-5 w-5 text-ink-secondary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-sm text-ink">
                github.com/<span className="text-accent-cyan">vercel</span>/next.js
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
                <GitBranch className="h-3 w-3" />
                main · 2,891 files
              </div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-accent-emerald"
            />
          </motion.div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-ink-muted">Indexing progress</span>
              <motion.span
                key="progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-mono text-accent-violet"
              >
                <AnimatedCounter />
              </motion.span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent-violet via-accent-blue to-accent-cyan"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {STAGES.map((stage, i) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.15 }}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors',
                  i < 3
                    ? 'border-accent-emerald/20 bg-accent-emerald/5 text-accent-emerald'
                    : 'border-white/[0.06] bg-white/[0.02] text-ink-muted',
                )}
              >
                {i < 3 ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  >
                    <stage.icon className="h-3.5 w-3.5 shrink-0" />
                  </motion.div>
                )}
                {stage.label}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 font-mono text-[10px] text-ink-faint"
          >
            <span>12,403 symbols indexed</span>
            <span className="text-accent-cyan">Neo4j · ChromaDB</span>
          </motion.div>
        </div>
      </motion.div>

      <FloatingBadge label="Tree-Sitter" className="-left-4 top-8" delay={0.8} />
      <FloatingBadge label="LangGraph" className="-right-6 top-1/3" delay={1} />
      <FloatingBadge label="Neo4j" className="-left-2 bottom-12" delay={1.2} />
    </div>
  );
}

function AnimatedCounter() {
  return (
    <motion.span
      animate={{ opacity: [1, 0.5, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      78%
    </motion.span>
  );
}

function FloatingBadge({
  label,
  className,
  delay,
}: {
  label: string;
  className?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
      transition={{
        opacity: { delay, duration: 0.4 },
        scale: { delay, duration: 0.4 },
        y: { delay: delay + 0.5, duration: 3, repeat: Infinity, ease: 'easeInOut' },
      }}
      className={cn(
        'absolute hidden rounded-full border border-white/[0.1] bg-[#0a0a0c]/90 px-3 py-1.5 text-xs font-medium text-ink-secondary shadow-lg backdrop-blur-md sm:block',
        className,
      )}
    >
      {label}
    </motion.div>
  );
}

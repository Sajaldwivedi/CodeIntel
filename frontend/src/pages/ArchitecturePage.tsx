import { motion } from 'framer-motion';
import { Box, ArrowRight, ChevronRight } from 'lucide-react';
import { PageHeader, staggerContainer, staggerItem } from '@/components/ui/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBorder } from '@/components/ui/GradientBorder';
import { Badge } from '@/components/ui/Badge';
import { architectureModules } from '@/data/mock';
import { cn } from '@/lib/utils';

export function ArchitecturePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Architecture"
        description="High-level module structure, boundaries, and dependency relationships."
        badge={<Badge variant="info">6 modules</Badge>}
      />

      <GradientBorder>
        <div className="p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-faint">
            System Overview
          </p>
          <div className="overflow-x-auto">
            <pre className="font-mono text-xs leading-relaxed text-ink-muted">
{`┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│   React     │────▶│   FastAPI   │────▶│     Services     │
│  Frontend   │     │   Backend   │     └────────┬─────────┘
└─────────────┘     └─────────────┘              │
                    ┌────────────────────────────┼────────────────┐
                    ▼              ▼             ▼                ▼
              ┌──────────┐  ┌──────────┐  ┌──────────┐   ┌──────────┐
              │  Parser  │  │ ChromaDB │  │  Neo4j   │   │LangGraph │
              │Tree-Sitter│  │ Vectors  │  │  Graph   │   │  Agents  │
              └──────────┘  └──────────┘  └──────────┘   └──────────┘`}
            </pre>
          </div>
        </div>
      </GradientBorder>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {architectureModules.map((mod) => (
          <motion.div key={mod.name} variants={staggerItem}>
            <GlassCard
              className="h-full cursor-pointer group"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-violet/10 ring-1 ring-accent-violet/20">
                  <Box className="h-5 w-5 text-accent-violet" />
                </div>
                <span className="font-mono text-xs text-ink-faint">{mod.files} files</span>
              </div>

              <h3 className="font-semibold text-ink group-hover:text-accent-violet transition-colors">
                {mod.name}
              </h3>
              <p className="mt-1 font-mono text-xs text-accent-cyan">{mod.path}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{mod.description}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {mod.deps.map((dep) => (
                  <span
                    key={dep}
                    className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-ink-muted"
                  >
                    <ArrowRight className="h-3 w-3" />
                    {dep}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-1 text-xs text-accent-violet opacity-0 group-hover:opacity-100 transition-opacity">
                Explore module <ChevronRight className="h-3 w-3" />
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      <GlassCard padding="md">
        <h3 className="mb-4 font-semibold text-ink">Design Patterns Detected</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: 'Repository Pattern', count: 3, status: 'good' },
            { name: 'Dependency Injection', count: 12, status: 'good' },
            { name: 'Clean Architecture', count: 1, status: 'good' },
            { name: 'God Object', count: 0, status: 'good' },
          ].map((pattern, i) => (
            <motion.div
              key={pattern.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'rounded-xl border p-4',
                pattern.status === 'good'
                  ? 'border-accent-emerald/20 bg-accent-emerald/5'
                  : 'border-accent-rose/20 bg-accent-rose/5',
              )}
            >
              <p className="text-sm font-medium text-ink">{pattern.name}</p>
              <p className="mt-1 text-xs text-ink-muted">{pattern.count} occurrences</p>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

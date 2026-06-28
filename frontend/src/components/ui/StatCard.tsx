import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
}

export function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-accent-violet',
  delay = 0,
}: StatCardProps) {
  return (
    <GlassCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      padding="md"
      className="group"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-ink-muted">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-ink">{value}</p>
          {change && (
            <p
              className={cn(
                'text-xs font-medium',
                changeType === 'positive' && 'text-accent-emerald',
                changeType === 'negative' && 'text-accent-rose',
                changeType === 'neutral' && 'text-ink-muted',
              )}
            >
              {change}
            </p>
          )}
        </div>
        <motion.div
          whileHover={{ rotate: 5, scale: 1.05 }}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05] ring-1 ring-white/[0.08]',
            'group-hover:bg-white/[0.08] transition-colors',
          )}
        >
          <Icon className={cn('h-5 w-5', iconColor)} />
        </motion.div>
      </div>
    </GlassCard>
  );
}

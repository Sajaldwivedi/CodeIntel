import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-ink-secondary border-white/10',
  success: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  error: 'bg-accent-rose/10 text-accent-rose border-accent-rose/20',
  info: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-ink-muted',
  success: 'bg-accent-emerald',
  warning: 'bg-amber-400',
  error: 'bg-accent-rose',
  info: 'bg-accent-blue',
};

export function Badge({ children, variant = 'default', dot, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: 'ready' | 'indexing' | 'failed' | 'pending' }) {
  const map = {
    ready: { variant: 'success' as const, label: 'Ready' },
    indexing: { variant: 'warning' as const, label: 'Indexing' },
    failed: { variant: 'error' as const, label: 'Failed' },
    pending: { variant: 'default' as const, label: 'Pending' },
  };
  const { variant, label } = map[status];
  return (
    <Badge variant={variant} dot>
      {label}
    </Badge>
  );
}

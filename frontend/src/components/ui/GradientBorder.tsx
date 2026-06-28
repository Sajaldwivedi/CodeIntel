import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GradientBorderProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: 'default' | 'subtle' | 'active';
  children?: React.ReactNode;
}

const variants = {
  default:
    'before:bg-gradient-to-br before:from-accent-violet/60 before:via-accent-blue/40 before:to-accent-cyan/60',
  subtle:
    'before:bg-gradient-to-br before:from-white/20 before:via-white/5 before:to-white/20',
  active:
    'before:bg-gradient-to-br before:from-accent-violet before:via-accent-blue before:to-accent-cyan before:opacity-80',
};

export function GradientBorder({
  className,
  children,
  variant = 'default',
  ...props
}: GradientBorderProps) {
  return (
    <motion.div
      className={cn(
        'relative rounded-2xl p-[1px]',
        'before:absolute before:inset-0 before:rounded-2xl before:p-[1px]',
        'before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]',
        'before:[mask-composite:exclude]',
        variants[variant],
        className,
      )}
      {...props}
    >
      <div className="relative h-full rounded-2xl bg-surface-raised/80 backdrop-blur-xl">
        {children}
      </div>
    </motion.div>
  );
}

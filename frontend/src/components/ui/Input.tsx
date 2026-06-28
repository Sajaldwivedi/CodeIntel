import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export function Input({ label, hint, icon, className, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-ink-secondary">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3',
            'text-sm text-ink placeholder:text-ink-faint',
            'backdrop-blur-sm transition-all duration-200',
            'focus:border-accent-violet/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-accent-violet/20',
            icon && 'pl-10',
            className,
          )}
          {...props}
        />
      </div>
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-ink-secondary">{label}</label>
      )}
      <textarea
        className={cn(
          'w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3',
          'text-sm text-ink placeholder:text-ink-faint font-mono',
          'backdrop-blur-sm transition-all duration-200 min-h-[120px]',
          'focus:border-accent-violet/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-accent-violet/20',
          className,
        )}
        {...props}
      />
    </div>
  );
}

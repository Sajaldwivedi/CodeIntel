import { cn } from "@/utils/cn";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

/** Brand mark: a gradient glyph plus optional wordmark. */
export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 shadow-glow">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16M4 12h10M4 18h7" />
          <circle cx="18" cy="15" r="3" />
          <path d="m20.5 17.5 2 2" />
        </svg>
      </div>
      {showWordmark && (
        <span className="text-sm font-semibold tracking-tight">
          Code<span className="text-muted-foreground">Intel</span>
        </span>
      )}
    </div>
  );
}

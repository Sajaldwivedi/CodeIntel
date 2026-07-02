import { cn } from "@/utils/cn";

interface AuroraBackgroundProps {
  className?: string;
  /** Renders a faint grid overlay in addition to the aurora blobs. */
  grid?: boolean;
}

/** Ambient animated gradient blobs + optional grid. Purely decorative. */
export function AuroraBackground({ className, grid = true }: AuroraBackgroundProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)} aria-hidden>
      <div className="absolute -left-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-violet-600/20 blur-[120px] animate-aurora" />
      <div className="absolute -right-24 top-10 h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/15 blur-[120px] animate-aurora [animation-delay:-6s]" />
      <div className="absolute bottom-[-10rem] left-1/3 h-[32rem] w-[32rem] rounded-full bg-cyan-400/15 blur-[120px] animate-aurora [animation-delay:-12s]" />
      {grid && (
        <div className="absolute inset-0 bg-grid-pattern bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_75%)]" />
      )}
    </div>
  );
}

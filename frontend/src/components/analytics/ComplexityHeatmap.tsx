import { cn } from "@/utils/cn";
import type { HeatmapCell } from "@/types/analytics";
import { COMPLEXITY_COLORS } from "@/components/analytics/chartTheme";

interface ComplexityHeatmapProps {
  cells: HeatmapCell[];
  onSelect?: (path: string) => void;
}

function intensity(cell: HeatmapCell): number {
  return Math.min(1, (cell.complexity_score * Math.log10(cell.lines + 10)) / 30);
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ComplexityHeatmap({ cells, onSelect }: ComplexityHeatmapProps) {
  if (!cells.length) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-white/10 text-sm text-muted-foreground">
        No heatmap data available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {cells.map((cell) => {
        const alpha = 0.15 + intensity(cell) * 0.75;
        const color =
          COMPLEXITY_COLORS[cell.complexity_label as keyof typeof COMPLEXITY_COLORS] ?? "#94a3b8";
        return (
          <button
            key={cell.path}
            type="button"
            onClick={() => onSelect?.(cell.path)}
            className="group relative overflow-hidden rounded-lg border border-white/10 p-3 text-left transition-transform hover:-translate-y-0.5 hover:border-white/20"
            style={{ backgroundColor: hexToRgba(color, alpha) }}
            title={`${cell.path} · ${cell.lines} lines · ${cell.complexity_label}`}
          >
            <p className="truncate font-mono text-[10px] text-foreground/90">{cell.path.split("/").pop()}</p>
            <p className="mt-1 truncate text-[10px] text-muted-foreground">{cell.directory}</p>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className={cn("rounded px-1.5 py-0.5 capitalize", "bg-black/20")}>
                {cell.complexity_label}
              </span>
              <span className="text-muted-foreground">{cell.lines}L</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

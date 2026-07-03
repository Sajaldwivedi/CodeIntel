const LANGUAGE_COLORS: Record<string, string> = {
  python: "#3b82f6",
  typescript: "#06b6d4",
  javascript: "#eab308",
  tsx: "#22d3ee",
  jsx: "#f59e0b",
  go: "#34d399",
  rust: "#f97316",
  java: "#ef4444",
  unknown: "#94a3b8",
};

export function languageColor(language: string): string {
  return LANGUAGE_COLORS[language.toLowerCase()] ?? LANGUAGE_COLORS.unknown;
}

export const COMPLEXITY_COLORS = {
  low: "#34d399",
  medium: "#fbbf24",
  high: "#f87171",
} as const;

export const CHART_THEME = {
  grid: "rgba(255,255,255,0.06)",
  axis: "rgba(255,255,255,0.45)",
  tooltipBg: "rgba(15,15,20,0.95)",
  tooltipBorder: "rgba(255,255,255,0.12)",
};

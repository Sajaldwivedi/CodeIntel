import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_THEME, COMPLEXITY_COLORS, languageColor } from "@/components/analytics/chartTheme";
import type { ComplexitySlice, LanguageSlice } from "@/types/analytics";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; payload?: LanguageSlice }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0];
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-xl"
      style={{ background: CHART_THEME.tooltipBg, borderColor: CHART_THEME.tooltipBorder }}
    >
      <p className="font-medium text-foreground">{label ?? row.name}</p>
      <p className="text-muted-foreground">{row.value}</p>
    </div>
  );
}

export function LanguageChart({ data }: { data: LanguageSlice[] }) {
  return (
    <Card className="overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Language distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="lines"
              nameKey="language"
              innerRadius={58}
              outerRadius={92}
              paddingAngle={2}
              stroke="transparent"
            >
              {data.map((entry) => (
                <Cell key={entry.language} fill={languageColor(entry.language)} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as LanguageSlice;
                return (
                  <div
                    className="rounded-lg border px-3 py-2 text-xs"
                    style={{ background: CHART_THEME.tooltipBg, borderColor: CHART_THEME.tooltipBorder }}
                  >
                    <p className="font-medium capitalize">{row.language}</p>
                    <p className="text-muted-foreground">
                      {row.lines.toLocaleString()} lines · {row.percentage}%
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {data.map((row) => (
            <div key={row.language} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: languageColor(row.language) }}
              />
              <span className="capitalize">{row.language}</span>
              <span>{row.percentage}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ComplexityChart({ data }: { data: ComplexitySlice[] }) {
  return (
    <Card className="overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Complexity distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
            <XAxis dataKey="level" tick={{ fill: CHART_THEME.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: CHART_THEME.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.level}
                  fill={COMPLEXITY_COLORS[entry.level as keyof typeof COMPLEXITY_COLORS] ?? "#94a3b8"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

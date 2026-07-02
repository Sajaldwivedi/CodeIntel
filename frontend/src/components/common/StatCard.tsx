import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { fadeInUp } from "@/utils/motion";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  /** e.g. "+12%". Positive/negative inferred from the leading sign. */
  delta?: string;
  accent?: string;
}

/** Animated KPI card with hover glow. */
export function StatCard({ label, value, icon, delta, accent = "text-primary" }: StatCardProps) {
  const isNegative = delta?.trim().startsWith("-");

  return (
    <motion.div variants={fadeInUp}>
      <Card className="group relative overflow-hidden p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05]">
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
        <div className="flex items-center justify-between">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 [&_svg]:size-4", accent)}>
            {icon}
          </div>
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium",
                isNegative ? "text-red-400" : "text-emerald-400",
              )}
            >
              {isNegative ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
              {delta.replace(/^[-+]/, "")}
            </span>
          )}
        </div>
        <div className="mt-4">
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          <div className="mt-0.5 text-sm text-muted-foreground">{label}</div>
        </div>
      </Card>
    </motion.div>
  );
}

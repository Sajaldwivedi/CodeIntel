import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { scaleIn } from "@/utils/motion";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

/** Friendly empty state with an icon, copy, and optional call to action. */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center"
    >
      <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-muted-foreground [&_svg]:size-7">
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-400/10" />
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TypingIndicator({ label = "Thinking" }: { label?: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="from-violet-500 to-cyan-400">
          <Sparkles className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-muted-foreground"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        {label && <span className="pl-1 text-[10px] text-muted-foreground">{label}</span>}
      </div>
    </motion.div>
  );
}

import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { RepoStatus } from "@/types";

const CONFIG: Record<
  RepoStatus,
  { label: string; variant: "success" | "warning" | "danger" | "secondary"; icon: typeof Clock; spin?: boolean }
> = {
  indexed: { label: "Indexed", variant: "success", icon: CheckCircle2 },
  indexing: { label: "Indexing", variant: "warning", icon: Loader2, spin: true },
  queued: { label: "Queued", variant: "secondary", icon: Clock },
  failed: { label: "Failed", variant: "danger", icon: XCircle },
};

export function RepoStatusBadge({ status }: { status: RepoStatus }) {
  const { label, variant, icon: Icon, spin } = CONFIG[status];
  return (
    <Badge variant={variant}>
      <Icon className={spin ? "h-3 w-3 animate-spin" : "h-3 w-3"} />
      {label}
    </Badge>
  );
}

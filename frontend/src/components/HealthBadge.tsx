import { cn } from "@/utils/cn";

type Variant = "loading" | "success" | "error";

interface HealthBadgeProps {
  variant: Variant;
  label: string;
}

const VARIANT_STYLES: Record<Variant, string> = {
  loading: "bg-muted text-muted-foreground",
  success: "bg-emerald-100 text-emerald-700",
  error: "bg-destructive/10 text-destructive",
};

/** Small status pill used to surface backend connectivity. */
export function HealthBadge({ variant, label }: HealthBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
        VARIANT_STYLES[variant],
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          variant === "success" && "bg-emerald-500",
          variant === "error" && "bg-destructive",
          variant === "loading" && "animate-pulse bg-muted-foreground",
        )}
      />
      {label}
    </span>
  );
}

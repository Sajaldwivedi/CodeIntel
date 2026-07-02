import { Toaster as Sonner } from "sonner";

/** App-wide toast host. Styled to match the dark, glassmorphic theme. */
export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group border border-white/10 bg-[hsl(240_10%_8%)]/95 text-foreground backdrop-blur-xl shadow-2xl rounded-xl",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-white/10 text-muted-foreground",
          success: "[&_[data-icon]]:text-emerald-400",
          error: "[&_[data-icon]]:text-red-400",
        },
      }}
    />
  );
}

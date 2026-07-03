import { useEffect, useId, useRef, useState } from "react";

import { cleanupMermaidArtifacts, renderMermaidSvg } from "@/components/diagrams/diagramUtils";
import { cn } from "@/utils/cn";

interface MermaidPanelProps {
  title: string;
  source: string;
  exportRef?: React.RefObject<HTMLDivElement | null>;
}

export function MermaidPanel({ title, source, exportRef }: MermaidPanelProps) {
  const uid = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    renderMermaidSvg(source, `mmd-${uid}-${title.replace(/\s+/g, "-")}`)
      .then((markup) => {
        if (!cancelled) setSvg(markup);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
          setSvg("");
        }
      });
    return () => {
      cancelled = true;
      cleanupMermaidArtifacts();
    };
  }, [source, title, uid]);

  useEffect(() => {
    if (exportRef && containerRef.current) {
      (exportRef as React.MutableRefObject<HTMLDivElement | null>).current = containerRef.current;
    }
  }, [exportRef, svg]);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <div
        ref={containerRef}
        className={cn(
          "overflow-auto rounded-xl border border-white/10 bg-[hsl(240_10%_7%)]/80 p-4",
          "min-h-[280px]",
        )}
      >
        {error ? (
          <div className="space-y-2">
            <p className="text-xs text-red-400">{error}</p>
            <pre className="overflow-x-auto text-xs text-muted-foreground">{source}</pre>
          </div>
        ) : svg ? (
          <div className="flex justify-center [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <p className="text-xs text-muted-foreground">Rendering diagram…</p>
        )}
      </div>
    </div>
  );
}

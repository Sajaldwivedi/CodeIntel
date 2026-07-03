import { FileCode, FunctionSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Citation } from "@/types";

interface CitationPanelProps {
  citations: Citation[];
  fileReferences?: string[];
  functionReferences?: string[];
  onFileClick?: (path: string, line?: number) => void;
}

export function CitationPanel({
  citations,
  fileReferences = [],
  functionReferences = [],
  onFileClick,
}: CitationPanelProps) {
  const files = fileReferences.length
    ? fileReferences
    : [...new Set(citations.map((c) => c.path))];

  return (
    <div className="w-full space-y-3">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="mr-1 self-center text-xs font-medium text-muted-foreground">Files</span>
          {files.map((path) => (
            <Button
              key={path}
              type="button"
              variant="secondary"
              size="sm"
              className="h-7 gap-1 font-mono text-[10px]"
              onClick={() => onFileClick?.(path)}
            >
              <FileCode className="h-3 w-3" />
              {path}
            </Button>
          ))}
        </div>
      )}

      {functionReferences.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="mr-1 self-center text-xs font-medium text-muted-foreground">Functions</span>
          {functionReferences.map((name) => (
            <Badge key={name} variant="secondary" className="gap-1 font-mono text-[10px]">
              <FunctionSquare className="h-3 w-3" />
              {name}
            </Badge>
          ))}
        </div>
      )}

      {citations.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Code citations</p>
          {citations.map((c, i) => (
            <Card
              key={`${c.path}-${i}`}
              className="group cursor-pointer overflow-hidden transition-colors hover:border-primary/40"
              onClick={() => onFileClick?.(c.path, c.startLine)}
            >
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                <FileCode className="h-3.5 w-3.5 text-primary" />
                <button
                  type="button"
                  className="truncate font-mono text-xs text-left hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileClick?.(c.path, c.startLine);
                  }}
                >
                  {c.path}
                </button>
                {c.functionName && (
                  <Badge variant="secondary" className="text-[10px]">
                    {c.functionName}
                  </Badge>
                )}
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  L{c.startLine}-{c.endLine}
                </Badge>
              </div>
              <pre className="overflow-x-auto px-3 py-2 font-mono text-xs text-muted-foreground">
                {c.snippet}
              </pre>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

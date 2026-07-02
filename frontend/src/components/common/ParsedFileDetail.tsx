import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ParsedFileResult } from "@/types/parse";

export function ParsedFileDetail({ file }: { file: ParsedFileResult }) {
  const symbols = [
    ...file.functions.map((f) => ({ kind: "function" as const, ...f })),
    ...file.classes.flatMap((c) => [
      { kind: "class" as const, name: c.name, start_line: c.start_line, end_line: c.end_line, docstring: c.docstring },
      ...c.methods.map((m) => ({
        kind: "method" as const,
        name: `${c.name}.${m.name}`,
        start_line: m.start_line,
        end_line: m.end_line,
        docstring: m.docstring,
      })),
    ]),
  ];

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{file.file}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {file.language} · {file.metadata.lines} lines · complexity {file.metadata.complexity} ·{" "}
          {file.metadata.symbol_count} symbols
        </p>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {file.api_endpoints.length > 0 && (
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">API routes</h4>
            <ul className="space-y-1">
              {file.api_endpoints.map((ep) => (
                <li key={`${ep.method}-${ep.route}-${ep.start_line}`} className="font-mono text-xs">
                  <span className="text-primary">{ep.method}</span> {ep.route}{" "}
                  <span className="text-muted-foreground">→ {ep.handler}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {symbols.length > 0 && (
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Symbols</h4>
            <ul className="space-y-2">
              {symbols.map((s) => (
                <li key={`${s.kind}-${s.name}-${s.start_line}`} className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs text-muted-foreground">
                      L{s.start_line}–{s.end_line}
                    </span>
                  </div>
                  {s.docstring && <p className="mt-1 text-xs text-muted-foreground">{s.docstring}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {file.imports.length > 0 && (
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Imports</h4>
            <ul className="space-y-1 font-mono text-xs text-muted-foreground">
              {file.imports.slice(0, 12).map((imp) => (
                <li key={`${imp.module}-${imp.start_line}`}>
                  {imp.module} {imp.is_external ? "(external)" : "(internal)"}
                </li>
              ))}
            </ul>
          </section>
        )}
      </CardContent>
    </Card>
  );
}

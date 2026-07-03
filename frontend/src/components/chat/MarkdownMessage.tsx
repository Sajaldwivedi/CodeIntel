import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { Citation } from "@/types";

interface MarkdownMessageProps {
  content: string;
  citations?: Citation[];
  fileReferences?: string[];
  functionReferences?: string[];
  onFileClick?: (path: string, line?: number) => void;
  className?: string;
}

function CodeBlock({
  language,
  value,
}: {
  language: string | undefined;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <div className="group relative my-3 overflow-hidden rounded-lg border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          {language || "text"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs opacity-80 hover:opacity-100"
          onClick={copy}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "0.875rem 1rem",
          background: "rgba(0,0,0,0.35)",
          fontSize: "0.75rem",
        }}
        PreTag="div"
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

function linkifyPath(
  text: string,
  knownPaths: Set<string>,
  onFileClick?: (path: string, line?: number) => void,
): React.ReactNode[] {
  if (!onFileClick || knownPaths.size === 0) return [text];

  const pattern = new RegExp(
    `(\`?)((?:[\\w.-]+/)+[\\w.-]+\\.[\\w]+)(\`?)(?::(\\d+)(?:-(\\d+))?)?`,
    "g",
  );
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const [full, openTick, path, closeTick, lineStr] = match;
    const start = match.index;
    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));

    const normalized = path.replace(/\\/g, "/");
    const isKnown = [...knownPaths].some(
      (p) => p === normalized || p.endsWith(`/${normalized}`) || normalized.endsWith(p),
    );

    if (isKnown && openTick === closeTick) {
      const line = lineStr ? Number(lineStr) : undefined;
      nodes.push(
        <button
          key={`${normalized}-${start}`}
          type="button"
          onClick={() => onFileClick(normalized, line)}
          className="font-mono text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
        >
          {openTick}
          {path}
          {closeTick}
          {lineStr ? `:${lineStr}` : ""}
        </button>,
      );
    } else {
      nodes.push(full);
    }
    lastIndex = start + full.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes.length ? nodes : [text];
}

export function MarkdownMessage({
  content,
  citations = [],
  fileReferences = [],
  functionReferences = [],
  onFileClick,
  className,
}: MarkdownMessageProps) {
  const knownPaths = new Set<string>([
    ...fileReferences,
    ...citations.map((c) => c.path),
  ]);

  return (
    <div className={cn("prose prose-invert prose-sm max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p({ children }) {
            const text = String(children);
            if (typeof children === "string") {
              return <p>{linkifyPath(text, knownPaths, onFileClick)}</p>;
            }
            return <p>{children}</p>;
          },
          li({ children }) {
            if (typeof children === "string") {
              return <li>{linkifyPath(children, knownPaths, onFileClick)}</li>;
            }
            return <li>{children}</li>;
          },
          code({ className: codeClass, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClass || "");
            const value = String(children).replace(/\n$/, "");
            const inline = !match && !value.includes("\n");
            if (inline) {
              const raw = value.replace(/`/g, "");
              const isFile = [...knownPaths].some((p) => p.includes(raw) || raw.includes(p));
              const isFn = functionReferences.includes(raw);
              if ((isFile || isFn) && onFileClick && isFile) {
                return (
                  <button
                    type="button"
                    onClick={() => onFileClick(raw)}
                    className="rounded bg-primary/15 px-1.5 py-0.5 font-mono text-xs text-primary hover:bg-primary/25"
                  >
                    {value}
                  </button>
                );
              }
              if (isFn) {
                return (
                  <code className="rounded bg-violet-500/15 px-1.5 py-0.5 font-mono text-xs text-violet-300">
                    {value}
                  </code>
                );
              }
              return (
                <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs" {...props}>
                  {children}
                </code>
              );
            }
            return <CodeBlock language={match?.[1]} value={value} />;
          },
          pre({ children }) {
            return <>{children}</>;
          },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

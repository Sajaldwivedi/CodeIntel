import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Brain, Loader2, Send, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { streamAgentChat } from "@/api/agent";
import { CitationPanel } from "@/components/chat/CitationPanel";
import { FollowUpChips } from "@/components/chat/FollowUpChips";
import { MarkdownMessage } from "@/components/chat/MarkdownMessage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useRepoStore } from "@/store/repoStore";
import { cn } from "@/utils/cn";
import type { ChatMessage } from "@/types";

const SUGGESTIONS = [
  "How does authentication work?",
  "Where is the database connection configured?",
  "Explain the request lifecycle",
  "What are the main API endpoints?",
];

export function ChatPage() {
  const navigate = useNavigate();
  const repositories = useRepoStore((s) => s.repositories);
  const selectedId = useRepoStore((s) => s.selectedRepoId);
  const activeRepo = repositories.find((r) => r.id === selectedId) ?? repositories[0];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setSessionId(undefined);
    setMessages([]);
  }, [activeRepo?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const openFile = (path: string, line?: number) => {
    if (!activeRepo) return;
    const params = new URLSearchParams({ file: path });
    if (line) params.set("line", String(line));
    navigate(`/repository/${activeRepo.id}?${params.toString()}`);
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || thinking) return;
    if (!activeRepo) {
      setError("Select or ingest a repository before asking questions.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const assistantId = crypto.randomUUID();
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true,
      statusLabel: "Analyzing repository context…",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((m) => [...m, userMsg, assistantPlaceholder]);
    setInput("");
    setThinking(true);
    setError(null);

    try {
      const repoId = `${activeRepo.owner}/${activeRepo.name}`;

      await streamAgentChat(
        { repo_id: repoId, question: content, session_id: sessionId },
        (event) => {
          if (event.type === "status") {
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId ? { ...msg, statusLabel: event.message } : msg,
              ),
            );
            return;
          }

          if (event.type === "error") {
            setError(event.message);
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: event.message, isStreaming: false }
                  : msg,
              ),
            );
            return;
          }

          if (event.type === "meta") {
            setSessionId(event.data.session_id);
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId
                  ? {
                      ...msg,
                      statusLabel: undefined,
                      confidence: event.data.confidence,
                      reasoningSummary: event.data.reasoning_summary,
                      reasoningSteps: event.data.reasoning_steps,
                      plan: event.data.plan,
                      toolsUsed: event.data.tools_used,
                      fileReferences: event.data.file_references,
                      functionReferences: event.data.function_references,
                      followUpSuggestions: event.data.follow_up_suggestions,
                      citations: event.data.citations.map((c) => ({
                        path: c.file_path,
                        startLine: c.start_line,
                        endLine: c.end_line,
                        snippet: c.snippet,
                        functionName: c.function_name,
                        source: c.source,
                        score: c.score,
                      })),
                    }
                  : msg,
              ),
            );
            return;
          }

          if (event.type === "token") {
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: msg.content + event.text }
                  : msg,
              ),
            );
            return;
          }

          if (event.type === "done") {
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: event.answer || msg.content, isStreaming: false }
                  : msg,
              ),
            );
          }
        },
        controller.signal,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Query failed.";
      setError(message);
    } finally {
      setThinking(false);
    }
  };

  const hasMessages = messages.length > 0;
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant" && !m.isStreaming);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-400/20 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Code Chat</h1>
            <p className="text-xs text-muted-foreground">
              AI Software Engineer ·{" "}
              <span className="text-foreground">
                {activeRepo?.owner}/{activeRepo?.name}
              </span>
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Streaming
        </Badge>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto py-6">
        {!hasMessages ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-400/20 text-primary"
            >
              <Sparkles className="h-7 w-7" />
            </motion.div>
            <h2 className="mt-5 text-xl font-semibold">Ask anything about this codebase</h2>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
              Grounded answers with file references, function citations, reasoning summaries, and
              follow-up suggestions.
            </p>
            <div className="mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/5"
                >
                  <span className="text-muted-foreground transition-colors group-hover:text-foreground">
                    {s}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} onFileClick={openFile} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {lastAssistant?.followUpSuggestions && lastAssistant.followUpSuggestions.length > 0 && (
        <div className="border-t border-white/5 px-1 py-3">
          <FollowUpChips
            suggestions={lastAssistant.followUpSuggestions}
            onSelect={send}
            disabled={thinking}
          />
        </div>
      )}

      <div className="border-t border-white/10 pt-4">
        {error && <p className="mb-2 text-center text-xs text-red-400">{error}</p>}
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about functions, files, architecture…"
            className="min-h-[56px] pr-14"
            disabled={thinking}
          />
          <Button
            size="icon"
            variant="gradient"
            className="absolute bottom-2.5 right-2.5 h-9 w-9"
            onClick={() => send(input)}
            disabled={!input.trim() || thinking}
          >
            {thinking ? <Loader2 className="animate-spin" /> : <ArrowUp />}
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          <Send className="mr-1 inline h-3 w-3" />
          Press Enter to send · Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onFileClick,
}: {
  message: ChatMessage;
  onFileClick: (path: string, line?: number) => void;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      <Avatar className="h-8 w-8 shrink-0">
        {isUser ? (
          <AvatarFallback>You</AvatarFallback>
        ) : (
          <AvatarFallback className="from-violet-500 to-cyan-400">
            <Sparkles className="h-4 w-4" />
          </AvatarFallback>
        )}
      </Avatar>

      <div className={cn("max-w-3xl space-y-3", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground"
              : "border border-white/10 bg-white/[0.03]",
          )}
        >
          {isUser ? (
            message.content
          ) : message.content ? (
            <MarkdownMessage
              content={message.content}
              citations={message.citations}
              fileReferences={message.fileReferences}
              functionReferences={message.functionReferences}
              onFileClick={onFileClick}
            />
          ) : message.isStreaming ? (
            <div className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-2 w-2 rounded-full bg-muted-foreground"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </span>
              {message.statusLabel && (
                <span className="text-xs text-muted-foreground">{message.statusLabel}</span>
              )}
            </div>
          ) : null}
          {message.isStreaming && message.content ? (
            <span className="ml-0.5 inline-block h-4 w-1 animate-pulse bg-primary/80" />
          ) : null}
        </div>

        {!isUser && message.confidence !== undefined && !message.isStreaming && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">Confidence {(message.confidence * 100).toFixed(0)}%</Badge>
            {message.toolsUsed?.map((tool) => (
              <Badge key={tool} variant="secondary">
                {tool}
              </Badge>
            ))}
          </div>
        )}

        {!isUser && message.reasoningSummary && !message.isStreaming && (
          <div className="flex gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-muted-foreground">
            <Brain className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400" />
            <div>
              <p className="font-medium text-foreground/80">Reasoning summary</p>
              <p className="mt-0.5">{message.reasoningSummary}</p>
            </div>
          </div>
        )}

        {message.reasoningSteps && message.reasoningSteps.length > 1 && !isUser && !message.isStreaming && (
          <details className="w-full text-xs text-muted-foreground">
            <summary className="cursor-pointer font-medium">
              Reasoning steps ({message.reasoningSteps.length})
            </summary>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              {message.reasoningSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </details>
        )}

        {!isUser && !message.isStreaming && (message.citations?.length || message.fileReferences?.length) ? (
          <CitationPanel
            citations={message.citations ?? []}
            fileReferences={message.fileReferences}
            functionReferences={message.functionReferences}
            onFileClick={onFileClick}
          />
        ) : null}
      </div>
    </motion.div>
  );
}

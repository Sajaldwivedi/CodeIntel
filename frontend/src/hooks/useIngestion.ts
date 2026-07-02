import { useCallback, useEffect, useRef, useState } from "react";

import { getIngestionStatus, subscribeIngestionEvents } from "@/api/ingestion";
import type { IngestionJob } from "@/types/ingestion";

interface Options {
  /** Poll every N ms when SSE is unavailable. */
  pollIntervalMs?: number;
}

export function useIngestionProgress(jobId: string | null, options: Options = {}) {
  const { pollIntervalMs = 2000 } = options;
  const [job, setJob] = useState<IngestionJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isActive = job?.stage !== "completed" && job?.stage !== "failed";
  const isComplete = job?.stage === "completed";
  const isFailed = job?.stage === "failed";

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      setError(null);
      return;
    }

    setError(null);
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    const handleUpdate = (update: IngestionJob) => {
      if (!cancelled) setJob(update);
    };

    // Try SSE first; fall back to polling on error.
    unsubscribe = subscribeIngestionEvents(
      jobId,
      handleUpdate,
      () => {
        if (cancelled || pollRef.current) return;
        pollRef.current = setInterval(async () => {
          try {
            const status = await getIngestionStatus(jobId);
            if (!cancelled) setJob(status);
            if (status.stage === "completed" || status.stage === "failed") {
              stopPolling();
            }
          } catch {
            if (!cancelled) setError("Lost connection to ingestion service.");
            stopPolling();
          }
        }, pollIntervalMs);
      },
    );

    return () => {
      cancelled = true;
      unsubscribe?.();
      stopPolling();
    };
  }, [jobId, pollIntervalMs, stopPolling]);

  return { job, error, isActive, isComplete, isFailed };
}

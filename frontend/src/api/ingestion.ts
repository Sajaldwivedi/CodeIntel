import { apiClient } from "@/api/client";
import type { GitHubIngestionRequest, IngestionJob, IngestionStartResponse } from "@/types/ingestion";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export async function startGitHubIngestion(
  body: GitHubIngestionRequest,
): Promise<IngestionStartResponse> {
  const { data } = await apiClient.post<IngestionStartResponse>("/ingestion/github", body);
  return data;
}

export async function startZipIngestion(file: File, name: string, owner = "local"): Promise<IngestionStartResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("name", name);
  form.append("owner", owner);

  const { data } = await apiClient.post<IngestionStartResponse>("/ingestion/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120_000,
  });
  return data;
}

export async function getIngestionStatus(jobId: string): Promise<IngestionJob> {
  const { data } = await apiClient.get<IngestionJob>(`/ingestion/${jobId}`);
  return data;
}

/** Open an SSE stream for real-time ingestion progress. */
export function subscribeIngestionEvents(
  jobId: string,
  onEvent: (job: IngestionJob) => void,
  onError?: (error: Event) => void,
): () => void {
  const url = `${baseURL}/ingestion/${jobId}/events`;
  const source = new EventSource(url);

  source.onmessage = (event) => {
    try {
      const job = JSON.parse(event.data) as IngestionJob;
      onEvent(job);
      if (job.stage === "completed" || job.stage === "failed") {
        source.close();
      }
    } catch {
      // Ignore malformed events.
    }
  };

  source.onerror = (event) => {
    onError?.(event);
    source.close();
  };

  return () => source.close();
}

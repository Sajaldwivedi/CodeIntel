import { HealthBadge } from "@/components/HealthBadge";
import { useHealth } from "@/hooks/useHealth";

/** Landing page. Verifies the frontend can reach the backend health endpoint. */
export function HomePage() {
  const { status, data, error, refetch } = useHealth();

  const badge =
    status === "success"
      ? { variant: "success" as const, label: `Backend: ${data?.status ?? "ok"}` }
      : status === "error"
        ? { variant: "error" as const, label: "Backend unreachable" }
        : { variant: "loading" as const, label: "Checking backend…" };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Graph-RAG + Code Intelligence
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          AI Software Engineer for GitHub Repositories
        </h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Production-grade platform scaffold. Frontend, backend, and databases are wired up and
          ready for the ingestion, embeddings, and retrieval phases.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <HealthBadge variant={badge.variant} label={badge.label} />

        {status === "error" && error && (
          <p className="max-w-md text-sm text-destructive">{error}</p>
        )}

        {status === "success" && data && (
          <p className="text-sm text-muted-foreground">
            {data.service} · v{data.version} · {data.environment}
          </p>
        )}

        <button
          type="button"
          onClick={refetch}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Re-check backend
        </button>
      </div>
    </main>
  );
}

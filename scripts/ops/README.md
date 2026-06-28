# Operations Scripts

Deployment, backup, and maintenance scripts for production environments.

## Planned Scripts

| Script                | Description                          |
|-----------------------|--------------------------------------|
| `backup-neo4j.sh`     | Export Neo4j database dump           |
| `backup-chroma.sh`    | Snapshot ChromaDB volume             |
| `health-check.sh`     | Verify all services are healthy      |
| `migrate-graph.sh`    | Run Neo4j schema migrations          |
| `cleanup-repos.sh`    | Remove stale cloned repositories     |

## Safety

- All destructive operations require `--confirm` flag
- Backup scripts timestamp output files
- Dry-run mode available via `--dry-run`

## Scheduling

Production maintenance scripts designed for cron execution:

```cron
0 2 * * * /app/scripts/ops/backup-neo4j.sh
0 3 * * * /app/scripts/ops/cleanup-repos.sh
```

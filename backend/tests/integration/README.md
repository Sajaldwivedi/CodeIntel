# Integration Tests

End-to-end tests against real infrastructure services running in Docker.

## Prerequisites

```bash
docker compose up -d neo4j chromadb redis
```

## Scope

- ChromaDB upsert and search round-trip
- Neo4j graph creation and Cypher queries
- Full indexing pipeline on fixture repository
- API endpoint smoke tests via TestClient
- Worker task execution against Redis queue

## Markers

All tests in this directory use `@pytest.mark.integration`.

Excluded from default CI unit test run; executed in a separate CI job with service containers.

## Cleanup

Each test cleans up its data (delete test repo from ChromaDB and Neo4j) in teardown fixtures.

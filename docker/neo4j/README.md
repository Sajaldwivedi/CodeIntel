# Neo4j Docker Config

Optional Neo4j customization for Docker deployment.

## Planned Contents

- `neo4j.conf` overrides (memory, query timeout)
- APOC plugin configuration
- Initial constraint/index Cypher scripts

## Default Setup

The root `docker-compose.yml` uses the official `neo4j:5-community` image with APOC plugin enabled via environment variable. Custom config in this directory is optional for advanced tuning.

## Initial Schema

Constraint and index creation scripts will run on first startup:

```cypher
CREATE CONSTRAINT repo_id IF NOT EXISTS FOR (r:Repository) REQUIRE r.id IS UNIQUE;
CREATE INDEX file_path IF NOT EXISTS FOR (f:File) ON (f.path);
```

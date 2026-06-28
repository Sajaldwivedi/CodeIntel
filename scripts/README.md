# Scripts

Development and operations utility scripts.

## Structure

| Directory | Purpose                              |
|-----------|--------------------------------------|
| `dev/`    | Local development helpers            |
| `ops/`    | Deployment and maintenance scripts   |

## Conventions

- Python scripts: run from project root with venv activated
- Shell scripts: include shebang, work on Linux/macOS/WSL
- All scripts documented with `--help` flag
- No secrets in scripts — read from environment

## Usage

```bash
# Examples (to be implemented)
./scripts/dev/setup.sh          # First-time dev environment setup
./scripts/dev/seed.sh           # Seed test data
./scripts/ops/backup-neo4j.sh   # Backup graph database
```

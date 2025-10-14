# Load Testing Toolkit

This Nx project provides k6-based load tests for the monorepo.

## Structure

- `scripts/` – k6 scenarios (smoke, load, regression)
- `config/` – environment-aware configuration helpers
- `docker/` – container assets for running tests in CI
- `reports/` – k6 output artifacts (HTML/JSON). A `.gitkeep` ensures the folder is versioned.

## Prerequisites

- Node.js 20.11.x (matches workspace engines requirement)
- k6 binary (optional for local runs). Docker usage does not require k6 locally.

## Running Tests (Local Binary)

```bash
npm run smoke    # short smoke test
```

## Running Tests (Docker)

```bash
npm run smoke:docker
```

The Docker commands build `docker/Dockerfile`, mount scripts/config, and write reports to `reports/`.

## Configuration

1. Create `.env.local` (ignored by git) to override defaults.
2. Environment variables fall back to workspace `.env`.
3. See `config/environments.js` for available settings.

## Reports

- Artifacts are saved to `reports/`.
- CI can archive this directory as a build artifact.

## Next Steps

- Fill in real endpoints in configuration.
- Expand scripts with business-specific scenarios.
- Integrate with CI/CD pipeline.

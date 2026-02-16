# GitHub Copilot Instructions

## Project Structure

```
gfw-microservices/
├── apps/
│   ├── webserver/          # Express.js web server (main application)
│   ├── microservices/      # NestJS microservices
│   │   ├── b2b/             # B2B API services
│   │   ├── externalapi/     # allow external user to access internal data and services
│   │   ├── externalapi-e2e/ # E2E tests for externalapi
│   │   ├── list-downloader/ # enable to download lists in various formats (CSV, GeoJSON, etc.)
│   │   └── list-processing/ # process lists (e.g., calculate area, remaining usage, etc.)
│   ├── gfwpro-e2e/         # Cypress E2E tests
│   └── load-testing/       # Load testing scripts
├── libs/
│   ├── shared/             # Shared utilities (subscription, limits, usage)
│   ├── sql/                # SQL queries, entities, and database utilities
│   ├── constants/          # Application constants
│   ├── aws/                # AWS integrations (S3, Lambda, etc.)
│   └── geo/                # Geospatial utilities
├── database/
│   ├── gfwpro/             # Main database schema and stored procedures
│   ├── clientstore/        # Client store database
│   └── scripts/            # Database migration scripts (YYYY-MM-DD-NN.sql)
└── tools/                  # Development tools and scripts
```

## Technology Stack

- **Backend**: Express.js (webserver), NestJS (microservices)
- **Database**: Microsoft SQL Server (MSSQL)
- **ORM**: TypeORM (for entities)
- **Testing**: Jest (unit tests), Cypress (E2E)
- **Build System**: Nx monorepo
- **Cloud**: AWS (S3, Lambda, Step Functions, Batch)

## Key Conventions

### Imports

- Use `@wri-monorepos/sql` for SQL utilities, queries, and entities
- Use `@wri-monorepos/shared` for shared subscription/limit utilities
- Use `@wri-monorepos/constants` for constants

### Testing

- Run tests: `npx nx test <project> --testFile=<filename>`
- Run tests by pattern: `npx nx test <project> --testPathPattern="<pattern>"`
- Format code: `npx nx format:write --files="<file-paths>"`

### Database Scripts

- Migration scripts go in `database/scripts/` with naming: `YYYY-MM-DD-NN.sql`
- SQL queries are TypeScript template strings in `libs/sql/src/lib/queries/`

## Notes

- Feature flags are managed via `featureFlagsService` from `@wri-monorepos/shared`
- Subscription types: Standard and Premium

### Determining the Scope

To determine which scope to use, analyze where most changes are located:

1. If most changes are in `apps/webserver/` → use `webserver`
2. If most changes are in `libs/shared/` → use `shared`
3. If most changes are in `libs/sql/` → use `sql`
4. If most changes are in `apps/microservices/list-processing/` → use `microservices-list-processing`
5. If most changes are in `apps/microservices/list-downloader/` → use `microservices-list-downloader`
6. If most changes are in `apps/microservices/externalapi/` → use `microservices-externalapi`
7. If most changes are in `libs/constants/` → use `constants`
8. If most changes are in `libs/aws/` → use `aws`
9. If most changes are in `libs/geo/` → use `geo`
10. If changes span multiple areas equally, use the most significant one

### Amending Commits

If you need to add formatting changes to an existing commit:

```bash
npx nx format:write --files="<comma-separated-file-paths>"
git add -A
git commit --amend --no-edit
git push --force-with-lease
```

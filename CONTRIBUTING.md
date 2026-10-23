# Contributing

Thanks for your interest in contributing to this repository.

## Prerequisites

- Node.js `24.22.1`
- npm
- Docker (required for local Redis when running webserver)

Install dependencies:

```sh
npm install --legacy-peer-deps
```

## Local Development

Create your environment file(s) as described in [README.md](README.md).

### HTTP Client Environment Files

For local testing with REST clients, copy the example template:

```sh
cp apps/webserver/src/test/http-client.private.env.example.json apps/webserver/src/test/http-client.private.env.json
```

Then add your test tokens to `http-client.private.env.json` (this file is git-ignored).

Common commands:

```sh
npx nx serve webserver
npx nx serve microservices-list-processing
npx nx serve microservices-list-downloader
npx nx serve microservices-externalapi
```

## Testing, Linting, and Formatting

Run relevant checks before opening a pull request:

```sh
npx nx test <project>
npx nx lint <project>
npx nx format:write --files="<comma-separated-files>"
```

## Commit Message Convention

This repository uses commitlint. Use this format:

```text
type(scope): subject
```

Typical types:

- `feat`
- `fix`
- `refactor`
- `test`
- `docs`
- `chore`

Use an Nx-related scope when possible (for example: `webserver`, `sql`, `shared`, `microservices-list-processing`).

## Pull Requests

Before opening a PR:

1. Rebase your branch on `develop`.
2. Ensure tests/lint/format pass for changed code.
3. Include a clear description, testing notes, and linked issue/ticket.
4. Keep changes focused and reviewable.

## Sensitive Data

Do not commit secrets, API keys, private certificates, or credentials.

- Use local environment files and secret stores.
- Redact sensitive values in docs, test fixtures, and examples.

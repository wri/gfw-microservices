# GFW Microservices Release Management Scripts

This repository contains a collection of bash scripts for managing releases and branches for the GFW (Global Forest Watch) microservices project.

## Prerequisites

Before using these scripts, ensure you have the following installed:

- **Git** - For repository operations
- **GitHub CLI (gh)** - For GitHub API interactions
- **Bash** - For script execution

### Installing GitHub CLI

```bash
# macOS (using Homebrew)
brew install gh

# Ubuntu/Debian
sudo apt install gh

# Or download from: https://cli.github.com/
```

### Authenticating with GitHub

```bash
gh auth login
```

## Scripts Overview

### 1. `create-release-candidate.sh`

Creates a release candidate branch by cherry-picking specific PRs from the develop branch.

**Usage:**
```bash
./create-release-candidate.sh <sprint_number> <last_pr> <cherry_picks>
```

**Parameters:**
- `sprint_number` - Sprint number (e.g., 80)
- `last_pr` - Last PR number (e.g., 1985)
- `cherry_picks` - Comma-separated list of PRs to cherry-pick

**Example:**
```bash
./create-release-candidate.sh 80 1985 "1988,1991,1995,2002,TODO: 2008,2011"
```

**Features:**
- Automatically clones the repository
- Creates a release candidate branch (`release-candidate-{sprint_number}`)
- Cherry-picks specified PRs
- Skips PRs marked with `TODO:` prefix
- Handles conflicts gracefully
- Pushes the branch to remote

**Output:**
- Creates branch: `release-candidate-{sprint_number}`
- Provides branch URL for easy access
- Shows summary of processed cherry-picks

### 2. `create-release.sh`

Creates release tags and GitHub releases for specified microservices and environments.

**Usage:**
```bash
./create-release.sh [branch] [microservice] [environment]
```

**Parameters:**
- `branch` - Source branch (default: `develop`)
- `microservice` - Service name or `ALL` (default: `ALL`)
- `environment` - Environment: `QA`, `STG`, or `PROD` (default: `QA`)

**Examples:**
```bash
# Create releases for all services in QA environment from develop branch
./create-release.sh

# Create release for LP service in STG environment from release-candidate-80
./create-release.sh release-candidate-80 LP STG

# Create releases for all services in PROD environment
./create-release.sh develop ALL PROD

# Create release for WEB service only
./create-release.sh develop WEB QA
```

**Supported Microservices:**
- `WEB` - Web service
- `LP` - Landing Page service
- `EAPI` - External API service
- `LD` - Landing service
- `ALL` - All services (default)

**Tag Format:**
- Format: `{SERVICE}-{ENV}-V{NNN}`
- Examples: `WEB-QA-V001`, `LP-STG-V002`, `EAPI-PROD-V003`

**Features:**
- Automatically increments version numbers
- Creates both Git tags and GitHub releases
- Supports multiple environments
- Handles individual or all services

### 3. `delete-old-branches.sh`

Deletes branches older than a specified number of months to keep the repository clean.

**Usage:**
```bash
./delete-old-branches.sh [OPTIONS]
```

**Options:**
- `-d, --dry-run` - Show what would be deleted without actually deleting
- `-m, --months N` - Number of months old (default: 2)
- `-h, --help` - Show help message

**Examples:**
```bash
# Delete branches older than 2 months (default)
./delete-old-branches.sh

# Dry run to see what would be deleted
./delete-old-branches.sh --dry-run

# Delete branches older than 3 months
./delete-old-branches.sh --months 3

# Dry run for branches older than 1 month
./delete-old-branches.sh -d -m 1
```

**Protected Branches:**
The following branches are never deleted:
- `main`
- `master`
- `develop`
- `development`
- `staging`
- `production`

**Features:**
- Analyzes both local and remote branches
- Focuses on `release-candidate-*` branches for remote deletion
- Provides detailed colored output
- Interactive confirmation before deletion
- Cross-platform date handling (macOS/Linux)
- Automatic cleanup of stale remote tracking branches

## Workflow Examples

### Complete Release Process

1. **Create Release Candidate:**
   ```bash
   ./create-release-candidate.sh 80 1985 "1988,1991,1995,2002"
   ```

2. **Test the Release Candidate:**
   - Review the created branch
   - Run tests and validation

3. **Create Release Tags:**
   ```bash
   ./create-release.sh release-candidate-80 ALL QA
   ```

4. **Promote to Production:**
   ```bash
   ./create-release.sh release-candidate-80 ALL PROD
   ```

5. **Clean Up Old Branches:**
   ```bash
   ./delete-old-branches.sh --dry-run  # Review first
   ./delete-old-branches.sh            # Actually delete
   ```

### Sprint Planning

```bash
# Create release candidate for sprint 81
./create-release-candidate.sh 81 2000 "2003,2005,2008,TODO: 2010"

# Create QA releases
./create-release.sh release-candidate-81 ALL QA

# After testing, create staging releases
./create-release.sh release-candidate-81 ALL STG

# Finally, create production releases
./create-release.sh release-candidate-81 ALL PROD
```

### Getting Help

Each script includes built-in help:
```bash
./create-release-candidate.sh
./create-release.sh
./delete-old-branches.sh --help
```
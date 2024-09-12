# Release Automation Script

This script automates the process of creating release tags and GitHub releases for multiple microservices. It clones the repository, creates release tags, pushes them, and then creates GitHub releases. Finally, it cleans up by removing the cloned repository.

## Prerequisites

- **Git**: Ensure Git is installed and configured on your machine.
- **GitHub CLI (gh)**: Install the GitHub CLI tool from [here](https://cli.github.com/).
- **SSH Access**: Ensure you have SSH access to the GitHub repository.

## Usage

```bash
./create-release.sh [branch] [microservice] [environment]
```

### Parameters

- `branch` (optional): The branch to clone. Default is `develop`.
- `microservice` (optional): The microservice to create a release for. Options are `LD`, `LP`, `WEB`, `EAPI`, or `ALL`. Default is `ALL`.
- `environment` (optional): The environment for the release. Default is `QA`.

### Example

To create releases for all microservices on the `develop` branch in the `QA` environment:

```bash
./create-release.sh develop ALL QA
```

To create a release for the `LD` microservice on the `main` branch in the `PROD` environment:

```bash
./create-release.sh main LD PROD
```

## Script Details

### Functions

#### `create_release`

This function creates a new release tag and GitHub release for a specified microservice and environment.

- **Parameters**:
  - `service`: The microservice name (e.g., `LD`, `LP`, `WEB`, `EAPI`).
  - `env`: The environment (e.g., `QA`, `PROD`).

### Steps

1. **Clone the Repository**: The script clones the specified branch of the repository.
2. **Create Releases**: Based on the input parameters, the script creates release tags and GitHub releases for the specified microservices.
3. **Cleanup**: The script removes the cloned repository to clean up.

### Cleanup

The script includes a cleanup step to remove the cloned repository after the releases have been created:

```bash
cd ..
rm -rf gfw-microservices-release
```

## Notes

- Ensure you have the necessary permissions to create tags and releases in the GitHub repository.
- The script assumes the repository URL is `git@github.com:wri/gfw-microservices.git`. Modify this URL if your repository is different.

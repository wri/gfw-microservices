#!/bin/bash

set -euo pipefail

# Configurable variables
REPO_URL="git@github.com:wri/gfw-microservices.git"
CLONE_DIR="gfw-microservices-release"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Usage message
usage() {
  echo -e "${YELLOW}Usage: $0 [branch] [microservice] [environment]${NC}"
  echo "Example: $0 release-candidate-76 LP STG"
  exit 1
}

# Check for required tools
for tool in git gh; do
  if ! command -v $tool &>/dev/null; then
    echo -e "${RED}Error: '$tool' is required but not installed.${NC}"
    exit 1
  fi
done

# Input parameters
branch="${1:-develop}"
microservice="${2:-ALL}"
environment="${3:-QA}"

# Validate environment
if [[ "$environment" != "QA" && "$environment" != "STG" && "$environment" != "PROD" ]]; then
  echo -e "${RED}Error: Invalid environment '$environment'. Allowed values are QA, STG, PROD.${NC}"
  usage
fi

# Function to create a release tag using GitHub CLI
create_release() {
  local service="$1"
  local env="$2"

  echo -e "${YELLOW}Processing $service for $env...${NC}"

  latest_tag=$(git tag -l "${service}-${env}-V*" | sort -V | tail -n 1)
  if [ -z "$latest_tag" ]; then
    new_tag="${service}-${env}-V001"
  else
    new_tag_num=$(echo "$latest_tag" | grep -oE '[0-9]+$')
    new_tag_num=$(printf "%03d" $((10#$new_tag_num + 1)))
    new_tag="${service}-${env}-V${new_tag_num}"
  fi

  # Check if tag already exists remotely
  if git ls-remote --tags origin | grep -q "refs/tags/$new_tag$"; then
    echo -e "${RED}Tag $new_tag already exists remotely. Skipping.${NC}"
    return
  fi

  # Create a new tag and push it
  git tag -a "$new_tag" -m "Release for $service"
  git push origin "$new_tag"

  # Create a release using GitHub CLI with error handling
  if gh release view "$new_tag" &>/dev/null; then
    echo -e "${YELLOW}Release for $new_tag already exists on GitHub. Skipping creation.${NC}"
  else
    if gh release create "$new_tag" --title "Release $new_tag" --notes "Release for $service in $env environment"; then
      echo -e "${GREEN}Created release: $new_tag${NC}"
    else
      echo -e "${RED}Error: Failed to create GitHub release for $new_tag.${NC}"
      exit 1
    fi
  fi
}

# Cleanup function
cleanup() {
  if [[ -d "$CLONE_DIR" ]]; then
    rm -rf "$CLONE_DIR"
    echo -e "${GREEN}Cleaned up $CLONE_DIR${NC}"
  fi
}
trap cleanup EXIT

# Clone the repository
if [[ -d "$CLONE_DIR" ]]; then
  echo -e "${YELLOW}Directory $CLONE_DIR already exists. Removing...${NC}"
  rm -rf "$CLONE_DIR"
fi

echo -e "${YELLOW}Cloning $REPO_URL (branch: $branch)...${NC}"
git clone --branch "$branch" --depth 1 "$REPO_URL" "$CLONE_DIR"
cd "$CLONE_DIR"
git pull --tags

# Create releases based on the microservice input
declare -a services=("WEB" "LP" "EAPI" "LD")
if [[ "$microservice" == "ALL" ]]; then
  for svc in "${services[@]}"; do
    create_release "$svc" "$environment"
  done
else
  if [[ " ${services[*]} " == *" $microservice "* ]]; then
    create_release "$microservice" "$environment"
  else
    echo -e "${RED}Error: Invalid microservice '$microservice'. Allowed: ${services[*]} or ALL.${NC}"
    usage
  fi
fi

echo -e "${GREEN}All done!${NC}"
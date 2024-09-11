#!/bin/bash

# Function to create a release tag using GitHub CLI
create_release() {
  local service=$1
  local env=$2

  latest_tag=$(git tag -l "${service}-${env}-V*" | sort -V | tail -n 1)
  if [ -z "$latest_tag" ]; then
    new_tag="${service}-${env}-V001"
  else
    new_tag_num=$(echo $latest_tag | sed 's/[^0-9]*//g')
    new_tag_num=$(printf "%03d" $((10#$new_tag_num + 1)))
    new_tag="${service}-${env}-V$new_tag_num"
  fi

  # Create a new tag and push it using GitHub CLI
  git tag -a $new_tag -m "Release for $service"
  git push origin $new_tag

  # Create a release using GitHub CLI
  gh release create $new_tag --title "Release $new_tag" --notes "Release for $service in $env environment"
  echo "Created release: $new_tag"
}

# Input parameters
branch=${1:-develop}
microservice=${2:-ALL}
environment=${3:-QA}

# Checkout the repository
git clone --branch $branch --depth 1 git@github.com:wri/gfw-microservices.git gfw-microservices-release
cd gfw-microservices-release

# Create releases based on the microservice input
if [[ "$microservice" == "LD" || "$microservice" == "ALL" ]]; then
  create_release "LD" $environment
fi

if [[ "$microservice" == "LP" || "$microservice" == "ALL" ]]; then
  create_release "LP" $environment
fi

if [[ "$microservice" == "WEB" || "$microservice" == "ALL" ]]; then
  create_release "WEB" $environment
fi

if [[ "$microservice" == "EAPI" || "$microservice" == "ALL" ]]; then
  create_release "EAPI" $environment
fi

# Cleanup: Remove the cloned repository
cd ..
rm -rf gfw-microservices-release

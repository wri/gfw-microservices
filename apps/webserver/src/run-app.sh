#!/bin/bash

if [ "$NODE_ENV" == "production" ] || [ "$NODE_ENV" == "ProdV2" ]; then
  npm run webpack:build:production
elif [ "$NODE_ENV" == "staging" ]; then
  npm run webpack:build:staging
elif [ "$NODE_ENV" == "qa" ]; then
  npm run webpack:build:qa
#else
  #  For development run with npm.
  #  npm run webpack:build:dev
fi

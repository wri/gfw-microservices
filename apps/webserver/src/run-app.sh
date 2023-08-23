#!/bin/bash

if [ "$NODE_ENV" == "production" ] || [ "$NODE_ENV" == "ProdV2" ]; then
  node node_modules/webpack/bin/webpack.js --merge --config ./config/webpack.config.js --config ./config/webpack.production.config.js
elif [ "$NODE_ENV" == "staging" ]; then
  node node_modules/webpack/bin/webpack.js --merge --config ./config/webpack.config.js --config ./config/webpack.staging.config.js
elif [ "$NODE_ENV" == "qa" ]; then
  node node_modules/webpack/bin/webpack.js --merge --config ./config/webpack.config.js --config ./config/webpack.qa.config.js
#else
  #  For development run with npm.
  #  npm run webpack:build:dev
fi

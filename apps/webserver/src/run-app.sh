#!/bin/bash

# the webpack.config.ts is converted to .js for qa, stg and prod
if [ "$NODE_ENV" == "production" ] || [ "$NODE_ENV" == "ProdV2" ]; then
  node --max-old-space-size=8192 ../../../node_modules/webpack/bin/webpack.js --merge --config ./config/webpack.config.js --config ./config/webpack.production.config.js
elif [ "$NODE_ENV" == "staging" ]; then
  node --max-old-space-size=8192 ../../../node_modules/webpack/bin/webpack.js --merge --config ./config/webpack.config.js --config ./config/webpack.staging.config.js
elif [ "$NODE_ENV" == "qa" ]; then
  node --max-old-space-size=8192 ../../../node_modules/webpack/bin/webpack.js --merge --config ./config/webpack.config.js --config ./config/webpack.qa.config.js
#else
  #  For development happens automatically from webserver at initial startup and on file changes
fi

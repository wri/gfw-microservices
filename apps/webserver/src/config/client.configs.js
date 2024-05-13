const glob = require('glob');
const path = require('path');
const assets = require('./assets');

const clientBuild = glob.sync(assets.build).map((conf) => require(path.resolve(conf)));

// Merge all the entries together
const entries = clientBuild.reduce((all, conf) => Object.assign(all, conf.webpack.entry), {});

// Merge all the aliases together
const aliases = clientBuild.reduce((all, conf) => Object.assign(all, conf.webpack.alias), {});

// Resolve their paths
for (const key in entries) {
  entries[key] = path.resolve(entries[key]);
}
for (const key in aliases) {
  aliases[key] = path.resolve(aliases[key]);
}

module.exports = {
  entries,
  aliases,
  clientBuild,
};

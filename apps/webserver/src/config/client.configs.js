const glob = require('glob');
const fs = require('fs');
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

// Client webpack can run from source (`apps/webserver/src`) or compiled dist paths.
// Resolve the constants alias from the first existing candidate path.
const constantsAliasCandidates = [
  path.resolve(process.cwd(), '../../../libs/constants/src/index.ts'),
  path.resolve(process.cwd(), '../../../../../../libs/constants/src/index.ts'),
  path.resolve(__dirname, '../../../../../../libs/constants/src/index.ts'),
  path.resolve(__dirname, '../../../../../../../libs/constants/src/index.ts'),
];

const resolvedConstantsAlias = constantsAliasCandidates.find((candidate) =>
  fs.existsSync(candidate)
);

if (resolvedConstantsAlias) {
  aliases['@wri-monorepos/constants'] = resolvedConstantsAlias;
}

module.exports = {
  entries,
  aliases,
  clientBuild,
};

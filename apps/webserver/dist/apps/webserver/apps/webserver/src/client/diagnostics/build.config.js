/**
 * @name exports
 * @static
 * @summary Build configurations for manager page modules
 */
module.exports = {
  webpack: {
    alias: {
      diagnostics: 'client/diagnostics',
    },
    entry: {
      diagnostics: 'client/diagnostics/index.js',
    },
  },
};

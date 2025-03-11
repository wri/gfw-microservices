/**
 * @name exports
 * @static
 * @summary Build configurations for B2B page modules
 */
module.exports = {
  webpack: {
    alias: {
      b2b: 'client/b2b',
    },
    entry: {
      b2b: 'client/b2b/index.jsx',
    },
  },
};

/**
 * @name exports
 * @static
 * @summary Build configurations for select page modules
 */
module.exports = {
  webpack: {
    alias: {
      select: 'client/select',
    },
    entry: {
      select: 'client/select/index.js',
    },
  },
};

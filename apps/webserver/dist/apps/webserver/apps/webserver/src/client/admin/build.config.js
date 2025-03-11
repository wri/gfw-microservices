/**
 * @name exports
 * @static
 * @summary Build configurations for admin page modules
 */
module.exports = {
  webpack: {
    alias: {
      admin: 'client/admin',
    },
    entry: {
      admin: 'client/admin/index.js',
    },
  },
};

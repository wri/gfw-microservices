/**
 * @name exports
 * @static
 * @summary Test environment configurations
 */

module.exports = {
  port: 3000,
  sessionVars: {
    secret: 'anything',
  },
  devTestUserAuthSecret: 'unsafe',
};

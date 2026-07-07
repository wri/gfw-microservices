/**
 * @name exports
 * @static
 * @summary Test environment configurations
 */

module.exports = {
  port: 3000,
  sessionVars: {
    secret: process.env.SESSION_SECRET || 'not-a-secret-test-session-secret',
  },
  devTestUserAuthSecret: 'unsafe',
};

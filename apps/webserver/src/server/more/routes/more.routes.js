const controller = require('../controllers/more.controller');

module.exports = (app) => {
  app.get('/more', controller.more);
};

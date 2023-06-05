const path = require('path');
const controller = require('../controllers/about.controller');

module.exports = (app) => {
  app.get('/about', controller.about);
};

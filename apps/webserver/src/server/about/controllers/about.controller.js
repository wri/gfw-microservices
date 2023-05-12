const path = require('path');
const { createElement } = require('react');
const { renderToString } = require('react-dom/server');
const { compiledAssets } = require(path.resolve('./config/config'));

exports.about = (req, res) => {
  const markup = compiledAssets.js['login-component']
    ? renderToString(createElement(compiledAssets.js['login-component'].default))
    : '';
  res.render('about', {
    critical: compiledAssets.css['login/css/login.scss'],
    common: compiledAssets.js.common,
    aboutjs: compiledAssets.js.about,
    aboutcss: compiledAssets.css.about,
    markup: markup,
  });
};

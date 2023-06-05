const path = require('path');
const { createElement } = require('react');
const { renderToString } = require('react-dom/server');
const { compiledAssets } = require(path.resolve('./config/config'));
const page = 'more';

exports[page] = (req, res) => {
  const markup = compiledAssets.js['login-component']
    ? renderToString(createElement(compiledAssets.js['login-component'].default))
    : '';

  res.render(page, {
    critical: compiledAssets.css['login/css/login.scss'],
    common: compiledAssets.js.common,
    indexjs: compiledAssets.js[page],
    indexcss: compiledAssets.css[page],
    markup: markup,
  });
};

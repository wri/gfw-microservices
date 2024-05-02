const { createElement } = require('react');
const { renderToString } = require('react-dom/server');
import config from '../../../config/config';
const { compiledAssets } = config;
const page = 'more';

export const more = (req, res) => {
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


const loaders = {

  loadCSS: url => {
    const sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.type = 'text/css';
    sheet.href = url;
    requestAnimationFrame(function () { document.getElementsByTagName('head')[0].appendChild(sheet); });
  },

  loadJS: (url, async) => {
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = async || false;
      script.id = 'loader-gfw';
      script.onload = resolve;
      script.onerror = reject;
      script['data-current'] = 'gfw-water';
      requestAnimationFrame(function () { document.getElementsByTagName('head')[0].appendChild(script); });
    });
    return promise;
  }

};

export const loadCSS = loaders.loadCSS;
export const loadJS = loaders.loadJS;

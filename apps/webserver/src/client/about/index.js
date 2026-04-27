import { render } from 'react-dom';
import { useEffect, useState } from 'react';

import { ThemeProvider } from '../styles';
import About from './component/About';
import { GFW_PRO_USER_GUIDE } from '../common/js/config';
import { BrowserRouter } from 'react-router-dom';

const App = () => {
  const [languageCode, setLanguageCode] = useState('en');
  const [userGuideLink, setUserGuideLink] = useState(GFW_PRO_USER_GUIDE);

  useEffect(() => {
    if (window.Transifex?.live?.onReady) {
      window.Transifex.live.onReady(() => {
        const selectedLanguageCode = window.Transifex?.live?.getSelectedLanguageCode?.() || 'en';
        setLanguageCode(selectedLanguageCode);
        setUserGuideLink(GFW_PRO_USER_GUIDE);
      });
    }
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <About key={languageCode} userGuideLink={userGuideLink} />
      </BrowserRouter>
    </ThemeProvider>
  );
};

render(<App />, document.getElementById('page-mount'));

if (module.hot) {
  module.hot.accept();
}

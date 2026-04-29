import { render } from 'react-dom';
import { useEffect, useState } from 'react';

import More from './component/More';
import { GFW_PRO_HELP_CENTER__LINK } from '../common/js/config';
import { ThemeProvider } from '../styles';

const App = () => {
  const [languageCode, setLanguageCode] = useState('en');
  const [userGuideLink, setUserGuideLink] = useState(GFW_PRO_HELP_CENTER__LINK);
  useEffect(() => {
    if (window.Transifex?.live?.onReady) {
      window.Transifex.live.onReady(() => {
        const selectedLanguageCode = window.Transifex?.live?.getSelectedLanguageCode?.() || 'en';
        setLanguageCode(selectedLanguageCode);
        setUserGuideLink(GFW_PRO_HELP_CENTER__LINK);
      });
    }
  });

  return (
    <ThemeProvider>
      <More languageCode={languageCode} userGuideLink={userGuideLink} />
    </ThemeProvider>
  );
};

render(<App />, document.getElementById('page-mount'));

if (module.hot) {
  module.hot.accept();
}

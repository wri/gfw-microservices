import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import About from './component/About';
import { GFW_PRO_USER_GUIDE } from '../common/js/config';

const App = () => {
  const [languageCode, setLanguageCode] = useState('en');
  const [userGuideLink, setUserGuideLink] = useState(GFW_PRO_USER_GUIDE);
  useEffect(() => {
    if (Transifex) {
      Transifex.live.onReady(() => {
        const selectedLanguageCode = Transifex.live.getSelectedLanguageCode();
        setLanguageCode(selectedLanguageCode);
        setUserGuideLink(GFW_PRO_USER_GUIDE);
      });
    }
  });

  return (
    <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
      <BrowserRouter>
        <About key={languageCode} userGuideLink={userGuideLink} />
      </BrowserRouter>
    </MuiThemeProvider>
  );
};

const container = document.getElementById('page-mount');
const root = createRoot(container);
root.render(<App />);

if (module.hot) {
  module.hot.accept();
}

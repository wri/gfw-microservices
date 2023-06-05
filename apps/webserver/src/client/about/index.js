import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { render } from 'react-dom';
import React, { useEffect, useState } from 'react';
import About from './component/About';
import { GFW_PRO_USER_GUIDE } from '../common/js/config';

const App = () => {
  const [languageCode, setLanguageCode] = useState('en');
  const [userGuideLink, setUserGuideLink] = useState(GFW_PRO_USER_GUIDE);
  useEffect(() => {
    if (Transifex) {
      Transifex.live.onReady((languages) => {
        const selectedLanguageCode = Transifex.live.getSelectedLanguageCode();
        setLanguageCode(selectedLanguageCode);
        setUserGuideLink(GFW_PRO_USER_GUIDE);
      });
    }
  });

  return (
    <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
      <About key={languageCode} userGuideLink={userGuideLink} />
    </MuiThemeProvider>
  );
};

render(<App />, document.getElementById('page-mount'));

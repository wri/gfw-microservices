import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { render } from 'react-dom';
import React, { useEffect, useState } from 'react';
import More from './component/More';
import { GFW_PRO_HELP_CENTER__LINK } from '../common/js/config';

const App = () => {
  const [languageCode, setLanguageCode] = useState('en');
  const [userGuideLink, setUserGuideLink] = useState(GFW_PRO_HELP_CENTER__LINK);
  useEffect(() => {
    if (Transifex) {
      Transifex.live.onReady((languages) => {
        const selectedLanguageCode = Transifex.live.getSelectedLanguageCode();
        setLanguageCode(selectedLanguageCode);
        setUserGuideLink(GFW_PRO_HELP_CENTER__LINK);
      });
    }
  });

  return (
    <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
      <More languageCode={languageCode} userGuideLink={userGuideLink} />
    </MuiThemeProvider>
  );
};

render(<App />, document.getElementById('page-mount'));

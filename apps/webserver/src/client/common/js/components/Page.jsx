import React from 'react';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Header from './Header';

// - Set the user agent so server rendering works
lightBaseTheme.userAgent = 'all';
lightBaseTheme.fontFamily = 'Fira Sans, sans-serif';

const noHeaderPages = ['account', 'verify', 'forgot', 'reset', 'admin', 'select']; // TODO: use this and figure out who else does not want it:

function Page(props) {
  const { active, children } = props;
  return (
    <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
      <div className="app">
        {!noHeaderPages.includes(active) && <Header {...props} />}
        <div className="app__body">{children}</div>
        <div id="footerGfw" className={`${active === 'login' ? '' : 'hidden'}`} />
      </div>
    </MuiThemeProvider>
  );
}

export default Page;

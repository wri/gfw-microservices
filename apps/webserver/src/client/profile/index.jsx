import { render } from 'react-dom';
import './css/profile.scss';

import Page from '../common/js/components/Page';
import ProfileContextProvider from './js/ProfileStateContext';
import Profile from './js/Profile';
import AppErrorFallback from '../common/js/components/Errors/AppErrorFallback';
import { ThemeProvider } from '../styles';

const pageOptions = {
  links: {
    logout: true,
  },
};

function App() {
  return (
    <ThemeProvider>
      <AppErrorFallback>
        <Page links={pageOptions.links} active="profile">
          <ProfileContextProvider>
            <Profile />
          </ProfileContextProvider>
        </Page>
      </AppErrorFallback>
    </ThemeProvider>
  );
}

render(<App />, document.getElementById('profile-mount'));

if (module.hot) {
  module.hot.accept();
}

import { render } from 'react-dom';
import Page from '../common/js/components/Page';
import ProfileContextProvider from './js/ProfileStateContext';
import Profile from './js/Profile';
import './css/profile.scss';
import AppErrorFallback from '../common/js/components/Errors/AppErrorFallback';

const pageOptions = {
  links: {
    logout: true,
  },
};

function App() {
  return (
    <AppErrorFallback>
      <Page links={pageOptions.links} active="profile">
        <ProfileContextProvider>
          <Profile />
        </ProfileContextProvider>
      </Page>
    </AppErrorFallback>
  );
}

render(<App />, document.getElementById('profile-mount'));

if (module.hot) {
  module.hot.accept();
}

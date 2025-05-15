import { createRoot } from 'react-dom/client';
import './css/profile.scss';

import Page from '../common/js/components/Page';
import ProfileContextProvider from './js/ProfileStateContext';
import Profile from './js/Profile';
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

const container = document.getElementById('profile-mount');
const root = createRoot(container);
root.render(<App />);

if (module.hot) {
  module.hot.accept();
}

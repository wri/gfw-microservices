import React from 'react';
import { render } from 'react-dom';
import Page from '../common/js/components/Page';
import ProfileContextProvider from './js/ProfileStateContext';
import Profile from './js/Profile';
import './css/profile.scss';

const pageOptions = {
  links: {
    logout: true,
  },
};

function App() {
  return (
    <Page links={pageOptions.links} active="profile">
      <ProfileContextProvider>
        <Profile />
      </ProfileContextProvider>
    </Page>
  );
}

render(<App />, document.getElementById('profile-mount'));

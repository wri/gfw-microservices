/* global userID */
import { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { CircularProgress } from '@mui/material';

import UserProfile from './js/components/UserProfile';
import Page from '../common/js/components/Page';
import { ThemeProvider } from '../styles';

const pageOptions = {
  links: {
    logout: true,
  },
};

const newEmptyUser = {
  users: [],
  userInfo: {},
  classifications: [],
  commodities: [],
  geographies: [],
  titles: [],
  userToEdit: {},
};

function App() {
  const [userProfileData, setUserProfileData] = useState(newEmptyUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const url = userID ? `/user-profile-data/${userID}` : '/user-profile-data/new';

    fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserProfileData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  }, []);

  const {
    users,
    userInfo,
    classifications,
    commodities,
    geographies,
    titles,
    userToEdit = {},
  } = userProfileData ?? {};

  return (
    <ThemeProvider>
      {isLoading ? (
        <div
          style={{
            display: 'flex',
            width: '100vw',
            height: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress color="success" />
        </div>
      ) : (
        <Page links={pageOptions.links} active="profile">
          <UserProfile
            users={users}
            userInfo={userInfo}
            userOnly={users.length === 0}
            classificationsData={classifications}
            commoditiesData={commodities}
            geographiesData={geographies}
            titlesData={titles}
            currentUser={userToEdit}
          />
        </Page>
      )}
    </ThemeProvider>
  );
}

render(<App />, document.getElementById('user-profile-mount'));

if (module.hot) {
  module.hot.accept();
}

import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import CircularProgress from '@mui/material/CircularProgress';
import UserProfile from './js/components/UserProfile';
import Page from '../common/js/components/Page';

lightBaseTheme.fontFamily = 'Fira Sans, sans-serif';

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
    // if userID is null a new user is being created
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
      });
  }, []);

  const { users, userInfo, classifications, commodities, geographies, titles, userToEdit = {} } = userProfileData ?? {};

  return (
    <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
      {isLoading ? (
        <div
          style={{ display: 'flex', width: '100vw', height: '100vh', alignItems: 'center', justifyContent: 'center' }}
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
    </MuiThemeProvider>
  );
}

render(<App />, document.getElementById('user-profile-mount'));

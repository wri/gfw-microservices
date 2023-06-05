import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Page from '../common/js/components/Page';
import Profile from './js/Profile';

const pageOptions = {
  links: {
    logout: true,
  },
};

function App() {
  const [profileInfo, setProfileInfo] = useState();
  useEffect(() => {
    fetch('/profile/info/', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfileInfo(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const {
    organization,
    userInfo,
    users,
    classifications,
    commodities,
    geographies,
    titles,
    policyList,
  } = profileInfo ?? {};
  const isLoading = !profileInfo;

  if (!isLoading && !users?.length) {
    window.location.href = `/user-profile?user_id=${userInfo.id}`;
  }

  return (
    <Page links={pageOptions.links} active="profile">
      {isLoading || (!isLoading && !users?.length) ? (
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
        <div className="profile-page">
          <Profile
            organization={organization}
            userInfo={userInfo}
            users={users}
            classificationsData={classifications}
            commoditiesData={commodities}
            geographiesData={geographies}
            titlesData={titles}
            policyList={policyList}
          />
        </div>
      )}
    </Page>
  );
}

render(<App />, document.getElementById('profile-mount'));

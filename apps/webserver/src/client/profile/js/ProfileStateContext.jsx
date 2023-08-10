import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const Loading = () => {
  const loadingStyles = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    zIndex: 1,
  };
  return (
    <Box sx={loadingStyles}>
      <CircularProgress color="success" />
    </Box>
  );
};

const ProfileStateContext = createContext();

export function useProfileContext() {
  return useContext(ProfileStateContext);
}

export default function ProfileContextProvider({ children }) {
  const [profileInfo, setProfileInfo] = useState();
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchProfileInfo = useCallback(() => {
    fetch('/profile/info', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfileInfo(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    fetchProfileInfo();
  }, []);

  return (
    <ProfileStateContext.Provider
      value={{
        organization,
        userInfo,
        users,
        classifications,
        commodities,
        geographies,
        titles,
        policyList,
      }}
    >
      {isLoading ? <Loading /> : children}
    </ProfileStateContext.Provider>
  );
}

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import Loading from '../../common/js/components/Loaders/Loading';

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
    accountRenewalTime,
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
        accountRenewalTime,
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

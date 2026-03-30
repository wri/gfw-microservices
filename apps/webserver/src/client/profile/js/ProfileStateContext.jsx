import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { LoadingModal } from '../../components';

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
      {isLoading ? <LoadingModal isLoading={true} /> : children}
    </ProfileStateContext.Provider>
  );
}

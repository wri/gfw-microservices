import { useState, useCallback, useEffect } from 'react';
import Locations from '../Locations';
import ModalLoader from '../../../../common/js/components/Loaders/ModalLoader';
import errorLogger from '../../../../common/js/utils/errorLogger';

const LocationsPage = ({ userInfo }) => {
  const [locationsData, setLocationsData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchInitialData = useCallback(() => {
    fetch('/api/locations', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const {
          templateDropdowns,
          locationCount,
          gfwLists,
          accountUsers,
          userSharedLists,
          orgLists,
          userLists,
          listStatuses,
        } = data;

        setLocationsData({
          templateDropdowns,
          locationCount,
          gfwLists,
          accountUsers,
          userSharedLists,
          orgLists,
          userLists,
          listStatuses,
        });
        setIsLoading(false);
      })
      .catch((error) => {
        errorLogger.error('Error fetching initial locations data', {
          component: 'LocationsPage',
          action: 'fetchInitialData',
          error,
        });
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const { locationCount, gfwLists, accountUsers, userSharedLists, userLists } = locationsData;

  return isLoading ? (
    <ModalLoader open={true} />
  ) : (
    <Locations
      userLists={userLists} //Contains all lists that users have created
      userSharedLists={userSharedLists}
      locationCount={locationCount}
      userInfo={userInfo}
      usersList={accountUsers} //Contains all users
      gfwLists={gfwLists}
    />
  );
};

export default LocationsPage;

import { useState, useCallback, useEffect } from 'react';
import Locations from '../Locations';
import ModalLoader from '../../../../common/js/components/Loaders/ModalLoader';

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
        console.log(error);
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

import React, { useState, useEffect } from 'react';
import UserProfile from './UserProfile';

function UserDetailSection({ isLoading, setIsLoading, organizationId, userId }) {
  const [promanagerData, setPromanagerData] = useState({});

  useEffect(() => {
    fetch(`/pro-manager-list/users/${organizationId}/${userId}`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setPromanagerData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const { classes, commoditiesData, geographiesData, titlesData, selectedUser } = promanagerData;

  return (
    <>
      {selectedUser && !isLoading && (
        <UserProfile
          userOnly
          classificationsData={classes}
          commoditiesData={commoditiesData}
          geographiesData={geographiesData}
          titlesData={titlesData}
          currentUser={selectedUser}
          disable={selectedUser.org_status !== 1}
        />
      )}
    </>
  );
}

export default UserDetailSection;

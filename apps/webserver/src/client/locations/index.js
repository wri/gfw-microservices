/* global userInfo, organizationId */

import { useState, useCallback, useEffect } from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '../styles/ThemeProvider';

import Locations from './js/components/Locations';
import AppErrorFallback from '../common/js/components/Errors/AppErrorFallback';
import ModalLoader from '../common/js/components/Loaders/ModalLoader';

import { NO_MESSAGE } from './js/utils/history.utils';
import './polyfills';

const LocationsPage = ({ userInfo, organizationId }) => {
  const [templateData, setTemplateData] = useState(null);
  const [templateDropdowns, setTemplateDropdowns] = useState(null);
  const [userLists, setUserLists] = useState([]);
  const [locationCount, seLocationCount] = useState(0);
  const [gfwLists, setGfwLists] = useState([]);
  const [accountUsers, setAccountUsers] = useState([]);
  const [userSharedLists, setUserSharedLists] = useState([]);
  const [orgLists, setOrgLists] = useState([]);
  const [listStatuses, setListStatuses] = useState([]);
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
          templateData,
          templateDropdowns,
          locationCount,
          gfwLists,
          accountUsers,
          userSharedLists,
          orgLists,
          userLists,
          listStatuses,
        } = data;

        setTemplateData(templateData);
        setTemplateDropdowns(templateDropdowns);
        seLocationCount(locationCount);
        setGfwLists(gfwLists);
        setAccountUsers(accountUsers);
        setUserSharedLists(userSharedLists);
        setOrgLists(orgLists);
        setUserLists(userLists);
        setListStatuses(listStatuses);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, []);

  return isLoading ? (
    <ModalLoader open={true} />
  ) : (
    <Locations
      templateData={templateData}
      templateDropdowns={templateDropdowns}
      userLists={userLists} //Contains all lists that users have created
      userSharedLists={userSharedLists}
      locationCount={locationCount}
      userInfo={userInfo}
      usersList={accountUsers} //Contains all users
      organizationId={organizationId}
      orgLists={orgLists}
      gfwLists={gfwLists}
      listStatuses={listStatuses}
    />
  );
};

const App = () => (
  <ThemeProvider>
    <AppErrorFallback>
      <Router
        basename="/locations"
        getUserConfirmation={(message, callback) => {
          if (message !== NO_MESSAGE) {
            window.alert(message);
          }
          callback(false);
        }}
      >
        <LocationsPage userInfo={userInfo} organizationId={organizationId} />
      </Router>
    </AppErrorFallback>
  </ThemeProvider>
);

render(<App />, document.getElementById('locations-mount'));

if (module.hot) {
  module.hot.accept();
}

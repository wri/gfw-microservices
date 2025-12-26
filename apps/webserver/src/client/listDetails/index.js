/* global userLists, userSharedLists, userInfo, usersList, locationCount, gfwLists, listStatuses */

import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../locations/js/store';

import { ThemeProvider } from '../styles';
import AppErrorFallback from '../common/js/components/Errors/AppErrorFallback';
import Locations from './js/components/Locations';

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppErrorFallback>
          <BrowserRouter basename="/list-details">
            <Locations
              userLists={userLists} //Contains all lists that users have created
              userSharedLists={userSharedLists}
              locationCount={locationCount}
              userInfo={userInfo}
              usersList={usersList} //Contains all users
              gfwLists={gfwLists}
              listStatuses={listStatuses}
            />
          </BrowserRouter>
        </AppErrorFallback>
      </ThemeProvider>
    </Provider>
  );
};

render(<App />, document.getElementById('list-details-mount'));

if (module.hot) {
  module.hot.accept();
}

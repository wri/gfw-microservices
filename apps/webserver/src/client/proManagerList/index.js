import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render } from 'react-dom';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ProManagerList from './js/components/ProManagerList';

lightBaseTheme.fontFamily = 'Fira Sans, sans-serif';

function App() {
  return (
    <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
      <BrowserRouter basename="/pro-manager-list">
        <ProManagerList
          allAccountsList={allAccountsList}
          allUsersList={allUsersList}
          classes={classes}
          commoditiesData={commoditiesData}
          geographiesData={geographiesData}
          titlesData={titlesData}
          statusData={statusData}
          accessData={accessData}
          policyList={policyList}
          subscriptionStatuses={subscriptionStatuses}
        />
      </BrowserRouter>
    </MuiThemeProvider>
  );
}

render(<App />, document.getElementById('proManagerList-mount'));

import { render } from 'react-dom';

import { ThemeProvider } from '../styles';
import Page from '../common/js/components/Page';
import ActivityLog from './js/components/ActivityLog';

const pageOptions = {
  links: {
    logout: true,
  },
};

function App() {
  return (
    <ThemeProvider>
      <Page links={pageOptions.links} active="profile">
        <ActivityLog />
      </Page>
    </ThemeProvider>
  );
}

render(<App />, document.getElementById('activity-log-mount'));

if (module.hot) {
  module.hot.accept();
}

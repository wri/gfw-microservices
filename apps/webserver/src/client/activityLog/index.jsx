import { render } from 'react-dom';

import { ThemeProvider } from '../styles';
import PageWithoutThemeProvider from '../common/js/components/PageWithoutThemeProvider';
import ActivityLog from './js/components/ActivityLog';

const pageOptions = {
  links: {
    logout: true,
  },
};

function App() {
  return (
    <ThemeProvider>
      <PageWithoutThemeProvider links={pageOptions.links} active="profile">
        <ActivityLog />
      </PageWithoutThemeProvider>
    </ThemeProvider>
  );
}

render(<App />, document.getElementById('activity-log-mount'));

if (module.hot) {
  module.hot.accept();
}

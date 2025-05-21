import { BrowserRouter } from 'react-router-dom';
import { render } from 'react-dom';

import { ThemeProvider } from '../styles';
import ProManagerPanel from './js/components/ProManagerPanel';
import Page from '../common/js/components/Page';
import AppErrorFallback from '../common/js/components/Errors/AppErrorFallback';

const pageOptions = {
  links: {
    logout: true,
  },
};

function App() {
  return (
    <ThemeProvider>
      <AppErrorFallback>
        <BrowserRouter basename="/pro-manager-list">
          <Page links={pageOptions.links} active="pro-manager">
            <ProManagerPanel />
          </Page>
        </BrowserRouter>
      </AppErrorFallback>
    </ThemeProvider>
  );
}

render(<App />, document.getElementById('proManagerList-mount'));

if (module.hot) {
  module.hot.accept();
}

import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { render } from 'react-dom';
import Page from '../common/js/components/Page';
import Diagnostics from './js/Diagnostics';
import store from '../locations/js/store';
import './css/diagnostics.scss';
import AppErrorFallback from '../common/js/components/Errors/AppErrorFallback';
import { ThemeProvider } from '../styles/ThemeProvider';

const pageOptions = {
  links: {
    logout: true,
  },
};

function App() {
  return (
    <ThemeProvider>
      <AppErrorFallback>
        <Provider store={store}>
          <BrowserRouter basename="/diagnostics">
            <Page links={pageOptions.links} active="locations">
              <Diagnostics />
            </Page>
          </BrowserRouter>
        </Provider>
      </AppErrorFallback>
    </ThemeProvider>
  );
}

render(<App />, document.getElementById('mount'));

if (module.hot) {
  module.hot.accept();
}

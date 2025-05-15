import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Page from '../common/js/components/Page';
import Diagnostics from './js/Diagnostics';
import store from '../locations/js/store';
import './css/diagnostics.scss';
import AppErrorFallback from '../common/js/components/Errors/AppErrorFallback';

lightBaseTheme.fontFamily = 'Fira Sans, sans-serif';
const pageOptions = {
  links: {
    logout: true,
  },
};

function App() {
  return (
    <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
      <AppErrorFallback>
        <Provider store={store}>
          <BrowserRouter basename="/diagnostics">
            <Page links={pageOptions.links} active="locations">
              <Diagnostics />
            </Page>
          </BrowserRouter>
        </Provider>
      </AppErrorFallback>
    </MuiThemeProvider>
  );
}

const container = document.getElementById('mount');
const root = createRoot(container);
root.render(<App />);

if (module.hot) {
  module.hot.accept();
}

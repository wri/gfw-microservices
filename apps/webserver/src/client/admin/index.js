import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Admin from './js/components/Admin';
import { render } from 'react-dom';

lightBaseTheme.fontFamily = 'Fira Sans, sans-serif';

const App = () => (
  <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
    <Admin />
  </MuiThemeProvider>
);

render(<App />, document.getElementById('admin-mount'));

if (module.hot) {
  module.hot.accept();
}

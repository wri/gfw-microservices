import { render } from 'react-dom';

import Admin from './js/components/Admin';
import { ThemeProvider } from '../styles';

const App = () => (
  <ThemeProvider>
    <Admin />
  </ThemeProvider>
);

render(<App />, document.getElementById('admin-mount'));

if (module.hot) {
  module.hot.accept();
}

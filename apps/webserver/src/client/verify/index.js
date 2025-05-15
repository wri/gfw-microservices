import { render } from 'react-dom';

import Verify from './js/components/verify';
import { ThemeProvider } from '../styles';

const App = () => (
  <ThemeProvider>
    <Verify />
  </ThemeProvider>
);

render(<App />, document.getElementById('verify-mount'));

if (module.hot) {
  module.hot.accept();
}

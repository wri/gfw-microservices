/* global userEmail */

import Change from './js/components/Change';
import { render } from 'react-dom';
import { ThemeProvider } from '../styles';

const App = () => (
  <ThemeProvider>
    <Change userEmail={userEmail} />
  </ThemeProvider>
);

render(<App />, document.getElementById('change-mount'));

if (module.hot) {
  module.hot.accept();
}

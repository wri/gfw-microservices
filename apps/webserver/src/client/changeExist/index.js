/* global userEmail */

import { render } from 'react-dom';

import ChangeExist from './js/components/ChangeExist';
import { ThemeProvider } from '../styles';

const App = () => (
  <ThemeProvider>
    <ChangeExist userEmail={userEmail} />
  </ThemeProvider>
);

render(<App />, document.getElementById('changeExist-mount'));

if (module.hot) {
  module.hot.accept();
}

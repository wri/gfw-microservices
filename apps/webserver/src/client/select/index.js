/* global organizations */

import { render } from 'react-dom';

import Select from './js/components/Select';
import { ThemeProvider } from '../styles';

const App = () => (
  <ThemeProvider>
    <Select organizations={organizations} />
  </ThemeProvider>
);

render(<App />, document.getElementById('select-mount'));

if (module.hot) {
  module.hot.accept();
}

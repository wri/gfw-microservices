import { render } from 'react-dom';

import Manager from './js/components/Manager';
import { ThemeProvider } from '../styles';

const App = () => (
  <ThemeProvider>
    <Manager />
  </ThemeProvider>
);

render(<App />, document.getElementById('manager-mount'));

if (module.hot) {
  module.hot.accept();
}

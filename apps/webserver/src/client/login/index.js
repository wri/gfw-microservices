import { render } from 'react-dom';

import { ThemeProvider } from '../styles';
import Login from './js/components/Login';
import './css/login.scss';

const App = () => (
  <ThemeProvider>
    <Login />
  </ThemeProvider>
);

render(<App />, document.getElementById('mount'));

if (module.hot) {
  module.hot.accept();
}

import { render } from 'react-dom';

import { ThemeProvider } from '../styles';
import Splash from './js/components/Splash';
import './css/splash.scss';

const App = () => (
  <ThemeProvider>
    <Splash />
  </ThemeProvider>
);

render(<App />, document.getElementById('splash-mount'));

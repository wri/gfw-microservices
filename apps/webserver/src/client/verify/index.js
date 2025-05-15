import { createRoot } from 'react-dom/client';

import Verify from './js/components/verify';
import { ThemeProvider } from '../styles';

const App = () => (
  <ThemeProvider>
    <Verify />
  </ThemeProvider>
);

const container = document.getElementById('verify-mount');
const root = createRoot(container);
root.render(<App />);

if (module.hot) {
  module.hot.accept();
}

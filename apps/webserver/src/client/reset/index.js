import { createRoot } from 'react-dom/client';

import { ThemeProvider } from '../styles';
import Reset from './js/components/Reset';

const App = () => (
  <ThemeProvider>
    <Reset />
  </ThemeProvider>
);

const container = document.getElementById('reset-mount');
const root = createRoot(container);
root.render(<App />);

if (module.hot) {
  module.hot.accept();
}

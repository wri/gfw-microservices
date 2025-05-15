import { createRoot } from 'react-dom/client';

import { ThemeProvider } from '../styles';
import Forgot from './js/components/Forgot';

const App = () => (
  <ThemeProvider>
    <Forgot />
  </ThemeProvider>
);

const container = document.getElementById('forgot-mount');
const root = createRoot(container);
root.render(<App />);

if (module.hot) {
  module.hot.accept();
}

/* global userEmail */

import { createRoot } from 'react-dom/client';

import Change from './js/components/Change';
import { ThemeProvider } from '../styles';

const App = () => (
  <ThemeProvider>
    <Change userEmail={userEmail} />
  </ThemeProvider>
);

const container = document.getElementById('change-mount');
const root = createRoot(container);
root.render(<App />);

if (module.hot) {
  module.hot.accept();
}

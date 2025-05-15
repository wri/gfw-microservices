/* global organizations */

import { createRoot } from 'react-dom/client';

import Select from './js/components/Select';
import { ThemeProvider } from '../styles';

const App = () => (
  <ThemeProvider>
    <Select organizations={organizations} />
  </ThemeProvider>
);

const container = document.getElementById('select-mount');
const root = createRoot(container);
root.render(<App />);

if (module.hot) {
  module.hot.accept();
}

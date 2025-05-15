import { createRoot } from 'react-dom/client';
import './css/login.scss';

import Login from './js/components/Login';

const container = document.getElementById('mount');
const root = createRoot(container);
root.render(<Login />);


import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import './styles/index.css';

const mountNode = document.querySelector<HTMLElement>('[data-frame-configurator-root]')
  ?? document.getElementById('frame-configurator-root')
  ?? document.getElementById('root');

if (mountNode) {
  createRoot(mountNode).render(<App />);
}
  

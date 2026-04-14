import './styles/index.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createRoot } from 'react-dom/client';
import { Shell } from './layout/shell';
import { MapView } from './components/map/view';
import { SidePanel } from './components/nav/side-panel';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element with id "root" was not found.');
}

createRoot(rootElement).render(<Shell sidebar={<SidePanel />} content={<MapView />} />);

import './index.css';
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element with id "root" was not found.');
}

createRoot(rootElement).render(
  <main className="min-h-screen bg-slate-950 text-slate-100">
    <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
      <h1 className="text-center text-3xl font-semibold tracking-tight">This is a test.</h1>
    </div>
  </main>,
);

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/responsive-fixes.css'
import { initViewportHeight } from './lib/viewport.ts'

// Initialize dynamic viewport height handling
initViewportHeight();

createRoot(document.getElementById("root")!).render(<App />);

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/responsive-fixes.css'
import { initViewportHeight } from './lib/viewport'

// Initialize dynamic viewport height management
initViewportHeight();

createRoot(document.getElementById("root")!).render(<App />);

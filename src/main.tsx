import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/responsive-fixes.css'
import { initViewportHeight } from './lib/viewport'

// Initialize viewport height before React render to ensure correct initial paint
initViewportHeight();

createRoot(document.getElementById("root")!).render(<App />);

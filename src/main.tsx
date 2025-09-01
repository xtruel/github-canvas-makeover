import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/responsive-fixes.css'

// Dynamic viewport handling (mobile 100vh + keyboard + rotation fixes)
import { initViewportHeight } from './lib/viewport'

// Add an 'android' class to <html> only on Android devices/emulators
const isAndroid = /Android/i.test(navigator.userAgent || '')
if (isAndroid) {
  document.documentElement.classList.add('android')
}

// Safe to call multiple times (internally singleton + HMR aware)
initViewportHeight()

createRoot(document.getElementById("root")!).render(<App />)
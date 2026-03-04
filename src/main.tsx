import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// StrictMode intentionally omitted — it double-mounts components in dev,
// which destroys and recreates the WebGL context causing "Context Lost".
createRoot(document.getElementById('root')!).render(<App />)

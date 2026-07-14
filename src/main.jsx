import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { BASE_PATH, withBase } from './lib/paths'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(withBase('/sw.js'), { scope: `${BASE_PATH || ''}/` }).catch(() => {
      // The app still works without offline support.
    })
  })
}

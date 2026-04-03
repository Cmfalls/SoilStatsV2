import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const bootStatus = document.getElementById('boot-status')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)

if (bootStatus) {
  requestAnimationFrame(() => {
    bootStatus.hidden = true
  })
}

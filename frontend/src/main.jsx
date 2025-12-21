import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <--- IMPORTAR ESTO
import App from './App.jsx'
import "./styles/global.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* <--- ENVOLVER LA APP AQUÍ */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)
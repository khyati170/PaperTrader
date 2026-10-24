import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './stockDetail.css';
import App from './App.jsx';
import { ToastProvider } from "./context/ToastContext";
import "./testNews.js";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)


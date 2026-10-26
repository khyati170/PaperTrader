import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'              // NEW
import { store } from './store/store'   
import './index.css'
import './stockDetail.css';
import App from './App.jsx';
import { ToastProvider } from "./context/ToastContext";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <ToastProvider>
      <App />
    </ToastProvider>
    </Provider>
  </StrictMode>,
)


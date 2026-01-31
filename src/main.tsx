import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './globals.css'
import App from './App';
import {Provider} from "react-redux";
import { store } from './store'

const container = document.getElementById('root');
if (!container) {
    throw new Error('Root element with id="root" not found');
}

createRoot(container!).render(
  <StrictMode>
      <Provider store={store}>
    <App/>
      </Provider>
  </StrictMode>,
)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App';
import './styles.css';
import { AuthProvider } from './context/AuthContext';

const baseURL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
axios.defaults.baseURL = baseURL;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

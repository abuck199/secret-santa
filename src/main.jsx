import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import './index.css';
import App from './App';
import { I18nProvider } from './i18n/I18nContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Analytics />
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import './index.css';
import SecretSantaApp from './SecretSanta';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || ''}>
      <SecretSantaApp />
    </GoogleReCaptchaProvider>
  </React.StrictMode>
);
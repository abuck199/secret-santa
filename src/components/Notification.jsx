import React from 'react';
import { Toaster } from 'react-hot-toast';

const Notification = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#fff',
          color: '#292524',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '600',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          style: {
            border: '2px solid #10b981',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            border: '2px solid #ef4444',
          },
        },
      }}
    />
  );
};

export default Notification;
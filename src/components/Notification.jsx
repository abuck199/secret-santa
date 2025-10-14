import React from 'react';
import { Toaster } from 'react-hot-toast';

const Notification = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
          color: '#f1f5f9',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3), 0 0 20px rgba(220, 38, 38, 0.2)',
          borderRadius: '16px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '600',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          style: {
            background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.2) 0%, rgba(4, 120, 87, 0.2) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3), 0 0 20px rgba(16, 185, 129, 0.3)',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2) 0%, rgba(153, 27, 27, 0.2) 100%)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3), 0 0 20px rgba(220, 38, 38, 0.3)',
          },
        },
        loading: {
          iconTheme: {
            primary: '#fbbf24',
            secondary: '#fff',
          },
          style: {
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3), 0 0 20px rgba(251, 191, 36, 0.3)',
          },
        },
      }}
    />
  );
};

export default Notification;
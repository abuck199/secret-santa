import React from 'react';
import { Check, X } from 'lucide-react';

const Notification = ({ type, message }) => (
  <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white`}>
    <div className="flex items-center space-x-2">
      {type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
      <span>{message}</span>
    </div>
  </div>
);

export default Notification;
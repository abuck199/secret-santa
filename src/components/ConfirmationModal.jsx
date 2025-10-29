import React from 'react';
import { AlertCircle, X, Check } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmer", 
  cancelText = "Annuler",
  type = "warning"
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: AlertCircle,
      iconColor: "text-gold",
      iconBg: "from-gold/20 to-gold/10",
      iconBorder: "border-gold/30",
      confirmBg: "from-gold via-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500",
      confirmShadow: "shadow-glow-gold"
    },
    danger: {
      icon: AlertCircle,
      iconColor: "text-primary",
      iconBg: "from-primary/20 to-primary/10",
      iconBorder: "border-primary/30",
      confirmBg: "from-primary via-primary-600 to-primary-dark hover:from-primary-dark hover:to-primary",
      confirmShadow: "shadow-glow-red"
    },
    info: {
      icon: AlertCircle,
      iconColor: "text-blue-500",
      iconBg: "from-blue-500/20 to-blue-600/10",
      iconBorder: "border-blue-500/30",
      confirmBg: "from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-600",
      confirmShadow: "shadow-blue-500/50"
    }
  };

  const style = typeStyles[type];
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-dark-800/95 to-dark-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 max-w-md w-full mx-4 animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors group"
        >
          <X className="w-5 h-5 text-dark-400 group-hover:text-white" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`p-3 bg-gradient-to-br ${style.iconBg} rounded-xl border ${style.iconBorder}`}>
            <Icon className={`w-8 h-8 ${style.iconColor}`} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-dark-100 text-center mb-3">
          {title}
        </h3>

        {/* Message */}
        <p className="text-dark-300 text-center mb-6 leading-relaxed">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-dark-700/50 hover:bg-dark-600/50 backdrop-blur-sm text-dark-200 rounded-xl font-semibold border border-white/10 hover:border-white/20 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-3 bg-gradient-to-r ${style.confirmBg} text-white rounded-xl font-semibold shadow-lg ${style.confirmShadow} transition-all flex items-center justify-center gap-2 group`}
          >
            <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
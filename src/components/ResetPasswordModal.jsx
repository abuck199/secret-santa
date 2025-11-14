import React, { useState } from 'react';
import { X, Key, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import bcrypt from 'bcryptjs';

const ResetPasswordModal = ({ isOpen, onClose, user, supabase, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleReset = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error('Tous les champs sont requis');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 4) {
      toast.error('Le mot de passe doit avoir au moins 4 caractères');
      return;
    }

    setLoading(true);

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const { error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', user.id);

      if (error) throw error;

      toast.success(`Mot de passe réinitialisé pour ${user.username}`);
      
      setNewPassword('');
      setConfirmPassword('');
      onClose();
      
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Erreur lors de la réinitialisation');
      console.error('Erreur reset password:', error);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-gold/20 to-gold/10 rounded-xl">
            <Key className="w-6 h-6 text-gold" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-dark-100">
              Réinitialiser le mot de passe
            </h3>
            <p className="text-sm text-dark-400">Pour {user.username}</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-dark-300 mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-dark-900/50 border-2 border-white/10 rounded-xl focus:ring-2 focus:ring-gold focus:border-gold/50 outline-none transition-all text-dark-100 placeholder-dark-500"
                placeholder="Minimum 4 caractères"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-300 mb-2">
              Confirmer le mot de passe
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark-900/50 border-2 border-white/10 rounded-xl focus:ring-2 focus:ring-gold focus:border-gold/50 outline-none transition-all text-dark-100 placeholder-dark-500"
              placeholder="Confirmer le mot de passe"
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && handleReset()}
            />
          </div>

          {/* Info box */}
          <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg">
            <p className="text-xs text-blue-400">
              💡 Le nouveau mot de passe sera immédiatement actif. Communiquez-le à l'utilisateur de manière sécurisée.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-dark-700/50 hover:bg-dark-600/50 backdrop-blur-sm text-dark-200 rounded-xl font-semibold border border-white/10 hover:border-white/20 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-gold via-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-dark-900 rounded-xl font-semibold shadow-lg hover:shadow-glow-gold transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin"></div>
                Réinitialisation...
              </>
            ) : (
              <>
                <Key className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Réinitialiser
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, ArrowLeft, Shield, CheckCircle } from 'lucide-react';

const ChangePasswordView = ({ currentUser, supabase, bcrypt, setView }) => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false
  });
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (password) => {
    if (password.length < 6) return { level: 'weak', label: 'Faible', color: 'red' };
    if (password.length < 8) return { level: 'medium', label: 'Moyen', color: 'yellow' };
    return { level: 'strong', label: 'Fort', color: 'green' };
  };

  const strength = passwords.new ? getPasswordStrength(passwords.new) : null;

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error('Tous les champs sont requis');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast.error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwords.new.length < 4) {
      toast.error('Le nouveau mot de passe doit avoir au moins 4 caractères');
      return;
    }

    if (passwords.new === passwords.current) {
      toast.error('Le nouveau mot de passe doit être différent de l\'ancien');
      return;
    }

    setLoading(true);

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('password')
        .eq('id', currentUser.id)
        .single();

      if (!userData) {
        toast.error('Utilisateur non trouvé');
        setLoading(false);
        return;
      }

      const passwordMatch = await bcrypt.compare(passwords.current, userData.password);

      if (!passwordMatch) {
        toast.error('Le mot de passe actuel est incorrect');
        setLoading(false);
        return;
      }

      const hashedPassword = await bcrypt.hash(passwords.new, 10);

      const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      toast.success('Mot de passe modifié avec succès !');
      setPasswords({
        current: '',
        new: '',
        confirm: '',
        showCurrent: false,
        showNew: false,
        showConfirm: false
      });

      setTimeout(() => {
        setView('dashboard');
      }, 2000);

    } catch (error) {
      toast.error('Erreur lors de la modification du mot de passe');
      console.error('Erreur changement mot de passe:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => setView('dashboard')}
        className="text-dark-300 hover:text-white bg-dark-800/50 hover:bg-dark-700/50 backdrop-blur-sm px-4 py-2 rounded-xl mb-6 font-medium transition-all flex items-center gap-2 border border-white/10 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Retour
      </button>

      <div className="bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-gold/20 to-gold/10 rounded-xl">
            <Shield className="w-10 h-10 text-gold" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-dark-100 flex items-center gap-2">
              Changer mon mot de passe
            </h2>
            <p className="text-dark-400 text-sm mt-1">Protégez votre compte avec un mot de passe fort</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Mot de passe actuel */}
          <div>
            <label className="block text-sm font-semibold text-dark-300 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={passwords.showCurrent ? 'text' : 'password'}
                value={passwords.current}
                onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                className="w-full px-4 py-3 pr-12 bg-dark-900/50 border-2 border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary/50 outline-none transition-all text-dark-100 placeholder-dark-500"
                placeholder="Entrez votre mot de passe actuel"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setPasswords(p => ({ ...p, showCurrent: !p.showCurrent }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
              >
                {passwords.showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-sm font-semibold text-dark-300 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={passwords.showNew ? 'text' : 'password'}
                value={passwords.new}
                onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                className="w-full px-4 py-3 pr-12 bg-dark-900/50 border-2 border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 outline-none transition-all text-dark-100 placeholder-dark-500"
                placeholder="Entrez votre nouveau mot de passe"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setPasswords(p => ({ ...p, showNew: !p.showNew }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
              >
                {passwords.showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-dark-500 mt-2 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Minimum 4 caractères
            </p>
          </div>

          {/* Confirmer nouveau mot de passe */}
          <div>
            <label className="block text-sm font-semibold text-dark-300 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gold rounded-full"></span>
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={passwords.showConfirm ? 'text' : 'password'}
                value={passwords.confirm}
                onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                className="w-full px-4 py-3 pr-12 bg-dark-900/50 border-2 border-white/10 rounded-xl focus:ring-2 focus:ring-gold focus:border-gold/50 outline-none transition-all text-dark-100 placeholder-dark-500"
                placeholder="Confirmez votre nouveau mot de passe"
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleChangePassword()}
              />
              <button
                type="button"
                onClick={() => setPasswords(p => ({ ...p, showConfirm: !p.showConfirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
              >
                {passwords.showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Indicateur de force du mot de passe */}
          {passwords.new && strength && (
            <div className={`p-4 bg-gradient-to-r ${strength.color === 'red' ? 'from-red-900/20 to-red-800/20 border-red-500/30' :
                strength.color === 'yellow' ? 'from-yellow-900/20 to-yellow-800/20 border-yellow-500/30' :
                  'from-green-900/20 to-green-800/20 border-green-500/30'
              } backdrop-blur-sm border rounded-xl`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-dark-200">Force du mot de passe</p>
                <span className={`text-sm font-bold ${strength.color === 'red' ? 'text-red-400' :
                    strength.color === 'yellow' ? 'text-yellow-400' :
                      'text-green-400'
                  }`}>
                  {strength.label}
                </span>
              </div>
              <div className="w-full bg-dark-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${strength.color === 'red' ? 'bg-gradient-to-r from-red-600 to-red-500 w-1/3' :
                      strength.color === 'yellow' ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 w-2/3' :
                        'bg-gradient-to-r from-green-600 to-green-500 w-full'
                    }`}
                ></div>
              </div>
            </div>
          )}

          {/* Match indicator */}
          {passwords.new && passwords.confirm && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${passwords.new === passwords.confirm
                ? 'bg-green-900/20 border border-green-500/30'
                : 'bg-red-900/20 border border-red-500/30'
              }`}>
              <CheckCircle className={`w-5 h-5 ${passwords.new === passwords.confirm ? 'text-green-400' : 'text-red-400'
                }`} />
              <p className={`text-sm font-medium ${passwords.new === passwords.confirm ? 'text-green-400' : 'text-red-400'
                }`}>
                {passwords.new === passwords.confirm
                  ? 'Les mots de passe correspondent'
                  : 'Les mots de passe ne correspondent pas'}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold via-gold-500 to-gold-600 text-dark-900 py-3.5 rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all shadow-lg hover:shadow-glow-gold font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin"></div>
                Modification en cours...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Changer mon mot de passe
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordView;
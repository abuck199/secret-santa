import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock } from 'lucide-react';

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

  const handleChangePassword = async () => {
    toast.error('');
    
    // Validations
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
      // Vérifier l'ancien mot de passe
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
      
      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(passwords.new, 10);
      
      // Mettre à jour dans la base de données
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
      
      // Retourner au dashboard après 2 secondes
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button 
        onClick={() => setView('dashboard')}
        className="text-white bg-stone-700 hover:bg-stone-800 px-4 py-2 rounded-lg mb-4 font-medium"
      >
        ← Retour
      </button>

      <div className="bg-white rounded-xl shadow-2xl p-6 border-t-4 border-primary">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-stone-800">Changer mon mot de passe</h2>
        </div>

        <div className="space-y-4">
          {/* Mot de passe actuel */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={passwords.showCurrent ? 'text' : 'password'}
                value={passwords.current}
                onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                className="w-full px-4 py-3 pr-12 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="Entrez votre mot de passe actuel"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setPasswords(p => ({ ...p, showCurrent: !p.showCurrent }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {passwords.showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={passwords.showNew ? 'text' : 'password'}
                value={passwords.new}
                onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                className="w-full px-4 py-3 pr-12 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="Entrez votre nouveau mot de passe"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setPasswords(p => ({ ...p, showNew: !p.showNew }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {passwords.showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-1">Minimum 4 caractères</p>
          </div>

          {/* Confirmer nouveau mot de passe */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={passwords.showConfirm ? 'text' : 'password'}
                value={passwords.confirm}
                onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                className="w-full px-4 py-3 pr-12 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="Confirmez votre nouveau mot de passe"
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleChangePassword()}
              />
              <button
                type="button"
                onClick={() => setPasswords(p => ({ ...p, showConfirm: !p.showConfirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {passwords.showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Indicateur de force du mot de passe */}
          {passwords.new && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                Force du mot de passe : {' '}
                <span className={`font-bold ${
                  passwords.new.length < 6 ? 'text-red-600' : 
                  passwords.new.length < 8 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {passwords.new.length < 6 ? 'Faible' : 
                   passwords.new.length < 8 ? 'Moyen' : 
                   'Fort'}
                </span>
              </p>
            </div>
          )}

          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-lg hover:from-primary-dark hover:to-primary-dark transition shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Modification en cours...' : 'Changer mon mot de passe'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordView;
import React from 'react';
import { Shuffle } from 'lucide-react';

const AdminView = ({ 
  users, 
  wishLists, 
  assignments, 
  event, 
  setEvent, 
  userForm, 
  setUserForm, 
  getStatistics, 
  updateEvent, 
  addUser, 
  deleteUser, 
  getAssignedUser, 
  shuffleAssignments,
  sendAssignmentEmails,
  setView, 
  loading 
}) => {
  const stats = getStatistics();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => setView('dashboard')}
        className="text-white bg-stone-700 hover:bg-stone-800 px-4 py-2 rounded-lg mb-4 font-medium"
      >
        ← Retour
      </button>

      {/* Statistiques */}
      <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border-t-4 border-blue-500">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">📊 Statistiques</h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <p className="text-sm text-stone-600">Total</p>
            <p className="text-3xl font-bold text-blue-700">{stats.totalItems}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <p className="text-sm text-stone-600">Réservés</p>
            <p className="text-3xl font-bold text-green-700">{stats.reservedItems}</p>
          </div>
          <div className="bg-gradient-to-br from-cream to-beige p-4 rounded-lg">
            <p className="text-sm text-stone-600">Disponibles</p>
            <p className="text-3xl font-bold text-primary-dark">{stats.availableItems}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-beige to-beige-dark p-4 rounded-lg mb-6">
          <p className="text-sm text-stone-600">Listes complétées</p>
          <p className="text-3xl font-bold text-white">{stats.usersWithLists} / {users.length}</p>
        </div>

        {stats.usersWithoutLists > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-900 font-semibold">
              ⚠️ {stats.usersWithoutLists} personne{stats.usersWithoutLists > 1 ? 's' : ''} sans liste
            </p>
            <p className="text-sm text-red-700 mt-1">
              {users.filter(u => !wishLists[u.id]?.length).map(u => u.username).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Paramètres */}
      <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border-t-4 border-beige-dark">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">Paramètres</h2>
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1">Nom de l'événement</label>
          <input 
            type="text" 
            value={event.name}
            onChange={(e) => setEvent(p => ({ ...p, name: e.target.value }))}
            onBlur={updateEvent}
            className="w-full px-4 py-2 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            disabled={loading} 
          />
        </div>
      </div>

      {/* Participants */}
      <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border-t-4 border-primary">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-stone-800">Participants</h2>
          <button 
            onClick={() => setUserForm(p => ({ ...p, showForm: !p.showForm }))}
            className="bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-2 rounded-lg hover:from-primary-dark hover:to-primary-dark font-semibold"
          >
            Ajouter
          </button>
        </div>

        {userForm.showForm && (
          <div className="mb-4 p-4 bg-cream border-2 border-beige-dark rounded-xl">
            <h3 className="font-bold text-stone-800 mb-3">Nouveau participant</h3>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Nom d'utilisateur" 
                value={userForm.username}
                onChange={(e) => setUserForm(p => ({ ...p, username: e.target.value }))}
                className="w-full px-4 py-2 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                disabled={loading} 
              />
              <input 
                type="email" 
                placeholder="Courriel" 
                value={userForm.email || ''}
                onChange={(e) => setUserForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-2 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                disabled={loading}
                required
              />
              <input 
                type="password" 
                placeholder="Mot de passe" 
                value={userForm.password}
                onChange={(e) => setUserForm(p => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-2 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                disabled={loading} 
              />
              <div className="flex space-x-2">
                <button 
                  onClick={addUser} 
                  disabled={loading}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark font-semibold disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer'}
                </button>
                <button 
                  onClick={() => setUserForm({ username: '', password: '', email: '', showForm: false })}
                  className="flex-1 bg-stone-200 text-stone-700 py-2 rounded-lg hover:bg-stone-300 font-semibold"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-cream to-beige border-2 border-beige-dark rounded-xl">
              <div>
                <p className="font-bold text-stone-800">{user.username}</p>
              </div>
              <div className="flex items-center space-x-2">
                {user.is_admin && (
                  <span className="bg-beige-dark text-white text-xs px-3 py-1 rounded-full font-bold">Admin</span>
                )}
                {!user.is_admin && (
                  <button 
                    onClick={() => deleteUser(user.id)} 
                    disabled={loading}
                    className="bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary-dark text-sm font-semibold disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-stone-600 mt-4 font-medium">Total: {users.length}</p>
      </div>

      {/* Attributions */}
      <div className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-primary">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">Attributions</h2>
        
        {Object.keys(assignments).length === 0 ? (
          <div className="text-center py-8">
            <Shuffle className="w-16 h-16 text-primary mx-auto mb-4" />
            <p className="text-stone-700 font-medium mb-4">Aucune attribution</p>
            <button 
              onClick={shuffleAssignments} 
              disabled={loading}
              className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-lg hover:from-primary-dark hover:to-primary-dark font-bold shadow-lg disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg mb-4">
              <p className="text-green-900 font-bold">✓ Attributions créées</p>
            </div>

            <div className="space-y-2 mb-6">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-cream border-2 border-beige-dark rounded-lg">
                  <span className="font-bold text-stone-800">{user.username}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-stone-400">→</span>
                    <span className="text-primary-dark font-bold">{getAssignedUser(user.id)?.username || 'Non attribué'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={shuffleAssignments}  // ← CORRECTION : Remélanger appelle shuffleAssignments
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-beige to-beige-dark text-white px-6 py-3 rounded-lg hover:from-beige-dark hover:to-beige-dark font-bold disabled:opacity-50"
              >
                {loading ? 'Mélange...' : 'Remélanger'}
              </button>
              <button 
                onClick={sendAssignmentEmails}  // ← CORRECT : Renvoyer emails appelle sendAssignmentEmails
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-lg hover:from-primary-dark hover:to-primary-dark font-bold disabled:opacity-50"
              >
                {loading ? 'Envoi...' : 'Renvoyer les emails'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;
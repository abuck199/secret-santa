import React, { useState } from 'react';
import { Shuffle, ArrowLeft, Users, Settings, Crown, Mail, Trash2, UserPlus, TrendingUp, UserX, UserCheck, Key } from 'lucide-react';
import ResetPasswordModal from './ResetPasswordModal';

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
  loading,
  toggleUserParticipation,
  supabase, // Ajouter supabase dans les props
  loadUsers // Ajouter loadUsers dans les props
}) => {
  const stats = getStatistics();
  
  // État pour le modal de réinitialisation
  const [resetPasswordModal, setResetPasswordModal] = useState({
    isOpen: false,
    user: null
  });

  // Séparer les utilisateurs par type de participation
  const participatingUsers = users.filter(u => u.participates_in_draw);
  const nonParticipatingUsers = users.filter(u => !u.participates_in_draw);

  const handleOpenResetPassword = (user) => {
    setResetPasswordModal({
      isOpen: true,
      user: user
    });
  };

  const handleCloseResetPassword = () => {
    setResetPasswordModal({
      isOpen: false,
      user: null
    });
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 animate-fade-in">
        {/* Back Button */}
        <button
          onClick={() => setView('dashboard')}
          className="text-dark-300 hover:text-white bg-dark-800/50 hover:bg-dark-700/50 backdrop-blur-sm px-4 py-2 rounded-xl mb-6 font-medium transition-all flex items-center gap-2 border border-white/10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour
        </button>

        {/* Header avec badge admin */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-sm rounded-full border border-primary/30 mb-4">
            <Crown className="w-6 h-6 text-primary animate-float" />
            <span className="text-primary font-bold">Panneau d'administration</span>
          </div>
          <h1 className="text-4xl font-bold text-dark-100">Gérez votre événement</h1>
        </div>

        {/* Statistiques améliorées */}
        <div className="bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-dark-100">Statistiques</h2>
          </div>

          {/* Stats des articles */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-900/20 to-blue-800/20 backdrop-blur-sm rounded-lg border border-blue-500/30 hover:border-blue-500/50 transition-all">
              <p className="text-xs text-blue-400 mb-2 font-medium">Total articles</p>
              <p className="text-3xl font-bold text-blue-300">{stats.totalItems}</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 backdrop-blur-sm rounded-xl border border-emerald-500/30 hover:border-emerald-500/50 transition-all">
              <p className="text-sm text-emerald-400 mb-2 font-medium">Réservés</p>
              <p className="text-4xl font-bold text-emerald-300">{stats.reservedItems}</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-gold/20 to-gold/10 backdrop-blur-sm rounded-xl border border-gold/30 hover:border-gold/50 transition-all">
              <p className="text-sm text-gold mb-2 font-medium">Disponibles</p>
              <p className="text-4xl font-bold text-gold-400">{stats.availableItems}</p>
            </div>
          </div>

          {/* Stats des participants */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-5 bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm rounded-xl border border-primary/30">
              <p className="text-sm text-primary mb-2 font-medium flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Participants au tirage
              </p>
              <div className="flex items-center gap-4">
                <p className="text-4xl font-bold text-primary">{stats.participatingUsers}</p>
                <div className="text-xs text-dark-400">
                  <p>{stats.participatingWithLists} avec liste</p>
                  <p>{stats.participatingWithoutLists} sans liste</p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-purple-900/20 to-purple-800/20 backdrop-blur-sm rounded-xl border border-purple-500/30">
              <p className="text-sm text-purple-400 mb-2 font-medium flex items-center gap-2">
                <UserX className="w-4 h-4" />
                Hors-tirage (liste seulement)
              </p>
              <div className="flex items-center gap-4">
                <p className="text-4xl font-bold text-purple-400">{stats.nonParticipatingUsers}</p>
                <div className="text-xs text-dark-400">
                  <p>{stats.nonParticipatingWithLists} avec liste</p>
                </div>
              </div>
            </div>
          </div>

          {/* Avertissements */}
          {stats.participatingWithoutLists > 0 && (
            <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 backdrop-blur-sm border border-red-500/30 p-4 rounded-xl mb-4">
              <p className="text-red-400 font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 bg-red-500/20 rounded-full">⚠️</span>
                {stats.participatingWithoutLists} participant{stats.participatingWithoutLists > 1 ? 's' : ''} au tirage sans liste
              </p>
              <p className="text-sm text-red-300 mt-2">
                {participatingUsers.filter(u => !wishLists[u.id]?.length).map(u => u.username).join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Paramètres de l'événement */}
        <div className="bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-gold/20 to-gold/10 rounded-xl">
              <Settings className="w-6 h-6 text-gold" />
            </div>
            <h2 className="text-2xl font-bold text-dark-100">Paramètres de l'événement</h2>
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark-300 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gold rounded-full"></span>
              Nom de l'événement
            </label>
            <input
              type="text"
              value={event.name}
              onChange={(e) => setEvent(p => ({ ...p, name: e.target.value }))}
              onBlur={updateEvent}
              className="w-full px-4 py-3 bg-dark-900/50 border-2 border-white/10 rounded-xl focus:ring-2 focus:ring-gold focus:border-gold/50 outline-none transition-all text-dark-100"
              disabled={loading}
            />
          </div>
        </div>

        {/* Gestion des participants */}
        <div className="bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-6 border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-dark-100">Participants</h2>
            </div>
            <button
              onClick={() => setUserForm(p => ({ ...p, showForm: !p.showForm }))}
              className="bg-gradient-to-r from-primary via-primary-600 to-primary-dark text-white px-4 py-2 rounded-xl hover:from-primary-dark hover:to-primary font-semibold flex items-center gap-2 shadow-lg hover:shadow-glow-red transition-all group"
            >
              <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Ajouter
            </button>
          </div>

          {userForm.showForm && (
            <div className="mb-6 p-5 bg-gradient-to-br from-emerald-900/20 via-dark-800/50 to-dark-900/50 backdrop-blur-sm border border-emerald-500/20 rounded-xl">
              <h3 className="font-bold text-dark-100 mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-500" />
                Nouveau participant
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nom d'utilisateur"
                  value={userForm.username}
                  onChange={(e) => setUserForm(p => ({ ...p, username: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-900/50 border-2 border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 outline-none transition-all text-dark-100 placeholder-dark-500"
                  disabled={loading}
                />
                <input
                  type="email"
                  placeholder="Courriel"
                  value={userForm.email || ''}
                  onChange={(e) => setUserForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-900/50 border-2 border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 outline-none transition-all text-dark-100 placeholder-dark-500"
                  disabled={loading}
                  required
                />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={userForm.password}
                  onChange={(e) => setUserForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-900/50 border-2 border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 outline-none transition-all text-dark-100 placeholder-dark-500"
                  disabled={loading}
                />

                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-900/20 to-purple-800/20 rounded-xl border border-purple-500/30">
                  <input
                    type="checkbox"
                    id="participatesInDraw"
                    checked={userForm.participatesInDraw}
                    onChange={(e) => setUserForm(p => ({ ...p, participatesInDraw: e.target.checked }))}
                    className="w-5 h-5 text-purple-500 bg-dark-900/50 border-2 border-purple-500/50 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <label htmlFor="participatesInDraw" className="text-dark-200 font-medium flex-1 cursor-pointer">
                    Participe au tirage au sort
                    <p className="text-xs text-dark-500 mt-1">
                      Si non coché : peut créer sa liste et les autres peuvent réserver, mais ne participera pas à la pige
                    </p>
                  </label>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={addUser}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-3 rounded-xl hover:from-emerald-500 hover:to-emerald-600 font-semibold disabled:opacity-50 shadow-lg hover:shadow-glow-green transition-all"
                  >
                    {loading ? 'Création...' : 'Créer'}
                  </button>
                  <button
                    onClick={() => setUserForm({ username: '', password: '', email: '', participatesInDraw: true, showForm: false })}
                    className="flex-1 bg-dark-700/50 hover:bg-dark-600/50 backdrop-blur-sm text-dark-200 py-3 rounded-xl font-semibold border border-white/10 transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sections des utilisateurs */}
          <div className="space-y-6">
            {/* Participants au tirage */}
            {participatingUsers.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-dark-100 mb-3 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-500" />
                  Participants au tirage ({participatingUsers.length})
                </h3>
                <div className="space-y-3">
                  {participatingUsers.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-dark-700/50 to-dark-800/50 backdrop-blur-sm border border-white/10 rounded-xl hover:border-primary/50 transition-all animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold shadow-lg">
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-dark-100">{user.username}</p>
                          {!wishLists[user.id]?.length && (
                            <p className="text-xs text-red-400">Pas de liste</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.is_admin ? (
                          <span className="bg-gradient-to-r from-gold/20 to-gold/10 text-gold text-xs px-3 py-1.5 rounded-full font-bold border border-gold/30 flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Admin
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleOpenResetPassword(user)}
                              disabled={loading}
                              className="bg-gold/20 hover:bg-gold/30 text-gold px-3 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-1 border border-gold/30 transition-all group"
                              title="Réinitialiser le mot de passe"
                            >
                              <Key className="w-3.5 h-3.5" />
                              Mot de passe
                            </button>
                            <button
                              onClick={() => toggleUserParticipation(user.id)}
                              disabled={loading}
                              className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-3 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-1 border border-purple-500/30 transition-all group"
                              title="Retirer du tirage"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              Retirer du tirage
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              disabled={loading}
                              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-1 shadow-lg transition-all group"
                            >
                              <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                              Supprimer
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hors-tirage */}
            {nonParticipatingUsers.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-dark-100 mb-3 flex items-center gap-2">
                  <UserX className="w-5 h-5 text-purple-500" />
                  Hors-tirage - Liste seulement ({nonParticipatingUsers.length})
                </h3>
                <div className="bg-purple-900/10 border border-purple-500/20 p-3 rounded-lg mb-3">
                  <p className="text-sm text-purple-400">
                    Ces personnes peuvent créer leur liste et recevoir des cadeaux, mais ne participent pas au tirage au sort.
                  </p>
                </div>
                <div className="space-y-3">
                  {nonParticipatingUsers.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-900/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-all animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white font-bold shadow-lg">
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-dark-100">{user.username}</p>
                          <p className="text-xs text-purple-400">Hors-tirage</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenResetPassword(user)}
                          disabled={loading}
                          className="bg-gold/20 hover:bg-gold/30 text-gold px-3 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-1 border border-gold/30 transition-all group"
                          title="Réinitialiser le mot de passe"
                        >
                          <Key className="w-3.5 h-3.5" />
                          Mot de passe
                        </button>
                        <button
                          onClick={() => toggleUserParticipation(user.id)}
                          disabled={loading}
                          className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-1 border border-emerald-500/30 transition-all group"
                          title="Ajouter au tirage"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Ajouter au tirage
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={loading}
                          className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-1 shadow-lg transition-all group"
                        >
                          <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="text-sm text-dark-400 mt-4 font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Total: {users.length} utilisateur{users.length > 1 ? 's' : ''}
            ({participatingUsers.length} au tirage, {nonParticipatingUsers.length} hors-tirage)
          </p>
        </div>

        {/* Attributions */}
        <div className="bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
              <Shuffle className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-dark-100">{event?.name}</h2>
          </div>

          {Object.keys(assignments).length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-dark-700/30 to-dark-800/30 backdrop-blur-sm rounded-xl border border-white/10">
              <Shuffle className="w-20 h-20 text-primary/50 mx-auto mb-4 animate-float" />
              <p className="text-dark-300 font-medium mb-2">Aucune attribution créée</p>
              <p className="text-dark-500 text-sm mb-2">
                {participatingUsers.length} participant{participatingUsers.length > 1 ? 's' : ''} au tirage
              </p>
              {nonParticipatingUsers.length > 0 && (
                <p className="text-purple-400 text-xs mb-6">
                  ({nonParticipatingUsers.length} personne{nonParticipatingUsers.length > 1 ? 's' : ''} hors-tirage)
                </p>
              )}
              {participatingUsers.length < 3 && (
                <p className="text-red-400 text-sm mb-6">
                  ⚠️ Il faut au moins 3 participants au tirage
                </p>
              )}
              <button
                onClick={shuffleAssignments}
                disabled={loading || participatingUsers.length < 3}
                className="bg-gradient-to-r from-primary via-primary-600 to-primary-dark text-white px-8 py-3 rounded-xl hover:from-primary-dark hover:to-primary font-bold shadow-lg hover:shadow-glow-red disabled:opacity-50 inline-flex items-center gap-2 group"
              >
                <Shuffle className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                {loading ? 'Création...' : 'Créer les attributions'}
              </button>
            </div>
          ) : (
            <div>
              <div className="bg-gradient-to-r from-emerald-900/20 to-emerald-800/20 backdrop-blur-sm border border-emerald-500/30 p-4 rounded-xl mb-6">
                <p className="text-emerald-400 font-bold flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-emerald-500/20 rounded-full">✓</span>
                  Attributions créées pour {participatingUsers.length} participants
                </p>
                {nonParticipatingUsers.length > 0 && (
                  <p className="text-purple-400 text-sm mt-2">
                    {nonParticipatingUsers.length} personne{nonParticipatingUsers.length > 1 ? 's' : ''} hors-tirage peuvent recevoir des cadeaux mais n'ont pas d'attribution
                  </p>
                )}
              </div>

              <div className="space-y-2 mb-6 max-h-96 overflow-y-auto custom-scrollbar">
                {participatingUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-dark-700/50 to-dark-800/50 backdrop-blur-sm border border-white/10 rounded-xl animate-slide-up"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <span className="font-bold text-dark-100">{user.username}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-dark-500">→</span>
                      <span className="text-primary font-bold">{getAssignedUser(user.id)?.username || 'Non attribué'}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={shuffleAssignments}
                  disabled={loading || participatingUsers.length < 3}
                  className="flex-1 bg-gradient-to-r from-gold via-gold-500 to-gold-600 text-dark-900 px-6 py-3 rounded-xl hover:from-gold-400 hover:to-gold-500 font-bold disabled:opacity-50 shadow-lg hover:shadow-glow-gold transition-all flex items-center justify-center gap-2 group"
                >
                  <Shuffle className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  {loading ? 'Mélange...' : 'Remélanger'}
                </button>
                <button
                  onClick={sendAssignmentEmails}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-primary via-primary-600 to-primary-dark text-white px-6 py-3 rounded-xl hover:from-primary-dark hover:to-primary font-bold disabled:opacity-50 shadow-lg hover:shadow-glow-red transition-all flex items-center justify-center gap-2 group"
                >
                  <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {loading ? 'Envoi...' : 'Envoyer les emails'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de réinitialisation */}
      <ResetPasswordModal
        isOpen={resetPasswordModal.isOpen}
        onClose={handleCloseResetPassword}
        user={resetPasswordModal.user}
        supabase={supabase}
        onSuccess={loadUsers}
      />
    </>
  );
};

export default AdminView;
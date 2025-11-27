import React from 'react';
import { Gift, List, Users, Shuffle, Lock, Sparkles, ArrowRight, UserX, AlertCircle, Bell, X, CalendarX, ShoppingBag } from 'lucide-react';

const DashboardView = ({ currentUser, assignments, wishLists, getAssignedUser, setView }) => {
  const [showAnnouncement, setShowAnnouncement] = React.useState(true);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 animate-fade-in">
      {/* ===== BANNIÈRE D'ANNONCES MISE À JOUR ===== */}
      {showAnnouncement && (
        <div className="mb-6 bg-gradient-to-r from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-xl border border-gold/30 shadow-lg animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gold" />
              <span className="text-sm font-semibold text-gold">Annonces importantes</span>
            </div>
            <button
              onClick={() => setShowAnnouncement(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-dark-400 hover:text-white" />
            </button>
          </div>

          {/* Contenu */}
          <div className="px-4 py-3 space-y-2">
            {/* Annonce 1 - Date limite passée */}
            <div className="flex items-start gap-3">
              <span className="text-base">🔒</span>
              <p className="text-sm text-dark-200">
                <span className="text-primary font-semibold">Période terminée :</span> L'ajout de nouveaux articles aux listes est maintenant <span className="text-primary font-bold">fermé</span>.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-base">✨</span>
              <p className="text-sm text-dark-200">
                <span className="text-gold font-semibold">Rappel :</span> Marquez vos articles comme "Acheté" dans{' '}
                <button
                  onClick={() => setView('my-reservations')}
                  className="text-gold hover:text-gold-300 font-semibold underline underline-offset-2 transition-colors"
                >
                  Mes Réservations
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Header - VERSION ÉQUILIBRÉE */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl md:text-3xl font-bold bg-gradient-to-r from-primary via-gold to-emerald-500 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-gold animate-sparkle" />
          Bienvenue {currentUser.username}!
          <Sparkles className="w-5 h-5 text-gold animate-sparkle" />
        </h1>
        <p className="text-sm text-dark-400">Votre plateforme d'échange de cadeaux intelligente</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Attribution Card - VERSION ÉQUILIBRÉE */}
        {currentUser.participates_in_draw && (
          <div className="bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-xl shadow-2xl p-5 border border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-glow-red animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-dark-100 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                Votre attribution
              </h2>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            </div>

            {assignments[currentUser.id] ? (
              <div>
                <div className="bg-gradient-to-br from-primary/20 via-primary-dark/20 to-emerald-900/20 backdrop-blur-sm border border-primary/30 text-white p-5 rounded-xl mb-3 shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 group-hover:translate-x-full transition-transform duration-1000"></div>
                  <p className="text-sm opacity-90 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Vous offrez un cadeau à :
                  </p>
                  <p className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                    {getAssignedUser(currentUser.id)?.username}
                    <ArrowRight className="w-5 h-5 animate-pulse" />
                  </p>
                </div>
                <button
                  onClick={() => setView('assignment')}
                  className="w-full bg-gradient-to-r from-primary via-primary-600 to-primary-dark text-white py-2.5 rounded-xl hover:from-primary-dark hover:to-primary transition-all shadow-lg hover:shadow-glow-red font-semibold flex items-center justify-center gap-2 group"
                >
                  <Gift className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Voir leur liste
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-dark-700/50 to-dark-800/50 backdrop-blur-sm border border-white/10 p-6 rounded-xl text-center">
                <Shuffle className="w-14 h-14 text-primary/50 mx-auto mb-3 animate-gentle-bounce" />
                <p className="text-dark-200 font-semibold mb-1">Pas encore d'attribution</p>
                <p className="text-sm text-dark-400">L'admin va créer les attributions bientôt! 🎁</p>
              </div>
            )}
          </div>
        )}

        {/* Wishlist Card - VERSION AVEC INDICATEUR DE FERMETURE */}
        <div className={`bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-xl shadow-2xl p-5 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-glow-green animate-slide-up ${!currentUser.participates_in_draw ? 'md:col-span-2' : ''
          }`} style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-dark-100 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-lg">
                <List className="w-5 h-5 text-emerald-500" />
              </div>
              Ma liste de souhaits
            </h2>
            {/* Badge de fermeture */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full border border-primary/30">
              <Lock className="w-3 h-3 text-primary" />
              <span className="text-xs font-semibold text-primary">Fermée</span>
            </div>
          </div>

          {/* Message de fermeture compact */}
          <div className="bg-gradient-to-r from-primary/10 to-gold/10 border border-primary/20 p-3 rounded-lg mb-3">
            <p className="text-xs text-dark-300 flex items-center gap-2">
              <CalendarX className="w-4 h-4 text-primary flex-shrink-0" />
              <span>
                <span className="font-semibold text-primary">Période terminée</span> — Vous pouvez encore modifier vos articles existants
              </span>
            </p>
          </div>

          {(wishLists[currentUser.id] || []).length > 0 ? (
            <div className="space-y-2 mb-3 max-h-52 overflow-y-auto scrollbar-hide">
              {(wishLists[currentUser.id] || []).map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 bg-gradient-to-r from-dark-700/50 to-dark-800/50 backdrop-blur-sm border border-white/10 rounded-lg hover:border-emerald-500/50 transition-all duration-300 hover:translate-x-1 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full group-hover:scale-125 transition-transform flex-shrink-0"></div>
                    <p className="font-semibold text-dark-100 flex-1 truncate">{item.item}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-dark-700/50 to-dark-800/50 backdrop-blur-sm border border-white/10 p-5 rounded-lg text-center mb-3">
              <p className="text-dark-400 text-sm flex items-center justify-center gap-2">
                <List className="w-5 h-5" />
                Votre liste est vide
              </p>
            </div>
          )}

          <button
            onClick={() => setView('wishlist')}
            className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white py-2.5 rounded-xl hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-lg hover:shadow-glow-green font-semibold flex items-center justify-center gap-2 group"
          >
            <List className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Voir ma liste
          </button>
        </div>
      </div>

      {/* Message pour les hors-tirage - VERSION ÉQUILIBRÉE */}
      {!currentUser.participates_in_draw && (
        <div className="mt-5 bg-gradient-to-br from-purple-900/20 to-purple-800/20 backdrop-blur-xl rounded-xl shadow-2xl p-5 border border-purple-500/30 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl">
              <UserX className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-lg font-bold text-dark-100 flex items-center justify-center md:justify-start gap-2 mb-1">
                Mode liste seulement
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full border border-purple-500/30">Hors-tirage</span>
              </h2>
              <p className="text-sm text-dark-400">
                Vous pouvez créer votre liste et recevoir des cadeaux, mais vous ne participez pas au tirage au sort
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Raccourci vers les réservations */}
      {currentUser.participates_in_draw && (
        <div className="mt-5 bg-gradient-to-br from-gold/10 via-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-xl shadow-2xl p-5 border border-gold/30 hover:border-gold/50 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-gold/20 to-gold/10 rounded-xl">
                <ShoppingBag className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-dark-100 flex items-center gap-2">
                  Réservez des cadeaux
                </h2>
                <p className="text-sm text-dark-400 mt-1">Parcourez les listes et réservez vos cadeaux</p>
              </div>
            </div>
            <button
              onClick={() => setView('all-lists')}
              className="bg-gradient-to-r from-gold via-gold-500 to-gold-600 text-dark-900 px-5 py-2.5 rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all shadow-lg hover:shadow-glow-gold font-semibold flex items-center gap-2 group whitespace-nowrap"
            >
              <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Voir toutes les listes
            </button>
          </div>
        </div>
      )}

      {/* Security Section - VERSION ÉQUILIBRÉE */}
      <div className={`mt-5 bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-xl shadow-2xl p-5 border border-white/10 hover:border-gold/50 transition-all duration-300 animate-slide-up`} style={{ animationDelay: currentUser.participates_in_draw ? '0.25s' : '0.3s' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-gold/20 to-gold/10 rounded-xl">
              <Lock className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-dark-100 flex items-center gap-2">
                Sécurité
                <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded-full border border-gold/30">Recommandé</span>
              </h2>
              <p className="text-sm text-dark-400 mt-1">Protégez votre compte avec un mot de passe fort</p>
            </div>
          </div>
          <button
            onClick={() => setView('change-password')}
            className="bg-gradient-to-r from-gold via-gold-500 to-gold-600 text-dark-900 px-5 py-2.5 rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all shadow-lg hover:shadow-glow-gold font-semibold flex items-center gap-2 group whitespace-nowrap"
          >
            <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Changer mon mot de passe
          </button>
        </div>
      </div>

      {/* Admin Panel - VERSION ÉQUILIBRÉE */}
      {currentUser.is_admin && (
        <div className={`mt-5 bg-gradient-to-br from-primary/20 via-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-xl shadow-2xl p-5 border border-primary/30 hover:border-primary/50 transition-all duration-300 animate-slide-up hover:shadow-glow-red`} style={{ animationDelay: currentUser.participates_in_draw ? '0.35s' : '0.4s' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-primary/30 to-primary/10 rounded-xl">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-dark-100 flex items-center gap-2">
                  Panneau d'administration
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full border border-primary/30">Admin</span>
                </h2>
                <p className="text-sm text-dark-400 mt-1">Gérez les participants et les attributions</p>
              </div>
            </div>
            <button
              onClick={() => setView('admin')}
              className="bg-gradient-to-r from-primary via-primary-600 to-primary-dark text-white px-5 py-2.5 rounded-xl hover:from-primary-dark hover:to-primary transition-all shadow-lg hover:shadow-glow-red font-semibold flex items-center gap-2 group whitespace-nowrap"
            >
              <Users className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Gérer l'événement
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
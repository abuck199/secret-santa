import React from 'react';
import { Gift, List, Users, Shuffle, Lock, Sparkles, ArrowRight } from 'lucide-react';

const DashboardView = ({ currentUser, assignments, wishLists, getAssignedUser, setView }) => (
  <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
    {/* Welcome Header */}
    <div className="mb-8 text-center">
      <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-gold to-emerald-500 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-2">
        <Sparkles className="w-6 h-6 text-gold animate-pulse" />
        Bienvenue {currentUser.username}!
        <Sparkles className="w-6 h-6 text-gold animate-pulse" />
      </h1>
      <p className="text-dark-400">Votre plateforme d'échange de cadeaux intelligente</p>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      {/* Attribution Card */}
      <div className="bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-xl shadow-2xl p-4 border border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-glow-red animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-dark-100 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
              <Gift className="w-5 h-5 mr-2 text-primary" />
            </div>
            Votre attribution
          </h2>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        </div>

        {assignments[currentUser.id] ? (
          <div>
            <div className="bg-gradient-to-br from-primary/20 via-primary-dark/20 to-emerald-900/20 backdrop-blur-sm border border-primary/30 text-white p-6 rounded-xl mb-4 shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 group-hover:translate-x-full transition-transform duration-1000"></div>
              <p className="text-sm opacity-90 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Vous offrez un cadeau à :
              </p>
              <p className="text-3xl font-bold flex items-center gap-3">
                {getAssignedUser(currentUser.id)?.username}
                <ArrowRight className="w-6 h-6 animate-pulse" />
              </p>
            </div>
            <button
              onClick={() => setView('assignment')}
              className="w-full bg-gradient-to-r from-primary via-primary-600 to-primary-dark text-white py-3 rounded-xl hover:from-primary-dark hover:to-primary transition-all shadow-lg hover:shadow-glow-red font-semibold flex items-center justify-center gap-2 group"
            >
              <Gift className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Voir leur liste de souhaits
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-dark-700/50 to-dark-800/50 backdrop-blur-sm border border-white/10 p-8 rounded-xl text-center">
            <Shuffle className="w-16 h-16 text-primary/50 mx-auto mb-3 animate-float" />
            <p className="text-dark-200 font-semibold mb-2">Pas encore d'attribution</p>
            <p className="text-sm text-dark-400">L'admin va créer les attributions bientôt! 🎁</p>
          </div>
        )}
      </div>

      {/* Wishlist Card */}
      <div className="bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-glow-green animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-dark-100 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-lg">
              <List className="w-6 h-6 text-emerald-500" />
            </div>
            Ma liste de souhaits
          </h2>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>

        {(wishLists[currentUser.id] || []).length > 0 ? (
          <div className="space-y-2 mb-4 max-h-56 overflow-y-auto scrollbar-hide">
            {(wishLists[currentUser.id] || []).map((item, index) => (
              <div
                key={item.id}
                className="p-3 bg-gradient-to-r from-dark-700/50 to-dark-800/50 backdrop-blur-sm border border-white/10 rounded-lg hover:border-emerald-500/50 transition-all duration-300 hover:translate-x-1 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full group-hover:scale-125 transition-transform"></div>
                  <p className="font-semibold text-dark-100 flex-1">{item.item}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-dark-700/50 to-dark-800/50 backdrop-blur-sm border border-white/10 p-6 rounded-lg text-center mb-4">
            <p className="text-dark-400 text-sm flex items-center justify-center gap-2">
              <List className="w-5 h-5" />
              Votre liste est vide
            </p>
          </div>
        )}

        <button
          onClick={() => setView('wishlist')}
          className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white py-3 rounded-xl hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-lg hover:shadow-glow-green font-semibold flex items-center justify-center gap-2 group"
        >
          <List className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Gérer ma liste
        </button>
      </div>
    </div>

    {/* Security Section */}
    <div className="mt-6 bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/10 hover:border-gold/50 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-gold/20 to-gold/10 rounded-xl">
            <Lock className="w-7 h-7 text-gold" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark-100 flex items-center gap-2">
              Sécurité
              <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded-full border border-gold/30">Recommandé</span>
            </h2>
            <p className="text-sm text-dark-400 mt-1">Protégez votre compte avec un mot de passe fort</p>
          </div>
        </div>
        <button
          onClick={() => setView('change-password')}
          className="bg-gradient-to-r from-gold via-gold-500 to-gold-600 text-dark-900 px-6 py-3 rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all shadow-lg hover:shadow-glow-gold font-semibold flex items-center gap-2 group whitespace-nowrap"
        >
          <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Changer mon mot de passe
        </button>
      </div>
    </div>

    {/* Admin Panel */}
    {currentUser.is_admin && (
      <div className="mt-6 bg-gradient-to-br from-primary/20 via-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-primary/30 hover:border-primary/50 transition-all duration-300 animate-slide-up hover:shadow-glow-red" style={{ animationDelay: '0.3s' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary/30 to-primary/10 rounded-xl">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-dark-100 flex items-center gap-2">
                Panneau d'administration
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full border border-primary/30">Admin</span>
              </h2>
              <p className="text-sm text-dark-400 mt-1">Gérez les participants et les attributions</p>
            </div>
          </div>
          <button
            onClick={() => setView('admin')}
            className="bg-gradient-to-r from-primary via-primary-600 to-primary-dark text-white px-6 py-3 rounded-xl hover:from-primary-dark hover:to-primary transition-all shadow-lg hover:shadow-glow-red font-semibold flex items-center gap-2 group whitespace-nowrap"
          >
            <Users className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Gérer l'événement
          </button>
        </div>
      </div>
    )}
  </div>
);

export default DashboardView;
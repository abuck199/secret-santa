import React from 'react';
import { ArrowLeft, Sparkles, Gift, Heart } from 'lucide-react';
import WishlistItem from './WishlistItem';

const AssignmentView = ({
  currentUser,
  assignments,
  wishLists,
  getAssignedUser,
  toggleItemClaimed,
  setView,
  event,
  loading
}) => {
  const assignedUser = getAssignedUser(currentUser.id);
  const assignedUserWishlist = wishLists[assignments[currentUser.id]] || [];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => setView('dashboard')}
        className="text-dark-300 hover:text-white bg-dark-800/50 hover:bg-dark-700/50 backdrop-blur-sm px-4 py-2 rounded-xl mb-6 font-medium transition-all flex items-center gap-2 border border-white/10 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Retour
      </button>

      <div className="bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/10">
        {/* Header festif avec l'attribution - VERSION COMPACTE */}
        <div className="relative mb-6 p-5 bg-gradient-to-br from-primary/30 via-primary/20 to-emerald-900/30 backdrop-blur-sm rounded-xl border border-primary/30 overflow-hidden group">
          {/* Effet de brillance animé */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>

          <div className="relative flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-600 flex items-center justify-center text-dark-900 font-bold text-xl shadow-lg shadow-gold/50 flex-shrink-0">
              {assignedUser?.username.substring(0, 2).toUpperCase()}
            </div>

            {/* Texte */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-xs text-dark-300 opacity-90 font-medium">
                  {event?.name}
                </p>
                <Sparkles className="w-3 h-3 text-gold animate-sparkle" />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-dark-400">Vous offrez un cadeau à :</p>
                <Heart className="w-4 h-4 text-primary animate-pulse flex-shrink-0" fill="currentColor" />
              </div>
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-gold to-white bg-clip-text text-transparent truncate">
                {assignedUser?.username}
              </p>
            </div>
          </div>
        </div>

        {/* Liste de souhaits */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl md:text-2xl font-bold text-dark-100 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-emerald-500 rounded-full"></div>
              Leur liste de souhaits
            </h3>
            <div className="px-3 py-1.5 bg-gradient-to-r from-dark-700/50 to-dark-800/50 backdrop-blur-sm rounded-lg border border-white/10">
              <span className="text-dark-200 font-bold">{assignedUserWishlist.length}</span>
              <span className="text-dark-500 text-xs ml-1">article{assignedUserWishlist.length > 1 ? 's' : ''}</span>
            </div>
          </div>

          {assignedUserWishlist.length > 0 ? (
            <div className="space-y-3">
              {assignedUserWishlist.map((item, index) => (
                <div
                  key={item.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <WishlistItem
                    item={item}
                    showToggle={true}
                    toggleItemClaimed={toggleItemClaimed}
                    currentUser={currentUser}
                    hideClaimedBadge={false}
                    onUpdate={null}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-dark-700/30 to-dark-800/30 backdrop-blur-sm border border-white/10 p-8 rounded-xl text-center">
              <div className="text-5xl mb-3 opacity-50">🎁</div>
              <p className="text-dark-400 font-medium mb-2">Liste vide</p>
              <p className="text-dark-500 text-sm">
                {assignedUser?.username} n'a pas encore ajouté d'articles à sa liste
              </p>
            </div>
          )}
        </div>

        {/* Info footer - VERSION COMPACTE */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-900/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-400 flex items-center gap-2">
            <Sparkles className="w-3 h-3 flex-shrink-0" />
            <span>
              <strong>Conseil :</strong> Réservez les articles qui vous intéressent rapidement !
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssignmentView;
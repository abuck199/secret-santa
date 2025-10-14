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
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Back Button */}
      <button 
        onClick={() => setView('dashboard')}
        className="text-dark-300 hover:text-white bg-dark-800/50 hover:bg-dark-700/50 backdrop-blur-sm px-4 py-2 rounded-xl mb-6 font-medium transition-all flex items-center gap-2 border border-white/10 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Retour
      </button>

      <div className="bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/10">
        {/* Header festif avec l'attribution */}
        <div className="relative mb-6 p-8 bg-gradient-to-br from-primary/30 via-primary/20 to-emerald-900/30 backdrop-blur-sm rounded-2xl border border-primary/30 overflow-hidden group">
          {/* Effet de brillance animé */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-5 h-5 text-primary animate-float" />
              <p className="text-sm text-dark-300 opacity-90 font-medium flex items-center gap-2">
                {event?.name}
                <Sparkles className="w-4 h-4 text-gold animate-pulse" />
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-600 flex items-center justify-center text-dark-900 font-bold text-2xl shadow-lg shadow-gold/50">
                {assignedUser?.username.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-dark-400 mb-1">Vous offrez un cadeau à :</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-white via-gold to-white bg-clip-text text-transparent flex items-center gap-3">
                  {assignedUser?.username}
                  <Heart className="w-8 h-8 text-primary animate-pulse" fill="currentColor" />
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste de souhaits */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-dark-100 flex items-center gap-2">
              <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-emerald-500 rounded-full"></div>
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
            <div className="bg-gradient-to-br from-dark-700/30 to-dark-800/30 backdrop-blur-sm border border-white/10 p-12 rounded-xl text-center">
              <div className="text-6xl mb-4 opacity-50 animate-float">🎁</div>
              <p className="text-dark-400 font-medium mb-2">Liste vide</p>
              <p className="text-dark-500 text-sm">
                {assignedUser?.username} n'a pas encore ajouté d'articles à sa liste
              </p>
            </div>
          )}
        </div>

        {/* Info footer */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-xl">
          <p className="text-sm text-blue-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
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
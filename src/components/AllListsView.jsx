import React from 'react';
import { Users, Sparkles, Crown } from 'lucide-react';
import WishlistItem from './WishlistItem';

const AllListsView = ({
  users,
  wishLists,
  currentUser,
  toggleItemClaimed,
  updateWishlistItem,
  loading
}) => (
  <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
    {/* Header avec effet festif */}
    <div className="bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-6 border border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-dark-100 mb-2 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
              <Users className="w-7 h-7 text-primary" />
            </div>
            Toutes les listes
            <Sparkles className="w-6 h-6 text-gold animate-pulse" />
          </h2>
          <p className="text-dark-400">Réservez des articles pour éviter les doublons</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-900/30 to-emerald-800/30 rounded-lg border border-emerald-500/30">
          <Users className="w-5 h-5 text-emerald-500" />
          <span className="text-emerald-400 font-bold">{users.length}</span>
          <span className="text-dark-400 text-sm">participant{users.length > 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>

    {/* Grid des listes */}
    <div className="grid md:grid-cols-2 gap-4">
      {users.map((user, index) => {
        const userWishlist = wishLists[user.id] || [];
        const reservedCount = userWishlist.filter(i => i.claimed).length;
        const isOwnList = user.id === currentUser.id;

        return (
          <div
            key={user.id}
            className="bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-glow-red animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Header de la carte utilisateur */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  {isOwnList && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-gold to-gold-600 rounded-full p-1">
                      <Crown className="w-3 h-3 text-dark-900" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark-100 flex items-center gap-2">
                    {user.username}
                    {isOwnList && (
                      <span className="text-xs bg-gradient-to-r from-gold/20 to-gold/10 text-gold px-2.5 py-1 rounded-full border border-gold/30 font-bold">
                        Vous
                      </span>
                    )}
                  </h3>
                  {reservedCount > 0 && !isOwnList && (
                    <p className="text-sm text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      {reservedCount} réservé{reservedCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Badge du nombre d'articles */}
              <div className="px-3 py-1.5 bg-gradient-to-r from-dark-700/50 to-dark-800/50 backdrop-blur-sm rounded-lg border border-white/10">
                <span className="text-dark-200 font-bold">{userWishlist.length}</span>
                <span className="text-dark-500 text-xs ml-1">article{userWishlist.length > 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Liste des articles */}
            {userWishlist.length > 0 ? (
              <div className="space-y-3">
                {userWishlist.map((item) => (
                  <WishlistItem
                    key={item.id}
                    item={item}
                    showToggle={!isOwnList}
                    toggleItemClaimed={toggleItemClaimed}
                    currentUser={currentUser}
                    hideClaimedBadge={isOwnList}
                    onUpdate={isOwnList ? updateWishlistItem : null}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-dark-700/30 to-dark-800/30 backdrop-blur-sm border border-white/5 p-8 rounded-xl text-center">
                <div className="text-4xl mb-3 opacity-50">🎁</div>
                <p className="text-dark-500 text-sm">Aucun article</p>
              </div>
            )}
          </div>
        );
      })}
    </div>

    {/* Footer info */}
    {users.length === 0 && (
      <div className="text-center py-12 bg-gradient-to-br from-dark-800/50 to-dark-900/50 backdrop-blur-sm rounded-2xl border border-white/10">
        <Users className="w-16 h-16 text-dark-600 mx-auto mb-4 animate-float" />
        <p className="text-dark-400">Aucun participant pour le moment</p>
      </div>
    )}
  </div>
);

export default AllListsView;
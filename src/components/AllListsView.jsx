import React from 'react';
import WishlistItem from './WishlistItem';

const AllListsView = ({ 
  users, 
  wishLists, 
  currentUser, 
  toggleItemClaimed,
  updateWishlistItem,
  loading 
}) => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border-t-4 border-primary">
      <h2 className="text-3xl font-bold text-stone-800 mb-2">Toutes les listes</h2>
      <p className="text-stone-600">Réservez des articles pour éviter les doublons</p>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      {users.map(user => {
        const userWishlist = wishLists[user.id] || [];
        const reservedCount = userWishlist.filter(i => i.claimed).length;
        const isOwnList = user.id === currentUser.id;
        
        return (
          <div key={user.id} className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-primary">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-stone-800">{user.username}</h3>
                {reservedCount > 0 && !isOwnList && (
                  <p className="text-sm text-green-700 font-medium">
                    {reservedCount} réservé{reservedCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              {isOwnList && (
                <span className="bg-cream text-primary-dark text-xs px-3 py-1 rounded-full font-bold">Vous</span>
              )}
            </div>

            {userWishlist.length > 0 ? (
              <div className="space-y-3">
                {userWishlist.map(item => (
                  <WishlistItem 
                    key={item.id} 
                    item={item}
                    showToggle={!isOwnList}
                    toggleItemClaimed={toggleItemClaimed}
                    currentUser={currentUser}
                    hideClaimedBadge={isOwnList}
                    onUpdate={updateWishlistItem}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-stone-50 border-2 border-stone-200 p-6 rounded-xl text-center">
                <p className="text-stone-600 text-sm">Aucun article</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

export default AllListsView;
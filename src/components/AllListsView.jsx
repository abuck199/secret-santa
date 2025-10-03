import React from 'react';
import WishlistItem from './WishlistItem';

const AllListsView = ({ 
  users, 
  wishLists, 
  currentUser, 
  toggleItemClaimed, 
  searchQuery, 
  setSearchQuery, 
  filterStatus, 
  setFilterStatus, 
  getFilteredUsers, 
  loading 
}) => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border-t-4 border-primary">
      <h2 className="text-3xl font-bold text-stone-800 mb-2">Toutes les listes</h2>
      <p className="text-stone-600 mb-4">Réservez des articles pour éviter les doublons</p>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1">Rechercher</label>
          <input 
            type="text" 
            placeholder="Nom ou article..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1">Statut</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="all">Tous</option>
            <option value="reserved">Avec réservations</option>
            <option value="available">Disponibles</option>
          </select>
        </div>
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      {getFilteredUsers().map(user => {
        const userWishlist = wishLists[user.id] || [];
        // Compter seulement les articles réservés (peu importe par qui)
        const reservedCount = userWishlist.filter(i => i.claimed).length;
        
        return (
          <div key={user.id} className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-primary">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-stone-800">{user.username}</h3>
                {reservedCount > 0 && user.id !== currentUser.id && (
                  <p className="text-sm text-green-700 font-medium">
                    {reservedCount} réservé{reservedCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              {user.id === currentUser.id && (
                <span className="bg-cream text-primary-dark text-xs px-3 py-1 rounded-full font-bold">Vous</span>
              )}
            </div>

            {userWishlist.length > 0 ? (
              <div className="space-y-3">
                {userWishlist.map(item => (
                  <WishlistItem 
                    key={item.id} 
                    item={item} 
                    onToggle={toggleItemClaimed}
                    userId={user.id} 
                    hideClaimedBadge={user.id === currentUser.id} 
                    loading={loading}
                    currentUser={currentUser}
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

    {getFilteredUsers().length === 0 && (
      <div className="bg-white rounded-xl shadow-xl p-12 text-center">
        <p className="text-stone-600">Aucun résultat</p>
      </div>
    )}
  </div>
);

export default AllListsView;
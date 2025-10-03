import React from 'react';
import WishlistItem from './WishlistItem';

const AssignmentView = ({ 
  currentUser, 
  assignments, 
  wishLists, 
  getAssignedUser, 
  toggleItemClaimed, 
  setView, 
  loading 
}) => (
  <div className="max-w-3xl mx-auto px-4 py-8">
    <button 
      onClick={() => setView('dashboard')}
      className="text-white bg-stone-700 hover:bg-stone-800 px-4 py-2 rounded-lg mb-4 font-medium"
    >
      ← Retour
    </button>
    <div className="bg-white rounded-xl shadow-2xl p-6 border-t-4 border-primary">
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-6 rounded-xl mb-6">
        <p className="text-sm opacity-90 mb-2">Vous offrez à :</p>
        <p className="text-3xl font-bold">{getAssignedUser(currentUser.id)?.username}</p>
      </div>

      <h3 className="text-xl font-bold text-stone-800 mb-4">Leur liste</h3>
      
      {(wishLists[assignments[currentUser.id]] || []).length > 0 ? (
        <div className="space-y-3">
          {(wishLists[assignments[currentUser.id]] || []).map(item => (
            <WishlistItem 
              key={item.id} 
              item={item} 
              onToggle={toggleItemClaimed}
              userId={assignments[currentUser.id]} 
              loading={loading}
              currentUser={currentUser}
            />
          ))}
        </div>
      ) : (
        <div className="bg-beige border-2 border-beige-dark p-8 rounded-xl text-center">
          <p className="text-stone-700">Aucun article</p>
        </div>
      )}
    </div>
  </div>
);

export default AssignmentView;
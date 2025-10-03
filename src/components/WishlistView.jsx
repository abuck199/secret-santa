import React from 'react';
import WishlistItem from './WishlistItem';

const WishlistView = ({ 
  currentUser, 
  wishLists, 
  itemForm, 
  setItemForm, 
  addWishlistItem, 
  handleDragStart, 
  handleDragOver, 
  handleDrop, 
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
      <h2 className="text-2xl font-bold text-stone-800 mb-6">Ma liste de souhaits</h2>

      {/* Formulaire */}
      <div className="mb-6 p-4 bg-gradient-to-br from-cream to-beige border-2 border-beige-dark rounded-xl">
        <h3 className="font-bold text-stone-800 mb-3">Ajouter un article</h3>
        <p className="text-xs text-primary-dark mb-3 font-semibold">
          ⚠️ Impossible de supprimer après ajout
        </p>
        <div className="space-y-3">
          <input 
            type="text" 
            placeholder="Nom de l'article" 
            value={itemForm.item}
            onChange={(e) => setItemForm(p => ({ ...p, item: e.target.value }))}
            className="w-full px-4 py-2 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            disabled={loading} 
          />
          <input 
            type="url" 
            placeholder="Lien (optionnel)" 
            value={itemForm.link}
            onChange={(e) => setItemForm(p => ({ ...p, link: e.target.value }))}
            className="w-full px-4 py-2 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            disabled={loading} 
          />
          <button 
            onClick={addWishlistItem} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-lg hover:from-primary-dark hover:to-primary-dark transition shadow-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Ajout...' : 'Ajouter'}
          </button>
        </div>
      </div>

      <div className="mb-4 text-sm text-stone-600">💡 Glissez-déposez pour réorganiser</div>

      <div className="space-y-3">
        {(wishLists[currentUser.id] || []).map(item => (
          <div 
            key={item.id} 
            draggable 
            onDragStart={() => handleDragStart(item)}
            onDragOver={handleDragOver} 
            onDrop={() => handleDrop(item)} 
            className="cursor-move"
          >
            <WishlistItem item={item} showToggle={false} currentUser={currentUser} hideClaimedBadge={true} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default WishlistView;
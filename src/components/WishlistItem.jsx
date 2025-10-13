import React, { useState } from 'react';
import { ExternalLink, Check, Edit2, X, Save } from 'lucide-react';
import confetti from 'canvas-confetti';

const WishlistItem = ({ 
  item, 
  showToggle = true, 
  toggleItemClaimed, 
  currentUser, 
  hideClaimedBadge = false,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.item);
  const [editedLink, setEditedLink] = useState(item.link || '');

  const handleSave = () => {
    if (editedName.trim() && onUpdate) {
      onUpdate(item.id, editedName.trim(), editedLink.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedName(item.item);
    setEditedLink(item.link || '');
    setIsEditing(false);
  };

  const handleReserve = () => {
    // Confetti seulement quand on réserve (pas quand on annule)
    if (!item.claimed) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#9b8578', '#D5BDAF', '#F5EBE0']
      });
    }
    
    // Appeler la fonction de réservation
    if (toggleItemClaimed) {
      toggleItemClaimed(item.id, item.claimed);
    }
  };

  // Vérifier si c'est l'utilisateur actuel qui a réservé
  const isReservedByCurrentUser = item.claimed && item.reservedBy === currentUser?.id;
  // Vérifier si c'est réservé par quelqu'un d'autre
  const isReservedByOther = item.claimed && item.reservedBy !== currentUser?.id;

  // Mode édition
  if (isEditing) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-300">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nom de l'article
            </label>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full px-3 py-2 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nom de l'article"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Lien (optionnel)
            </label>
            <input
              type="url"
              value={editedLink}
              onChange={(e) => setEditedLink(e.target.value)}
              className="w-full px-3 py-2 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-700 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mode affichage normal
  return (
    <div className="bg-gradient-to-r from-cream to-beige p-4 rounded-lg border-2 border-beige-dark">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-stone-800">{item.item}</h4>
            {!hideClaimedBadge && item.claimed && (
              <span className="bg-green-200 text-green-900 text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" />
                Réservé
              </span>
            )}
          </div>
          
          {item.link && (
            <a 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
            >
              <ExternalLink className="w-3 h-3" />
              Voir le produit
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 ml-2">
          {/* Bouton de modification (seulement pour le propriétaire et si pas réservé) */}
          {currentUser && item.userId === currentUser.id && !item.claimed && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition"
              title="Modifier"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {/* Bouton de réservation */}
          {showToggle && toggleItemClaimed && (
            <>
              {/* Si pas réservé, afficher bouton "Réserver" */}
              {!item.claimed && (
                <button
                  onClick={handleReserve}
                  className="px-3 py-2 rounded-lg font-semibold transition bg-primary text-white hover:bg-primary-dark"
                >
                  Réserver
                </button>
              )}
              
              {/* Si réservé par l'utilisateur actuel, afficher bouton "Annuler" */}
              {isReservedByCurrentUser && (
                <button
                  onClick={handleReserve}
                  className="px-3 py-2 rounded-lg font-semibold transition bg-stone-300 text-stone-700 hover:bg-stone-400"
                >
                  Annuler
                </button>
              )}
              
              {/* Si réservé par quelqu'un d'autre, afficher texte "Réservé" désactivé */}
              {isReservedByOther && (
                <button
                  disabled
                  className="px-3 py-2 rounded-lg font-semibold bg-stone-200 text-stone-500 cursor-not-allowed"
                >
                  Réservé
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistItem;
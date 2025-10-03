import React from 'react';
import { Mail, Check } from 'lucide-react';

const WishlistItem = ({ item, onToggle, showToggle = true, userId, hideClaimedBadge = false, loading, currentUser }) => {
  const isReservedByMe = item.reservedBy === currentUser?.id;
  const isReservedByOther = item.claimed && item.reservedBy && item.reservedBy !== currentUser?.id;
  
  return (
    <div className="p-4 bg-gradient-to-r from-cream to-beige border-2 border-beige-dark rounded-xl">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <p className="font-bold text-stone-800">{item.item}</p>
            {item.claimed && !hideClaimedBadge && (
              <span className="bg-green-200 text-green-900 text-xs px-2 py-1 rounded-full font-semibold">
                <Check className="w-3 h-3 inline" /> {isReservedByMe ? 'Réservé par vous' : 'Réservé'}
              </span>
            )}
          </div>
          {item.link && (
            <a 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary-dark hover:text-primary text-sm flex items-center mt-2 font-medium"
            >
              <Mail className="w-4 h-4 mr-1" />Voir le produit
            </a>
          )}
        </div>
        {showToggle && userId !== currentUser?.id && (
          <button 
            onClick={() => onToggle(item.id, item.claimed)} 
            disabled={loading || isReservedByOther}
            className={`ml-3 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md disabled:opacity-50 ${
              isReservedByMe ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' 
                            : isReservedByOther ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary-dark'
            }`}
          >
            {isReservedByMe ? 'Annuler' : isReservedByOther ? 'Indisponible' : 'Réserver'}
          </button>
        )}
      </div>
    </div>
  );
}

export default WishlistItem;
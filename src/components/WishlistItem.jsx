import React, { useState, useEffect } from 'react';
import { ExternalLink, Check, Edit2, X, Save, Sparkles, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

const WishlistItem = ({
  item,
  showToggle = true,
  toggleItemClaimed,
  currentUser,
  hideClaimedBadge = false,
  onUpdate,
  setIsEditing,
  loading = false
}) => {
  const [isEditingLocal, setIsEditingLocal] = useState(false);
  const [editedName, setEditedName] = useState(item.item);
  const [editedLink, setEditedLink] = useState(item.link || '');

  useEffect(() => {
    if (setIsEditing) {
      setIsEditing(isEditingLocal);
    }
  }, [isEditingLocal, setIsEditing]);

  const handleSave = () => {
    if (editedName.trim() && onUpdate) {
      onUpdate(item.id, editedName.trim(), editedLink.trim());
      setIsEditingLocal(false);
    }
  };

  const handleCancel = () => {
    setEditedName(item.item);
    setEditedLink(item.link || '');
    setIsEditingLocal(false);
  };

  const handleEdit = () => {
    setIsEditingLocal(true);
  };

  const handleReserve = () => {
    if (!item.claimed) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#dc2626', '#fbbf24', '#10b981']
      });
    }

    if (toggleItemClaimed) {
      toggleItemClaimed(item.id, item.claimed);
    }
  };

  const isReservedByCurrentUser = item.claimed && item.reservedBy === currentUser?.id;
  const isReservedByOther = item.claimed && item.reservedBy !== currentUser?.id;

  if (isEditingLocal) {
    return (
      <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-sm p-4 rounded-xl border-2 border-blue-500/50 shadow-lg animate-scale-in">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-blue-300 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Nom de l'article
            </label>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full px-3 py-2 bg-dark-900/50 border-2 border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 outline-none text-dark-100 placeholder-dark-500"
              placeholder="Nom de l'article"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-blue-300 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Lien (optionnel)
            </label>
            <input
              type="url"
              value={editedLink}
              onChange={(e) => setEditedLink(e.target.value)}
              className="w-full px-3 py-2 bg-dark-900/50 border-2 border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 outline-none text-dark-100 placeholder-dark-500"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-glow-green"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-dark-700/50 hover:bg-dark-600/50 backdrop-blur-sm text-dark-200 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all border border-white/10"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-dark-800/60 to-dark-900/60 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:border-emerald-500/50 transition-all duration-300 group hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-dark-100 group-hover:text-emerald-400 transition-colors">{item.item}</h4>
            {!hideClaimedBadge && item.claimed && (
              <>
                {isReservedByCurrentUser ? (
                  <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 shadow-lg">
                    <Check className="w-3 h-3" />
                    Réservé par vous
                  </span>
                ) : (
                  <span className="bg-dark-700/80 text-dark-300 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 border border-dark-600">
                    <Lock className="w-3 h-3" />
                    Déjà pris
                  </span>
                )}
              </>
            )}
          </div>

          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-2 font-medium transition-colors group/link"
            >
              <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
              Voir le produit
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 ml-2">
          {/* Bouton de modification */}
          {currentUser && item.userId === currentUser.id && onUpdate && (
            <button
              onClick={handleEdit}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white p-2 rounded-lg transition-all shadow-lg hover:scale-110"
              title="Modifier"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {/* Bouton de réservation */}
          {showToggle && toggleItemClaimed && (
            <>
              {!item.claimed && (
                <button
                  onClick={handleReserve}
                  disabled={loading}
                  className="px-3 py-2 rounded-lg font-semibold transition-all bg-gradient-to-r from-primary via-primary-600 to-primary-dark text-white hover:from-primary-dark hover:to-primary shadow-lg hover:shadow-glow-red flex items-center gap-1.5 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
                  )}
                  {loading ? 'Réservation...' : 'Réserver'}
                </button>
              )}

              {isReservedByCurrentUser && (
                <button
                  onClick={handleReserve}
                  disabled={loading}
                  className="px-3 py-2 rounded-lg font-semibold transition-all bg-dark-700/50 hover:bg-dark-600/50 backdrop-blur-sm text-dark-200 border border-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Annulation...' : 'Annuler'}
                </button>
              )}

              {isReservedByOther && (
                <button
                  disabled
                  className="px-3 py-2 rounded-lg font-semibold bg-dark-800/30 text-dark-600 cursor-not-allowed border border-white/5"
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
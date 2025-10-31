import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ArrowLeft, Plus, Sparkles, List as ListIcon } from 'lucide-react';
import WishlistItem from './WishlistItem';
import AIGiftSuggestions from './AIGiftSuggestions';
import ConfirmationModal from './ConfirmationModal';

const SortableWishlistItem = ({ item, currentUser, updateWishlistItem }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2 group">
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none p-2 hover:bg-white/10 rounded-lg transition-colors mt-1 flex-shrink-0 backdrop-blur-sm"
        aria-label="Déplacer l'article"
      >
        <GripVertical className="w-5 h-5 text-dark-500 group-hover:text-emerald-500 transition-colors" />
      </div>

      <div className="flex-1 min-w-0">
        <WishlistItem
          item={item}
          showToggle={false}
          currentUser={currentUser}
          hideClaimedBadge={true}
          onUpdate={updateWishlistItem}
        />
      </div>
    </div>
  );
};

const WishlistView = ({
  currentUser,
  wishLists,
  itemForm,
  setItemForm,
  addWishlistItem,
  updateWishlistItem,
  updateWishlistOrder,
  setView,
  loading
}) => {
  const items = wishLists[currentUser.id] || [];

  // État pour la modal de confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);

      if (updateWishlistOrder) {
        updateWishlistOrder(currentUser.id, newItems);
      }
    }
  };

  // Fonction pour ajouter un article depuis l'IA
  const handleAddFromAI = (itemName, itemLink) => {
    setPendingItem({ name: itemName, link: itemLink });
    setShowConfirmModal(true);
  };

  // Fonction appelée lors du clic sur "Ajouter à ma liste"
  const handleAddClick = () => {
    if (!itemForm.item.trim()) return;

    setPendingItem({ name: itemForm.item, link: itemForm.link });
    setShowConfirmModal(true);
  };

  // Fonction de confirmation qui ajoute vraiment l'article
  const confirmAddItem = () => {
    if (pendingItem) {
      setItemForm({ item: pendingItem.name, link: pendingItem.link });
      setTimeout(() => {
        addWishlistItem();
        setPendingItem(null);
      }, 100);
    }
  };

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in">
        {/* Back Button */}
        <button
          onClick={() => setView('dashboard')}
          className="text-dark-300 hover:text-white bg-dark-800/50 hover:bg-dark-700/50 backdrop-blur-sm px-4 py-2 rounded-xl mb-6 font-medium transition-all flex items-center gap-2 border border-white/10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour
        </button>

        <div className="bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-dark-100 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl">
                <ListIcon className="w-7 h-7 text-emerald-500" />
              </div>
              Ma liste de souhaits
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-dark-400">
                {items.length} article{items.length > 1 ? 's' : ''}
              </span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* ===== FORMULAIRE D'AJOUT MANUEL EN PREMIER ===== */}
          <div className="mb-6 p-5 bg-gradient-to-br from-emerald-900/20 via-dark-800/50 to-dark-900/50 backdrop-blur-sm border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-dark-100">Ajouter manuellement</h3>
              <Sparkles className="w-4 h-4 text-gold animate-pulse" />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Vous pouvez modifier vos articles après les avoir ajoutés
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nom de l'article"
                value={itemForm.item}
                onChange={(e) => setItemForm(p => ({ ...p, item: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-900/50 border-2 border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 outline-none transition-all text-dark-100 placeholder-dark-500"
                disabled={loading}
              />
              <input
                type="url"
                placeholder="Lien (optionnel)"
                value={itemForm.link}
                onChange={(e) => setItemForm(p => ({ ...p, link: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-900/50 border-2 border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 outline-none transition-all text-dark-100 placeholder-dark-500"
                disabled={loading}
              />
              <button
                onClick={handleAddClick}
                disabled={loading || !itemForm.item.trim()}
                className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white py-3 rounded-xl hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-lg hover:shadow-glow-green font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                {loading ? 'Ajout...' : 'Ajouter à ma liste'}
              </button>
            </div>
          </div>

          {/* ===== ASSISTANT IA EN DEUXIÈME ===== */}
          <AIGiftSuggestions
            onAddToList={handleAddFromAI}
            currentUser={currentUser}
          />

          {/* Instructions */}
          {items.length > 0 && (
            <div className="mb-4 p-3 bg-gradient-to-r from-gold/10 to-primary/10 border border-gold/30 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-gold flex items-center gap-2">
                <GripVertical className="w-4 h-4" />
                <span className="hidden md:inline">Utilisez ☰ pour réorganiser • Cliquez sur ✏️ pour modifier</span>
                <span className="md:hidden">Maintenez ☰ pour déplacer • ✏️ pour modifier</span>
              </p>
            </div>
          )}

          {/* Liste des articles */}
          {items.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {items.map((item) => (
                    <SortableWishlistItem
                      key={item.id}
                      item={item}
                      currentUser={currentUser}
                      updateWishlistItem={updateWishlistItem}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-dark-700/30 to-dark-800/30 backdrop-blur-sm rounded-xl border border-white/5">
              <ListIcon className="w-16 h-16 text-dark-600 mx-auto mb-4 animate-float" />
              <p className="text-dark-400 flex items-center justify-center gap-2">
                Aucun article dans votre liste
              </p>
              <p className="text-dark-500 text-sm mt-2">Utilisez l'IA ou ajoutez manuellement ! 🎁</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPendingItem(null);
        }}
        onConfirm={confirmAddItem}
        title="Ajouter cet article ?"
        message={
          <div className="space-y-3">
            <p className="font-semibold text-dark-100">
              "{pendingItem?.name}"
            </p>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-400 font-medium mb-2">
                ⚠️ Attention : Impossible de supprimer après ajout
              </p>
              <p className="text-xs text-red-300">
                Vous pourrez seulement modifier le nom et le lien, mais l'article restera dans votre liste de façon permanente.
              </p>
            </div>
            <p className="text-sm text-dark-400">
              Êtes-vous sûr de vouloir ajouter cet article ?
            </p>
          </div>
        }
        confirmText="Ajouter"
        cancelText="Annuler"
        type="warning"
      />
    </>
  );
};

export default WishlistView;
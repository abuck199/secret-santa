import React from 'react';
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
import { GripVertical } from 'lucide-react';
import WishlistItem from './WishlistItem';

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
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none p-2 hover:bg-stone-100 rounded transition-colors mt-1 flex-shrink-0"
        aria-label="Déplacer l'article"
      >
        <GripVertical className="w-5 h-5 text-stone-400" />
      </div>
      
      <div className="flex-1 min-w-0">
        <WishlistItem 
          item={item} 
          showToggle={false} 
          currentUser={currentUser} 
          hideClaimedBadge={true}
          onUpdate={updateWishlistItem} // ← Passer la fonction de mise à jour
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
  updateWishlistItem, // ← Recevoir la fonction
  updateWishlistOrder,
  setView, 
  loading 
}) => {
  const items = wishLists[currentUser.id] || [];

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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button 
        onClick={() => setView('dashboard')} 
        className="text-white bg-stone-700 hover:bg-stone-800 px-4 py-2 rounded-lg mb-4 font-medium transition-colors"
      >
        ← Retour
      </button>
      <div className="bg-white rounded-xl shadow-2xl p-6 border-t-4 border-primary">
        <h2 className="text-2xl font-bold text-stone-800 mb-6">Ma liste de souhaits</h2>

        {/* Formulaire d'ajout */}
        <div className="mb-6 p-4 bg-gradient-to-br from-cream to-beige border-2 border-beige-dark rounded-xl">
          <h3 className="font-bold text-stone-800 mb-3">Ajouter un article</h3>
          <p className="text-xs text-primary-dark mb-3 font-semibold">
            💡 Vous pouvez modifier vos articles après les avoir ajoutés
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
              className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-lg hover:from-primary-dark hover:to-primary-dark transition shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </div>

        {/* Instructions */}
        {items.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="hidden md:inline">💡 Utilisez l'icône ☰ pour réorganiser • Cliquez sur ✏️ pour modifier</span>
              <span className="md:hidden">💡 Maintenez ☰ pour déplacer • ✏️ pour modifier</span>
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
                    updateWishlistItem={updateWishlistItem} // ← Passer ici
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-8 text-stone-500">
            Aucun article dans votre liste. Ajoutez-en un ci-dessus ! 🎁
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistView;
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

// Composant wrapper pour chaque item draggable
const SortableWishlistItem = ({ item, currentUser }) => {
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
      {/* Handle de drag - fonctionne sur mobile et desktop */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none p-2 hover:bg-stone-100 rounded transition-colors mt-1 flex-shrink-0"
        aria-label="Déplacer l'article"
      >
        <GripVertical className="w-5 h-5 text-stone-400" />
      </div>
      
      {/* Le contenu de votre item */}
      <div className="flex-1 min-w-0">
        <WishlistItem 
          item={item} 
          showToggle={false} 
          currentUser={currentUser} 
          hideClaimedBadge={true} 
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
  updateWishlistOrder,
  setView, 
  loading 
}) => {
  const items = wishLists[currentUser.id] || [];

  // Senseurs pour supporter souris, tactile et clavier
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px de mouvement avant de commencer le drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms de délai sur mobile pour éviter conflits avec scroll
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Quand un item est déplacé
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      // Réorganiser les items
      const newItems = arrayMove(items, oldIndex, newIndex);
      
      // Appeler la fonction parent pour mettre à jour dans Supabase
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
              className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-lg hover:from-primary-dark hover:to-primary-dark transition shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </div>

        {/* Instructions avec icône mobile/desktop */}
        {items.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="hidden md:inline">💡 Utilisez l'icône ☰ pour glisser-déposer et réorganiser par priorité</span>
              <span className="md:hidden">💡 Maintenez l'icône ☰ appuyée pour déplacer les articles</span>
            </p>
          </div>
        )}

        {/* Liste draggable avec dnd-kit */}
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
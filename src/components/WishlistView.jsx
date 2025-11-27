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
import { GripVertical, ArrowLeft, Sparkles, List as ListIcon, Clock, Lock, CalendarX, Gift, Edit2, PartyPopper } from 'lucide-react';
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

const DeadlineMessage = () => {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-dark-800/80 to-dark-900/80 backdrop-blur-xl shadow-2xl">
      <div className="relative bg-gradient-to-r from-primary/20 via-primary/10 to-gold/20 px-6 py-4 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        <div className="relative flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-primary/30 to-primary/10 rounded-xl border border-primary/30">
            <CalendarX className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-dark-100 flex items-center gap-2">
              Période d'ajout terminée
              <Lock className="w-4 h-4 text-primary/70" />
            </h3>
            <p className="text-sm text-dark-400">26 novembre 2025</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-gradient-to-br from-gold/20 to-gold/5 rounded-xl border border-gold/30">
            <Clock className="w-8 h-8 text-gold" />
          </div>
          <div className="flex-1">
            <p className="text-dark-200 leading-relaxed">
              La date limite pour ajouter des articles à votre liste était le <span className="font-bold text-primary">26 novembre 2025</span>.
              Il n'est plus possible d'ajouter de nouveaux articles.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-900/20 to-emerald-800/20 border border-emerald-500/30 rounded-xl p-4">
          <h4 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            Ce que vous pouvez encore faire :
          </h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-dark-300">
              <Edit2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Modifier vos articles existants (nom et lien)</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-dark-300">
              <GripVertical className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Réorganiser l'ordre de votre liste</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-dark-300">
              <Gift className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Réserver des articles dans les listes des autres</span>
            </li>
          </ul>
        </div>
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
  loading,
  setIsEditing,
  setLoading,
  loadWishLists,
  supabase
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
    <>
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 animate-fade-in">
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

          {/* ===== MESSAGE DE DATE LIMITE DÉPASSÉE ===== */}
          <DeadlineMessage />

          {/* Instructions de modification */}
          {items.length > 0 && (
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-blue-400 flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                <span className="hidden md:inline">Utilisez ☰ pour réorganiser • Cliquez sur ✏️ pour modifier vos articles</span>
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
                Votre liste est vide
              </p>
              <p className="text-dark-500 text-sm mt-2">
                La période d'ajout est terminée
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WishlistView;
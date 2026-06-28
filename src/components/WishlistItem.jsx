import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ExternalLink, Pencil, Trash2, Check, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { hostOf } from '../lib/url';

// A single editable, draggable item on the owner's own wishlist.
export default function WishlistItem({ item, onSave, onDelete, disabled }) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.item);
  const [link, setLink] = useState(item.link || '');

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: editing || disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  async function save() {
    const ok = await onSave(item.id, name, link);
    if (ok) setEditing(false);
  }

  function cancel() {
    setName(item.item);
    setLink(item.link || '');
    setEditing(false);
  }

  if (editing) {
    return (
      <div ref={setNodeRef} style={style} className="card p-4">
        <input
          className="input mb-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
          placeholder={t('wishlist.addPlaceholder')}
          autoFocus
        />
        <input
          className="input mb-3"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          maxLength={500}
          placeholder={t('wishlist.linkPlaceholder')}
        />
        <div className="flex gap-2 justify-end">
          <button className="btn-ghost px-3 py-2" onClick={cancel}>
            <X className="w-4 h-4" /> {t('common.cancel')}
          </button>
          <button className="btn-primary px-3 py-2" onClick={save}>
            <Check className="w-4 h-4" /> {t('common.save')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group card px-3 sm:px-4 py-3.5 flex items-center gap-3 transition ${
        isDragging ? 'shadow-card ring-1 ring-gold/40' : 'hover:border-line'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-line group-hover:text-mute hover:!text-fg cursor-grab active:cursor-grabbing touch-none transition"
        title={t('wishlist.dragHint')}
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-fg break-words">{item.item}</p>
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-mute hover:text-gold transition mt-0.5"
          >
            <ExternalLink className="w-3 h-3" /> {hostOf(item.link)}
          </a>
        )}
      </div>

      <div className="flex items-center gap-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition">
        <button
          onClick={() => setEditing(true)}
          className="p-2 rounded-lg text-mute hover:text-fg hover:bg-panel-2"
          title={t('common.edit')}
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(item)}
          className="p-2 rounded-lg text-mute hover:text-red-600 hover:bg-red-500/10"
          title={t('common.delete')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

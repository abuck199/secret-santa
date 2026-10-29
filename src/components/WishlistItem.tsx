'use client';

import { useId, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, ExternalLink, Gift, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { useI18n } from '@/i18n/client';
import { hostOf } from '@/lib/url';
import type { MyItem } from '@/server/queries/wishlist';

// A single editable, draggable item on the owner's own wishlist. Edit and
// remove are always-visible labelled buttons (no hover-only icons on phones).
export default function WishlistItem({
  item,
  onSave,
  onDelete,
  fresh = false,
  disabled,
}: {
  item: MyItem;
  onSave: (id: string, name: string, link: string) => Promise<boolean>;
  onDelete: (item: MyItem) => void;
  fresh?: boolean; // just added: pops in
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.item);
  const [link, setLink] = useState(item.link || '');
  const nameId = useId();
  const linkId = useId();

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
      <form
        ref={setNodeRef}
        style={style}
        className="card p-4 animate-pop"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label htmlFor={nameId} className="label">{t('wishlist.itemLabel')}</label>
        <input
          id={nameId}
          className="input mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
          autoFocus
        />
        <label htmlFor={linkId} className="label">{t('wishlist.linkLabel')}</label>
        <input
          id={linkId}
          className="input"
          type="url"
          inputMode="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          maxLength={500}
          placeholder={t('wishlist.linkPlaceholder')}
        />
        <div className="flex gap-2.5 justify-end mt-4">
          <button type="button" className="btn-secondary" onClick={cancel}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="btn-primary">
            <Check className="w-[18px] h-[18px]" strokeWidth={2.6} aria-hidden="true" /> {t('common.save')}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card p-3 sm:p-3.5 flex items-start gap-2.5 ${
        isDragging ? 'shadow-card ring-2 ring-brand/40' : ''
      } ${fresh ? 'animate-pop ring-2 ring-sun' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="self-center w-8 h-11 -ml-1 shrink-0 grid place-items-center rounded-lg text-mute hover:text-fg cursor-grab active:cursor-grabbing touch-none"
        aria-label={t('wishlist.dragHint')}
      >
        <GripVertical className="w-5 h-5" aria-hidden="true" />
      </button>

      <span className="w-12 h-12 shrink-0 rounded-2xl bg-brand-soft text-brand-ink grid place-items-center" aria-hidden="true">
        <Gift className="w-6 h-6" strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-base font-bold text-fg leading-snug break-words pt-0.5">{item.item}</p>
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:underline mt-0.5"
          >
            {hostOf(item.link)}
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            onClick={() => setEditing(true)}
            className="press inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-full bg-panel-2 text-sm font-semibold text-fg"
          >
            <Pencil className="w-4 h-4" aria-hidden="true" /> {t('common.edit')}
          </button>
          <button
            onClick={() => onDelete(item)}
            className="press inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-full text-sm font-semibold text-red-700 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" /> {t('wishlist.remove')}
          </button>
        </div>
      </div>
    </div>
  );
}

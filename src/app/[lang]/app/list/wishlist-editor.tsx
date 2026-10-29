'use client';

import { useEffect, useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Gift, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';
import { ADD_FIELD_ID } from '@/components/NavBar';
import PageHeader, { Page } from '@/components/PageHeader';
import LinkPreviewCard from '@/components/LinkPreviewCard';
import { useLinkPreview } from '@/components/useLinkPreview';
import WishlistItem from '@/components/WishlistItem';
import { useI18n } from '@/i18n/client';
import { actionErrorMessage } from '@/lib/action-error';
import { hostOf, normalizeUrl } from '@/lib/url';
import { addItem, deleteItem, reorderItems, updateItem } from '@/server/actions/wishlist';
import type { MyItem } from '@/server/queries/wishlist';

const MAX_ITEMS = 50; // mirrored for the counter; the server enforces it

export default function WishlistEditor({
  householdId,
  householdName,
  initialItems,
}: {
  householdId: string;
  householdName: string; // lists are per household: say which one
  initialItems: MyItem[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{ item: string; link: string; imageUrl: string | null }>({ item: '', link: '', imageUrl: null });
  const preview = useLinkPreview();
  const [toDelete, setToDelete] = useState<MyItem | null>(null);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const linkId = useId();

  // Arriving from the "+ Ajouter" tab (/app/list#add): straight to the add field.
  // Also runs when Activity reveals this page again, since effects re-mount then.
  useEffect(() => {
    if (window.location.hash === `#${ADD_FIELD_ID}`) document.getElementById(ADD_FIELD_ID)?.focus();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function add() {
    const name = form.item.trim();
    if (!name || saving) return;
    if (items.length >= MAX_ITEMS) return toast.error(t('wishlist.max', { max: MAX_ITEMS }));
    // Quick client-side feedback; the server re-checks the link anyway.
    if (normalizeUrl(form.link) === false) return toast.error(t('err.invalid_link'));

    setSaving(true);
    const res = await addItem(householdId, { item: name, link: form.link, imageUrl: form.imageUrl });
    setSaving(false);
    if (!res.ok) return toast.error(actionErrorMessage(t, res));
    setItems((prev) => [...prev, res.data]);
    setLastAdded(res.data.id);
    setForm({ item: '', link: '', imageUrl: null });
    preview.reset();
    toast.success(t('wishlist.added'));
  }

  // A pasted shop link fills in the photo, and the name if it's still empty.
  async function lookupLink(link: string) {
    const found = await preview.lookup(link);
    setForm((f) => ({
      ...f,
      imageUrl: found?.image ?? null,
      item: f.item.trim() || !found?.title ? f.item : found.title,
    }));
  }

  async function save(id: string, name: string, link: string, imageUrl: string | null) {
    if (!name.trim()) {
      toast.error(t('common.required'));
      return false;
    }
    if (normalizeUrl(link) === false) {
      toast.error(t('err.invalid_link'));
      return false;
    }
    const res = await updateItem(id, { item: name.trim(), link, imageUrl });
    if (!res.ok) {
      toast.error(actionErrorMessage(t, res));
      return false;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? res.data : i)));
    toast.success(t('wishlist.updated'));
    return true;
  }

  async function confirmDelete() {
    const item = toDelete;
    setToDelete(null);
    if (!item) return;
    const prev = items;
    setItems((p) => p.filter((i) => i.id !== item.id));
    const res = await deleteItem(item.id);
    if (!res.ok) {
      setItems(prev);
      return toast.error(actionErrorMessage(t, res));
    }
    toast.success(t('wishlist.deleted'));
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    const res = await reorderItems(householdId, reordered.map((i) => i.id));
    if (!res.ok) {
      toast.error(actionErrorMessage(t, res));
      router.refresh();
    }
  }

  return (
    <Page>
      <PageHeader eyebrow={householdName} title={t('wishlist.title')} subtitle={t('wishlist.subtitle')} />

      {/* Add form: labels above the fields (placeholders vanish while typing). */}
      <form
        className="card p-4 sm:p-5 mb-6 animate-rise [animation-delay:80ms]"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <h2 className="heading text-lg text-fg mb-3">{t('wishlist.addTitle')}</h2>
        <label htmlFor={ADD_FIELD_ID} className="label">{t('wishlist.itemLabel')}</label>
        <input
          id={ADD_FIELD_ID}
          className="input scroll-mt-24"
          value={form.item}
          onChange={(e) => setForm((p) => ({ ...p, item: e.target.value }))}
          placeholder={t('wishlist.addPlaceholder')}
          maxLength={200}
        />
        <label htmlFor={linkId} className="label mt-3">{t('wishlist.linkLabel')}</label>
        <input
          id={linkId}
          className="input"
          type="url"
          inputMode="url"
          value={form.link}
          onChange={(e) => {
            const link = e.target.value;
            setForm((p) => ({ ...p, link, ...(link.trim() ? {} : { imageUrl: null }) }));
            if (!link.trim()) preview.reset();
          }}
          onPaste={(e) => {
            const field = e.currentTarget;
            setTimeout(() => lookupLink(field.value)); // after the pasted text lands
          }}
          onBlur={(e) => lookupLink(e.target.value)}
          placeholder={t('wishlist.linkPlaceholder')}
          aria-describedby={`${linkId}-hint`}
          maxLength={500}
        />
        <p id={`${linkId}-hint`} className="text-sm text-mute mt-1.5">{t('wishlist.linkHint')}</p>
        <LinkPreviewCard
          status={preview.status}
          title={preview.preview?.title ?? null}
          imageUrl={form.imageUrl}
          site={hostOf(form.link)}
          canUseTitle={!!preview.preview?.title && !!form.item.trim() && form.item.trim() !== preview.preview.title}
          onUseTitle={() => setForm((f) => ({ ...f, item: preview.preview?.title ?? f.item }))}
          onRemovePhoto={() => setForm((f) => ({ ...f, imageUrl: null }))}
        />
        <div className="flex items-center justify-between gap-3 mt-4">
          <span className="font-mono text-xs font-semibold text-mute tabular-nums">
            {t('wishlist.count', { count: items.length, max: MAX_ITEMS })}
          </span>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? (
              <Loader2 className="w-[18px] h-[18px] animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="w-[18px] h-[18px]" strokeWidth={2.6} aria-hidden="true" />
            )}
            {t('wishlist.addButton')}
          </button>
        </div>
      </form>

      {/* List */}
      {items.length === 0 ? (
        <div className="card p-8 text-center animate-rise [animation-delay:160ms]">
          <span className="w-14 h-14 rounded-2xl bg-brand-soft text-brand-ink grid place-items-center mx-auto mb-3" aria-hidden="true">
            <Gift className="w-7 h-7" strokeWidth={2} />
          </span>
          <p className="text-[15px] text-mute">{t('wishlist.empty')}</p>
        </div>
      ) : (
        // Fixed id: dnd-kit's generated one differs between server and browser (hydration warning).
        <DndContext id="wishlist" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2.5">
              {items.map((item, i) => (
                <div key={item.id} className="animate-rise" style={{ animationDelay: `${160 + Math.min(i, 8) * 50}ms` }}>
                  <WishlistItem item={item} onSave={save} onDelete={setToDelete} fresh={item.id === lastAdded} />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ConfirmModal
        open={!!toDelete}
        title={t('wishlist.deleteTitle')}
        message={t('wishlist.deleteConfirm')}
        confirmLabel={t('wishlist.remove')}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        <p className="mt-3 p-3 rounded-2xl bg-paper text-base font-bold text-fg break-words">{toDelete?.item}</p>
      </ConfirmModal>
    </Page>
  );
}

'use client';

import { useState } from 'react';
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
import { ClipboardList, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';
import PageHeader, { Page } from '@/components/PageHeader';
import WishlistItem from '@/components/WishlistItem';
import { useI18n } from '@/i18n/client';
import { actionErrorMessage } from '@/lib/action-error';
import { normalizeUrl } from '@/lib/url';
import { addItem, deleteItem, reorderItems, updateItem } from '@/server/actions/wishlist';
import type { MyItem } from '@/server/queries/wishlist';

const MAX_ITEMS = 50; // mirrored for the counter; the server enforces it

export default function WishlistEditor({ householdId, initialItems }: { householdId: string; initialItems: MyItem[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ item: '', link: '' });
  const [toDelete, setToDelete] = useState<MyItem | null>(null);

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
    const res = await addItem(householdId, { item: name, link: form.link });
    setSaving(false);
    if (!res.ok) return toast.error(actionErrorMessage(t, res));
    setItems((prev) => [...prev, res.data]);
    setForm({ item: '', link: '' });
    toast.success(t('wishlist.added'));
  }

  async function save(id: string, name: string, link: string) {
    if (!name.trim()) {
      toast.error(t('common.required'));
      return false;
    }
    if (normalizeUrl(link) === false) {
      toast.error(t('err.invalid_link'));
      return false;
    }
    const res = await updateItem(id, { item: name.trim(), link });
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
      <PageHeader eyebrow={t('nav.wishlist')} title={t('wishlist.title')} subtitle={t('wishlist.subtitle')} />

      {/* Add form */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className="input"
            value={form.item}
            onChange={(e) => setForm((p) => ({ ...p, item: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder={t('wishlist.addPlaceholder')}
            aria-label={t('wishlist.addPlaceholder')}
            maxLength={200}
          />
          <input
            className="input sm:max-w-[38%]"
            value={form.link}
            onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder={t('wishlist.linkPlaceholder')}
            aria-label={t('wishlist.linkPlaceholder')}
            maxLength={500}
          />
          <button className="btn-primary shrink-0" onClick={add} disabled={saving} aria-label={t('common.add')}>
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="w-4 h-4" aria-hidden="true" />
            )}
            <span className="sm:hidden lg:inline">{t('common.add')}</span>
          </button>
        </div>
        <p className="text-xs text-mute mt-2.5 text-right tabular-nums">
          {items.length} / {MAX_ITEMS}
        </p>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-panel-2 grid place-items-center mx-auto mb-4">
            <ClipboardList className="w-6 h-6 text-mute" strokeWidth={1.6} />
          </div>
          <p className="text-mute">{t('wishlist.empty')}</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item) => (
                <WishlistItem key={item.id} item={item} onSave={save} onDelete={setToDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ConfirmModal
        open={!!toDelete}
        title={t('common.delete')}
        message={t('wishlist.deleteConfirm')}
        confirmLabel={t('common.delete')}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Page>
  );
}

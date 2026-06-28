import React, { useEffect, useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Plus, Loader2, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';
import { Page } from '../components/PageHeader';
import PageHeader from '../components/PageHeader';
import { InlineLoading } from '../components/Loading';
import ConfirmModal from '../components/ConfirmModal';
import WishlistItem from '../components/WishlistItem';
import { normalizeUrl } from '../lib/url';

const MAX_ITEMS = 50;

export default function WishlistView() {
  const { t } = useI18n();
  const { currentHouseholdId } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ item: '', link: '' });
  const [toDelete, setToDelete] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const load = useCallback(async () => {
    if (!currentHouseholdId) return;
    setLoading(true);
    try {
      setItems(await api.getMyItems(currentHouseholdId));
    } catch (e) {
      toast.error(t('err.generic'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHouseholdId]);

  useEffect(() => {
    load();
  }, [load]);

  async function addItem(rawName, rawLink = '') {
    const name = (rawName ?? form.item).trim();
    if (!name) return;
    if (name.length > 200) return toast.error(t('err.generic'));
    if (items.length >= MAX_ITEMS) return toast.error(t('wishlist.max', { max: MAX_ITEMS }));

    let link = null;
    if (rawLink || form.link) {
      const normalized = normalizeUrl(rawLink || form.link);
      if (normalized === false) return toast.error(t('wishlist.linkPlaceholder'));
      link = normalized;
    }

    setSaving(true);
    try {
      const maxOrder = items.reduce((m, i) => Math.max(m, i.display_order ?? 0), 0);
      const created = await api.addItem({
        householdId: currentHouseholdId,
        item: name,
        link,
        displayOrder: maxOrder + 1,
      });
      setItems((prev) => [...prev, created]);
      setForm({ item: '', link: '' });
      toast.success(t('wishlist.added'));
    } catch (e) {
      toast.error(t('err.generic'));
    } finally {
      setSaving(false);
    }
  }

  async function saveItem(id, name, link) {
    const trimmed = (name || '').trim();
    if (!trimmed) {
      toast.error(t('common.required'));
      return false;
    }
    let finalLink = null;
    if (link && link.trim()) {
      const normalized = normalizeUrl(link);
      if (normalized === false) {
        toast.error(t('wishlist.linkPlaceholder'));
        return false;
      }
      finalLink = normalized;
    }
    try {
      const updated = await api.updateItem(id, { item: trimmed, link: finalLink });
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)));
      toast.success(t('wishlist.updated'));
      return true;
    } catch (e) {
      toast.error(t('err.generic'));
      return false;
    }
  }

  async function confirmDelete() {
    const item = toDelete;
    setToDelete(null);
    if (!item) return;
    const prev = items;
    setItems((p) => p.filter((i) => i.id !== item.id));
    try {
      await api.deleteItem(item.id);
      toast.success(t('wishlist.deleted'));
    } catch (e) {
      setItems(prev);
      toast.error(t('err.generic'));
    }
  }

  async function onDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    try {
      await api.reorderItems(reordered);
    } catch (e) {
      toast.error(t('err.generic'));
      load();
    }
  }

  return (
    <Page>
      <PageHeader
        eyebrow={t('nav.wishlist')}
        title={t('wishlist.title')}
        subtitle={t('wishlist.subtitle')}
      />

      {/* Add form */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className="input"
            value={form.item}
            onChange={(e) => setForm((p) => ({ ...p, item: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder={t('wishlist.addPlaceholder')}
            maxLength={200}
          />
          <input
            className="input sm:max-w-[38%]"
            value={form.link}
            onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder={t('wishlist.linkPlaceholder')}
            maxLength={500}
          />
          <button className="btn-primary shrink-0" onClick={() => addItem()} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span className="sm:hidden lg:inline">{t('common.add')}</span>
          </button>
        </div>
        <p className="text-xs text-mute mt-2.5 text-right tabular-nums">
          {items.length} / {MAX_ITEMS}
        </p>
      </div>

      {/* List */}
      {loading ? (
        <InlineLoading />
      ) : items.length === 0 ? (
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
                <WishlistItem key={item.id} item={item} onSave={saveItem} onDelete={setToDelete} />
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

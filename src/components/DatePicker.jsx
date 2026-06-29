import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

// Dependency-free, themed calendar popover. Value/onChange use 'YYYY-MM-DD'.
// Designed for birthdays: month + year dropdowns let you jump to any year fast.
const pad = (n) => String(n).padStart(2, '0');
const toStr = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

function parse(value) {
  if (!value) return null;
  const [y, m, d] = String(value).split('-').map(Number);
  if (!y || !m || !d) return null;
  return { y, m: m - 1, d };
}

export default function DatePicker({ value, onChange, placeholder, minYear = 1920 }) {
  const { t, lang } = useI18n();
  const locale = lang === 'fr' ? 'fr-CA' : 'en-US';
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  const today = new Date();
  const maxYear = today.getFullYear();
  const selected = parse(value);

  const [view, setView] = useState(() => ({
    y: selected?.y ?? maxYear - 25,
    m: selected?.m ?? today.getMonth(),
  }));

  useEffect(() => {
    if (selected) setView({ y: selected.y, m: selected.m });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const firstDow = lang === 'en' ? 0 : 1; // Sunday for EN, Monday otherwise

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, m) =>
        new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2000, m, 1))
      ),
    [locale]
  );

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    // Jan 1 2024 is a Monday; Jan 7 2024 is a Sunday.
    const base = firstDow === 1 ? new Date(2024, 0, 1) : new Date(2024, 0, 7);
    return Array.from({ length: 7 }, (_, i) =>
      fmt.format(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i))
    );
  }, [locale, firstDow]);

  const years = useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i),
    [maxYear, minYear]
  );

  const grid = useMemo(() => {
    const firstWeekday = new Date(view.y, view.m, 1).getDay();
    const offset = (firstWeekday - firstDow + 7) % 7;
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [view, firstDow]);

  const label = value
    ? new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(
        new Date(selected.y, selected.m, selected.d)
      )
    : '';

  const move = (delta) => {
    setView((v) => {
      const m = v.m + delta;
      if (m < 0) return { y: v.y - 1, m: 11 };
      if (m > 11) return { y: v.y + 1, m: 0 };
      return { ...v, m };
    });
  };

  const isFuture = (d) => new Date(view.y, view.m, d) > today;

  const pick = (d) => {
    if (isFuture(d)) return;
    onChange(toStr(view.y, view.m, d));
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`input flex items-center gap-2.5 text-left ${value ? 'text-fg' : 'text-mute'}`}
      >
        <Calendar className="w-[18px] h-[18px] text-mute shrink-0" />
        <span className="flex-1 truncate">{label || placeholder || t('common.selectDate')}</span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                onChange('');
              }
            }}
            className="text-mute hover:text-fg p-0.5 rounded"
            aria-label={t('common.clear')}
          >
            <X className="w-4 h-4" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-[300px] max-w-[calc(100vw-2rem)] card p-3 animate-scale-in">
          {/* Header: nav + month/year selects */}
          <div className="flex items-center gap-1.5 mb-3">
            <button
              type="button"
              onClick={() => move(-1)}
              className="p-1.5 rounded-lg text-mute hover:text-fg hover:bg-panel-2"
              aria-label={t('common.prevMonth')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={view.m}
              onChange={(e) => setView((v) => ({ ...v, m: Number(e.target.value) }))}
              className="flex-1 bg-panel border border-line rounded-lg px-2 py-1.5 text-sm font-medium text-fg outline-none focus:border-gold cursor-pointer"
            >
              {months.map((name, i) => (
                <option key={i} value={i}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={view.y}
              onChange={(e) => setView((v) => ({ ...v, y: Number(e.target.value) }))}
              className="bg-panel border border-line rounded-lg px-2 py-1.5 text-sm font-medium text-fg outline-none focus:border-gold cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => move(1)}
              className="p-1.5 rounded-lg text-mute hover:text-fg hover:bg-panel-2"
              aria-label={t('common.nextMonth')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 mb-1">
            {weekdays.map((w, i) => (
              <div key={i} className="text-center text-[11px] font-semibold uppercase text-mute py-1">
                {w.slice(0, 2)}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {grid.map((d, i) => {
              if (d === null) return <div key={`e${i}`} />;
              const isSelected =
                selected && selected.y === view.y && selected.m === view.m && selected.d === d;
              const isToday =
                today.getFullYear() === view.y &&
                today.getMonth() === view.m &&
                today.getDate() === d;
              const disabled = isFuture(d);
              return (
                <button
                  key={d}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(d)}
                  className={`h-9 rounded-lg text-sm grid place-items-center transition ${
                    isSelected
                      ? 'bg-fg text-paper font-medium'
                      : disabled
                      ? 'text-mute/40 cursor-not-allowed'
                      : 'text-fg hover:bg-panel-2'
                  } ${isToday && !isSelected ? 'ring-1 ring-gold/50' : ''}`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

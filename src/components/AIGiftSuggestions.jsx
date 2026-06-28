import React, { useState } from 'react';
import { Sparkles, Plus, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useI18n } from '../i18n/I18nContext';

const GEMINI_KEY = process.env.REACT_APP_GEMINI_API_KEY;
export const aiEnabled = !!GEMINI_KEY;

// Lightweight, optional gift-idea helper backed by Google Gemini. Renders
// nothing unless an API key is configured. `onAdd(text)` adds a chosen idea.
export default function AIGiftSuggestions({ onAdd }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState([]);

  if (!aiEnabled) return null;

  async function getIdeas() {
    if (!interests.trim()) return;
    setLoading(true);
    setIdeas([]);
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
      const langName = lang === 'fr' ? 'French' : 'English';
      const prompt =
        `Suggest 6 concise gift ideas (2-5 words each) for someone who likes: ` +
        `${interests}. Reply in ${langName}. Return ONLY a plain list, one idea per ` +
        `line, no numbering, no extra text.`;
      const res = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });
      const text = res.text || '';
      const parsed = text
        .split('\n')
        .map((l) => l.replace(/^[\s\-*\d.)]+/, '').trim())
        .filter(Boolean)
        .slice(0, 8);
      if (parsed.length === 0) toast.error(t('err.generic'));
      setIdeas(parsed);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('AI suggestion failed', e);
      toast.error(t('err.generic'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="btn-secondary w-full border-dashed text-brand-600"
        >
          <Sparkles className="w-4 h-4" /> {t('wishlist.aiSuggest')}
        </button>
      ) : (
        <div className="card p-4 border-brand-200 bg-brand-50/40">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 font-semibold text-brand-700">
              <Sparkles className="w-4 h-4" /> {t('wishlist.aiSuggest')}
            </span>
            <button onClick={() => setOpen(false)} className="text-ink-400 hover:text-ink-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              className="input"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && getIdeas()}
              placeholder={lang === 'fr' ? 'ex. cuisine, randonnée, lecture' : 'e.g. cooking, hiking, reading'}
            />
            <button className="btn-primary px-4 shrink-0" onClick={getIdeas} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            </button>
          </div>

          {ideas.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {ideas.map((idea, i) => (
                <button
                  key={i}
                  onClick={() => onAdd(idea)}
                  className="chip bg-white border border-brand-200 text-ink-700 hover:bg-brand-100"
                >
                  <Plus className="w-3 h-3 text-brand-600" /> {idea}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

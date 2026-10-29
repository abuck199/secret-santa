'use client';

import { useRef, useState } from 'react';
import { normalizeUrl } from '@/lib/url';
import { previewLink } from '@/server/actions/wishlist';
import type { LinkPreview } from '@/server/link-preview';

type State = { status: 'idle' | 'loading' | 'done'; preview: LinkPreview | null };

// Looks up a pasted shop link's title and photo, once per link. Returns null
// for an empty/invalid link or when nothing could be read (bot-blocking shops).
export function useLinkPreview() {
  const [state, setState] = useState<State>({ status: 'idle', preview: null });
  const last = useRef<string | null>(null);

  async function lookup(link: string): Promise<LinkPreview | null> {
    const url = normalizeUrl(link);
    if (!url) {
      last.current = null;
      setState({ status: 'idle', preview: null });
      return null;
    }
    if (url === last.current) return state.preview;
    last.current = url;
    setState({ status: 'loading', preview: null });
    const res = await previewLink(url);
    if (last.current !== url) return null; // the link changed meanwhile
    const preview = res.ok && (res.data.title || res.data.image) ? res.data : null;
    setState({ status: 'done', preview });
    return preview;
  }

  function reset() {
    last.current = null;
    setState({ status: 'idle', preview: null });
  }

  return { ...state, lookup, reset };
}

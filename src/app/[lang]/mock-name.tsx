'use client';

import { useSyncExternalStore } from 'react';

// Popular first names in Québec, for the landing page's sample card.
const NAMES = [
  'Léa', 'Emma', 'Florence', 'Charlotte', 'Alice', 'Olivia', 'Zoé', 'Rosalie', 'Juliette', 'Béatrice',
  'Livia', 'Clara', 'William', 'Thomas', 'Liam', 'Noah', 'Jacob', 'Félix', 'Léo', 'Nathan',
  'Édouard', 'Gabriel', 'Mathis', 'Raphaël', 'Samuel', 'Arthur', 'Émile', 'Charles',
];

// Drawn once per page load. The page is prerendered at build time, so the
// draw has to happen in the browser; the server (and crawlers) get NAMES[0].
let drawn: string | null = null;
const noSubscribe = () => () => {};
const browserName = () => (drawn ??= NAMES[Math.floor(Math.random() * NAMES.length)]);
const serverName = () => NAMES[0];

export default function MockName() {
  return <>{useSyncExternalStore(noSubscribe, browserName, serverName)}</>;
}

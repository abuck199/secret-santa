// The three font families, shared by the root layout and the global 404 (which
// bypasses the layout). next/font downloads the files at build time and serves
// them from our own domain: no visitor request ever reaches Google.

import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';

// Body text.
const plexSans = IBM_Plex_Sans({ subsets: ['latin'], variable: '--font-plex-sans', display: 'swap' });
// Titles: heavy, uppercase and a little wide (font-stretch), hence the wdth axis.
const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  axes: ['wdth'],
  display: 'swap',
});
// Small labels (dates, counters). Not a variable font, so weights are listed.
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
});

// Put on <html>: defines the --font-* variables used by globals.css.
export const fontVariables = `${plexSans.variable} ${archivo.variable} ${plexMono.variable}`;

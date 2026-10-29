// The two font families, shared by the root layout and the global 404 (which
// bypasses the layout). next/font downloads the files at build time and serves
// them from our own domain: no visitor request ever reaches Google.

import { Fraunces, Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['opsz'],
  display: 'swap',
});

// Put on <html>: defines --font-inter / --font-fraunces for globals.css.
export const fontVariables = `${inter.variable} ${fraunces.variable}`;

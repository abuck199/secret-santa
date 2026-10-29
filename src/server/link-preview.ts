// Reads a shop page's title and product photo (Open Graph tags), so pasting a
// link fills in the wish. The server fetches URLs that users typed, so it
// guards against SSRF: public http(s) on ports 80/443 only, and every address
// is checked at connection time (DNS lookup hook) on every redirect, so a
// hostname can't point us at localhost, private networks or cloud metadata.

import 'server-only';
import { lookup as dnsLookup, type LookupAddress } from 'node:dns';
import { request as httpRequest, type IncomingMessage } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { BlockList, isIP } from 'node:net';
import { createBrotliDecompress, createGunzip, createInflate } from 'node:zlib';

const TIMEOUT_MS = 5000;
const MAX_BYTES = 512 * 1024;
const MAX_REDIRECTS = 3;

// Everything that isn't the public internet.
const blocked = new BlockList();
for (const [net, bits] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16],
  ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15],
  ['198.51.100.0', 24], ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4],
] as const) blocked.addSubnet(net, bits, 'ipv4');
// No ::ffff:0:0/96 rule here: Node applies it to every plain IPv4 address too
// (it blocked 8.8.8.8). IPv4-mapped addresses are unwrapped in isPublicAddress.
for (const [net, bits] of [
  ['::', 128], ['::1', 128], ['64:ff9b::', 96], ['100::', 64], ['2001:db8::', 32],
  ['fc00::', 7], ['fe80::', 10], ['ff00::', 8],
] as const) blocked.addSubnet(net, bits, 'ipv6');

export function isPublicAddress(ip: string): boolean {
  const family = isIP(ip);
  if (family === 0) return false;
  // IPv4-mapped IPv6 (::ffff:10.0.0.1): judge the IPv4 inside.
  const mapped = ip.toLowerCase().match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  if (mapped) return !blocked.check(mapped, 'ipv4');
  return !blocked.check(ip, family === 4 ? 'ipv4' : 'ipv6');
}

// DNS lookup that refuses non-public answers. Used by http(s).request, so the
// address actually connected to is the one that was checked.
function guardedLookup(
  hostname: string,
  options: { all?: boolean },
  callback: (err: Error | null, address: string | LookupAddress[], family?: number) => void,
) {
  dnsLookup(hostname, { all: true }, (err, addresses) => {
    if (err) return callback(err, '');
    if (!addresses.length || addresses.some((a) => !isPublicAddress(a.address))) {
      return callback(new Error('blocked address'), '');
    }
    if (options.all) return callback(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });
}

function allowedUrl(raw: string): URL | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  if (u.username || u.password) return null;
  if (u.port && u.port !== '80' && u.port !== '443') return null;
  // An IP literal skips DNS (and our lookup hook): check it here.
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (isIP(host) && !isPublicAddress(host)) return null;
  return u;
}

type Page = { url: string; html: string };

function fetchOnce(url: URL): Promise<{ res: IncomingMessage } | null> {
  return new Promise((resolve) => {
    const req = (url.protocol === 'https:' ? httpsRequest : httpRequest)(
      url,
      {
        method: 'GET',
        lookup: guardedLookup as never,
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; ThatWish/1.0; +https://thatwish.com) link preview',
          accept: 'text/html,application/xhtml+xml',
          'accept-language': 'fr-CA,fr;q=0.9,en;q=0.8',
          'accept-encoding': 'gzip, deflate, br',
        },
        timeout: TIMEOUT_MS,
      },
      (res) => resolve({ res }),
    );
    req.on('timeout', () => req.destroy());
    req.on('error', () => resolve(null));
    req.end();
  });
}

async function readHtml(res: IncomingMessage): Promise<string | null> {
  const type = String(res.headers['content-type'] ?? '');
  if (!/text\/html|application\/xhtml/i.test(type)) {
    res.destroy();
    return null;
  }
  const encoding = String(res.headers['content-encoding'] ?? '').toLowerCase();
  const stream =
    encoding === 'gzip' ? res.pipe(createGunzip())
    : encoding === 'br' ? res.pipe(createBrotliDecompress())
    : encoding === 'deflate' ? res.pipe(createInflate())
    : res;
  const chunks: Buffer[] = [];
  let size = 0;
  try {
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
      size += (chunk as Buffer).length;
      // The tags we want are in <head>: stop there, or at the size cap.
      if (size >= MAX_BYTES || (chunk as Buffer).includes('</head>')) break;
    }
  } catch {
    return null;
  } finally {
    res.destroy();
  }
  return new TextDecoder('utf-8').decode(Buffer.concat(chunks).subarray(0, MAX_BYTES));
}

export async function fetchPage(raw: string): Promise<Page | null> {
  let url = allowedUrl(raw);
  const deadline = Date.now() + TIMEOUT_MS * 2;
  for (let hop = 0; url && hop <= MAX_REDIRECTS && Date.now() < deadline; hop++) {
    const got = await fetchOnce(url);
    if (!got) return null;
    const { res } = got;
    const status = res.statusCode ?? 0;
    if (status >= 300 && status < 400 && res.headers.location) {
      res.destroy();
      url = allowedUrl(new URL(res.headers.location, url).toString()); // each hop is checked again
      continue;
    }
    if (status !== 200) {
      res.destroy();
      return null;
    }
    const html = await readHtml(res);
    return html ? { url: url.toString(), html } : null;
  }
  return null;
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

function attributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const m of tag.matchAll(/([a-zA-Z_:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
    attrs[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '');
  }
  return attrs;
}

export type LinkPreview = { title: string | null; image: string | null };

// Pure: picks the product title and photo out of a page's HTML.
export function parsePreview(html: string, pageUrl: string): LinkPreview {
  const meta = new Map<string, string>();
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const a = attributes(tag);
    const key = (a.property ?? a.name ?? a.itemprop)?.toLowerCase();
    if (key && a.content && !meta.has(key)) meta.set(key, a.content.trim());
  }
  const linkImage = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => attributes(tag))
    .find((a) => a.rel?.toLowerCase() === 'image_src')?.href;
  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];

  const rawTitle = meta.get('og:title') ?? meta.get('twitter:title') ?? (titleTag && decodeEntities(titleTag));
  const title = rawTitle?.replace(/\s+/g, ' ').trim().slice(0, 200) || null;

  let image: string | null = null;
  for (const candidate of [
    meta.get('og:image:secure_url'), meta.get('og:image'), meta.get('og:image:url'),
    meta.get('twitter:image'), meta.get('twitter:image:src'), meta.get('image'), linkImage,
  ]) {
    if (!candidate) continue;
    try {
      const u = new URL(candidate, pageUrl);
      if (u.protocol === 'http:') u.protocol = 'https:'; // the site is https; most CDNs serve both
      if (u.protocol === 'https:' && u.toString().length <= 1000) {
        image = u.toString();
        break;
      }
    } catch {
      // not a URL: try the next candidate
    }
  }
  return { title, image };
}

export async function previewForUrl(url: string): Promise<LinkPreview> {
  const page = await fetchPage(url).catch(() => null);
  return page ? parsePreview(page.html, page.url) : { title: null, image: null };
}

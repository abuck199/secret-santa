import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { fetchPage, isPublicAddress, parsePreview } from '@/server/link-preview';

describe('link preview parsing', () => {
  it('reads Open Graph title and photo, decoding entities', () => {
    const html = `<html><head>
      <meta property="og:title" content="Bottes &amp; chaussettes &#x2013; Plein Air">
      <meta content="https://cdn.shop.example/boots.jpg" property="og:image">
      <title>ignored</title></head><body>…`;
    expect(parsePreview(html, 'https://shop.example/p/1')).toEqual({
      title: 'Bottes & chaussettes – Plein Air',
      image: 'https://cdn.shop.example/boots.jpg',
    });
  });

  it('falls back to twitter tags and <title>, and resolves relative photos against the page', () => {
    const html = `<head><title>
      Lego   Technic </title><meta name="twitter:image" content="/img/lego.png"></head>`;
    expect(parsePreview(html, 'https://toys.example/lego/42')).toEqual({
      title: 'Lego Technic',
      image: 'https://toys.example/img/lego.png',
    });
  });

  it('upgrades http photos to https and ignores non-web ones', () => {
    expect(parsePreview('<meta property="og:image" content="http://cdn.example/a.jpg">', 'https://x.example').image)
      .toBe('https://cdn.example/a.jpg');
    expect(parsePreview('<meta property="og:image" content="javascript:alert(1)">', 'https://x.example').image)
      .toBeNull();
    expect(parsePreview('<p>nothing here</p>', 'https://x.example')).toEqual({ title: null, image: null });
  });
});

describe('link preview SSRF guard', () => {
  it('only treats public addresses as public', () => {
    for (const ip of ['127.0.0.1', '10.1.2.3', '172.20.0.1', '192.168.1.1', '169.254.169.254', '100.64.0.1',
      '0.0.0.0', '::1', 'fd00::1', 'fe80::1', '::ffff:10.0.0.1', '::ffff:127.0.0.1', 'not-an-ip']) {
      expect(isPublicAddress(ip), ip).toBe(false);
    }
    for (const ip of ['8.8.8.8', '1.1.1.1', '2606:4700:4700::1111', '::ffff:8.8.8.8']) {
      expect(isPublicAddress(ip), ip).toBe(true);
    }
  });

  // A real server on 127.0.0.1 that would answer: the guard must never reach it.
  let port = 0;
  let hits = 0;
  const server = createServer((req, res) => {
    hits++;
    if (req.url === '/redirect') {
      res.writeHead(302, { location: `http://127.0.0.1:${port}/secret` });
      return res.end();
    }
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end('<meta property="og:title" content="internal secret">');
  });
  beforeAll(async () => {
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    port = (server.address() as AddressInfo).port;
  });
  afterAll(() => new Promise<void>((r) => server.close(() => r())));

  it('refuses loopback, private and metadata addresses, by IP or by name', async () => {
    for (const url of [
      `http://127.0.0.1:${port}/`,
      'http://127.0.0.1/',
      `http://localhost:${port}/`,
      'http://localhost/',
      'http://[::1]/',
      'http://169.254.169.254/latest/meta-data/',
      'http://10.0.0.1/',
      'file:///etc/passwd',
      'http://user:pass@example.com/',
    ]) {
      expect(await fetchPage(url), url).toBeNull();
    }
    expect(hits).toBe(0);
  });
});

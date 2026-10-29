import { describe, expect, it } from 'vitest';
import { renderOtpEmail, type CodePurpose, type EmailLang } from '@/lib/email';

const cases: [CodePurpose, EmailLang][] = [
  ['sign-in', 'en'],
  ['sign-in', 'fr'],
  ['delete-account', 'en'],
  ['delete-account', 'fr'],
];

describe('code emails', () => {
  it.each(cases)('%s (%s) carries the code in the subject, the text and the HTML', (purpose, lang) => {
    const mail = renderOtpEmail('482913', lang, purpose);
    expect(mail.subject).toContain('482913');
    expect(mail.text).toContain('482913');
    expect(mail.html).toContain('>482913<');
    expect(mail.html).toContain(`<html lang="${lang}">`);
  });

  it('marks deletion codes so they are never mistaken for sign-in codes', () => {
    expect(renderOtpEmail('111111', 'fr', 'delete-account').html).toContain('Suppression de compte');
    expect(renderOtpEmail('111111', 'en', 'delete-account').html).toContain('Account deletion');
    expect(renderOtpEmail('111111', 'fr', 'sign-in').html).not.toContain('Suppression');
    expect(renderOtpEmail('111111', 'en', 'sign-in').subject).not.toMatch(/delet/i);
  });

  it('only loads images over https from the site (no SVG, which Gmail blocks)', () => {
    const { html } = renderOtpEmail('111111', 'en');
    const srcs = [...html.matchAll(/src="([^"]+)"/g)].map((m) => m[1]);
    expect(srcs.length).toBeGreaterThan(0);
    for (const src of srcs) {
      expect(src).toMatch(/^https:\/\/thatwish\.com\//);
      expect(src).not.toMatch(/\.svg$/);
    }
  });
});

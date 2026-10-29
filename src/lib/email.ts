// Transactional email via Resend: one-time codes (sign-in, and confirming an
// account deletion). The FROM domain must be verified in Resend or codes land
// in spam.

import 'server-only';
import { Resend } from 'resend';

// Created on first send: importing this module (tests, CI) needs no API key.
let client: Resend | null = null;
const resend = () => (client ??= new Resend(process.env.RESEND_API_KEY));
const from = process.env.EMAIL_FROM || 'ThatWish <noreply@thatwish.com>';

export type EmailLang = 'en' | 'fr';
export type CodePurpose = 'sign-in' | 'delete-account';

// Better Auth's email-OTP plugin has no "delete account" type; this app never
// uses `email-verification` otherwise, so that type carries the deletion
// codes (sent and checked by src/server/actions/account.ts).
export const DELETION_OTP_TYPE = 'email-verification';

const NB = ' '; // French typography: no line break before ? ! : or inside « »

const copy = {
  'sign-in': {
    en: {
      subject: (otp: string) => `${otp} is your ThatWish code`,
      title: 'Your sign-in code',
      intro: 'Here is your code to sign in to ThatWish:',
      expiry: 'It expires in 5 minutes. If you did not ask for it, you can ignore this email.',
      preheader: 'Your code expires in 5 minutes.',
    },
    fr: {
      subject: (otp: string) => `${otp} est votre code ThatWish`,
      title: 'Votre code de connexion',
      intro: `Voici votre code pour vous connecter à ThatWish${NB}:`,
      expiry: "Il expire dans 5 minutes. Si vous ne l'avez pas demandé, ignorez ce courriel.",
      preheader: 'Votre code expire dans 5 minutes.',
    },
  },
  // Worded (and coloured) so nobody mistakes it for a sign-in code.
  'delete-account': {
    en: {
      subject: (otp: string) => `${otp} confirms deleting your ThatWish account`,
      title: 'Confirm account deletion',
      intro: 'Someone asked to permanently delete your ThatWish account. Enter this code to confirm:',
      expiry: 'It expires in 5 minutes. If it wasn’t you, ignore this email: nothing will be deleted.',
      preheader: 'If it wasn’t you, ignore this email: nothing will be deleted.',
      warning: 'Account deletion',
    },
    fr: {
      subject: (otp: string) => `${otp} confirme la suppression de votre compte ThatWish`,
      title: 'Confirmer la suppression',
      intro: `Quelqu’un a demandé la suppression définitive de votre compte ThatWish. Entrez ce code pour confirmer${NB}:`,
      expiry: `Il expire dans 5 minutes. Si ce n’était pas vous, ignorez ce courriel${NB}: rien ne sera supprimé.`,
      preheader: `Si ce n’était pas vous, ignorez ce courriel${NB}: rien ne sera supprimé.`,
      warning: 'Suppression de compte',
    },
  },
} as const;

const footer = {
  en: 'Shared wishlists for birthdays and every occasion.',
  fr: 'Des listes de souhaits partagées pour les anniversaires et toutes les occasions.',
};

// The site's colours (src/app/globals.css). Fonts: email clients can't be
// trusted with web fonts, so heavy system fonts stand in for Archivo / Plex.
const C = {
  paper: '#F7F2E8',
  panel: '#FFFFFF',
  ink: '#1A1A1A',
  mute: '#6B6355',
  brand: '#C43C6A',
  danger: '#B91C1C',
  dangerSoft: '#FDECEC',
};
const SANS = "'IBM Plex Sans',Helvetica,Arial,sans-serif";
const DISPLAY = "'Archivo Black','Arial Black',Helvetica,Arial,sans-serif";
const MONO = "'IBM Plex Mono',Menlo,Consolas,'Courier New',monospace";
const LOGO = 'https://thatwish.com/apple-touch-icon.png';

// Subject, plain text and HTML for a code email. Kept apart from sending so it
// can be tested and previewed without Resend.
export function renderOtpEmail(otp: string, lang: EmailLang, purpose: CodePurpose = 'sign-in') {
  const c = copy[purpose][lang];
  const danger = purpose === 'delete-account';
  const warning = 'warning' in c ? c.warning : null;
  const codeBg = danger ? C.dangerSoft : C.paper;
  const codeInk = danger ? C.danger : C.ink;

  // Tables and inline styles only: that's what Gmail and Outlook render. The
  // code's cell has 10px more padding on the left to offset the letter-spacing
  // trailing after its last digit, so it looks centred.
  const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${c.subject(otp)}</title>
</head>
<body style="margin:0;padding:0;background:${C.paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${c.preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.paper};">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">
      <tr><td style="padding:0 4px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="padding-right:10px;vertical-align:middle;">
            <img src="${LOGO}" width="40" height="40" alt="" style="display:block;border:0;border-radius:10px;">
          </td>
          <td style="vertical-align:middle;font-family:${DISPLAY};font-size:22px;font-weight:900;letter-spacing:-0.5px;color:${C.ink};">THAT<span style="color:${C.brand};">WISH</span></td>
        </tr></table>
      </td></tr>
      <tr><td style="background:${C.panel};border-radius:24px;padding:28px 24px;">
        ${
          warning
            ? `<p style="margin:0 0 14px;"><span style="display:inline-block;padding:6px 12px;border-radius:999px;background:${C.dangerSoft};color:${C.danger};font-family:${MONO};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">⚠ ${warning}</span></p>`
            : ''
        }
        <h1 style="margin:0 0 12px;font-family:${DISPLAY};font-size:26px;line-height:1.1;font-weight:900;text-transform:uppercase;letter-spacing:-0.5px;color:${C.ink};">${c.title}</h1>
        <p style="margin:0 0 20px;font-family:${SANS};font-size:16px;line-height:1.5;color:${C.ink};">${c.intro}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td align="center" style="background:${codeBg};border-radius:16px;padding:20px 12px 20px 22px;font-family:${MONO};font-size:36px;line-height:1;font-weight:700;letter-spacing:10px;color:${codeInk};">${otp}</td></tr>
        </table>
        <p style="margin:20px 0 0;font-family:${SANS};font-size:14px;line-height:1.5;color:${C.mute};">${c.expiry}</p>
      </td></tr>
      <tr><td align="center" style="padding:20px 8px 0;font-family:${SANS};font-size:13px;line-height:1.5;color:${C.mute};">
        ${footer[lang]}<br>
        <a href="https://thatwish.com" style="color:${C.brand};font-weight:700;text-decoration:none;">thatwish.com</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  return {
    subject: c.subject(otp),
    text: `${c.title}\n\n${c.intro}\n\n${otp}\n\n${c.expiry}\n\n— ThatWish · https://thatwish.com`,
    html,
  };
}

export async function sendOtpEmail(to: string, otp: string, lang: EmailLang, purpose: CodePurpose = 'sign-in') {
  const { error } = await resend().emails.send({ from, to, ...renderOtpEmail(otp, lang, purpose) });
  if (error) throw new Error(`Resend: ${error.message}`);
}

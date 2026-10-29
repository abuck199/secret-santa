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

const copy = {
  'sign-in': {
    en: {
      subject: (otp: string) => `${otp} is your ThatWish code`,
      intro: 'Here is your code to sign in to ThatWish:',
      expiry: 'It expires in 5 minutes. If you did not ask for it, you can ignore this email.',
    },
    fr: {
      subject: (otp: string) => `${otp} est votre code ThatWish`,
      intro: 'Voici votre code pour vous connecter à ThatWish :',
      expiry: "Il expire dans 5 minutes. Si vous ne l'avez pas demandé, ignorez ce courriel.",
    },
  },
  // Worded so nobody mistakes it for a sign-in code.
  'delete-account': {
    en: {
      subject: (otp: string) => `${otp} confirms deleting your ThatWish account`,
      intro: 'Someone asked to permanently delete your ThatWish account. Enter this code to confirm:',
      expiry: 'It expires in 5 minutes. If it wasn’t you, ignore this email: nothing will be deleted.',
    },
    fr: {
      subject: (otp: string) => `${otp} confirme la suppression de votre compte ThatWish`,
      intro: 'Quelqu’un a demandé la suppression définitive de votre compte ThatWish. Entrez ce code pour confirmer :',
      expiry: 'Il expire dans 5 minutes. Si ce n’était pas vous, ignorez ce courriel : rien ne sera supprimé.',
    },
  },
};

export async function sendOtpEmail(to: string, otp: string, lang: EmailLang, purpose: CodePurpose = 'sign-in') {
  const c = copy[purpose][lang];
  const { error } = await resend().emails.send({
    from,
    to,
    subject: c.subject(otp),
    text: `${c.intro}\n\n${otp}\n\n${c.expiry}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:420px;margin:0 auto;padding:24px;color:#1f2937">
        <p style="margin:0 0 16px">${c.intro}</p>
        <p style="margin:0 0 16px;font-size:32px;font-weight:700;letter-spacing:8px">${otp}</p>
        <p style="margin:0;font-size:13px;color:#6b7280">${c.expiry}</p>
      </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

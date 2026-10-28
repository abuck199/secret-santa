// Transactional email via Resend. Only the sign-in code for now; the FROM
// domain must be verified in Resend or codes land in spam.

import 'server-only';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.EMAIL_FROM || 'ThatWish <noreply@thatwish.com>';

export type EmailLang = 'en' | 'fr';

const otpCopy = {
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
};

export async function sendOtpEmail(to: string, otp: string, lang: EmailLang) {
  const copy = otpCopy[lang];
  const { error } = await resend.emails.send({
    from,
    to,
    subject: copy.subject(otp),
    text: `${copy.intro}\n\n${otp}\n\n${copy.expiry}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:420px;margin:0 auto;padding:24px;color:#1f2937">
        <p style="margin:0 0 16px">${copy.intro}</p>
        <p style="margin:0 0 16px;font-size:32px;font-weight:700;letter-spacing:8px">${otp}</p>
        <p style="margin:0;font-size:13px;color:#6b7280">${copy.expiry}</p>
      </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

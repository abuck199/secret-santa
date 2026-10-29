import type { Metadata } from 'next';
import LegalLayout, { type LegalSection } from '@/components/LegalLayout';
import { getLang, getT } from '@/i18n/server';
import { alternates } from '@/lib/seo';

// Bump on every content change (and set it to the go-live date at cutover).
const UPDATED = '2026-10-29';

// Contact is a dedicated brand inbox (thatwishapp@gmail.com) - no domain email or
// forwarding needed. Swap to an @thatwish.com address later if you ever want.
const EN: LegalSection[] = [
  {
    h: 'Who we are',
    body: [
      'ThatWish ("we", "us") is an application operated from Québec, Canada. This policy explains what personal information we collect, why, and your rights under Québec’s Law 25 and applicable Canadian privacy law.',
    ],
  },
  {
    h: 'Information we collect',
    body: [
      'Account information you provide: your email address, display name, and date of birth.',
      'Sign-in codes: we sign you in by emailing you a one-time code. We store it only in hashed form, until it is used or expires a few minutes later.',
      'Bot check: when you request a sign-in code, Cloudflare Turnstile checks that the request comes from a person, using technical signals such as your IP address and browser characteristics. It is not used for advertising.',
      'Content you create: wishlist items and links, gift reservations, household memberships, and - if your household enables it - Secret Santa assignments.',
      'Limited technical data: privacy-friendly, aggregate, cookieless usage analytics. We do not use advertising or cross-site tracking.',
    ],
  },
  {
    h: 'How we use your information',
    body: [
      'To provide the service: create your account, host your wishlists, let members reserve gifts, and show upcoming birthdays.',
      'To keep the service secure and prevent abuse.',
      'To understand and improve how the app is used.',
    ],
  },
  {
    h: 'Cookies and similar technologies',
    body: [
      'Essential cookie: a secure session cookie keeps you signed in. It is required for the app to work and cannot be turned off.',
      'Preferences: a cookie remembers the language you choose, and your browser’s local storage remembers your light or dark theme.',
      'Analytics: a privacy-friendly, cookieless analytics tool that measures aggregate usage. It sets no tracking cookies and does not identify you.',
    ],
  },
  {
    h: 'Who we share it with',
    body: [
      'We do not sell your personal information.',
      'We use trusted service providers that process data on our behalf: Neon (database hosting), Vercel (application hosting and analytics), Resend (sending account emails such as sign-in codes), and Cloudflare (the bot check on the sign-in page). They may store data outside Québec.',
      'We may disclose information if required by law.',
    ],
  },
  {
    h: 'How long we keep it',
    body: [
      'We keep your information while your account is active. You can delete your wishlists, leave households, or delete your account at any time, after which we remove your personal data within a reasonable period.',
    ],
  },
  {
    h: 'Your rights',
    body: [
      'Under Québec’s Law 25, you may access, correct, or delete your personal information, withdraw your consent, and request a copy of your data (portability).',
      'To exercise these rights, contact us at thatwishapp@gmail.com.',
      'You also have the right to file a complaint with the Commission d’accès à l’information du Québec (CAI).',
    ],
  },
  {
    h: 'Person responsible for personal information',
    body: [
      'The person responsible for the protection of personal information at ThatWish can be reached at thatwishapp@gmail.com.',
    ],
  },
  {
    h: 'Children',
    body: [
      'ThatWish is not directed to children under 14. If you believe a child has provided us personal information, contact us and we will delete it.',
    ],
  },
  {
    h: 'Changes to this policy',
    body: ['We may update this policy from time to time. The "last updated" date above reflects the latest version.'],
  },
  { h: 'Contact', body: ['Questions? Email us at thatwishapp@gmail.com.'] },
];

const FR: LegalSection[] = [
  {
    h: 'Qui nous sommes',
    body: [
      'ThatWish (« nous ») est une application exploitée depuis le Québec, Canada. La présente politique explique quels renseignements personnels nous recueillons, pourquoi, et vos droits en vertu de la Loi 25 du Québec et des lois canadiennes applicables.',
    ],
  },
  {
    h: 'Renseignements que nous recueillons',
    body: [
      'Informations de compte que vous fournissez : votre adresse courriel, votre nom affiché et votre date de naissance.',
      'Codes de connexion : nous vous connectons en vous envoyant un code à usage unique par courriel. Nous le conservons uniquement sous forme hachée, jusqu’à ce qu’il soit utilisé ou qu’il expire quelques minutes plus tard.',
      'Vérification anti-robot : lorsque vous demandez un code de connexion, Cloudflare Turnstile vérifie que la demande vient d’une personne, à l’aide de signaux techniques comme votre adresse IP et les caractéristiques de votre navigateur. Elle ne sert pas à la publicité.',
      'Contenu que vous créez : articles et liens de liste de souhaits, réservations de cadeaux, adhésions à des foyers et - si votre foyer l’active - attributions Secret Santa.',
      'Données techniques limitées : analyses d’utilisation agrégées, sans témoin et respectueuses de la vie privée. Aucune publicité ni suivi intersites.',
    ],
  },
  {
    h: 'Comment nous utilisons vos renseignements',
    body: [
      'Pour fournir le service : créer votre compte, héberger vos listes, permettre la réservation de cadeaux et afficher les anniversaires à venir.',
      'Pour assurer la sécurité du service et prévenir les abus.',
      'Pour comprendre et améliorer l’utilisation de l’application.',
    ],
  },
  {
    h: 'Témoins et technologies similaires',
    body: [
      'Témoin essentiel : un témoin de session sécurisé vous garde connecté. Nécessaire au fonctionnement de l’application, il ne peut être désactivé.',
      'Préférences : un témoin retient la langue que vous choisissez, et le stockage local de votre navigateur retient votre thème clair ou sombre.',
      'Analyses : un outil d’analyse sans témoin et respectueux de la vie privée qui mesure l’utilisation globale. Aucun témoin de suivi, aucune identification.',
    ],
  },
  {
    h: 'Avec qui nous les partageons',
    body: [
      'Nous ne vendons pas vos renseignements personnels.',
      'Nous faisons appel à des fournisseurs de confiance qui traitent les données pour notre compte : Neon (hébergement de la base de données), Vercel (hébergement et analyses), Resend (envoi des courriels de compte comme les codes de connexion) et Cloudflare (la vérification anti-robot de la page de connexion). Ils peuvent stocker des données hors du Québec.',
      'Nous pouvons divulguer des renseignements si la loi l’exige.',
    ],
  },
  {
    h: 'Durée de conservation',
    body: [
      'Nous conservons vos renseignements tant que votre compte est actif. Vous pouvez supprimer vos listes, quitter des foyers ou supprimer votre compte à tout moment ; nous retirons alors vos données personnelles dans un délai raisonnable.',
    ],
  },
  {
    h: 'Vos droits',
    body: [
      'En vertu de la Loi 25, vous pouvez accéder à vos renseignements, les corriger ou les supprimer, retirer votre consentement et demander une copie de vos données (portabilité).',
      'Pour exercer ces droits, écrivez-nous à thatwishapp@gmail.com.',
      'Vous avez aussi le droit de porter plainte auprès de la Commission d’accès à l’information du Québec (CAI).',
    ],
  },
  {
    h: 'Responsable de la protection des renseignements personnels',
    body: [
      'Le responsable de la protection des renseignements personnels chez ThatWish est joignable à thatwishapp@gmail.com.',
    ],
  },
  {
    h: 'Enfants',
    body: [
      'ThatWish ne s’adresse pas aux enfants de moins de 14 ans. Si vous croyez qu’un enfant nous a fourni des renseignements, contactez-nous et nous les supprimerons.',
    ],
  },
  {
    h: 'Modifications',
    body: ['Nous pouvons mettre à jour cette politique. La date de « dernière mise à jour » ci-dessus indique la version en vigueur.'],
  },
  { h: 'Contact', body: ['Des questions ? Écrivez-nous à thatwishapp@gmail.com.'] },
];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('legal.privacyTitle'), alternates: alternates('/privacy', await getLang()) };
}

export default async function PrivacyPage() {
  const t = await getT();
  const lang = await getLang();
  return <LegalLayout title={t('legal.privacyTitle')} updated={UPDATED} sections={lang === 'fr' ? FR : EN} />;
}

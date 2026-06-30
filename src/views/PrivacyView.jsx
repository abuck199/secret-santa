import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import LegalLayout from '../components/LegalLayout';

const UPDATED = '2026-06-29';

// NOTE: Update the privacy@thatwish.com contact email to your real address before publishing.
const EN = [
  {
    h: 'Who we are',
    body: [
      'ThatWish ("we", "us") is operated by the team behind ThatWish, based in Québec, Canada. This policy explains what personal information we collect, why, and your rights under Québec’s Law 25 and applicable Canadian privacy law.',
    ],
  },
  {
    h: 'Information we collect',
    body: [
      'Account information you provide: your email address, display name, and date of birth.',
      'Content you create: wishlist items and links, gift reservations, household memberships, and — if your household enables it — Secret Santa assignments.',
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
      'Essential storage: we keep you signed in using your browser’s local storage. This is required for the app to work and cannot be turned off.',
      'Analytics: a privacy-friendly, cookieless analytics tool that measures aggregate usage. It sets no tracking cookies and does not identify you.',
    ],
  },
  {
    h: 'Who we share it with',
    body: [
      'We do not sell your personal information.',
      'We use trusted service providers that process data on our behalf: Supabase (database and authentication hosting) and Vercel (application hosting and analytics). They may store data outside Québec.',
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
      'To exercise these rights, contact us at privacy@thatwish.com.',
      'You also have the right to file a complaint with the Commission d’accès à l’information du Québec (CAI).',
    ],
  },
  {
    h: 'Person responsible for personal information',
    body: [
      'The person responsible for the protection of personal information at ThatWish can be reached at privacy@thatwish.com.',
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
  { h: 'Contact', body: ['Questions? Email us at privacy@thatwish.com.'] },
];

const FR = [
  {
    h: 'Qui nous sommes',
    body: [
      'ThatWish (« nous ») est exploité par l’équipe derrière ThatWish, située au Québec, Canada. La présente politique explique quels renseignements personnels nous recueillons, pourquoi, et vos droits en vertu de la Loi 25 du Québec et des lois canadiennes applicables.',
    ],
  },
  {
    h: 'Renseignements que nous recueillons',
    body: [
      'Informations de compte que vous fournissez : votre adresse courriel, votre nom affiché et votre date de naissance.',
      'Contenu que vous créez : articles et liens de liste de souhaits, réservations de cadeaux, adhésions à des foyers et — si votre foyer l’active — attributions Secret Santa.',
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
      'Stockage essentiel : nous vous gardons connecté à l’aide du stockage local de votre navigateur. Nécessaire au fonctionnement de l’application, il ne peut être désactivé.',
      'Analyses : un outil d’analyse sans témoin et respectueux de la vie privée qui mesure l’utilisation globale. Aucun témoin de suivi, aucune identification.',
    ],
  },
  {
    h: 'Avec qui nous les partageons',
    body: [
      'Nous ne vendons pas vos renseignements personnels.',
      'Nous faisons appel à des fournisseurs de confiance qui traitent les données pour notre compte : Supabase (base de données et authentification) et Vercel (hébergement et analyses). Ils peuvent stocker des données hors du Québec.',
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
      'Pour exercer ces droits, écrivez-nous à privacy@thatwish.com.',
      'Vous avez aussi le droit de porter plainte auprès de la Commission d’accès à l’information du Québec (CAI).',
    ],
  },
  {
    h: 'Responsable de la protection des renseignements personnels',
    body: [
      'Le responsable de la protection des renseignements personnels chez ThatWish est joignable à privacy@thatwish.com.',
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
  { h: 'Contact', body: ['Des questions ? Écrivez-nous à privacy@thatwish.com.'] },
];

export default function PrivacyView() {
  const { t, lang } = useI18n();
  return <LegalLayout title={t('legal.privacyTitle')} updated={UPDATED} sections={lang === 'fr' ? FR : EN} />;
}

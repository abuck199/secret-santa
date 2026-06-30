import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import LegalLayout from '../components/LegalLayout';

const UPDATED = '2026-06-29';

const EN = [
  {
    h: 'Acceptance of these terms',
    body: [
      'By creating an account or using ThatWish, you agree to these Terms of Service. If you do not agree, please do not use the service.',
    ],
  },
  {
    h: 'The service',
    body: [
      'ThatWish lets households and groups keep shared wishlists, reserve gifts privately, see upcoming birthdays, and optionally run a Secret Santa draw.',
    ],
  },
  {
    h: 'Your account',
    body: [
      'You are responsible for the accuracy of your information and for keeping your password secure. You must be at least 14 years old to use ThatWish. You are responsible for activity under your account.',
    ],
  },
  {
    h: 'Acceptable use',
    body: [
      'Do not use ThatWish for unlawful purposes, to harass others, to upload harmful or infringing content, or to attempt to disrupt or gain unauthorized access to the service.',
    ],
  },
  {
    h: 'Your content',
    body: [
      'You keep ownership of the content you add (wishlist items, links, names). You grant us a limited licence to host and display that content to the members of your households so the service can function.',
    ],
  },
  {
    h: 'Availability and changes',
    body: [
      'The service is provided "as is" and "as available", without warranties of any kind. We may add, change, or remove features, or suspend the service, at any time.',
    ],
  },
  {
    h: 'Limitation of liability',
    body: [
      'To the fullest extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the service.',
    ],
  },
  {
    h: 'Termination',
    body: [
      'You may stop using ThatWish and delete your account at any time. We may suspend or terminate accounts that violate these terms.',
    ],
  },
  {
    h: 'Governing law',
    body: [
      'These terms are governed by the laws of the Province of Québec and the federal laws of Canada applicable therein.',
    ],
  },
  {
    h: 'Changes to these terms',
    body: ['We may update these terms; continued use after changes means you accept them.'],
  },
  { h: 'Contact', body: ['Questions about these terms? Email privacy@thatwish.com.'] },
];

const FR = [
  {
    h: 'Acceptation des conditions',
    body: [
      'En créant un compte ou en utilisant ThatWish, vous acceptez les présentes conditions d’utilisation. Si vous n’êtes pas d’accord, veuillez ne pas utiliser le service.',
    ],
  },
  {
    h: 'Le service',
    body: [
      'ThatWish permet aux foyers et aux groupes de tenir des listes de souhaits partagées, de réserver des cadeaux en privé, de voir les anniversaires à venir et, en option, de lancer un tirage Secret Santa.',
    ],
  },
  {
    h: 'Votre compte',
    body: [
      'Vous êtes responsable de l’exactitude de vos informations et de la sécurité de votre mot de passe. Vous devez avoir au moins 14 ans pour utiliser ThatWish. Vous êtes responsable de l’activité sous votre compte.',
    ],
  },
  {
    h: 'Utilisation acceptable',
    body: [
      'N’utilisez pas ThatWish à des fins illégales, pour harceler autrui, pour téléverser du contenu nuisible ou contrefait, ni pour tenter de perturber le service ou d’y accéder sans autorisation.',
    ],
  },
  {
    h: 'Votre contenu',
    body: [
      'Vous conservez la propriété du contenu que vous ajoutez (articles, liens, noms). Vous nous accordez une licence limitée pour héberger et afficher ce contenu aux membres de vos foyers afin que le service fonctionne.',
    ],
  },
  {
    h: 'Disponibilité et modifications',
    body: [
      'Le service est fourni « tel quel » et « selon disponibilité », sans garantie d’aucune sorte. Nous pouvons ajouter, modifier ou retirer des fonctionnalités, ou suspendre le service, à tout moment.',
    ],
  },
  {
    h: 'Limitation de responsabilité',
    body: [
      'Dans la mesure permise par la loi, nous ne sommes pas responsables des dommages indirects ou accessoires découlant de votre utilisation du service.',
    ],
  },
  {
    h: 'Résiliation',
    body: [
      'Vous pouvez cesser d’utiliser ThatWish et supprimer votre compte à tout moment. Nous pouvons suspendre ou résilier les comptes qui enfreignent ces conditions.',
    ],
  },
  {
    h: 'Droit applicable',
    body: [
      'Les présentes conditions sont régies par les lois de la province de Québec et les lois fédérales du Canada qui s’y appliquent.',
    ],
  },
  {
    h: 'Modifications',
    body: ['Nous pouvons mettre à jour ces conditions ; toute utilisation continue après modification vaut acceptation.'],
  },
  { h: 'Contact', body: ['Des questions sur ces conditions ? Écrivez à privacy@thatwish.com.'] },
];

export default function TermsView() {
  const { t, lang } = useI18n();
  return <LegalLayout title={t('legal.termsTitle')} updated={UPDATED} sections={lang === 'fr' ? FR : EN} />;
}

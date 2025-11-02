import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Sparkles, Gift, List, Heart, Lock, Users, HelpCircle, ArrowLeft, CheckCircle, AlertCircle, Info } from 'lucide-react';

const FAQView = ({ event, setView }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState([0]);

  const colorMap = {
    emerald: {
      bg: 'from-emerald-900/10 to-emerald-800/10',
      border: 'border-emerald-500/20',
      icon: 'text-emerald-500'
    },
    blue: {
      bg: 'from-blue-900/10 to-blue-800/10',
      border: 'border-blue-500/20',
      icon: 'text-blue-500'
    },
    primary: {
      bg: 'from-primary/10 to-primary-dark/10',
      border: 'border-primary/20',
      icon: 'text-primary'
    },
    gold: {
      bg: 'from-gold/10 to-gold-dark/10',
      border: 'border-gold/20',
      icon: 'text-gold'
    },
    red: {
      bg: 'from-red-900/10 to-red-800/10',
      border: 'border-red-500/20',
      icon: 'text-red-500'
    },
    purple: {
      bg: 'from-purple-900/10 to-purple-800/10',
      border: 'border-purple-500/20',
      icon: 'text-purple-500'
    }
  };

  const Section = ({ title, children, icon: Icon, color = "emerald" }) => {
    const colors = colorMap[color] || colorMap.emerald;
    return (
      <div className={`mb-4 p-4 bg-gradient-to-br ${colors.bg} backdrop-blur-sm border ${colors.border} rounded-xl`}>
        <div className="flex items-center gap-2 mb-3">
          {Icon && <Icon className={`w-5 h-5 ${colors.icon}`} />}
          <h4 className="font-bold text-dark-100">{title}</h4>
        </div>
        <div className="space-y-2 text-dark-300 leading-relaxed">
          {children}
        </div>
      </div>
    );
  };

  const Step = ({ number, children }) => (
    <div className="flex items-start gap-3 mb-2">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold">
        {number}
      </div>
      <p className="flex-1 pt-0.5">{children}</p>
    </div>
  );

  const Tip = ({ children }) => (
    <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/30 rounded-lg mt-3">
      <Sparkles className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
      <p className="text-sm text-gold">{children}</p>
    </div>
  );

  const Warning = ({ children }) => (
    <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-500/30 rounded-lg mt-3">
      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-400">{children}</p>
    </div>
  );

  const Success = ({ children }) => (
    <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-emerald-900/20 to-emerald-800/20 border border-emerald-500/30 rounded-lg mt-3">
      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-emerald-400">{children}</p>
    </div>
  );

  const InfoBox = ({ children }) => (
    <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-lg mt-3">
      <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-blue-400">{children}</p>
    </div>
  );

  const Bullet = ({ children }) => (
    <div className="flex items-start gap-2 ml-4">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
      <p>{children}</p>
    </div>
  );

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Commencer',
      icon: Sparkles,
      color: 'text-gold',
      bgColor: 'from-gold/20 to-gold/10',
      borderColor: 'border-gold/30',
      questions: [
        {
          question: 'Comment fonctionne cette application?',
          answer: (
            <>
              <p className="mb-4">{event?.name || 'Cette application'} vous permet d'organiser un échange de cadeaux facilement!</p>

              <Section title="Les étapes" icon={Gift} color="primary">
                <Step number="1">Créez votre liste de souhaits avec vos envies</Step>
                <Step number="2">Consultez les listes des autres participants</Step>
                <Step number="3">Réservez des articles pour éviter les doublons</Step>
                <Step number="4">Découvrez votre attribution (à qui offrir un cadeau)</Step>
                <Step number="5">Échangez vos cadeaux le jour J!</Step>
              </Section>

              <Success>C'est simple, organisé et amusant! 🎄</Success>
            </>
          )
        },
        {
          question: 'Première utilisation : par où commencer?',
          answer: (
            <>
              <p className="mb-4">Bienvenue! Voici les 3 premières étapes:</p>

              <Section title="1. Créez votre liste" icon={List} color="emerald">
                <Bullet>Cliquez sur "Ma Liste" dans le menu</Bullet>
                <Bullet>Ajoutez vos idées de cadeaux</Bullet>
                <Bullet>Ajoutez des liens si vous le souhaitez</Bullet>
              </Section>

              <Section title="2. Explorez les autres listes" icon={Users} color="blue">
                <Bullet>Allez dans "Toutes les Listes"</Bullet>
                <Bullet>Parcourez ce que les autres veulent</Bullet>
                <Bullet>Réservez ce qui vous intéresse</Bullet>
              </Section>

              <Section title="3. Découvrez votre attribution" icon={Heart} color="primary">
                <Bullet>Cliquez sur "Mon Attribution"</Bullet>
                <Bullet>Voyez à qui vous devez offrir</Bullet>
                <Bullet>Consultez sa liste de souhaits</Bullet>
              </Section>

              <Success>C'est tout! Vous êtes prêt! 🎁</Success>
            </>
          )
        }
      ]
    },
    {
      id: 'wishlist',
      title: 'Ma liste de souhaits',
      icon: List,
      color: 'text-emerald-500',
      bgColor: 'from-emerald-500/20 to-emerald-600/10',
      borderColor: 'border-emerald-500/30',
      questions: [
        {
          question: 'Comment créer ma liste de souhaits?',
          answer: (
            <>
              <Section title="Pour créer votre liste" icon={List} color="emerald">
                <Step number="1">Cliquez sur "Ma Liste" 📋 dans le menu</Step>
                <Step number="2">Cliquez sur le bouton "Ajouter un article" ➕</Step>
                <Step number="3">Entrez le nom de l'article que vous souhaitez</Step>
                <Step number="4">(Optionnel) Ajoutez un lien vers le produit 🔗</Step>
                <Step number="5">Cliquez sur "Ajouter à ma liste" ✅</Step>
              </Section>

              <Tip>
                <strong>Conseils:</strong> Soyez précis dans vos descriptions • Ajoutez des liens pour aider • Variez les prix si possible • Mettez à jour régulièrement!
              </Tip>
            </>
          )
        },
        {
          question: 'Puis-je modifier un article de ma liste?',
          answer: (
            <>
              <p className="mb-4">Oui! Vous pouvez modifier vos articles à tout moment:</p>

              <Section title="Comment modifier" icon={List} color="blue">
                <Step number="1">Allez dans "Ma Liste" 📋</Step>
                <Step number="2">Cliquez sur l'icône ✏️ (crayon) sur l'article</Step>
                <Step number="3">Modifiez le nom ou le lien</Step>
                <Step number="4">Cliquez sur "Sauvegarder" 💾</Step>
              </Section>

              <InfoBox>
                Vous pouvez modifier même si quelqu'un a réservé l'article. La personne verra la version mise à jour. Pratique pour corriger des erreurs ou ajouter des détails!
              </InfoBox>
            </>
          )
        },
        {
          question: 'Puis-je supprimer un article de ma liste?',
          answer: (
            <>
              <Warning>
                Non, vous ne pouvez pas supprimer un article une fois ajouté.
              </Warning>

              <Section title="Pourquoi?" icon={AlertCircle} color="red">
                <Bullet>Pour éviter les problèmes si quelqu'un l'a déjà réservé</Bullet>
                <Bullet>Pour maintenir la cohérence des réservations</Bullet>
              </Section>

              <Section title="Solution" icon={CheckCircle} color="emerald">
                <Bullet>Vous pouvez modifier l'article pour le remplacer</Bullet>
                <Bullet>Changez le nom pour un autre souhait</Bullet>
                <Bullet>Mettez à jour le lien si nécessaire</Bullet>
              </Section>

              <Tip>Astuce: Réfléchissez bien avant d'ajouter un article!</Tip>
            </>
          )
        },
        {
          question: 'Comment réorganiser ma liste?',
          answer: (
            <>
              <p className="mb-4">Vous pouvez changer l'ordre de vos articles par glisser-déposer:</p>

              <Section title="Sur ordinateur" icon={null} color="blue">
                <Bullet>Cliquez sur l'icône ☰ (trois lignes) à gauche</Bullet>
                <Bullet>Maintenez et glissez l'article</Bullet>
                <Bullet>Relâchez à la position souhaitée</Bullet>
              </Section>

              <Section title="Sur mobile" icon={null} color="blue">
                <Bullet>Maintenez votre doigt sur l'icône ☰</Bullet>
                <Bullet>Glissez l'article vers le haut ou le bas</Bullet>
                <Bullet>Relâchez quand c'est bon</Bullet>
              </Section>

              <Tip>Mettez vos articles préférés en haut!</Tip>
            </>
          )
        }
      ]
    },
    {
      id: 'reservations',
      title: 'Réservations',
      icon: Gift,
      color: 'text-gold',
      bgColor: 'from-gold/20 to-gold/10',
      borderColor: 'border-gold/30',
      questions: [
        {
          question: 'Comment réserver un article?',
          answer: (
            <>
              <Section title="Pour réserver un article" icon={Gift} color="gold">
                <Step number="1">Allez dans "Toutes les Listes" 📝</Step>
                <Step number="2">Parcourez les listes des participants</Step>
                <Step number="3">Trouvez un article qui vous intéresse</Step>
                <Step number="4">Cliquez sur "Réserver" 🎁</Step>
                <Step number="5">L'article est maintenant marqué comme réservé!</Step>
              </Section>

              <Warning>
                Vous ne pouvez PAS réserver vos propres articles
              </Warning>

              <InfoBox>
                Les autres ne voient pas QUI a réservé • Vous pouvez annuler une réservation si besoin
              </InfoBox>

              <Tip>Réservez pour éviter que 2 personnes offrent la même chose!</Tip>
            </>
          )
        },
        {
          question: 'Comment voir mes réservations?',
          answer: (
            <>
              <Section title="Consulter vos réservations" icon={Gift} color="gold">
                <Step number="1">Cliquez sur "Mes Réservations" 🎁 dans le menu</Step>
                <Step number="2">Vous verrez tous vos articles réservés</Step>
                <Step number="3">Organisés par personne</Step>
                <Step number="4">Avec les liens vers les produits</Step>
              </Section>

              <Section title="Actions possibles" icon={CheckCircle} color="emerald">
                <Bullet>Voir le lien du produit</Bullet>
                <Bullet>Annuler une réservation si besoin</Bullet>
                <Bullet>Voir le compteur total</Bullet>
              </Section>

              <Tip>Pratique pour ne rien oublier lors des achats!</Tip>
            </>
          )
        },
        {
          question: 'Puis-je annuler une réservation?',
          answer: (
            <>
              <p className="mb-4">Oui! Vous pouvez annuler une réservation à tout moment:</p>

              <Section title="Méthode 1: Depuis Mes Réservations" icon={Gift} color="gold">
                <Step number="1">Allez dans "Mes Réservations" 🎁</Step>
                <Step number="2">Trouvez l'article à annuler</Step>
                <Step number="3">Cliquez sur "Annuler" ❌</Step>
                <Step number="4">L'article redevient disponible pour les autres</Step>
              </Section>

              <Section title="Méthode 2: Depuis les listes" icon={List} color="blue">
                <Step number="1">Allez dans "Toutes les Listes" 📝</Step>
                <Step number="2">Les articles que vous avez réservés ont un bouton "Annuler"</Step>
                <Step number="3">Cliquez dessus pour libérer l'article</Step>
              </Section>

              <Success>Aucun problème pour changer d'avis!</Success>
            </>
          )
        },
        {
          question: 'Les autres voient-ils qui a réservé?',
          answer: (
            <>
              <Warning>
                Non! Les réservations sont anonymes:
              </Warning>

              <Section title="Vous voyez" icon={Lock} color="emerald">
                <Bullet>Vos propres réservations</Bullet>
                <Bullet>Quels articles de votre liste sont réservés</Bullet>
                <Bullet>Mais PAS qui les a réservés</Bullet>
              </Section>

              <Section title="Les autres voient" icon={Users} color="blue">
                <Bullet>Si un article est "Réservé" ou "Disponible"</Bullet>
                <Bullet>Mais PAS qui l'a réservé</Bullet>
              </Section>

              <Section title="L'admin voit" icon={Users} color="purple">
                <Bullet>Toutes les statistiques</Bullet>
                <Bullet>Mais pas les détails de qui réserve quoi</Bullet>
              </Section>

              <Tip>C'est pour garder la surprise!</Tip>
            </>
          )
        }
      ]
    },
    {
      id: 'assignment',
      title: 'Mon attribution',
      icon: Heart,
      color: 'text-primary',
      bgColor: 'from-primary/20 to-primary/10',
      borderColor: 'border-primary/30',
      questions: [
        {
          question: 'Comment voir mon attribution?',
          answer: (
            <>
              <Section title="Découvrir votre attribution" icon={Heart} color="primary">
                <Step number="1">Cliquez sur "Mon Attribution" ❤️ dans le menu</Step>
                <Step number="2">Vous verrez le nom de la personne</Step>
                <Step number="3">Vous pouvez consulter sa liste de souhaits</Step>
                <Step number="4">Vous pouvez réserver des articles directement!</Step>
              </Section>

              <Warning>
                C'est SECRET! Ne dites à personne qui est votre attribution
              </Warning>

              <InfoBox>
                Vous ne pouvez offrir qu'à UNE personne • Quelqu'un d'autre vous offre un cadeau (mais vous ne savez pas qui!)
              </InfoBox>

              <Tip>C'est ça la magie du Secret Santa!</Tip>
            </>
          )
        },
        {
          question: 'Quand vais-je connaître mon attribution?',
          answer: (
            <>
              <p className="mb-4">Vous connaîtrez votre attribution quand l'admin créera les attributions:</p>

              <Section title="Vous recevrez un email" icon={Gift} color="primary">
                <Bullet>Le nom de votre attribution</Bullet>
                <Bullet>Un lien vers l'application</Bullet>
              </Section>

              <Section title="Dans l'app" icon={Heart} color="primary">
                <Bullet>L'onglet "Mon Attribution" deviendra actif</Bullet>
                <Bullet>Vous pourrez voir la liste de la personne</Bullet>
              </Section>

              <Section title="Timing" icon={null} color="blue">
                <Bullet>L'admin choisit quand créer les attributions</Bullet>
                <Bullet>Généralement quelques jours/semaines avant l'événement</Bullet>
              </Section>

              <Tip>Patience! L'admin vous préviendra! 😊</Tip>
            </>
          )
        },
        {
          question: "C'est quoi le principe du Secret Santa?",
          answer: (
            <>
              <p className="mb-4">Le Secret Santa (ou Père Noël Secret) c'est simple:</p>

              <Section title="Attribution aléatoire" icon={Gift} color="primary">
                <Bullet>Chaque personne tire au sort un nom</Bullet>
                <Bullet>Vous offrez UN cadeau à cette personne</Bullet>
                <Bullet>Quelqu'un d'autre vous offre un cadeau</Bullet>
                <Bullet>Personne ne sait qui offre à qui (sauf l'admin!)</Bullet>
              </Section>

              <Section title="Avantages" icon={CheckCircle} color="emerald">
                <Bullet>Un seul cadeau à acheter (économique!)</Bullet>
                <Bullet>Tout le monde reçoit un cadeau</Bullet>
                <Bullet>Suspense et surprise garantis</Bullet>
                <Bullet>Parfait pour les grands groupes</Bullet>
              </Section>

              <Warning>
                Règle d'or: GARDEZ LE SECRET! • Ne dites à personne qui est votre attribution • Le mystère fait partie du jeu!
              </Warning>

              <Success>C'est la magie des fêtes! 🎄</Success>
            </>
          )
        }
      ]
    },
    {
      id: 'account',
      title: 'Mon compte',
      icon: Lock,
      color: 'text-blue-500',
      bgColor: 'from-blue-500/20 to-blue-600/10',
      borderColor: 'border-blue-500/30',
      questions: [
        {
          question: 'Comment changer mon mot de passe?',
          answer: (
            <>
              <Section title="Sur ordinateur" icon={null} color="blue">
                <Step number="1">Cliquez sur votre avatar en haut à droite 👤</Step>
                <Step number="2">Sélectionnez "Changer mot de passe" 🔒</Step>
              </Section>

              <Section title="Sur mobile" icon={null} color="blue">
                <Step number="1">Ouvrez le menu "Menu" ☰ en bas</Step>
                <Step number="2">Sélectionnez "Changer mot de passe" 🔒</Step>
              </Section>

              <Section title="Ensuite" icon={Lock} color="blue">
                <Step number="3">Entrez votre mot de passe actuel</Step>
                <Step number="4">Entrez le nouveau (2 fois)</Step>
                <Step number="5">Validez! ✅</Step>
              </Section>

              <InfoBox>
                Exigences: Minimum 4 caractères • Doit être différent de l'ancien
              </InfoBox>

              <Warning>Gardez-le en sécurité! 🔒</Warning>
            </>
          )
        },
        {
          question: 'Vais-je recevoir des notifications?',
          answer: (
            <>
              <p className="mb-4">Oui! Vous recevrez des emails pour:</p>

              <Section title="Création de compte" icon={Gift} color="emerald">
                <Bullet>Vos identifiants de connexion</Bullet>
                <Bullet>Bienvenue sur la plateforme</Bullet>
              </Section>

              <Section title="Attribution créée" icon={Heart} color="primary">
                <Bullet>Le nom de votre attribution</Bullet>
                <Bullet>Lien direct vers l'application</Bullet>
              </Section>

              <Section title="Nouvelles attributions" icon={Gift} color="gold">
                <Bullet>Si l'admin recrée les attributions</Bullet>
                <Bullet>Votre nouvelle attribution</Bullet>
              </Section>

              <Warning>
                Pas de notifications pour les réservations
              </Warning>

              <Tip>Consultez régulièrement l'app pour voir les nouveautés! 📱 Gardez un œil sur votre boîte mail!</Tip>
            </>
          )
        },
        {
          question: 'Puis-je supprimer mon compte?',
          answer: (
            <>
              <Warning>
                Non, vous ne pouvez pas supprimer votre propre compte.
              </Warning>

              <Section title="Pourquoi?" icon={AlertCircle} color="red">
                <Bullet>Pour maintenir l'intégrité de l'échange</Bullet>
                <Bullet>Pour éviter de casser les attributions</Bullet>
                <Bullet>Pour la cohérence du groupe</Bullet>
              </Section>

              <Section title="Si vous voulez vraiment partir" icon={Users} color="blue">
                <Bullet>Contactez l'administrateur</Bullet>
                <Bullet>Seul l'admin peut supprimer des comptes</Bullet>
                <Bullet>Cela affectera les attributions</Bullet>
              </Section>

              <Tip>Mieux vaut rester et participer! 🎄</Tip>
            </>
          )
        }
      ]
    },
    {
      id: 'admin',
      title: 'Administration',
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'from-purple-500/20 to-purple-600/10',
      borderColor: 'border-purple-500/30',
      questions: [
        {
          question: "Qui est l'administrateur?",
          answer: (
            <>
              <p className="mb-4">L'administrateur gère {event?.name || "l'événement"}:</p>

              <Section title="Ses responsabilités" icon={Users} color="purple">
                <Bullet>Créer les attributions (qui offre à qui)</Bullet>
                <Bullet>Ajouter/supprimer des participants</Bullet>
                <Bullet>Envoyer les emails d'attribution</Bullet>
                <Bullet>Consulter les statistiques globales</Bullet>
                <Bullet>Gérer les paramètres de l'événement</Bullet>
              </Section>

              <Section title="Ce qu'il NE voit PAS" icon={Lock} color="red">
                <Bullet>Vos mots de passe</Bullet>
                <Bullet>Qui réserve quoi en détail</Bullet>
              </Section>

              <InfoBox>
                Besoin d'aide? Contactez votre administrateur. Il/elle peut vous aider avec tout problème.
              </InfoBox>

              <Tip>L'admin a un badge spécial dans l'app! 👑</Tip>
            </>
          )
        },
        {
          question: 'Comment devenir administrateur?',
          answer: (
            <>
              <Warning>
                Vous ne pouvez pas devenir administrateur vous-même.
              </Warning>

              <Section title="L'admin est désigné lors de la création" icon={Users} color="purple">
                <Bullet>C'est la personne qui a créé l'événement</Bullet>
                <Bullet>Seul l'admin peut gérer l'événement</Bullet>
              </Section>

              <Section title="Si vous voulez être admin" icon={Gift} color="blue">
                <Bullet>Demandez à l'admin actuel</Bullet>
                <Bullet>Il/elle peut créer un nouvel événement pour vous</Bullet>
              </Section>

              <Tip>En général, il n'y a qu'un seul admin par événement!</Tip>
            </>
          )
        }
      ]
    }
  ];

  // Filtrer les questions selon la recherche
  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleItem = (categoryIndex, questionIndex) => {
    const itemId = `${categoryIndex}-${questionIndex}`;
    setOpenItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isOpen = (categoryIndex, questionIndex) => {
    return openItems.includes(`${categoryIndex}-${questionIndex}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-8 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => setView('dashboard')}
        className="text-dark-300 hover:text-white bg-dark-800/50 hover:bg-dark-700/50 backdrop-blur-sm px-4 py-2 rounded-xl mb-6 font-medium transition-all flex items-center gap-2 border border-white/10 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Retour
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <HelpCircle className="w-10 h-10 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-gold to-emerald-500 bg-clip-text text-transparent">
            Foire Aux Questions
          </h1>
        </div>
        <p className="text-dark-400 text-lg">Trouvez rapidement les réponses à vos questions</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une question..."
            className="w-full pl-12 pr-4 py-4 bg-dark-800/50 border-2 border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary/50 outline-none text-dark-100 placeholder-dark-500 transition-all"
          />
        </div>
      </div>

      {/* Categories & Questions */}
      <div className="space-y-6">
        {filteredCategories.map((category, categoryIndex) => {
          const Icon = category.icon;
          return (
            <div
              key={category.id}
              className="bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-xl shadow-2xl p-4 border border-white/10 animate-slide-up"
              style={{ animationDelay: `${categoryIndex * 0.1}s` }}
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                <div className={`p-2 bg-gradient-to-br ${category.bgColor} rounded-xl border ${category.borderColor}`}>
                  <Icon className={`w-6 h-6 ${category.color}`} />
                </div>
                <h2 className="text-2xl font-bold text-dark-100">{category.title}</h2>
                <span className="ml-auto text-sm text-dark-500 font-medium">
                  {category.questions.length} question{category.questions.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Questions */}
              <div className="space-y-3">
                {category.questions.map((item, questionIndex) => {
                  const itemIsOpen = isOpen(categoryIndex, questionIndex);
                  return (
                    <div
                      key={questionIndex}
                      className="bg-dark-900/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/20"
                    >
                      {/* Question */}
                      <button
                        onClick={() => toggleItem(categoryIndex, questionIndex)}
                        className="w-full flex items-center justify-between p-4 text-left group"
                      >
                        <span className="font-semibold text-dark-100 group-hover:text-primary transition-colors pr-4">
                          {item.question}
                        </span>
                        {itemIsOpen ? (
                          <ChevronUp className="w-5 h-5 text-dark-400 flex-shrink-0 group-hover:text-primary transition-colors" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-dark-400 flex-shrink-0 group-hover:text-primary transition-colors" />
                        )}
                      </button>

                      {/* Answer */}
                      {itemIsOpen && (
                        <div className="px-4 pb-4 pt-2 border-t border-white/10 animate-slide-down">
                          <div className="text-dark-300 leading-relaxed">
                            {item.answer}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredCategories.length === 0 && searchQuery && (
        <div className="text-center py-12 bg-dark-800/50 rounded-2xl border border-white/10">
          <HelpCircle className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400 text-lg mb-2">Aucun résultat pour "{searchQuery}"</p>
          <p className="text-dark-500 text-sm">Essayez avec d'autres mots-clés</p>
        </div>
      )}

      {/* Help Footer */}
      <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-emerald-900/10 backdrop-blur-sm rounded-xl border border-primary/20">
        <div className="flex items-start gap-4">
          <Sparkles className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-dark-100 mb-2">Vous n'avez pas trouvé votre réponse?</h3>
            <p className="text-dark-400 text-sm">
              Contactez l'administrateur de {event?.name || "l'événement"} pour obtenir de l'aide personnalisée! 😊
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQView
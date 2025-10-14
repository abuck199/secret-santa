import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Sparkles, Gift, List, Heart, Lock, Users, HelpCircle, ArrowLeft } from 'lucide-react';

const FAQView = ({ event, setView }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState([0]); // Premier item ouvert par défaut

  // Données FAQ organisées par catégories
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
          answer: `${event?.name || 'Cette application'} vous permet d'organiser un échange de cadeaux facilement!\n\n**Les étapes:**\n\n1️⃣ Créez votre liste de souhaits avec vos envies\n2️⃣ Consultez les listes des autres participants\n3️⃣ Réservez des articles pour éviter les doublons\n4️⃣ Découvrez votre attribution (à qui offrir un cadeau)\n5️⃣ Échangez vos cadeaux le jour J!\n\n**C'est simple, organisé et amusant!** 🎄`
        },
        {
          question: 'Première utilisation : par où commencer?',
          answer: `Bienvenue! Voici les 3 premières étapes:\n\n**1. Créez votre liste** 📝\n• Cliquez sur "Ma Liste" dans le menu\n• Ajoutez vos idées de cadeaux\n• Ajoutez des liens si vous le souhaitez\n\n**2. Explorez les autres listes** 👀\n• Allez dans "Toutes les Listes"\n• Parcourez ce que les autres veulent\n• Réservez ce qui vous intéresse\n\n**3. Découvrez votre attribution** ❤️\n• Cliquez sur "Mon Attribution"\n• Voyez à qui vous devez offrir\n• Consultez sa liste de souhaits\n\n**C'est tout!** Vous êtes prêt! 🎁`
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
          answer: `**Pour créer votre liste:**\n\n1️⃣ Cliquez sur "Ma Liste" 📋 dans le menu\n2️⃣ Cliquez sur le bouton "Ajouter un article" ➕\n3️⃣ Entrez le nom de l'article que vous souhaitez\n4️⃣ (Optionnel) Ajoutez un lien vers le produit 🔗\n5️⃣ Cliquez sur "Ajouter à ma liste" ✅\n\n**Conseils:**\n• Soyez précis dans vos descriptions\n• Ajoutez des liens pour aider la personne à trouver\n• Variez les prix si possible\n• Mettez à jour régulièrement!`
        },
        {
          question: 'Puis-je modifier un article de ma liste?',
          answer: `**Oui! Vous pouvez modifier vos articles à tout moment:**\n\n1️⃣ Allez dans "Ma Liste" 📋\n2️⃣ Cliquez sur l'icône ✏️ (crayon) sur l'article\n3️⃣ Modifiez le nom ou le lien\n4️⃣ Cliquez sur "Sauvegarder" 💾\n\n**Important:**\n✅ Vous pouvez modifier même si quelqu'un a réservé l'article\n✅ La personne verra la version mise à jour\n✅ Pratique pour corriger des erreurs ou ajouter des détails!`
        },
        {
          question: 'Puis-je supprimer un article de ma liste?',
          answer: `**Non, vous ne pouvez pas supprimer un article une fois ajouté.**\n\n**Pourquoi?**\n🚫 Pour éviter les problèmes si quelqu'un l'a déjà réservé\n🚫 Pour maintenir la cohérence des réservations\n\n**Solution:**\n✅ Vous pouvez **modifier** l'article pour le remplacer\n✅ Changez le nom pour un autre souhait\n✅ Mettez à jour le lien si nécessaire\n\n💡 Astuce: Réfléchissez bien avant d'ajouter un article!`
        },
        {
          question: 'Comment réorganiser ma liste?',
          answer: `**Vous pouvez changer l'ordre de vos articles par glisser-déposer:**\n\n**Sur ordinateur:**\n🖱️ Cliquez sur l'icône ☰ (trois lignes) à gauche\n🖱️ Maintenez et glissez l'article\n🖱️ Relâchez à la position souhaitée\n\n**Sur mobile:**\n📱 Maintenez votre doigt sur l'icône ☰\n📱 Glissez l'article vers le haut ou le bas\n📱 Relâchez quand c'est bon\n\n💡 Mettez vos articles préférés en haut!`
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
          answer: `**Pour réserver un article d'une autre personne:**\n\n1️⃣ Allez dans "Toutes les Listes" 📝\n2️⃣ Parcourez les listes des participants\n3️⃣ Trouvez un article qui vous intéresse\n4️⃣ Cliquez sur "Réserver" 🎁\n5️⃣ L'article est maintenant marqué comme réservé!\n\n**Important:**\n⚠️ Vous ne pouvez PAS réserver vos propres articles\n✅ Les autres ne voient pas QUI a réservé\n✅ Vous pouvez annuler une réservation si besoin\n\n💡 Réservez pour éviter que 2 personnes offrent la même chose!`
        },
        {
          question: 'Comment voir mes réservations?',
          answer: `**Pour consulter tous les articles que vous avez réservés:**\n\n1️⃣ Cliquez sur "Mes Réservations" 🎁 dans le menu\n2️⃣ Vous verrez tous vos articles réservés\n3️⃣ Organisés par personne\n4️⃣ Avec les liens vers les produits\n\n**Actions possibles:**\n✅ Voir le lien du produit\n✅ Annuler une réservation si besoin\n✅ Voir le compteur total\n\n💡 Pratique pour ne rien oublier lors des achats!`
        },
        {
          question: 'Puis-je annuler une réservation?',
          answer: `**Oui! Vous pouvez annuler une réservation à tout moment:**\n\n1️⃣ Allez dans "Mes Réservations" 🎁\n2️⃣ Trouvez l'article à annuler\n3️⃣ Cliquez sur "Annuler" ❌\n4️⃣ L'article redevient disponible pour les autres\n\n**Ou directement depuis les listes:**\n1️⃣ Allez dans "Toutes les Listes" 📝\n2️⃣ Les articles que vous avez réservés ont un bouton "Annuler"\n3️⃣ Cliquez dessus pour libérer l'article\n\n✅ Aucun problème pour changer d'avis!`
        },
        {
          question: 'Les autres voient-ils qui a réservé?',
          answer: `**Non! Les réservations sont anonymes:**\n\n🔒 **Vous voyez:**\n✅ Vos propres réservations\n✅ Quels articles de votre liste sont réservés\n❌ Mais PAS qui les a réservés\n\n👥 **Les autres voient:**\n✅ Si un article est "Réservé" ou "Disponible"\n❌ Mais PAS qui l'a réservé\n\n🎁 **L'admin voit:**\n✅ Toutes les statistiques\n❌ Mais pas les détails de qui réserve quoi\n\n💡 C'est pour garder la surprise!`
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
          answer: `**Pour découvrir à qui vous devez offrir un cadeau:**\n\n1️⃣ Cliquez sur "Mon Attribution" ❤️ dans le menu\n2️⃣ Vous verrez le nom de la personne\n3️⃣ Vous pouvez consulter sa liste de souhaits\n4️⃣ Vous pouvez réserver des articles directement!\n\n**Important:**\n🤫 C'est SECRET! Ne dites à personne qui est votre attribution\n🎁 Vous ne pouvez offrir qu'à UNE personne\n❤️ Quelqu'un d'autre vous offre un cadeau (mais vous ne savez pas qui!)\n\n💡 C'est ça la magie du Secret Santa!`
        },
        {
          question: 'Quand vais-je connaître mon attribution?',
          answer: `**Vous connaîtrez votre attribution quand l'admin créera les attributions:**\n\n📧 **Vous recevrez un email** avec:\n✅ Le nom de votre attribution\n✅ Un lien vers l'application\n\n🔔 **Dans l'app:**\n✅ L'onglet "Mon Attribution" deviendra actif\n✅ Vous pourrez voir la liste de la personne\n\n⏱️ **Timing:**\n• L'admin choisit quand créer les attributions\n• Généralement quelques jours/semaines avant l'événement\n\n💡 Patience! L'admin vous préviendra! 😊`
        },
        {
          question: 'C\'est quoi le principe du Secret Santa?',
          answer: `**Le Secret Santa (ou Père Noël Secret) c'est simple:**\n\n🎲 **Attribution aléatoire:**\n• Chaque personne tire au sort un nom\n• Vous offrez UN cadeau à cette personne\n• Quelqu'un d'autre vous offre un cadeau\n• Personne ne sait qui offre à qui (sauf l'admin!)\n\n🎁 **Avantages:**\n✅ Un seul cadeau à acheter (économique!)\n✅ Tout le monde reçoit un cadeau\n✅ Suspense et surprise garantis\n✅ Parfait pour les grands groupes\n\n🤫 **Règle d'or:**\n• GARDEZ LE SECRET!\n• Ne dites à personne qui est votre attribution\n• Le mystère fait partie du jeu!\n\n🎄 C'est la magie des fêtes!`
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
          answer: `**Pour modifier votre mot de passe:**\n\n**Sur ordinateur:**\n1️⃣ Cliquez sur votre avatar en haut à droite 👤\n2️⃣ Sélectionnez "Changer mot de passe" 🔒\n\n**Sur mobile:**\n1️⃣ Ouvrez le menu "Menu" ☰ en bas\n2️⃣ Sélectionnez "Changer mot de passe" 🔒\n\n**Ensuite:**\n3️⃣ Entrez votre mot de passe actuel\n4️⃣ Entrez le nouveau (2 fois)\n5️⃣ Validez! ✅\n\n**Exigences:**\n• Minimum 4 caractères\n• Doit être différent de l'ancien\n\n🔒 Gardez-le en sécurité!`
        },
        {
          question: 'Vais-je recevoir des notifications?',
          answer: `**Oui! Vous recevrez des emails pour:**\n\n📧 **Création de compte:**\n✅ Vos identifiants de connexion\n✅ Bienvenue sur la plateforme\n\n❤️ **Attribution créée:**\n✅ Le nom de votre attribution\n✅ Lien direct vers l'application\n\n🔄 **Nouvelles attributions:**\n✅ Si l'admin recrée les attributions\n✅ Votre nouvelle attribution\n\n**Important:**\n⚠️ Pas de notifications pour les réservations\n💡 Consultez régulièrement l'app pour voir les nouveautés!\n\n📱 Gardez un œil sur votre boîte mail!`
        },
        {
          question: 'Puis-je supprimer mon compte?',
          answer: `**Non, vous ne pouvez pas supprimer votre propre compte.**\n\n**Pourquoi?**\n🔒 Pour maintenir l'intégrité de l'échange\n🎁 Pour éviter de casser les attributions\n👥 Pour la cohérence du groupe\n\n**Si vous voulez vraiment partir:**\n📧 Contactez l'administrateur\n👤 Seul l'admin peut supprimer des comptes\n⚠️ Cela affectera les attributions\n\n💡 Mieux vaut rester et participer! 🎄`
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
          question: 'Qui est l\'administrateur?',
          answer: `**L'administrateur gère ${event?.name || 'l\'événement'}:**\n\n⚙️ **Ses responsabilités:**\n• Créer les attributions (qui offre à qui)\n• Ajouter/supprimer des participants\n• Envoyer les emails d'attribution\n• Consulter les statistiques globales\n• Gérer les paramètres de l'événement\n\n🔒 **Ce qu'il NE voit PAS:**\n❌ Vos mots de passe\n❌ Qui réserve quoi en détail\n\n💬 **Besoin d'aide?**\n• Contactez votre administrateur\n• Il/elle peut vous aider avec tout problème\n\n👑 L'admin a un badge spécial dans l'app!`
        },
        {
          question: 'Comment devenir administrateur?',
          answer: `**Vous ne pouvez pas devenir administrateur vous-même.**\n\n**L'admin est désigné lors de la création:**\n👤 C'est la personne qui a créé l'événement\n🔐 Seul l'admin peut gérer l'événement\n\n**Si vous voulez être admin:**\n💬 Demandez à l'admin actuel\n⚠️ Il/elle peut créer un nouvel événement pour vous\n\n💡 En général, il n'y a qu'un seul admin par événement!`
        }
      ]
    }
  ];

  // Filtrer les questions selon la recherche
  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  // Toggle l'ouverture d'une question
  const toggleItem = (categoryIndex, questionIndex) => {
    const itemId = `${categoryIndex}-${questionIndex}`;
    setOpenItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Vérifier si un item est ouvert
  const isOpen = (categoryIndex, questionIndex) => {
    return openItems.includes(`${categoryIndex}-${questionIndex}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
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
        <HelpCircle className="w-10 h-10 text-primary animate-float" />
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
              <div className={`flex items-center gap-3 mb-4 pb-4 border-b border-white/10`}>
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
                          <div className="text-dark-300 whitespace-pre-line leading-relaxed">
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
              Contactez l'administrateur de {event?.name || 'l\'événement'} pour obtenir de l'aide personnalisée! 😊
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQView;
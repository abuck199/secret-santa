import React from 'react';
import { 
  Heart, 
  Shield, 
  HelpCircle, 
  Mail, 
  Github, 
  Sparkles, 
  Lock,
  Gift,
  ExternalLink,
  Coffee,
  Star,
  Users
} from 'lucide-react';

const Footer = ({ currentUser, event, setView }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-16 bg-gradient-to-b from-dark-900/50 to-dark-950 backdrop-blur-xl border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-dark-100">{event?.name || 'Secret Santa'}</h3>
            </div>
            <p className="text-sm text-dark-400 leading-relaxed">
              Organisez votre échange de cadeaux en toute simplicité. 
              Créez vos listes, réservez discrètement et partagez la magie des fêtes.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-dark-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              Navigation
            </h3>
            <ul className="space-y-2">
              {currentUser && (
                <>
                  <li>
                    <button 
                      onClick={() => setView('dashboard')}
                      className="text-sm text-dark-400 hover:text-primary transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 bg-dark-600 group-hover:bg-primary rounded-full transition-colors"></span>
                      Tableau de bord
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setView('wishlist')}
                      className="text-sm text-dark-400 hover:text-primary transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 bg-dark-600 group-hover:bg-primary rounded-full transition-colors"></span>
                      Ma liste
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setView('all-lists')}
                      className="text-sm text-dark-400 hover:text-primary transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 bg-dark-600 group-hover:bg-primary rounded-full transition-colors"></span>
                      Toutes les listes
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setView('faq')}
                      className="text-sm text-dark-400 hover:text-primary transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 bg-dark-600 group-hover:bg-primary rounded-full transition-colors"></span>
                      FAQ & Aide
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-dark-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              Informations
            </h3>
            <ul className="space-y-2">
              <li className="text-sm text-dark-400 flex items-center gap-2">
                <Lock className="w-3 h-3 text-dark-600" />
                <span>Données sécurisées</span>
              </li>
              <li className="text-sm text-dark-400 flex items-center gap-2">
                <Shield className="w-3 h-3 text-dark-600" />
                <span>Confidentialité respectée</span>
              </li>
              <li className="text-sm text-dark-400 flex items-center gap-2">
                <Heart className="w-3 h-3 text-dark-600" />
                <span>Réservations anonymes</span>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-dark-100 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gold" />
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setView('faq')}
                  className="text-sm text-dark-400 hover:text-gold transition-colors flex items-center gap-2"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Centre d'aide</span>
                </button>
              </li>
              {currentUser?.is_admin && (
                <li>
                  <button 
                    onClick={() => setView('admin')}
                    className="text-sm text-dark-400 hover:text-gold transition-colors flex items-center gap-2"
                  >
                    <Shield className="w-3 h-3" />
                    <span>Administration</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-dark-950/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-dark-500">
            <div className="flex items-center gap-2">
              <span>© {currentYear} Noël lavoie</span>
              <span className="text-dark-700">•</span>
              <span>Tous droits réservés</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
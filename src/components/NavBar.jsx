import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Menu, X, Home, List, Gift } from 'lucide-react';

const NavBar = ({ currentUser, event, view, setView, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleNavClick = (viewName) => {
    setView(viewName);
    setIsMenuOpen(false);
  };

  // Fermeture du menu au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    // Fermeture avec la touche ESC
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMenuOpen]);

  // Empêcher le scroll du body quand le menu est ouvert
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const menuItems = [
    { id: 'dashboard', label: 'Accueil', icon: Home },
    { id: 'all-lists', label: 'Listes', icon: List },
    { id: 'my-reservations', label: 'Réservations', icon: Gift }
  ];

  return (
    <>
      {/* Navbar sticky */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-primary to-beige-dark shadow-xl border-b-4 border-primary">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Mobile: Header avec hamburger */}
          <div className="flex md:hidden justify-between items-center">
            <span className="text-lg font-bold text-stone-800 truncate max-w-[150px]" title={event.name}>
              {event.name}
            </span>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-800 font-medium truncate max-w-[100px]">
                Bonjour {currentUser.username}
              </span>
              
              {/* Bouton hamburger (mobile seulement) */}
              <button 
                ref={menuRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-stone-800 hover:text-stone-900 transition-transform duration-200 ease-in-out transform hover:scale-110"
                aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Desktop: Tout sur une ligne */}
          <div className="hidden md:flex items-center justify-between">
            {/* Nom de l'événement */}
            <span className="text-xl font-bold text-stone-800 truncate" title={event.name}>
              {event.name}
            </span>
            
            {/* Navigation au centre */}
            <div className="flex gap-8 items-center">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button 
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`relative flex items-center gap-2 text-base text-stone-700 hover:text-stone-900 transition-colors duration-200 font-medium group ${
                      view === item.id ? 'text-stone-900 font-bold' : ''
                    }`}
                    aria-current={view === item.id ? 'page' : undefined}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {/* Barre avec animation transform plus fluide */}
                    <span 
                      className={`absolute -bottom-2 left-0 right-0 h-1 bg-stone-900 origin-left transform transition-transform duration-300 ease-out ${
                        view === item.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </button>
                );
              })}
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 text-base text-stone-700 hover:text-stone-900 transition-all duration-200 group"
                aria-label="Se déconnecter"
              >
                <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                <span>Déconnexion</span>
              </button>
            </div>

            {/* Utilisateur à droite */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-stone-700 text-white font-bold text-base">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-base text-stone-800 font-medium">
                Bonjour {currentUser.username}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay sombre (mobile) */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Menu Mobile (dropdown) - Animation slide */}
      <div
        className={`fixed top-[88px] right-0 w-64 md:hidden bg-white/95 backdrop-blur-sm shadow-2xl z-40 transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button 
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  view === item.id 
                    ? 'bg-stone-800 text-white font-bold shadow-md' 
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
                aria-current={view === item.id ? 'page' : undefined}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="border-t border-stone-200 my-2" />
          <button 
            onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
            className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-stone-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            aria-label="Se déconnecter"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default NavBar;
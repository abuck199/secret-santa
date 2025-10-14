import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Menu, X, Home, List, Gift, Lock, Sparkles } from 'lucide-react';

const NavBar = ({ currentUser, event, view, setView, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleNavClick = (viewName) => {
    setView(viewName);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

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
    { id: 'dashboard', label: 'Accueil', icon: Home, color: 'text-primary' },
    { id: 'all-lists', label: 'Listes', icon: List, color: 'text-emerald-500' },
    { id: 'my-reservations', label: 'Réservations', icon: Gift, color: 'text-gold' },
    { id: 'change-password', label: 'Mot de passe', icon: Lock, color: 'text-dark-400' }
  ];

  return (
    <>
      {/* Navbar sticky avec glassmorphism */}
      <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-xl shadow-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Mobile: Header avec hamburger */}
          <div className="flex md:hidden justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-float">🎄</span>
              <span className="text-lg font-bold bg-gradient-to-r from-primary via-gold to-emerald-500 bg-clip-text text-transparent truncate max-w-[150px]" title={event.name}>
                {event.name}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-dark-300 font-medium truncate max-w-[100px]">
                {currentUser.username}
              </span>
              
              <button 
                ref={menuRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-dark-200 hover:text-white transition-all duration-200 transform hover:scale-110 p-2 rounded-lg hover:bg-white/10"
                aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Desktop: Tout sur une ligne */}
          <div className="hidden md:flex items-center justify-between">
            {/* Nom de l'événement avec effet festif */}
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-float">🎄</span>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-gold to-emerald-500 bg-clip-text text-transparent flex items-center gap-2" title={event.name}>
                  {event.name}
                  <Sparkles className="w-4 h-4 text-gold animate-pulse" />
                </span>
              </div>
            </div>
            
            {/* Navigation au centre */}
            <div className="flex gap-6 items-center">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button 
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`relative flex items-center gap-2 text-base transition-all duration-200 font-medium group px-3 py-2 rounded-lg ${
                      view === item.id 
                        ? 'text-white bg-white/10' 
                        : 'text-dark-300 hover:text-white hover:bg-white/5'
                    }`}
                    aria-current={view === item.id ? 'page' : undefined}
                  >
                    <Icon className={`w-5 h-5 ${view === item.id ? item.color : ''} group-hover:scale-110 transition-transform`} />
                    <span>{item.label}</span>
                    {view === item.id && (
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-gold to-emerald-500"></span>
                    )}
                  </button>
                );
              })}
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 text-base text-dark-300 hover:text-primary transition-all duration-200 group px-3 py-2 rounded-lg hover:bg-white/5"
                aria-label="Se déconnecter"
              >
                <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Déconnexion</span>
              </button>
            </div>

            {/* Utilisateur à droite avec badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white font-bold text-base shadow-lg">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-dark-400">Connecté</span>
                <span className="text-sm text-dark-200 font-medium">
                  {currentUser.username}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay sombre (mobile) avec effet de flou */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 animate-fade-in"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Menu Mobile (dropdown) - Version dark festive */}
      <div
        className={`fixed top-[72px] right-0 w-72 md:hidden bg-dark-900/95 backdrop-blur-xl shadow-2xl z-40 transition-transform duration-300 ease-in-out border-l border-white/10 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 space-y-2">
          {/* User info dans le menu mobile */}
          <div className="pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white font-bold text-lg shadow-lg">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-dark-400">Connecté en tant que</p>
                <p className="text-base text-dark-100 font-semibold">{currentUser.username}</p>
              </div>
            </div>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button 
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                  view === item.id 
                    ? 'bg-gradient-to-r from-primary/20 to-transparent text-white border-l-2 border-primary shadow-lg' 
                    : 'text-dark-300 hover:bg-white/5 hover:text-white'
                }`}
                aria-current={view === item.id ? 'page' : undefined}
              >
                <Icon className={`w-5 h-5 ${view === item.id ? item.color : ''}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
          
          <div className="border-t border-white/10 my-2 pt-2" />
          
          <button 
            onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
            className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-dark-300 hover:bg-primary/10 hover:text-primary transition-all duration-200"
            aria-label="Se déconnecter"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default NavBar;
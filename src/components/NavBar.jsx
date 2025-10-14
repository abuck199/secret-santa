import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Home, List, Gift, Lock, Sparkles, Settings, Heart, Clipboard, Menu, X, HelpCircle } from 'lucide-react';

const NavBar = ({ currentUser, event, view, setView, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);
  const profileRef = useRef(null);

  const handleNavClick = (viewName) => {
    setView(viewName);
    setIsMenuOpen(false);
  };

  // Menu items pour navigation DESKTOP principale
  const desktopMenuItems = [
    { id: 'dashboard', label: 'Accueil', icon: Home, color: 'text-primary' },
    { id: 'wishlist', label: 'Ma Liste', icon: Clipboard, color: 'text-emerald-500' },
    { id: 'assignment', label: 'Mon Attribution', icon: Heart, color: 'text-primary' },
    { id: 'all-lists', label: 'Toutes les Listes', icon: List, color: 'text-blue-500' },
    { id: 'my-reservations', label: 'Mes Réservations', icon: Gift, color: 'text-gold' },
    { id: 'faq', label: 'Aide', icon: HelpCircle, color: 'text-purple-500' },
  ];

  // Fermeture au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Empêcher le scroll du body quand menu ouvert
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

  return (
    <>
      {/* ========== DESKTOP NAVBAR ========== */}
      <nav className="hidden md:block sticky top-0 z-50 bg-dark-900/80 backdrop-blur-xl shadow-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo cliquable */}
            <button 
              onClick={() => setView('dashboard')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
            >
              <span className="text-2xl animate-float group-hover:scale-110 transition-transform">🎄</span>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-gold to-emerald-500 bg-clip-text text-transparent flex items-center gap-2">
                  {event.name}
                  <Sparkles className="w-4 h-4 text-gold animate-pulse" />
                </span>
              </div>
            </button>
            
            {/* Navigation centrale - TOUS les menus principaux */}
            <div className="flex gap-2 items-center">
              {desktopMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button 
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium group ${
                      view === item.id 
                        ? 'bg-white/10 text-white shadow-lg' 
                        : 'text-dark-300 hover:text-white hover:bg-white/5'
                    }`}
                    aria-current={view === item.id ? 'page' : undefined}
                  >
                    <Icon className={`w-5 h-5 ${view === item.id ? item.color : ''} group-hover:scale-110 transition-transform`} />
                    <span>{item.label}</span>
                    {view === item.id && (
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-gold to-emerald-500 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Profil utilisateur avec dropdown (SEULEMENT Admin & Mot de passe) */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white font-bold text-base shadow-lg group-hover:scale-105 transition-transform">
                  {currentUser.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs text-dark-400">Connecté</span>
                  <span className="text-sm text-dark-200 font-medium">
                    {currentUser.username}
                  </span>
                </div>
              </button>

              {/* Dropdown menu - SEULEMENT Admin & Mot de passe */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-dark-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 py-2 animate-scale-in">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm text-dark-400">Connecté en tant que</p>
                    <p className="text-base font-bold text-dark-100">{currentUser.username}</p>
                    {currentUser.email && (
                      <p className="text-xs text-dark-500 mt-1">{currentUser.email}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => { setView('change-password'); setShowProfileMenu(false); }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-dark-300 hover:text-white"
                  >
                    <Lock className="w-5 h-5" />
                    <span>Changer mot de passe</span>
                  </button>

                  {currentUser.is_admin && (
                    <button
                      onClick={() => { setView('admin'); setShowProfileMenu(false); }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-dark-300 hover:text-white"
                    >
                      <Settings className="w-5 h-5" />
                      <span>Administration</span>
                    </button>
                  )}

                  <div className="border-t border-white/10 mt-2 pt-2">
                    <button
                      onClick={() => { handleLogout(); setShowProfileMenu(false); }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ========== MOBILE TOP BAR ========== */}
      <nav className="md:hidden sticky top-0 z-50 bg-dark-900/95 backdrop-blur-xl shadow-2xl border-b border-white/10">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Logo cliquable */}
          <button 
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2"
          >
            <span className="text-2xl animate-float">🎄</span>
            <span className="text-base font-bold bg-gradient-to-r from-primary via-gold to-emerald-500 bg-clip-text text-transparent truncate max-w-[120px]">
              {event.name}
            </span>
          </button>

          {/* Rien à droite sur mobile top bar */}
        </div>
      </nav>

      {/* ========== MOBILE BOTTOM APP BAR (2 boutons seulement) ========== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
        <div className="bg-dark-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
          <div className="flex items-center justify-around px-4 py-3">
            {/* Bouton Accueil */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200 ${
                view === 'dashboard' 
                  ? 'bg-white/10 scale-105' 
                  : 'hover:bg-white/5'
              }`}
            >
              <Home 
                className={`w-7 h-7 transition-all ${
                  view === 'dashboard' 
                    ? 'text-primary scale-110' 
                    : 'text-dark-400'
                }`} 
              />
              <span className={`text-sm font-medium transition-colors ${
                view === 'dashboard' 
                  ? 'text-white' 
                  : 'text-dark-500'
              }`}>
                Accueil
              </span>
            </button>

            {/* Bouton Menu (hamburger) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl hover:bg-white/5 transition-all"
            >
              <Menu className="w-7 h-7 text-dark-400" />
              <span className="text-sm font-medium text-dark-500">Menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Full Menu (Swipe up style) - TOUS les menus */}
      {isMenuOpen && (
        <>
          <div 
            className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
            onClick={() => setIsMenuOpen(false)}
          />
          <div 
            ref={menuRef}
            className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-900/95 backdrop-blur-xl rounded-t-2xl shadow-2xl border-t border-white/10 z-50 animate-slide-up max-h-[80vh] overflow-y-auto pb-safe"
          >
            {/* Handle bar + Close button */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Menu className="w-5 h-5 text-dark-400" />
                <h3 className="text-lg font-bold text-dark-100">Menu</h3>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-dark-400" />
              </button>
            </div>

            <div className="px-4 py-4">
              {/* User info */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-dark-800/60 to-dark-900/60 rounded-xl mb-4 border border-white/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {currentUser.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-base font-bold text-dark-100">{currentUser.username}</p>
                  <p className="text-xs text-dark-400">Connecté</p>
                </div>
              </div>

              {/* Navigation principale */}
              <div className="mb-3">
                <p className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-2 px-2">Navigation</p>
                <div className="space-y-1">
                  <button
                    onClick={() => handleNavClick('wishlist')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      view === 'wishlist' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : 'text-dark-300 hover:bg-white/5'
                    }`}
                  >
                    <Clipboard className="w-5 h-5" />
                    <span className="font-medium">Ma liste de souhaits</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('assignment')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      view === 'assignment' 
                        ? 'bg-primary/10 text-primary border border-primary/30' 
                        : 'text-dark-300 hover:bg-white/5'
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                    <span className="font-medium">Mon attribution</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('all-lists')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      view === 'all-lists' 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' 
                        : 'text-dark-300 hover:bg-white/5'
                    }`}
                  >
                    <List className="w-5 h-5" />
                    <span className="font-medium">Toutes les listes</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('my-reservations')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      view === 'my-reservations' 
                        ? 'bg-gold/10 text-gold border border-gold/30' 
                        : 'text-dark-300 hover:bg-white/5'
                    }`}
                  >
                    <Gift className="w-5 h-5" />
                    <span className="font-medium">Mes réservations</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('faq')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      view === 'faq' 
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' 
                        : 'text-dark-300 hover:bg-white/5'
                    }`}
                  >
                    <HelpCircle className="w-5 h-5" />
                    <span className="font-medium">Aide & FAQ</span>
                  </button>
                </div>
              </div>

              {/* Paramètres */}
              <div className="mb-3">
                <p className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-2 px-2">Paramètres</p>
                <div className="space-y-1">
                  <button
                    onClick={() => handleNavClick('change-password')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-dark-300 hover:bg-white/5 transition-all"
                  >
                    <Lock className="w-5 h-5" />
                    <span className="font-medium">Changer mot de passe</span>
                  </button>

                  {currentUser.is_admin && (
                    <button
                      onClick={() => handleNavClick('admin')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-dark-300 hover:bg-white/5 transition-all"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Administration</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Déconnexion */}
              <div className="border-t border-white/10 pt-3">
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NavBar;
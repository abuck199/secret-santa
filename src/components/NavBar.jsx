import React from 'react';
import { LogOut } from 'lucide-react';

const NavBar = ({ currentUser, event, view, setView, handleLogout }) => (
  <nav className="bg-gradient-to-r from-primary to-beige-dark shadow-xl border-b-4 border-primary">
    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <span className="text-xl font-bold text-stone-800">{event.name}</span>
      </div>
      <div className="flex items-center space-x-6">
        <button 
          onClick={() => setView('dashboard')}
          className={`text-stone-700 hover:text-stone-900 transition font-medium ${view === 'dashboard' ? 'text-stone-900 font-bold' : ''}`}
        >
          Accueil
        </button>
        <button 
          onClick={() => setView('all-lists')}
          className={`text-stone-700 hover:text-stone-900 transition font-medium ${view === 'all-lists' ? 'text-stone-900 font-bold' : ''}`}
        >
          Toutes les listes
        </button>
        <button 
          onClick={() => setView('my-reservations')}
          className={`text-stone-700 hover:text-stone-900 transition font-medium ${view === 'my-reservations' ? 'text-stone-900 font-bold' : ''}`}
        >
          Mes réservations
        </button>
        <span className="text-stone-800 font-medium">{currentUser.username}</span>
        <button 
          onClick={handleLogout} 
          className="flex items-center space-x-1 text-stone-700 hover:text-stone-900 transition"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  </nav>
);

export default NavBar;
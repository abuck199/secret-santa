import React from 'react';
import { Gift, List, Users, Shuffle, LogOut } from 'lucide-react';
import '../SecretSanta.css';

const Navigation = ({ currentUser, activeTab, setActiveTab, handleLogout }) => (
  <nav className="nav-container">
    <div className="nav-content">
      <div className="nav-header">
        <Gift className="nav-icon" size={32} />
        <div>
          <h1 className="nav-title">Noël 2025</h1>
          <p className="nav-subtitle">Organisateur de cadeaux</p>
        </div>
      </div>
      
      <div className="nav-actions">
        <div className="nav-tabs">
          <button 
            onClick={() => setActiveTab('wishlist')} 
            className={`nav-tab ${activeTab === 'wishlist' ? 'nav-tab-active' : ''}`}
          >
            <List size={20} />
            <span>Ma Liste</span>
          </button>
          <button 
            onClick={() => setActiveTab('all-lists')} 
            className={`nav-tab ${activeTab === 'all-lists' ? 'nav-tab-active' : ''}`}
          >
            <Users size={20} />
            <span>Toutes les listes</span>
          </button>
          {currentUser?.is_admin && (
            <button 
              onClick={() => setActiveTab('admin')} 
              className={`nav-tab ${activeTab === 'admin' ? 'nav-tab-active' : ''}`}
            >
              <Shuffle size={20} />
              <span>Admin</span>
            </button>
          )}
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  </nav>
);

export default Navigation;
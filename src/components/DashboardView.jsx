import React from 'react';
import { Gift, List, Users, Shuffle } from 'lucide-react';

const DashboardView = ({ currentUser, assignments, wishLists, getAssignedUser, setView }) => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="grid md:grid-cols-2 gap-6">
      {/* Attribution */}
      <div className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-primary">
        <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center">
          <Gift className="w-6 h-6 mr-2 text-primary" />Votre attribution
        </h2>
        
        {assignments[currentUser.id] ? (
          <div>
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-6 rounded-xl mb-4 shadow-lg">
              <p className="text-sm opacity-90 mb-2">Vous offrez un cadeau à :</p>
              <p className="text-3xl font-bold">{getAssignedUser(currentUser.id)?.username}</p>
            </div>
            <button 
              onClick={() => setView('assignment')} 
              className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-lg hover:from-primary-dark hover:to-primary-dark transition shadow-lg font-semibold"
            >
              Voir leur liste
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-cream to-beige border-2 border-beige-dark p-6 rounded-xl text-center">
            <Shuffle className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="text-stone-800 font-semibold">Pas encore d'attribution</p>
            <p className="text-sm text-stone-600 mt-2">L'admin va les créer bientôt!</p>
          </div>
        )}
      </div>

      {/* Ma liste */}
      <div className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-primary">
        <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center">
          <List className="w-6 h-6 mr-2 text-primary-dark" />Ma liste de souhaits
        </h2>

        {(wishLists[currentUser.id] || []).length > 0 ? (
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {(wishLists[currentUser.id] || []).map(item => (
              <div key={item.id} className="p-3 bg-cream border border-beige-dark rounded-lg">
                <p className="font-semibold text-stone-800">{item.item}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-stone-50 border-2 border-stone-200 p-4 rounded-lg text-center mb-4">
            <p className="text-stone-600 text-sm">Votre liste est vide</p>
          </div>
        )}

        <button 
          onClick={() => setView('wishlist')} 
          className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-lg hover:from-primary-dark hover:to-primary-dark transition shadow-lg font-semibold"
        >
          Gérer ma liste
        </button>
      </div>
    </div>

    {/* Admin Panel */}
    {currentUser.is_admin && (
      <div className="mt-6 bg-white rounded-xl shadow-xl p-6 border-t-4 border-beige-dark">
        <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center">
          <Users className="w-6 h-6 mr-2 text-primary" />Panneau d'administration
        </h2>
        <button 
          onClick={() => setView('admin')} 
          className="bg-gradient-to-r from-beige to-beige-dark text-white px-6 py-3 rounded-lg hover:from-beige-dark hover:to-beige-dark transition shadow-lg font-semibold"
        >
          Gérer l'événement
        </button>
      </div>
    )}
  </div>
);

export default DashboardView;
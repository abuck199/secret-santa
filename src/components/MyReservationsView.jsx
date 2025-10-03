import React from 'react';
import { Gift, Mail } from 'lucide-react';

const MyReservationsView = ({ getMyReservations, toggleItemClaimed, setView, loading }) => {
  const reservations = getMyReservations();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-primary-dark">
        <h2 className="text-3xl font-bold text-stone-800 mb-2">Mes réservations</h2>
        <p className="text-stone-600 mb-6">Articles réservés pour vos proches</p>

        {reservations.length === 0 ? (
          <div className="bg-stone-50 border-2 border-stone-200 p-12 rounded-xl text-center">
            <Gift className="w-16 h-16 text-stone-400 mx-auto mb-4" />
            <p className="text-stone-600 text-lg font-medium">Aucune réservation</p>
            <button 
              onClick={() => setView('all-lists')}
              className="mt-4 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-lg hover:from-primary-dark hover:to-primary-dark font-semibold"
            >
              Voir les listes
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6 p-4 bg-gradient-to-r from-cream to-beige border-2 border-beige-dark rounded-xl">
              <p className="text-sm text-stone-700 font-medium">Articles réservés</p>
              <p className="text-3xl font-bold text-primary-dark">{reservations.length}</p>
            </div>

            <div className="space-y-6">
              {(() => {
                const grouped = reservations.reduce((acc, item) => {
                  if (!acc[item.userId]) acc[item.userId] = { userName: item.userName, items: [] };
                  acc[item.userId].items.push(item);
                  return acc;
                }, {});

                return Object.values(grouped).map((group, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-cream to-white p-6 rounded-xl border-2 border-beige-dark">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-stone-800">Pour {group.userName}</h3>
                      <span className="text-lg font-bold text-primary-dark">{group.items.length} article{group.items.length > 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="space-y-3">
                      {group.items.map(item => (
                        <div key={item.id} className="p-4 bg-white border-2 border-beige rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-bold text-stone-800">{item.item}</p>
                              {item.link && (
                                <a 
                                  href={item.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary-dark hover:text-primary text-sm flex items-center mt-2 font-medium"
                                >
                                  <Mail className="w-4 h-4 mr-1" />Voir le produit
                                </a>
                              )}
                            </div>
                            <button 
                              onClick={() => toggleItemClaimed(item.id, item.claimed)} 
                              disabled={loading}
                              className="ml-3 px-4 py-2 rounded-lg text-sm font-semibold bg-stone-200 text-stone-700 hover:bg-stone-300 disabled:opacity-50"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservationsView;
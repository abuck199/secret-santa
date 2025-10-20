import React from 'react';
import { Gift, Mail, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';

const MyReservationsView = ({ getMyReservations, toggleItemClaimed, setView, loading }) => {
  const reservations = getMyReservations();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-dark-100 mb-2 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-gold/20 to-gold/10 rounded-xl">
                <ShoppingBag className="w-7 h-7 text-gold" />
              </div>
              Mes réservations
              <Sparkles className="w-6 h-6 text-gold animate-pulse" />
            </h2>
            <p className="text-dark-400">Articles réservés pour vos proches</p>
          </div>
          {reservations.length > 0 && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold/20 to-gold/10 rounded-lg border border-gold/30">
              <Gift className="w-5 h-5 text-gold" />
              <span className="text-gold font-bold">{reservations.length}</span>
              <span className="text-dark-400 text-sm">réservation{reservations.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {reservations.length === 0 ? (
          <div className="bg-gradient-to-br from-dark-700/30 to-dark-800/30 backdrop-blur-sm border border-white/5 p-12 rounded-xl text-center">
            <Gift className="w-20 h-20 text-dark-600 mx-auto mb-4 animate-float" />
            <p className="text-dark-400 text-lg font-medium mb-2">Aucune réservation</p>
            <p className="text-dark-500 text-sm mb-6">Explorez les listes pour réserver des cadeaux</p>
            <button
              onClick={() => setView('all-lists')}
              className="bg-gradient-to-r from-primary via-primary-600 to-primary-dark text-white px-6 py-3 rounded-xl hover:from-primary-dark hover:to-primary font-semibold shadow-lg hover:shadow-glow-red transition-all flex items-center gap-2 mx-auto group"
            >
              <Gift className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Voir les listes
            </button>
          </div>
        ) : (
          <div>
            {/* Stats card */}
            <div className="mb-6 p-5 bg-gradient-to-br from-gold/20 via-gold/10 to-transparent backdrop-blur-sm border border-gold/30 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gold font-medium mb-1">Total des articles réservés</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-gold via-gold-500 to-gold-600 bg-clip-text text-transparent">
                    {reservations.length}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-gold/20 to-gold/10 rounded-xl">
                  <Gift className="w-10 h-10 text-gold animate-float" />
                </div>
              </div>
            </div>

            {/* Réservations groupées par personne */}
            <div className="space-y-6">
              {(() => {
                const grouped = reservations.reduce((acc, item) => {
                  if (!acc[item.userId]) acc[item.userId] = { userName: item.userName, items: [] };
                  acc[item.userId].items.push(item);
                  return acc;
                }, {});

                return Object.values(grouped).map((group, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-dark-700/50 to-dark-800/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-slide-up"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    {/* Header personne */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {group.userName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-dark-100 flex items-center gap-2">
                            Pour {group.userName}
                            <ArrowRight className="w-5 h-5 text-primary" />
                          </h3>
                          <p className="text-sm text-dark-400">
                            {group.items.length} article{group.items.length > 1 ? 's' : ''} réservé{group.items.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-900/30 to-emerald-800/30 rounded-lg border border-emerald-500/30">
                        <span className="text-emerald-400 font-bold text-lg">{group.items.length}</span>
                      </div>
                    </div>

                    {/* Liste des articles */}
                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 bg-gradient-to-r from-dark-800/60 to-dark-900/60 backdrop-blur-sm border border-white/10 rounded-xl hover:border-emerald-500/50 transition-all group"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full group-hover:scale-125 transition-transform"></div>
                                <p className="font-bold text-dark-100 group-hover:text-emerald-400 transition-colors">
                                  {item.item}
                                </p>
                              </div>
                              {item.link && (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1 mt-2 font-medium transition-colors group/link"
                                >
                                  <Mail className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
                                  Voir le produit
                                </a>
                              )}
                            </div>
                            <button
                              onClick={() => toggleItemClaimed(item.id, item.claimed)}
                              disabled={loading}
                              className="px-4 py-2 rounded-lg text-sm font-semibold bg-dark-700/50 hover:bg-dark-600/50 backdrop-blur-sm text-dark-200 border border-white/10 hover:border-primary/50 disabled:opacity-50 transition-all"
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
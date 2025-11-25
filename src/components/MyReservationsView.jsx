import React from 'react';
import { Gift, Mail, ArrowRight, Sparkles, ShoppingBag, Check, ShoppingCart } from 'lucide-react';

const MyReservationsView = ({ getMyReservations, toggleItemClaimed, toggleItemPurchased, setView, loading }) => {
  const reservations = getMyReservations();

  const purchasedCount = reservations.filter(r => r.purchased).length;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-8 animate-fade-in">
      <div className="bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-gold/20 to-gold/10 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-dark-100 flex items-center gap-2">
                Mes réservations
                <Sparkles className="w-5 h-5 text-gold animate-sparkle" />
              </h2>
              <p className="text-sm text-dark-400">Articles réservés pour vos proches</p>
            </div>
          </div>
          {reservations.length > 0 && (
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gold/20 to-gold/10 rounded-lg border border-gold/30">
              <Gift className="w-4 h-4 text-gold" />
              <span className="text-gold font-bold">{reservations.length}</span>
              <span className="text-dark-400 text-xs">réservation{reservations.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {reservations.length === 0 ? (
          <div className="bg-gradient-to-br from-dark-700/30 to-dark-800/30 backdrop-blur-sm border border-white/5 p-8 rounded-xl text-center">
            <Gift className="w-16 h-16 text-dark-600 mx-auto mb-3" />
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
            {/* Stats card - VERSION COMPACTE avec progression des achats */}
            <div className="mb-6 p-4 bg-gradient-to-br from-gold/20 via-gold/10 to-transparent backdrop-blur-sm border border-gold/30 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gold font-medium mb-1">Total des articles réservés</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-gold via-gold-500 to-gold-600 bg-clip-text text-transparent">
                    {reservations.length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-gold/20 to-gold/10 rounded-xl">
                  <Gift className="w-8 h-8 text-gold" />
                </div>
              </div>

              {/* Barre de progression des achats */}
              <div className="mt-3 pt-3 border-t border-gold/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-dark-300 flex items-center gap-1">
                    <ShoppingCart className="w-3 h-3" />
                    Progression des achats
                  </p>
                  <p className="text-xs text-emerald-400 font-semibold">
                    {purchasedCount}/{reservations.length} acheté{purchasedCount > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="w-full bg-dark-700/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${reservations.length > 0 ? (purchasedCount / reservations.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {(() => {
                const grouped = reservations.reduce((acc, item) => {
                  if (!acc[item.userId]) acc[item.userId] = { userName: item.userName, items: [] };
                  acc[item.userId].items.push(item);
                  return acc;
                }, {});

                return Object.values(grouped).map((group, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-dark-700/50 to-dark-800/50 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-slide-up"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    {/* Header personne - VERSION COMPACTE */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold shadow-lg">
                          {group.userName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-dark-100 flex items-center gap-2">
                            Pour {group.userName}
                            <ArrowRight className="w-4 h-4 text-primary" />
                          </h3>
                          <p className="text-xs text-dark-400">
                            {group.items.length} article{group.items.length > 1 ? 's' : ''} réservé{group.items.length > 1 ? 's' : ''}
                            {group.items.filter(i => i.purchased).length > 0 && (
                              <span className="text-emerald-400 ml-2">
                                • {group.items.filter(i => i.purchased).length} acheté{group.items.filter(i => i.purchased).length > 1 ? 's' : ''}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="px-2.5 py-1 bg-gradient-to-r from-emerald-900/30 to-emerald-800/30 rounded-lg border border-emerald-500/30">
                        <span className="text-emerald-400 font-bold text-lg">{group.items.length}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 bg-gradient-to-r ${item.purchased
                            ? 'from-emerald-900/30 to-emerald-800/30 border-emerald-500/30'
                            : 'from-dark-800/60 to-dark-900/60 border-white/10'
                            } backdrop-blur-sm border rounded-lg hover:border-emerald-500/50 transition-all group`}
                        >
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 mb-1 flex-wrap">
                                <div className={`w-1.5 h-1.5 ${item.purchased ? 'bg-emerald-400' : 'bg-emerald-500'} rounded-full group-hover:scale-125 transition-transform flex-shrink-0 mt-1.5`}></div>
                                <p className={`font-bold ${item.purchased ? 'text-emerald-300 line-through opacity-75' : 'text-dark-100'} group-hover:text-emerald-400 transition-colors break-words flex-1`}>
                                  {item.item}
                                </p>
                                {item.purchased && (
                                  <span className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 whitespace-nowrap">
                                    <Check className="w-3 h-3" />
                                    Acheté
                                  </span>
                                )}
                              </div>
                              {item.link && (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1 font-medium transition-colors group/link ml-3.5"
                                >
                                  <Mail className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform flex-shrink-0" />
                                  <span className="truncate">Voir le produit</span>
                                </a>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto md:flex-shrink-0">
                              <button
                                onClick={() => toggleItemPurchased(item.id, item.purchased)}
                                disabled={loading}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${item.purchased
                                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-lg hover:shadow-glow-green'
                                  }`}
                              >
                                {item.purchased ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Déjà acheté</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                    <span>Marquer acheté</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => toggleItemClaimed(item.id, item.claimed)}
                                disabled={loading}
                                className="px-3 py-2 rounded-lg text-xs font-semibold bg-dark-700/50 hover:bg-dark-600/50 backdrop-blur-sm text-dark-200 border border-white/10 hover:border-primary/50 disabled:opacity-50 transition-all flex items-center justify-center"
                              >
                                Annuler réservation
                              </button>
                            </div>
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
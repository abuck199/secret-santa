import React, { useState, useEffect, useCallback } from 'react';
import { Gift, Users, LogOut, List, Shuffle, Mail, Eye, EyeOff, Check, X } from 'lucide-react';
import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';

const SecretSantaApp = () => {
  // États principaux
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('login');
  const [users, setUsers] = useState([]);
  const [wishLists, setWishLists] = useState({});
  const [assignments, setAssignments] = useState({});
  const [event, setEvent] = useState({ id: null, name: 'Noël en Famille 2025' });
  
  // Formulaires
  const [loginForm, setLoginForm] = useState({ username: '', password: '', showPassword: false });
  const [userForm, setUserForm] = useState({ username: '', password: '', showForm: false });
  const [itemForm, setItemForm] = useState({ item: '', link: '' });
  
  // UI
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [draggedItem, setDraggedItem] = useState(null);

  // === EFFETS ===
  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    const titles = {
      login: 'Connexion',
      dashboard: 'Accueil',
      wishlist: 'Ma Liste',
      'all-lists': 'Toutes les Listes',
      'my-reservations': 'Mes Réservations',
      assignment: 'Mon Attribution',
      admin: 'Administration'
    };
    document.title = `${titles[view] || 'Cadeau Mystère'} - Cadeau Mystère`;
  }, [view]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // === CHARGEMENT DONNÉES ===
  const loadAllData = async () => {
    try {
      await Promise.all([loadEvent(), loadUsers(), loadWishLists(), loadAssignments()]);
    } catch (err) {
      console.error('Erreur chargement:', err);
      setError('Erreur de chargement');
    }
  };

  const loadEvent = async () => {
    const { data } = await supabase.from('events').select('*').limit(1).single();
    if (data) setEvent({ id: data.id, name: data.name });
  };

  const loadUsers = async () => {
    const { data } = await supabase.from('users').select('*').order('username');
    setUsers(data || []);
  };

  const loadWishLists = async () => {
    const { data } = await supabase.from('wishlist_items').select('*').order('display_order');
    if (!data) return;
    
    const organized = data.reduce((acc, item) => {
      if (!acc[item.user_id]) acc[item.user_id] = [];
      acc[item.user_id].push({
        id: item.id,
        item: item.item,
        link: item.link || '',
        claimed: item.claimed,
        displayOrder: item.display_order || 0
      });
      return acc;
    }, {});
    
    setWishLists(organized);
  };

  const loadAssignments = async () => {
    const { data } = await supabase.from('assignments').select('*');
    if (!data) return;
    
    const organized = data.reduce((acc, a) => ({ ...acc, [a.giver_id]: a.receiver_id }), {});
    setAssignments(organized);
  };

  // === AUTHENTIFICATION ===
  const handleLogin = async () => {
    setError('');
    setLoading(true);
    
    const trimmedUsername = loginForm.username.toLowerCase().trim();
    
    if (!trimmedUsername || !loginForm.password) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }
    
    // Récupérer l'utilisateur par username
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('username', trimmedUsername)
      .single();
    
    if (!data) {
      setLoading(false);
      setError('Nom d\'utilisateur ou mot de passe invalide');
      return;
    }
    
    // Vérifier le mot de passe avec bcrypt
    const passwordMatch = await bcrypt.compare(loginForm.password, data.password);
    
    setLoading(false);
    
    if (!passwordMatch) {
      setError('Nom d\'utilisateur ou mot de passe invalide');
      return;
    }
    
    setCurrentUser(data);
    setView('dashboard');
    setLoginForm({ username: '', password: '', showPassword: false });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
  };

  // === GESTION UTILISATEURS ===
  const addUser = async () => {
    const { username, password } = userForm;
    const trimmedUsername = username.toLowerCase().trim();
    
    if (!trimmedUsername || !password.trim()) {
      setError('Tous les champs sont requis');
      return;
    }
    
    if (trimmedUsername.length < 3) {
      setError('Le nom d\'utilisateur doit avoir au moins 3 caractères');
      return;
    }
    
    if (password.length < 4) {
      setError('Le mot de passe doit avoir au moins 4 caractères');
      return;
    }
    
    setLoading(true);
    
    // Hasher le mot de passe avec bcrypt
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    
    const { error } = await supabase.from('users').insert([{ 
      username: trimmedUsername, 
      password: hashedPassword,
      is_admin: false 
    }]);
    setLoading(false);
    
    if (error) {
      setError(error.code === '23505' ? 'Ce nom d\'utilisateur existe déjà' : 'Erreur lors de la création');
      return;
    }
    
    await loadUsers();
    setUserForm({ username: '', password: '', showForm: false });
    setSuccess(`${trimmedUsername} a été ajouté`);
  };

  const deleteUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const items = wishLists[userId] || [];
    const hasReserved = items.some(i => i.claimed);
    
    const msg = `Supprimer ${user.username}?\n\nCela supprimera:\n` +
                `- Sa liste (${items.length} article${items.length > 1 ? 's' : ''})\n` +
                (hasReserved ? '- Les réservations sur ses articles\n' : '') +
                '- Son attribution';
    
    if (!window.confirm(msg)) return;
    
    setLoading(true);
    await supabase.from('users').delete().eq('id', userId);
    await loadAllData();
    setSuccess(`${user.username} supprimé`);
    setLoading(false);
  };

  // === GESTION WISHLIST ===
  const addWishlistItem = async () => {
    if (!itemForm.item.trim()) return;
    
    const msg = `Ajouter "${itemForm.item}"?\n\n⚠️ Impossible de supprimer après ajout.`;
    if (!window.confirm(msg)) return;
    
    setLoading(true);
    
    const userItems = wishLists[currentUser.id] || [];
    const maxOrder = userItems.length > 0 ? Math.max(...userItems.map(i => i.displayOrder)) : 0;
    
    await supabase.from('wishlist_items').insert([{
      user_id: currentUser.id,
      item: itemForm.item,
      link: itemForm.link,
      claimed: false,
      display_order: maxOrder + 1
    }]);
    
    await loadWishLists();
    setItemForm({ item: '', link: '' });
    setSuccess('Article ajouté');
    setLoading(false);
  };

  const toggleItemClaimed = async (itemId, currentStatus) => {
    setLoading(true);
    await supabase.from('wishlist_items').update({ claimed: !currentStatus }).eq('id', itemId);
    await loadWishLists();
    setSuccess(!currentStatus ? 'Article réservé' : 'Réservation annulée');
    setLoading(false);
  };

  // === DRAG & DROP ===
  const handleDragStart = (item) => setDraggedItem(item);
  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = async (targetItem) => {
    if (!draggedItem || draggedItem.id === targetItem.id) return;
    
    const items = [...(wishLists[currentUser.id] || [])];
    const dragIdx = items.findIndex(i => i.id === draggedItem.id);
    const targetIdx = items.findIndex(i => i.id === targetItem.id);
    
    items.splice(dragIdx, 1);
    items.splice(targetIdx, 0, draggedItem);
    
    await Promise.all(items.map((item, idx) => 
      supabase.from('wishlist_items').update({ display_order: idx }).eq('id', item.id)
    ));
    
    await loadWishLists();
    setDraggedItem(null);
  };

  // === ATTRIBUTIONS ===
  const shuffleAssignments = async () => {
    setLoading(true);
    
    await supabase.from('assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    const ids = users.map(u => u.id);
    const shuffled = [...ids].sort(() => Math.random() - 0.5);
    
    const newAssignments = shuffled.map((giver, i) => ({
      giver_id: giver,
      receiver_id: shuffled[(i + 1) % shuffled.length]
    }));
    
    await supabase.from('assignments').insert(newAssignments);
    await loadAssignments();
    setSuccess('Attributions créées');
    setLoading(false);
  };

  const updateEvent = async () => {
    if (!event.id) return;
    setLoading(true);
    await supabase.from('events').update({ name: event.name }).eq('id', event.id);
    setSuccess('Mis à jour');
    setLoading(false);
  };

  // === UTILITAIRES ===
  const getAssignedUser = useCallback((userId) => {
    return users.find(u => u.id === assignments[userId]);
  }, [users, assignments]);

  const getMyReservations = useCallback(() => {
    const reservations = [];
    Object.entries(wishLists).forEach(([userId, items]) => {
      items.forEach(item => {
        if (item.claimed && userId !== currentUser?.id) {
          const user = users.find(u => u.id === userId);
          if (user) reservations.push({ ...item, userName: user.username, userId });
        }
      });
    });
    return reservations;
  }, [wishLists, users, currentUser]);

  const getStatistics = useCallback(() => {
    const allItems = Object.values(wishLists).flat();
    const totalItems = allItems.length;
    const reservedItems = allItems.filter(i => i.claimed).length;
    const usersWithLists = Object.keys(wishLists).length;
    
    return {
      totalItems,
      reservedItems,
      availableItems: totalItems - reservedItems,
      usersWithLists,
      usersWithoutLists: users.length - usersWithLists
    };
  }, [wishLists, users]);

  const getFilteredUsers = useCallback(() => {
    let filtered = users.filter(user => {
      const userName = user.username.toLowerCase();
      const userItems = wishLists[user.id] || [];
      const matchesSearch = userName.includes(searchQuery.toLowerCase()) || 
                           userItems.some(item => item.item.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchesSearch) return false;
      
      if (filterStatus === 'reserved') return userItems.some(i => i.claimed);
      if (filterStatus === 'available') return userItems.some(i => !i.claimed);
      return true;
    });
    
    return filtered.sort((a, b) => a.username.localeCompare(b.username));
  }, [users, wishLists, searchQuery, filterStatus]);

  // === COMPOSANTS ===
  const NavBar = () => (
    <nav className="bg-gradient-to-r from-stone-800 to-stone-900 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-500 p-2 rounded-lg">
            <img src="/logo.png" alt="Logo" className="w-14 h-14 object-cover rounded" />
          </div>
          <span className="text-xl font-bold text-amber-50">{event.name}</span>
        </div>
        <div className="flex items-center space-x-6">
          <button onClick={() => setView('dashboard')}
                  className={`text-orange-100 hover:text-white transition font-medium ${view === 'dashboard' ? 'text-white' : ''}`}>
            Accueil
          </button>
          <button onClick={() => setView('all-lists')}
                  className={`text-orange-100 hover:text-white transition font-medium ${view === 'all-lists' ? 'text-white' : ''}`}>
            Toutes les listes
          </button>
          <button onClick={() => setView('my-reservations')}
                  className={`text-orange-100 hover:text-white transition font-medium ${view === 'my-reservations' ? 'text-white' : ''}`}>
            Mes réservations
          </button>
          <span className="text-orange-100 font-medium">{currentUser.username}</span>
          <button onClick={handleLogout} className="flex items-center space-x-1 text-orange-100 hover:text-white transition">
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </nav>
  );

  const WishlistItem = ({ item, onToggle, showToggle = true, userId, hideClaimedBadge = false }) => (
    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <p className="font-bold text-stone-800">{item.item}</p>
            {item.claimed && !hideClaimedBadge && (
              <span className="bg-lime-200 text-lime-900 text-xs px-2 py-1 rounded-full font-semibold">
                <Check className="w-3 h-3 inline" /> Réservé
              </span>
            )}
          </div>
          {item.link && (
            <a href={item.link} target="_blank" rel="noopener noreferrer" 
               className="text-orange-600 hover:text-orange-800 text-sm flex items-center mt-2 font-medium">
              <Mail className="w-4 h-4 mr-1" />Voir le produit
            </a>
          )}
        </div>
        {showToggle && userId !== currentUser.id && (
          <button onClick={() => onToggle(item.id, item.claimed)} disabled={loading}
                  className={`ml-3 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md disabled:opacity-50 ${
                    item.claimed ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' 
                                 : 'bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800'
                  }`}>
            {item.claimed ? 'Annuler' : 'Réserver'}
          </button>
        )}
      </div>
    </div>
  );

  const Notification = ({ type, message }) => (
    <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in ${
      type === 'success' ? 'bg-lime-500' : 'bg-red-500'
    } text-white`}>
      <div className="flex items-center space-x-2">
        {type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
        <span>{message}</span>
      </div>
    </div>
  );

  // === PAGE CONNEXION ===
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-stone-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border-t-4 border-orange-600">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-br from-orange-600 to-orange-800 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-24 h-24 object-cover" />
            </div>
            <h1 className="text-3xl font-bold text-orange-900">Cadeau Mystère</h1>
            <p className="text-stone-600 mt-2">Échange de cadeaux familial</p>
          </div>

          {error && <div className="bg-red-50 border-l-4 border-red-600 text-red-900 px-4 py-3 rounded mb-4">{error}</div>}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Nom d'utilisateur</label>
              <input type="text" value={loginForm.username}
                     onChange={(e) => setLoginForm(p => ({ ...p, username: e.target.value }))}
                     onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                     className="w-full px-4 py-2 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                     disabled={loading} 
                     autoComplete="username" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Mot de passe</label>
              <div className="relative">
                <input type={loginForm.showPassword ? 'text' : 'password'} value={loginForm.password}
                       onChange={(e) => setLoginForm(p => ({ ...p, password: e.target.value }))}
                       onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                       className="w-full px-4 py-2 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                       disabled={loading}
                       autoComplete="current-password" />
                <button type="button" onClick={() => setLoginForm(p => ({ ...p, showPassword: !p.showPassword }))}
                        className="absolute right-3 top-2.5 text-stone-500 hover:text-stone-700">
                  {loginForm.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button onClick={handleLogin} disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 rounded-lg hover:from-orange-700 hover:to-orange-800 shadow-lg font-semibold disabled:opacity-50">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-stone-500 text-sm">Pas de compte? Contactez l'administrateur</p>
          </div>
        </div>
      </div>
    );
  }

  // === PAGES PRINCIPALES ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-stone-100">
      <NavBar />
      {success && <Notification type="success" message={success} />}
      {error && <Notification type="error" message={error} />}

      {/* DASHBOARD */}
      {view === 'dashboard' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Attribution */}
            <div className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-orange-600">
              <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center">
                <Gift className="w-6 h-6 mr-2 text-orange-600" />Votre attribution
              </h2>
              
              {assignments[currentUser.id] ? (
                <div>
                  <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white p-6 rounded-xl mb-4 shadow-lg">
                    <p className="text-sm opacity-90 mb-2">Vous offrez un cadeau à :</p>
                    <p className="text-3xl font-bold">{getAssignedUser(currentUser.id)?.username}</p>
                  </div>
                  <button onClick={() => setView('assignment')} 
                          className="w-full bg-gradient-to-r from-lime-600 to-lime-700 text-white py-3 rounded-lg hover:from-lime-700 hover:to-lime-800 transition shadow-lg font-semibold">
                    Voir leur liste
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-200 p-6 rounded-xl text-center">
                  <Shuffle className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                  <p className="text-stone-800 font-semibold">Pas encore d'attribution</p>
                  <p className="text-sm text-stone-600 mt-2">L'admin va les créer bientôt!</p>
                </div>
              )}
            </div>

            {/* Ma liste */}
            <div className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-lime-600">
              <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center">
                <List className="w-6 h-6 mr-2 text-lime-700" />Ma liste de souhaits
              </h2>

              {(wishLists[currentUser.id] || []).length > 0 ? (
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {(wishLists[currentUser.id] || []).map(item => (
                    <div key={item.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="font-semibold text-stone-800">{item.item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-stone-50 border-2 border-stone-200 p-4 rounded-lg text-center mb-4">
                  <p className="text-stone-600 text-sm">Votre liste est vide</p>
                </div>
              )}

              <button onClick={() => setView('wishlist')} 
                      className="w-full bg-gradient-to-r from-lime-600 to-lime-700 text-white py-3 rounded-lg hover:from-lime-700 hover:to-lime-800 transition shadow-lg font-semibold">
                Gérer ma liste
              </button>
            </div>
          </div>

          {/* Admin Panel */}
          {currentUser.is_admin && (
            <div className="mt-6 bg-white rounded-xl shadow-xl p-6 border-t-4 border-amber-500">
              <h2 className="text-2xl font-bold text-stone-800 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-amber-600" />Panneau d'administration
              </h2>
              <button onClick={() => setView('admin')} 
                      className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg hover:from-amber-600 hover:to-amber-700 transition shadow-lg font-semibold">
                Gérer l'événement
              </button>
            </div>
          )}
        </div>
      )}

      {/* MA LISTE */}
      {view === 'wishlist' && (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button onClick={() => setView('dashboard')} 
                  className="text-white bg-stone-700 hover:bg-stone-800 px-4 py-2 rounded-lg mb-4 font-medium">
            ← Retour
          </button>
          <div className="bg-white rounded-xl shadow-2xl p-6 border-t-4 border-lime-600">
            <h2 className="text-2xl font-bold text-stone-800 mb-6">Ma liste de souhaits</h2>

            {/* Formulaire */}
            <div className="mb-6 p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl">
              <h3 className="font-bold text-stone-800 mb-3">Ajouter un article</h3>
              <p className="text-xs text-orange-700 mb-3 font-semibold">
                ⚠️ Impossible de supprimer après ajout
              </p>
              <div className="space-y-3">
                <input type="text" placeholder="Nom de l'article" value={itemForm.item}
                       onChange={(e) => setItemForm(p => ({ ...p, item: e.target.value }))}
                       className="w-full px-4 py-2 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                       disabled={loading} />
                <input type="url" placeholder="Lien (optionnel)" value={itemForm.link}
                       onChange={(e) => setItemForm(p => ({ ...p, link: e.target.value }))}
                       className="w-full px-4 py-2 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                       disabled={loading} />
                <button onClick={addWishlistItem} disabled={loading}
                        className="w-full bg-gradient-to-r from-lime-600 to-lime-700 text-white py-3 rounded-lg hover:from-lime-700 hover:to-lime-800 transition shadow-lg font-semibold disabled:opacity-50">
                  {loading ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </div>

            <div className="mb-4 text-sm text-stone-600">💡 Glissez-déposez pour réorganiser</div>

            <div className="space-y-3">
              {(wishLists[currentUser.id] || []).map(item => (
                <div key={item.id} draggable onDragStart={() => handleDragStart(item)}
                     onDragOver={handleDragOver} onDrop={() => handleDrop(item)} className="cursor-move">
                  <WishlistItem item={item} showToggle={false} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TOUTES LES LISTES */}
      {view === 'all-lists' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border-t-4 border-orange-600">
            <h2 className="text-3xl font-bold text-stone-800 mb-2">Toutes les listes</h2>
            <p className="text-stone-600 mb-4">Réservez des articles pour éviter les doublons</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Rechercher</label>
                <input type="text" placeholder="Nom ou article..." value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full px-4 py-2 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Statut</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500">
                  <option value="all">Tous</option>
                  <option value="reserved">Avec réservations</option>
                  <option value="available">Disponibles</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {getFilteredUsers().map(user => {
              const userWishlist = wishLists[user.id] || [];
              const reservedCount = userWishlist.filter(i => i.claimed).length;
              
              return (
                <div key={user.id} className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-lime-600">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-stone-800">{user.username}</h3>
                      {reservedCount > 0 && (
                        <p className="text-sm text-lime-700 font-medium">
                          {reservedCount} réservé{reservedCount > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    {user.id === currentUser.id && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-bold">Vous</span>
                    )}
                  </div>

                  {userWishlist.length > 0 ? (
                    <div className="space-y-3">
                      {userWishlist.map(item => (
                        <WishlistItem key={item.id} item={item} onToggle={toggleItemClaimed}
                                     userId={user.id} hideClaimedBadge={user.id === currentUser.id} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-stone-50 border-2 border-stone-200 p-6 rounded-xl text-center">
                      <p className="text-stone-600 text-sm">Aucun article</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {getFilteredUsers().length === 0 && (
            <div className="bg-white rounded-xl shadow-xl p-12 text-center">
              <p className="text-stone-600">Aucun résultat</p>
            </div>
          )}
        </div>
      )}

      {/* MES RÉSERVATIONS */}
      {view === 'my-reservations' && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-purple-600">
            <h2 className="text-3xl font-bold text-stone-800 mb-2">Mes réservations</h2>
            <p className="text-stone-600 mb-6">Articles réservés pour vos proches</p>

            {(() => {
              const reservations = getMyReservations();

              if (reservations.length === 0) {
                return (
                  <div className="bg-stone-50 border-2 border-stone-200 p-12 rounded-xl text-center">
                    <Gift className="w-16 h-16 text-stone-400 mx-auto mb-4" />
                    <p className="text-stone-600 text-lg font-medium">Aucune réservation</p>
                    <button onClick={() => setView('all-lists')}
                            className="mt-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 font-semibold">
                      Voir les listes
                    </button>
                  </div>
                );
              }

              const grouped = reservations.reduce((acc, item) => {
                if (!acc[item.userId]) acc[item.userId] = { userName: item.userName, items: [] };
                acc[item.userId].items.push(item);
                return acc;
              }, {});

              return (
                <div>
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl">
                    <p className="text-sm text-stone-700 font-medium">Articles réservés</p>
                    <p className="text-3xl font-bold text-purple-700">{reservations.length}</p>
                  </div>

                  <div className="space-y-6">
                    {Object.values(grouped).map((group, idx) => (
                      <div key={idx} className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border-2 border-purple-200">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold text-stone-800">Pour {group.userName}</h3>
                          <span className="text-lg font-bold text-purple-700">{group.items.length} article{group.items.length > 1 ? 's' : ''}</span>
                        </div>
                        
                        <div className="space-y-3">
                          {group.items.map(item => (
                            <div key={item.id} className="p-4 bg-white border-2 border-purple-100 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-bold text-stone-800">{item.item}</p>
                                  {item.link && (
                                    <a href={item.link} target="_blank" rel="noopener noreferrer"
                                       className="text-purple-600 hover:text-purple-800 text-sm flex items-center mt-2 font-medium">
                                      <Mail className="w-4 h-4 mr-1" />Voir le produit
                                    </a>
                                  )}
                                </div>
                                <button onClick={() => toggleItemClaimed(item.id, item.claimed)} disabled={loading}
                                        className="ml-3 px-4 py-2 rounded-lg text-sm font-semibold bg-stone-200 text-stone-700 hover:bg-stone-300 disabled:opacity-50">
                                  Annuler
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MON ATTRIBUTION */}
      {view === 'assignment' && assignments[currentUser.id] && (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button onClick={() => setView('dashboard')}
                  className="text-white bg-stone-700 hover:bg-stone-800 px-4 py-2 rounded-lg mb-4 font-medium">
            ← Retour
          </button>
          <div className="bg-white rounded-xl shadow-2xl p-6 border-t-4 border-orange-600">
            <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white p-6 rounded-xl mb-6">
              <p className="text-sm opacity-90 mb-2">Vous offrez à :</p>
              <p className="text-3xl font-bold">{getAssignedUser(currentUser.id)?.username}</p>
            </div>

            <h3 className="text-xl font-bold text-stone-800 mb-4">Leur liste</h3>
            
            {(wishLists[assignments[currentUser.id]] || []).length > 0 ? (
              <div className="space-y-3">
                {(wishLists[assignments[currentUser.id]] || []).map(item => (
                  <WishlistItem key={item.id} item={item} onToggle={toggleItemClaimed}
                               userId={assignments[currentUser.id]} />
                ))}
              </div>
            ) : (
              <div className="bg-amber-50 border-2 border-amber-200 p-8 rounded-xl text-center">
                <p className="text-stone-700">Aucun article</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN */}
      {view === 'admin' && currentUser.is_admin && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button onClick={() => setView('dashboard')}
                  className="text-white bg-stone-700 hover:bg-stone-800 px-4 py-2 rounded-lg mb-4 font-medium">
            ← Retour
          </button>

          {/* Statistiques */}
          {(() => {
            const stats = getStatistics();
            return (
              <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border-t-4 border-blue-500">
                <h2 className="text-2xl font-bold text-stone-800 mb-4">📊 Statistiques</h2>
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <p className="text-sm text-stone-600">Total</p>
                    <p className="text-3xl font-bold text-blue-700">{stats.totalItems}</p>
                  </div>
                  <div className="bg-gradient-to-br from-lime-50 to-lime-100 p-4 rounded-lg">
                    <p className="text-sm text-stone-600">Réservés</p>
                    <p className="text-3xl font-bold text-lime-700">{stats.reservedItems}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                    <p className="text-sm text-stone-600">Disponibles</p>
                    <p className="text-3xl font-bold text-orange-700">{stats.availableItems}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg mb-6">
                  <p className="text-sm text-stone-600">Listes complétées</p>
                  <p className="text-3xl font-bold text-purple-700">{stats.usersWithLists} / {users.length}</p>
                </div>

                {stats.usersWithoutLists > 0 && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-900 font-semibold">
                      ⚠️ {stats.usersWithoutLists} personne{stats.usersWithoutLists > 1 ? 's' : ''} sans liste
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {users.filter(u => !wishLists[u.id]?.length).map(u => u.username).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Paramètres */}
          <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border-t-4 border-amber-500">
            <h2 className="text-2xl font-bold text-stone-800 mb-4">Paramètres</h2>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Nom de l'événement</label>
              <input type="text" value={event.name}
                     onChange={(e) => setEvent(p => ({ ...p, name: e.target.value }))}
                     onBlur={updateEvent}
                     className="w-full px-4 py-2 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                     disabled={loading} />
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border-t-4 border-lime-600">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-stone-800">Participants</h2>
              <button onClick={() => setUserForm(p => ({ ...p, showForm: !p.showForm }))}
                      className="bg-gradient-to-r from-lime-600 to-lime-700 text-white px-4 py-2 rounded-lg hover:from-lime-700 hover:to-lime-800 font-semibold">
                Ajouter
              </button>
            </div>

            {userForm.showForm && (
              <div className="mb-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                <h3 className="font-bold text-stone-800 mb-3">Nouveau participant</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Nom d'utilisateur" value={userForm.username}
                         onChange={(e) => setUserForm(p => ({ ...p, username: e.target.value }))}
                         className="w-full px-4 py-2 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                         disabled={loading} />
                  <input type="password" placeholder="Mot de passe" value={userForm.password}
                         onChange={(e) => setUserForm(p => ({ ...p, password: e.target.value }))}
                         className="w-full px-4 py-2 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                         disabled={loading} />
                  <div className="flex space-x-2">
                    <button onClick={addUser} disabled={loading}
                            className="flex-1 bg-lime-600 text-white py-2 rounded-lg hover:bg-lime-700 font-semibold disabled:opacity-50">
                      {loading ? 'Création...' : 'Créer'}
                    </button>
                    <button onClick={() => setUserForm({ username: '', password: '', showForm: false })}
                            className="flex-1 bg-stone-200 text-stone-700 py-2 rounded-lg hover:bg-stone-300 font-semibold">
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200 rounded-xl">
                  <div>
                    <p className="font-bold text-stone-800">{user.username}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {user.is_admin && (
                      <span className="bg-amber-200 text-amber-900 text-xs px-3 py-1 rounded-full font-bold">Admin</span>
                    )}
                    {!user.is_admin && (
                      <button onClick={() => deleteUser(user.id)} disabled={loading}
                              className="bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700 text-sm font-semibold disabled:opacity-50">
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-stone-600 mt-4 font-medium">Total: {users.length}</p>
          </div>

          {/* Attributions */}
          <div className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-orange-600">
            <h2 className="text-2xl font-bold text-stone-800 mb-4">Attributions</h2>
            
            {Object.keys(assignments).length === 0 ? (
              <div className="text-center py-8">
                <Shuffle className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                <p className="text-stone-700 font-medium mb-4">Aucune attribution</p>
                <button onClick={shuffleAssignments} disabled={loading}
                        className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 rounded-lg hover:from-orange-700 hover:to-orange-800 font-bold shadow-lg disabled:opacity-50">
                  {loading ? 'Création...' : 'Créer'}
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-lime-50 border-l-4 border-lime-600 p-4 rounded-lg mb-4">
                  <p className="text-lime-900 font-bold">✓ Attributions créées</p>
                </div>

                <div className="space-y-2 mb-6">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-amber-50 border-2 border-orange-200 rounded-lg">
                      <span className="font-bold text-stone-800">{user.username}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-stone-400">→</span>
                        <span className="text-lime-700 font-bold">{getAssignedUser(user.id)?.username || 'Non attribué'}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={shuffleAssignments} disabled={loading}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg hover:from-amber-600 hover:to-amber-700 font-bold disabled:opacity-50">
                  {loading ? 'Mélange...' : 'Remélanger'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretSantaApp;
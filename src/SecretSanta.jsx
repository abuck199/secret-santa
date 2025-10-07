import React, { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseAnon } from './supabaseClient';
import bcrypt from 'bcryptjs';
import emailjs from '@emailjs/browser';
import { emailConfig } from './emailConfig';
import LoginPage from './components/LoginPage';
import NavBar from './components/NavBar';
import DashboardView from './components/DashboardView';
import WishlistView from './components/WishlistView';
import AllListsView from './components/AllListsView';
import MyReservationsView from './components/MyReservationsView';
import AssignmentView from './components/AssignmentView';
import AdminView from './components/AdminView';
import Notification from './components/Notification';

const SecretSantaApp = () => {
  // Initialiser EmailJS
  useEffect(() => {
    emailjs.init(emailConfig.publicKey);
  }, []);
  
  // États principaux
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('login');
  const [users, setUsers] = useState([]);
  const [wishLists, setWishLists] = useState({});
  const [assignments, setAssignments] = useState({});
  const [event, setEvent] = useState({ id: null, name: 'Noël 2025' });
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Formulaires
  const [loginForm, setLoginForm] = useState({ username: '', password: '', showPassword: false });
  const [userForm, setUserForm] = useState({ username: '', password: '', email: '', showForm: false });
  const [itemForm, setItemForm] = useState({ item: '', link: '' });
  
  // UI
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // === EFFETS ===
  useEffect(() => {
    const checkUserSession = async () => {
      const savedUser = sessionStorage.getItem('currentUser');
      const savedView = sessionStorage.getItem('currentView');
      
      if (!savedUser) {
        setInitialLoading(false); // ← Pas d'utilisateur, arrêter le loading
        return;
      }
      
      try {
        const parsedUser = JSON.parse(savedUser);
        
        // Vérifier que l'utilisateur existe toujours dans la DB
        const { data, error } = await supabaseAnon
          .from('users')
          .select('id, username, email, is_admin')
          .eq('id', parsedUser.id)
          .single();
        
        if (error || !data) {
          console.log('Utilisateur supprimé, déconnexion...');
          sessionStorage.removeItem('currentUser');
          sessionStorage.removeItem('currentView');
          setError('Votre compte a été supprimé');
          setInitialLoading(false); // ← Arrêter le loading
          return;
        }
        
        setCurrentUser(data);
        
        // Restaurer la vue sauvegardée
        if (savedView) {
          setView(savedView);
        } else {
          setView('dashboard');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la session:', error);
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentView');
      } finally {
        setInitialLoading(false); // ← Toujours arrêter le loading à la fin
      }
    };
    
    checkUserSession();
  }, []);

  // Sauvegarder la vue chaque fois qu'elle change
  useEffect(() => {
    if (currentUser && view !== 'login') {
      sessionStorage.setItem('currentView', view);
    }
  }, [view, currentUser]);

  useEffect(() => {
  if (!currentUser) return;
  
  // Recharger les données toutes les 10 secondes
  const interval = setInterval(() => {
    loadWishLists();
  }, 5000); // 5 secondes
  
  return () => clearInterval(interval);
}, [currentUser]);

  // Charger les données seulement quand currentUser change
  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);

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
    const appName = event.name || 'Cadeau Mystère';
    document.title = `${titles[view] || appName} - ${appName}`;
  }, [view, event.name]);

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

  useEffect(() => {
    if (!currentUser) return;
    
    // Vérifier toutes les 30 secondes si le compte existe toujours
    const checkAccountExists = async () => {
      try {
        const { data, error } = await supabaseAnon
          .from('users')
          .select('id')
          .eq('id', currentUser.id)
          .single();
        
        if (error || !data) {
          // Compte supprimé, forcer la déconnexion
          sessionStorage.removeItem('currentUser');
          setCurrentUser(null);
          setView('login');
          setError('Votre compte a été supprimé par un administrateur');
        }
      } catch (error) {
        console.error('Erreur vérification compte:', error);
      }
    };
    
    const interval = setInterval(checkAccountExists, 5000); // 5 secondes
    
    return () => clearInterval(interval);
  }, [currentUser]);

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
  const { data } = await supabase.from('users_safe').select('*').order('username');
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
        reservedBy: item.reserved_by || null,
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
    
    // Utiliser supabaseAnon pour le login (lecture publique du username/email)
    const { data } = await supabaseAnon
      .from('users')
      .select('*')
      .eq('username', trimmedUsername)
      .single();
    
    if (!data) {
      setLoading(false);
      setError('Nom d\'utilisateur ou mot de passe invalide');
      return;
    }
    
    const passwordMatch = await bcrypt.compare(loginForm.password, data.password);
    
    setLoading(false);
    
    if (!passwordMatch) {
      setError('Nom d\'utilisateur ou mot de passe invalide');
      return;
    }
    
    // Sauvegarder dans sessionStorage
    sessionStorage.setItem('currentUser', JSON.stringify(data));
    
    setCurrentUser(data);
    setView('dashboard');
    setLoginForm({ username: '', password: '', showPassword: false });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentView'); // ← Nettoyer la vue
    setCurrentUser(null);
    setView('login');
  };

  // === GESTION UTILISATEURS ===
  const addUser = async () => {
    const { username, password, email } = userForm;
    const trimmedUsername = username.toLowerCase().trim();
    const trimmedEmail = email?.trim() || '';
    
    if (!trimmedUsername || !password.trim() || !trimmedEmail) {
      setError('Tous les champs sont requis (nom d\'utilisateur, email et mot de passe)');
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
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Courriel invalide');
      return;
    }
    
    setLoading(true);
    
    // Envoyer l'email avec les identifiants AVANT de hasher
    try {
      await emailjs.send(
        emailConfig.serviceId,
        emailConfig.templateIdWelcome,
        {
          to_email: trimmedEmail,
          to: trimmedEmail,
          from_name: 'Secret Santa',
          to_name: trimmedUsername,
          username: trimmedUsername,
          password: password.trim(),
          event_name: event.name,
          site_url: window.location.origin
        }
      );
    } catch (error) {
      console.error('Erreur envoi email de bienvenue:', error);
    }
    
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    
    const { error } = await supabase.from('users').insert([{ 
      username: trimmedUsername, 
      password: hashedPassword,
      email: trimmedEmail,
      is_admin: false 
    }]);
    setLoading(false);
    
    if (error) {
      setError(error.code === '23505' ? 'Ce nom d\'utilisateur existe déjà' : 'Erreur lors de la création');
      return;
    }
    
    await loadUsers();
    setUserForm({ username: '', password: '', email: '', showForm: false });
    setSuccess(`${trimmedUsername} a été ajouté et un email de bienvenue a été envoyé`);
  };

  const deleteUser = async (userId) => {
  const user = users.find(u => u.id === userId);
  if (!user) return;
  
  const items = wishLists[userId] || [];
  const hasReserved = items.some(i => i.reservedBy !== null);
  
  const reservedByUser = Object.values(wishLists)
    .flat()
    .filter(item => item.reservedBy === userId && item.userId !== userId);
  
  const msg = `⚠️ ATTENTION : Cette action est IRRÉVERSIBLE !\n\n` +
              `Supprimer ${user.username}?\n\n` +
              `Cela va:\n` +
              `- Supprimer sa liste (${items.length} article${items.length > 1 ? 's' : ''})\n` +
              (hasReserved ? '- Annuler les réservations sur ses articles\n' : '') +
              (reservedByUser.length > 0 ? `- Annuler ses ${reservedByUser.length} réservation(s) chez les autres\n` : '') +
              '- Supprimer son attribution\n\n' +
              'Tapez "SUPPRIMER" en majuscules pour confirmer';
  
  const confirmation = window.prompt(msg);
  
  if (confirmation !== 'SUPPRIMER') {
    setError('Suppression annulée');
    return;
  }
  
  setLoading(true);
  
  try {
    // 1. D'abord, annuler toutes les réservations de cet utilisateur
    await supabase
      .from('wishlist_items')
      .update({ claimed: false, reserved_by: null })
      .eq('reserved_by', userId);
    
    // 2. Ensuite, supprimer l'utilisateur (cascade supprimera sa liste et ses attributions)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (deleteError) throw deleteError;
    
    // 3. Recharger toutes les données
    await Promise.all([
      loadUsers(),
      loadWishLists(),
      loadAssignments()
    ]);
    
    setSuccess(`${user.username} supprimé avec succès`);
  } catch (error) {
    setError('Erreur lors de la suppression');
    console.error('Erreur suppression:', error);
  } finally {
    setLoading(false);
  }
};

  // === GESTION WISHLIST ===
  const addWishlistItem = async () => {
    if (!itemForm.item.trim()) return;
    
    if (itemForm.link && itemForm.link.trim()) {
      const link = itemForm.link.trim();
      
      // Bloquer javascript: et data: URLs
      if (link.toLowerCase().startsWith('javascript:') || 
          link.toLowerCase().startsWith('data:')) {
        setError('Lien invalide');
        return;
      }
      
      // Optionnel : forcer https
      if (!link.startsWith('http://') && !link.startsWith('https://')) {
        setError('Le lien doit commencer par http:// ou https://');
        return;
      }
    }
    
    // Limiter la longueur
    if (itemForm.item.length > 200) {
      setError('Le nom de l\'article est trop long (max 200 caractères)');
      return;
  }
    
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
    
    try {
      if (!currentStatus) {
        // Avant de réserver, vérifier que personne d'autre ne l'a réservé
        const { data: checkData } = await supabase
          .from('wishlist_items')
          .select('claimed, reserved_by')
          .eq('id', itemId)
          .single();
        
        if (checkData.claimed && checkData.reserved_by !== currentUser.id) {
          setError('Désolé, cet article vient d\'être réservé par quelqu\'un d\'autre');
          setLoading(false);
          await loadWishLists(); // Recharger pour voir l'état actuel
          return;
        }
      }
      
      const reservedBy = !currentStatus ? currentUser.id : null;
      
      const { error } = await supabase
        .from('wishlist_items')
        .update({ 
          claimed: !currentStatus,
          reserved_by: reservedBy
        })
        .eq('id', itemId);
      
      if (error) {
        setError('Erreur lors de la réservation');
        setLoading(false);
        return;
      }
        
      await loadWishLists();
      setSuccess(!currentStatus ? 'Article réservé' : 'Réservation annulée');
    } catch (err) {
      setError('Erreur lors de la réservation');
      console.error(err);
    } finally {
      setLoading(false);
    }
};

  // === DRAG & DROP ===
  const updateWishlistOrder = async (userId, newItems) => {
    try {
      await Promise.all(newItems.map((item, idx) => 
        supabase
          .from('wishlist_items')
          .update({ display_order: idx })
          .eq('id', item.id)
      ));
      
      await loadWishLists();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'ordre:', error);
      setError('Erreur lors de la réorganisation');
    }
  };

  // === ATTRIBUTIONS ===
  const sendAssignmentEmails = async () => {
    if (Object.keys(assignments).length === 0) {
      setError('Aucune attribution à envoyer. Créez d\'abord les attributions.');
      return;
    }

    setLoading(true);
    
    try {
      let emailsSent = 0;
      let emailsFailed = 0;
      const emailPromises = [];
      
      for (const [giverId, receiverId] of Object.entries(assignments)) {
        const giver = users.find(u => u.id === giverId);
        const receiver = users.find(u => u.id === receiverId);
        
        if (giver?.email && receiver) {
          const emailPromise = emailjs.send(
            emailConfig.serviceId,
            emailConfig.templateIdAssignment,
            {
              to_email: giver.email,
              to: giver.email,
              from_name: 'Secret Santa',
              to_name: giver.username,
              receiver_name: receiver.username,
              event_name: event.name,
              site_url: window.location.origin
            }
          )
          .then(() => emailsSent++)
          .catch(() => emailsFailed++);
          
          emailPromises.push(emailPromise);
        }
      }
      
      await Promise.all(emailPromises);
      
      let message = emailsSent > 0 
        ? `${emailsSent} email(s) renvoyé(s)` 
        : 'Aucun email envoyé';
      
      if (emailsFailed > 0) message += `, ${emailsFailed} échec(s)`;
      
      setSuccess(message);
    } catch (error) {
      setError('Erreur lors de l\'envoi des emails');
    } finally {
      setLoading(false);
    }
  };

  const shuffleAssignments = async () => {
    setLoading(true);
    
    try {
      await supabase.from('assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      const ids = users.map(u => u.id);
      const shuffled = [...ids].sort(() => Math.random() - 0.5);
      
      const newAssignments = shuffled.map((giver, i) => ({
        giver_id: giver,
        receiver_id: shuffled[(i + 1) % shuffled.length]
      }));
      
      await supabase.from('assignments').insert(newAssignments);
      await loadAssignments();
      
      // Envoyer les emails
      let emailsSent = 0;
      let emailsFailed = 0;
      
      for (const assignment of newAssignments) {
        const giver = users.find(u => u.id === assignment.giver_id);
        const receiver = users.find(u => u.id === assignment.receiver_id);
        
        if (giver?.email && receiver) {
          try {
            await emailjs.send(
              emailConfig.serviceId,
              emailConfig.templateId,
              {
                to_email: giver.email,
                to: giver.email,
                from_name: 'Secret Santa',
                to_name: giver.username,
                receiver_name: receiver.username,
                event_name: event.name,
                site_url: window.location.origin
              }
            );
            emailsSent++;
          } catch {
            emailsFailed++;
          }
        }
      }
      
      let message = 'Attributions créées !';
      if (emailsSent > 0) message += ` ${emailsSent} email(s) envoyé(s)`;
      if (emailsFailed > 0) message += `, ${emailsFailed} échec(s)`;
      
      setSuccess(message);
    } catch (error) {
      setError('Erreur lors de la création des attributions');
    } finally {
      setLoading(false);
    }
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
        if (item.reservedBy === currentUser?.id && userId !== currentUser?.id) {
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
    const reservedItems = allItems.filter(i => i.reservedBy !== null).length;
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

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-light via-cream to-beige flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-stone-800 mb-4"></div>
          <p className="text-stone-600 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  // === RENDU ===
  if (!currentUser) {
    return (
      <LoginPage
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        handleLogin={handleLogin}
        error={error}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-light via-cream to-beige">
      <NavBar 
        currentUser={currentUser}
        event={event}
        view={view}
        setView={setView}
        handleLogout={handleLogout}
      />
      
      {success && <Notification type="success" message={success} />}
      {error && <Notification type="error" message={error} />}

      {view === 'dashboard' && (
        <DashboardView
          currentUser={currentUser}
          assignments={assignments}
          wishLists={wishLists}
          getAssignedUser={getAssignedUser}
          setView={setView}
        />
      )}

      {view === 'wishlist' && (
        <WishlistView
          currentUser={currentUser}
          wishLists={wishLists}
          itemForm={itemForm}
          setItemForm={setItemForm}
          addWishlistItem={addWishlistItem}
          updateWishlistOrder={updateWishlistOrder}
          setView={setView}
          loading={loading}
        />
      )}

      {view === 'all-lists' && (
        <AllListsView
          users={users}
          wishLists={wishLists}
          currentUser={currentUser}
          toggleItemClaimed={toggleItemClaimed}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          getFilteredUsers={getFilteredUsers}
          loading={loading}
        />
      )}

      {view === 'my-reservations' && (
        <MyReservationsView
          getMyReservations={getMyReservations}
          toggleItemClaimed={toggleItemClaimed}
          setView={setView}
          loading={loading}
        />
      )}

      {view === 'assignment' && assignments[currentUser.id] && (
        <AssignmentView
          currentUser={currentUser}
          assignments={assignments}
          wishLists={wishLists}
          getAssignedUser={getAssignedUser}
          toggleItemClaimed={toggleItemClaimed}
          setView={setView}
          loading={loading}
        />
      )}

      {view === 'admin' && currentUser.is_admin && (
        <AdminView
          users={users}
          wishLists={wishLists}
          assignments={assignments}
          event={event}
          setEvent={setEvent}
          userForm={userForm}
          setUserForm={setUserForm}
          getStatistics={getStatistics}
          updateEvent={updateEvent}
          addUser={addUser}
          deleteUser={deleteUser}
          getAssignedUser={getAssignedUser}
          shuffleAssignments={shuffleAssignments}
          sendAssignmentEmails={sendAssignmentEmails}
          setView={setView}
          loading={loading}
        />
      )}
    </div>
  );
};

export default SecretSantaApp;
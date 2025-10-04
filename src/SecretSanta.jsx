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
  const [event, setEvent] = useState({ id: null, name: 'Noël en Famille 2025' });
  
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
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
        setView('dashboard');
      } catch (error) {
        console.error('Erreur lors du chargement de la session:', error);
        sessionStorage.removeItem('currentUser');
      }
    }
  }, []);

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
    const { data } = await supabase.from('users').select('id, username, email, is_admin, created_at').order('username');
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
    
    const reservedBy = !currentStatus ? currentUser.id : null;
    
    await supabase
      .from('wishlist_items')
      .update({ 
        claimed: !currentStatus,
        reserved_by: reservedBy
      })
      .eq('id', itemId);
      
    await loadWishLists();
    setSuccess(!currentStatus ? 'Article réservé' : 'Réservation annulée');
    setLoading(false);
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
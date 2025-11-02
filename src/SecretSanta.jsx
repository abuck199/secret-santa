import React, { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseAnon } from './supabaseClient';
import bcrypt from 'bcryptjs';
import emailjs from '@emailjs/browser';
import Snowfall from 'react-snowfall';
import { emailConfig } from './emailConfig';
import LoginPage from './components/LoginPage';
import NavBar from './components/NavBar';
import DashboardView from './components/DashboardView';
import WishlistView from './components/WishlistView';
import AllListsView from './components/AllListsView';
import MyReservationsView from './components/MyReservationsView';
import AssignmentView from './components/AssignmentView';
import AdminView from './components/AdminView';
import toast from 'react-hot-toast';
import Notification from './components/Notification';
import ChangePasswordView from './components/ChangePasswordView';
import WelcomeAnimation from './components/WelcomeAnimation';
import FAQView from './components/FAQView';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

const SecretSantaApp = () => {
  useEffect(() => {
    emailjs.init(emailConfig.publicKey);
  }, []);

  const [currentUser, setCurrentUser] = useState(null);
  const [reservingItems, setReservingItems] = useState(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [view, setView] = useState('login');
  const [showWelcome, setShowWelcome] = useState(false);
  const [users, setUsers] = useState([]);
  const [wishLists, setWishLists] = useState({});
  const [assignments, setAssignments] = useState({});
  const [event, setEvent] = useState({ id: null, name: 'Noël 2025' });
  const [initialLoading, setInitialLoading] = useState(true);

  const [loginForm, setLoginForm] = useState({ username: '', password: '', showPassword: false });
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    email: '',
    participatesInDraw: true,
    showForm: false
  });
  const [itemForm, setItemForm] = useState({ item: '', link: '' });

  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const checkUserSession = async () => {
      const savedUser = localStorage.getItem('currentUser'); // ← CHANGER ICI
      const savedView = localStorage.getItem('currentView'); // ← CHANGER ICI

      if (!savedUser) {
        setInitialLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(savedUser);

        const { data, error } = await supabaseAnon
          .from('users')
          .select('id, username, email, is_admin, participates_in_draw')
          .eq('id', parsedUser.id)
          .single();

        if (error || !data) {
          console.log('Utilisateur supprimé, déconnexion...');
          localStorage.removeItem('currentUser'); // ← CHANGER ICI
          localStorage.removeItem('currentView'); // ← CHANGER ICI
          toast.error('Votre compte a été supprimé');
          setInitialLoading(false);
          return;
        }

        setCurrentUser(data);

        if (savedView) {
          setView(savedView);
        } else {
          setView('dashboard');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la session:', error);
        localStorage.removeItem('currentUser'); // ← CHANGER ICI
        localStorage.removeItem('currentView'); // ← CHANGER ICI
      } finally {
        setInitialLoading(false);
      }
    };

    checkUserSession();
  }, []);

  useEffect(() => {
    if (currentUser && view !== 'login') {
      localStorage.setItem('currentView', view);
    }
  }, [view, currentUser]);

  useEffect(() => {
    if (!currentUser || isEditing) return;

    const interval = setInterval(() => {
      loadWishLists();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser, isEditing]);

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
    if (!currentUser) return;

    const checkAccountExists = async () => {
      try {
        const { data, error } = await supabaseAnon
          .from('users')
          .select('id')
          .eq('id', currentUser.id)
          .single();

        if (error || !data) {
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
          setView('login');
          toast.error('Votre compte a été supprimé par un administrateur');
        }
      } catch (error) {
        console.error('Erreur vérification compte:', error);
      }
    };

    const interval = setInterval(checkAccountExists, 5000);

    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const loadAllData = async () => {
    try {
      await Promise.all([loadEvent(), loadUsers(), loadWishLists(), loadAssignments()]);
    } catch (err) {
      console.error('Erreur chargement:', err);
      toast.error('Erreur de chargement');
    }
  };

  const loadEvent = async () => {
    const { data } = await supabase.from('events').select('*').limit(1).single();
    if (data) setEvent({ id: data.id, name: data.name });
  };

  const loadUsers = async () => {
    const { data } = await supabaseAnon
      .from('users')
      .select('id, username, email, is_admin, participates_in_draw')
      .order('username');
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
        displayOrder: item.display_order || 0,
        userId: item.user_id
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

  const handleLogin = async () => {
    setLoading(true);

    const trimmedUsername = loginForm.username.toLowerCase().trim();

    if (!trimmedUsername || !loginForm.password) {
      toast.error('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabaseAnon
        .from('users')
        .select('*')
        .eq('username', trimmedUsername)
        .single();

      if (!data) {
        setLoading(false);
        toast.error('Nom d\'utilisateur ou mot de passe invalide');
        return;
      }

      const passwordMatch = await bcrypt.compare(loginForm.password, data.password);

      setLoading(false);

      if (!passwordMatch) {
        toast.error('Nom d\'utilisateur ou mot de passe invalide');
        return;
      }

      localStorage.setItem('currentUser', JSON.stringify(data));

      setCurrentUser(data);
      setShowWelcome(true);
      setLoginForm({ username: '', password: '', showPassword: false });

    } catch (err) {
      toast.error('Erreur de connexion');
      console.error('Erreur login:', err);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentView');
    setCurrentUser(null);
    setView('login');
    toast.success('Déconnexion réussie ! À bientôt !');
  };

  const addUser = async () => {
    const { username, password, email, participatesInDraw } = userForm;
    const trimmedUsername = username.toLowerCase().trim();
    const trimmedEmail = email?.trim() || '';

    if (!trimmedUsername || !password.trim() || !trimmedEmail) {
      toast.error('Tous les champs sont requis (nom d\'utilisateur, email et mot de passe)');
      return;
    }

    if (trimmedUsername.length < 3) {
      toast.error('Le nom d\'utilisateur doit avoir au moins 3 caractères');
      return;
    }

    if (password.length < 4) {
      toast.error('Le mot de passe doit avoir au moins 4 caractères');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error('Courriel invalide');
      return;
    }

    setLoading(true);

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
          site_url: window.location.origin,
          participates_in_draw_text: participatesInDraw
            ? 'Vous participez au tirage'
            : 'Liste seulement (pas de tirage)',
          participation_badge_html: participatesInDraw
            ? '<span class="participation-badge">Vous participez au tirage</span>'
            : '<span class="no-participation-badge">Liste seulement (pas de tirage)</span>'
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
      is_admin: false,
      participates_in_draw: participatesInDraw
    }]);
    setLoading(false);

    if (error) {
      toast.error(error.code === '23505' ? 'Ce nom d\'utilisateur existe déjà' : 'Erreur lors de la création');
      return;
    }

    await loadUsers();
    setUserForm({ username: '', password: '', email: '', participatesInDraw: true, showForm: false });

    const message = participatesInDraw
      ? `${trimmedUsername} a été ajouté et participera au tirage`
      : `${trimmedUsername} a été ajouté (liste seulement, pas de tirage)`;
    toast.success(message);
  };

  const toggleUserParticipation = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setLoading(true);

    try {
      const newStatus = !user.participates_in_draw;

      const { error } = await supabase
        .from('users')
        .update({ participates_in_draw: newStatus })
        .eq('id', userId);

      if (error) throw error;

      await loadUsers();

      const message = newStatus
        ? `${user.username} participera maintenant au tirage`
        : `${user.username} ne participera plus au tirage (liste seulement)`;
      toast.success(message);
    } catch (error) {
      toast.error('Erreur lors de la modification');
      console.error('Erreur toggle participation:', error);
    } finally {
      setLoading(false);
    }
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
      toast.error('Suppression annulée');
      return;
    }

    setLoading(true);

    try {
      await supabase
        .from('wishlist_items')
        .update({ claimed: false, reserved_by: null })
        .eq('reserved_by', userId);

      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteError) throw deleteError;

      await Promise.all([
        loadUsers(),
        loadWishLists(),
        loadAssignments()
      ]);

      toast.success(`${user.username} supprimé avec succès`);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Erreur suppression:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWishlistItem = async () => {
    if (!itemForm.item.trim()) return;

    const userItems = wishLists[currentUser.id] || [];
    const MAX_ITEMS = 30;

    if (userItems.length >= MAX_ITEMS) {
      toast.error(`Vous avez atteint la limite de ${MAX_ITEMS} articles par liste`);
      return;
    }

    const normalizeUrl = (url) => {
      if (!url || !url.trim()) return null;

      const trimmedUrl = url.trim();

      if (trimmedUrl.toLowerCase().startsWith('javascript:') ||
        trimmedUrl.toLowerCase().startsWith('data:')) {
        return false;
      }

      let urlToValidate = trimmedUrl;

      if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
        urlToValidate = trimmedUrl;
      } else {
        urlToValidate = `https://${trimmedUrl}`;
      }

      try {
        const urlObj = new URL(urlToValidate);

        if (!urlObj.hostname.includes('.')) {
          return false;
        }

        if (urlObj.hostname === '.' || urlObj.hostname.startsWith('.') || urlObj.hostname.endsWith('.')) {
          return false;
        }

        return urlToValidate;
      } catch (e) {
        return false;
      }
    };

    if (itemForm.link && itemForm.link.trim()) {
      const normalizedLink = normalizeUrl(itemForm.link);

      if (normalizedLink === false) {
        toast.error('Le lien doit être une URL valide (ex: amazon.ca/produit)');
        return;
      }

      // Mettre à jour le lien normalisé
      itemForm.link = normalizedLink;
    }

    if (itemForm.item.length > 200) {
      toast.error('Le nom de l\'article est trop long (max 200 caractères)');
      return;
    }

    setLoading(true);

    const maxOrder = userItems.length > 0 ? Math.max(...userItems.map(i => i.displayOrder)) : 0;

    const { error } = await supabase.from('wishlist_items').insert([{
      user_id: currentUser.id,
      item: itemForm.item,
      link: itemForm.link || null,
      claimed: false,
      display_order: maxOrder + 1
    }]);

    if (error) {
      toast.error('Erreur lors de l\'ajout de l\'article');
      console.error('Erreur ajout item:', error);
      setLoading(false);
      return;
    }

    await loadWishLists();
    setItemForm({ item: '', link: '' });
    toast.success('Article ajouté');
    setLoading(false);
  };

  const toggleItemClaimed = async (itemId, currentStatus) => {
    if (reservingItems.has(itemId)) {
      toast.error('Réservation en cours, veuillez patienter...');
      return;
    }

    setReservingItems(prev => new Set(prev).add(itemId));
    setLoading(true);

    try {
      if (!currentStatus) {
        const { data, error } = await supabase
          .from('wishlist_items')
          .update({
            claimed: true,
            reserved_by: currentUser.id
          })
          .eq('id', itemId)
          .eq('claimed', false)
          .select();

        if (error || !data || data.length === 0) {
          toast.error('Désolé, cet article vient d\'être réservé par quelqu\'un d\'autre');
          setLoading(false);
          setReservingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(itemId);
            return newSet;
          });
          await loadWishLists();
          return;
        }

        toast.success('Article réservé');
      } else {
        const { data, error } = await supabase
          .from('wishlist_items')
          .update({
            claimed: false,
            reserved_by: null
          })
          .eq('id', itemId)
          .eq('reserved_by', currentUser.id)
          .select();

        if (error || !data || data.length === 0) {
          toast.error('Impossible d\'annuler cette réservation');
          setLoading(false);
          setReservingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(itemId);
            return newSet;
          });
          await loadWishLists();
          return;
        }

        toast.success('Réservation annulée');
      }

      await loadWishLists();
    } catch (err) {
      toast.error('Erreur lors de la réservation');
      console.error(err);
      await loadWishLists();
    } finally {
      setLoading(false);
      setReservingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const updateWishlistOrder = async (userId, newItems) => {
    if (userId !== currentUser.id) {
      console.error('Tentative de modification de la liste d\'un autre utilisateur');
      toast.error('Vous ne pouvez réorganiser que votre propre liste');
      return;
    }

    const userItemIds = (wishLists[userId] || []).map(item => item.id);
    const allItemsBelongToUser = newItems.every(item => userItemIds.includes(item.id));

    if (!allItemsBelongToUser) {
      console.error('Tentative de réorganiser des items qui ne lui appartiennent pas');
      toast.error('Erreur lors de la réorganisation');
      return;
    }

    try {
      await Promise.all(newItems.map((item, idx) =>
        supabase
          .from('wishlist_items')
          .update({ display_order: idx })
          .eq('id', item.id)
          .eq('user_id', userId)
      ));

      await loadWishLists();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'ordre:', error);
      toast.error('Erreur lors de la réorganisation');
    }
  };

  const updateWishlistItem = async (itemId, newName, newLink) => {
    if (!newName.trim()) {
      toast.error('Le nom de l\'article est requis');
      return;
    }

    if (newName.length > 200) {
      toast.error('Le nom de l\'article est trop long (max 200 caractères)');
      return;
    }

    const normalizeUrl = (url) => {
      if (!url || !url.trim()) return null;

      const trimmedUrl = url.trim();

      if (trimmedUrl.toLowerCase().startsWith('javascript:') ||
        trimmedUrl.toLowerCase().startsWith('data:')) {
        return false;
      }

      let urlToValidate = trimmedUrl;

      if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
        urlToValidate = trimmedUrl;
      } else {
        urlToValidate = `https://${trimmedUrl}`;
      }

      try {
        const urlObj = new URL(urlToValidate);

        if (!urlObj.hostname.includes('.')) {
          return false;
        }

        if (urlObj.hostname === '.' || urlObj.hostname.startsWith('.') || urlObj.hostname.endsWith('.')) {
          return false;
        }

        return urlToValidate;
      } catch (e) {
        return false;
      }
    };

    let finalLink = null;

    if (newLink && newLink.trim()) {
      finalLink = normalizeUrl(newLink);

      if (finalLink === false) {
        toast.error('Le lien doit être une URL valide (ex: amazon.ca/produit)');
        return;
      }

      if (finalLink && finalLink.length > 500) {
        toast.error('Le lien est trop long (max 500 caractères)');
        return;
      }
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .update({
          item: newName,
          link: finalLink
        })
        .eq('id', itemId)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      await loadWishLists();
      toast.success('Article mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error('Erreur update item:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendAssignmentEmails = async () => {
    if (Object.keys(assignments).length === 0) {
      toast.error('Aucune attribution à envoyer. Créez d\'abord les attributions.');
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

      toast.success(message);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi des emails');
    } finally {
      setLoading(false);
    }
  };

  const shuffleAssignments = async () => {
    const participatingUsers = users.filter(u => u.participates_in_draw);

    if (participatingUsers.length < 3) {
      toast.error('Il faut au moins 3 participants AU TIRAGE pour créer des attributions');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const { data: existingAssignments } = await supabase
        .from('assignments')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingAssignments?.length > 0) {
        const lastCreated = new Date(existingAssignments[0].created_at);
        const now = new Date();
        const diffSeconds = (now - lastCreated) / 1000;

        if (diffSeconds < 10) {
          toast.error('Attendez quelques secondes avant de recréer les attributions');
          setLoading(false);
          return;
        }
      }

      await supabase.from('assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      const ids = participatingUsers.map(u => u.id);
      const shuffled = [...ids].sort(() => Math.random() - 0.5);

      const newAssignments = shuffled.map((giver, i) => ({
        giver_id: giver,
        receiver_id: shuffled[(i + 1) % shuffled.length]
      }));

      await supabase.from('assignments').insert(newAssignments);
      await loadAssignments();

      const nonParticipants = users.filter(u => !u.participates_in_draw);
      let message = `Attributions créées pour ${participatingUsers.length} participants! 🎁`;
      if (nonParticipants.length > 0) {
        message += ` (${nonParticipants.length} personne(s) hors-tirage)`;
      }

      toast.success(message);
    } catch (error) {
      toast.error('Erreur lors de la création des attributions');
      console.error('Erreur création attributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async () => {
    if (!event.id) return;
    setLoading(true);
    await supabase.from('events').update({ name: event.name }).eq('id', event.id);
    toast.success('Mis à jour');
    setLoading(false);
  };

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

    const participatingUsers = users.filter(u => u.participates_in_draw);
    const nonParticipatingUsers = users.filter(u => !u.participates_in_draw);
    const participatingWithLists = participatingUsers.filter(u => wishLists[u.id]?.length > 0).length;
    const nonParticipatingWithLists = nonParticipatingUsers.filter(u => wishLists[u.id]?.length > 0).length;

    return {
      totalItems,
      reservedItems,
      availableItems: totalItems - reservedItems,
      usersWithLists,
      usersWithoutLists: users.length - usersWithLists,
      participatingUsers: participatingUsers.length,
      nonParticipatingUsers: nonParticipatingUsers.length,
      participatingWithLists,
      participatingWithoutLists: participatingUsers.length - participatingWithLists,
      nonParticipatingWithLists
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
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-dark-300 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <Notification />
        <LoginPage
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          handleLogin={handleLogin}
          loading={loading}
          event={event}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 relative pb-24 md:pb-0">
      <NavBar
        currentUser={currentUser}
        event={event}
        view={view}
        setView={setView}
        handleLogout={handleLogout}
      />

      {currentUser && (
        <Snowfall
          color="#fff"
          snowflakeCount={50}
          style={{
            position: 'fixed',
            width: '100vw',
            height: '100vh',
            zIndex: 1,
            opacity: 0.15
          }}
        />
      )}

      <Notification />

      {showWelcome && (
        <WelcomeAnimation
          username={currentUser.username}
          onComplete={() => {
            setShowWelcome(false);
            setView('dashboard');
          }}
        />
      )}

      {view === 'dashboard' && !showWelcome && (
        <DashboardView
          currentUser={currentUser}
          assignments={assignments}
          wishLists={wishLists}
          getAssignedUser={getAssignedUser}
          setView={setView}
        />
      )}

      {view === 'wishlist' && !showWelcome && (
        <WishlistView
          currentUser={currentUser}
          wishLists={wishLists}
          itemForm={itemForm}
          setItemForm={setItemForm}
          addWishlistItem={addWishlistItem}
          updateWishlistItem={updateWishlistItem}
          updateWishlistOrder={updateWishlistOrder}
          setView={setView}
          loading={loading}
          setIsEditing={setIsEditing}
          setLoading={setLoading}
          loadWishLists={loadWishLists}
          supabase={supabase}
        />
      )}

      {view === 'all-lists' && !showWelcome && (
        <AllListsView
          users={users}
          wishLists={wishLists}
          currentUser={currentUser}
          toggleItemClaimed={toggleItemClaimed}
          updateWishlistItem={updateWishlistItem}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          getFilteredUsers={getFilteredUsers}
          loading={loading}
          setIsEditing={setIsEditing}
        />
      )}

      {view === 'my-reservations' && !showWelcome && (
        <MyReservationsView
          getMyReservations={getMyReservations}
          toggleItemClaimed={toggleItemClaimed}
          setView={setView}
          loading={loading}
        />
      )}

      {view === 'assignment' && currentUser.participates_in_draw && !showWelcome && (
        <AssignmentView
          currentUser={currentUser}
          assignments={assignments}
          wishLists={wishLists}
          getAssignedUser={getAssignedUser}
          toggleItemClaimed={toggleItemClaimed}
          setView={setView}
          event={event}
          loading={loading}
        />
      )}

      {view === 'change-password' && !showWelcome && (
        <ChangePasswordView
          currentUser={currentUser}
          supabase={supabase}
          bcrypt={bcrypt}
          setView={setView}
        />
      )}

      {view === 'admin' && currentUser.is_admin && !showWelcome && (
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
          toggleUserParticipation={toggleUserParticipation}
        />
      )}

      {view === 'faq' && !showWelcome && (
        <FAQView
          event={event}
          setView={setView}
        />
      )}

      {currentUser && !showWelcome && <ScrollToTop />}

      {currentUser && !showWelcome && (
        <Footer
          currentUser={currentUser}
          event={event}
          setView={setView}
        />
      )}
    </div>
  );
};

export default SecretSantaApp;
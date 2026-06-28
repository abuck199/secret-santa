// Thin data-access layer over Supabase. The browser only ever holds the anon
// key; every privileged action is a SECURITY DEFINER RPC and every plain query
// is constrained by Row-Level Security. Functions throw on error so callers can
// try/catch and surface a toast.

import { supabase } from '../supabaseClient';

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

async function currentUserId() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id || null;
}

/* ----------------------------- Auth ----------------------------- */

export async function signUp({ email, password, displayName, birthday }) {
  return unwrap(
    await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}`,
        data: {
          display_name: displayName || '',
          birthday: birthday || null,
        },
      },
    })
  );
}

export async function signIn({ email, password }) {
  return unwrap(await supabase.auth.signInWithPassword({ email, password }));
}

export async function signOut() {
  return unwrap(await supabase.auth.signOut());
}

export async function sendPasswordReset(email) {
  return unwrap(
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    })
  );
}

export async function updatePassword(newPassword) {
  return unwrap(await supabase.auth.updateUser({ password: newPassword }));
}

/* --------------------------- Profiles --------------------------- */

export async function getMyProfile() {
  const uid = await currentUserId();
  if (!uid) return null;
  return unwrap(
    await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
  );
}

export async function updateProfile({ display_name, birthday }) {
  const uid = await currentUserId();
  if (!uid) throw new Error('not authenticated');
  const patch = {};
  if (display_name !== undefined) patch.display_name = display_name;
  if (birthday !== undefined) patch.birthday = birthday || null;
  return unwrap(
    await supabase.from('profiles').update(patch).eq('id', uid).select().single()
  );
}

export async function getProfiles(ids) {
  if (!ids || ids.length === 0) return [];
  return unwrap(
    await supabase
      .from('profiles')
      .select('id, display_name, birthday')
      .in('id', ids)
  );
}

/* -------------------- Households & memberships ------------------- */

export async function getMyHouseholds() {
  const uid = await currentUserId();
  if (!uid) return [];
  const rows = unwrap(
    await supabase
      .from('memberships')
      .select('role, household:households(id, name, secret_santa_enabled, owner_id, created_at)')
      .eq('user_id', uid)
  );
  return (rows || [])
    .filter((r) => r.household)
    .map((r) => ({ ...r.household, role: r.role }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function createHousehold(name) {
  return unwrap(await supabase.rpc('create_household', { p_name: name }));
}

export async function acceptInvite(code) {
  return unwrap(await supabase.rpc('accept_invite', { p_code: code }));
}

export async function renameHousehold(id, name) {
  return unwrap(
    await supabase.from('households').update({ name }).eq('id', id).select().single()
  );
}

export async function setSecretSanta(id, enabled) {
  return unwrap(
    await supabase
      .from('households')
      .update({ secret_santa_enabled: enabled })
      .eq('id', id)
      .select()
      .single()
  );
}

export async function deleteHousehold(id) {
  return unwrap(await supabase.from('households').delete().eq('id', id));
}

export async function leaveHousehold(householdId) {
  const uid = await currentUserId();
  return unwrap(
    await supabase
      .from('memberships')
      .delete()
      .eq('household_id', householdId)
      .eq('user_id', uid)
  );
}

export async function getMembers(householdId) {
  const memberships = unwrap(
    await supabase
      .from('memberships')
      .select('id, role, user_id, joined_at')
      .eq('household_id', householdId)
  );
  const ids = memberships.map((m) => m.user_id);
  const profiles = await getProfiles(ids);
  const byId = Object.fromEntries(profiles.map((p) => [p.id, p]));
  return memberships
    .map((m) => ({
      membershipId: m.id,
      userId: m.user_id,
      role: m.role,
      joinedAt: m.joined_at,
      displayName: byId[m.user_id]?.display_name || '—',
      birthday: byId[m.user_id]?.birthday || null,
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function setMemberRole(membershipId, role) {
  return unwrap(
    await supabase.from('memberships').update({ role }).eq('id', membershipId)
  );
}

export async function removeMember(membershipId) {
  return unwrap(await supabase.from('memberships').delete().eq('id', membershipId));
}

/* ----------------------- Wishlist (own) ------------------------- */

export async function getMyItems(householdId) {
  const uid = await currentUserId();
  return unwrap(
    await supabase
      .from('wishlist_items')
      .select('id, item, link, display_order')
      .eq('household_id', householdId)
      .eq('user_id', uid)
      .order('display_order')
  );
}

export async function addItem({ householdId, item, link, displayOrder }) {
  const uid = await currentUserId();
  // Only return the columns the `authenticated` role is granted — selecting
  // `*` would touch the masked `reserved_by` column and be denied.
  return unwrap(
    await supabase
      .from('wishlist_items')
      .insert({
        household_id: householdId,
        user_id: uid,
        item,
        link: link || null,
        display_order: displayOrder ?? 0,
      })
      .select('id, item, link, display_order')
      .single()
  );
}

export async function updateItem(id, { item, link }) {
  return unwrap(
    await supabase
      .from('wishlist_items')
      .update({ item, link: link || null })
      .eq('id', id)
      .select('id, item, link, display_order')
      .single()
  );
}

export async function deleteItem(id) {
  return unwrap(await supabase.from('wishlist_items').delete().eq('id', id));
}

export async function reorderItems(orderedItems) {
  // orderedItems: array of {id} in the desired order.
  await Promise.all(
    orderedItems.map((it, idx) =>
      supabase.from('wishlist_items').update({ display_order: idx }).eq('id', it.id)
    )
  );
}

/* ------------------- Household lists & reserving ----------------- */

export async function getHouseholdWishlists(householdId) {
  return unwrap(await supabase.rpc('get_household_wishlists', { h: householdId }));
}

export async function reserveItem(id) {
  return unwrap(await supabase.rpc('reserve_item', { p_item: id }));
}

export async function cancelReservation(id) {
  return unwrap(await supabase.rpc('cancel_reservation', { p_item: id }));
}

export async function setPurchased(id, value) {
  return unwrap(await supabase.rpc('set_purchased', { p_item: id, p_value: value }));
}

export async function getMyReservations() {
  return unwrap(await supabase.rpc('get_my_reservations'));
}

/* -------------------------- Assignments ------------------------- */

export async function getMyAssignment(householdId) {
  const uid = await currentUserId();
  return unwrap(
    await supabase
      .from('assignments')
      .select('giver_id, receiver_id')
      .eq('household_id', householdId)
      .eq('giver_id', uid)
      .maybeSingle()
  );
}

export async function shuffleAssignments(householdId) {
  return unwrap(await supabase.rpc('shuffle_assignments', { h: householdId }));
}

/* ---------------------------- Invites --------------------------- */

export async function getInvites(householdId) {
  return unwrap(
    await supabase
      .from('invites')
      .select('id, code, role, expires_at, created_at, accepted_by')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false })
  );
}

export async function createInvite(householdId, role = 'member') {
  const uid = await currentUserId();
  return unwrap(
    await supabase
      .from('invites')
      .insert({ household_id: householdId, role, invited_by: uid })
      .select()
      .single()
  );
}

export async function deleteInvite(id) {
  return unwrap(await supabase.from('invites').delete().eq('id', id));
}

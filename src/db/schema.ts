import {
  pgTable, pgEnum, uuid, text, boolean, integer, timestamp, unique, index,
} from 'drizzle-orm/pg-core';

export const memberRole = pgEnum('member_role', ['admin', 'member']);

/* ----------------------------- Auth ----------------------------- */

// Better Auth owns this table; it is configured to generate UUID ids so every
// FK below stays a plain `uuid` column.
export const users = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().default(''),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/* ---------------------------- Domain ---------------------------- */

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  displayName: text('display_name').notNull().default(''),
  birthday: timestamp('birthday', { mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const households = pgTable('households', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  secretSantaEnabled: boolean('secret_santa_enabled').notNull().default(false),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const memberships = pgTable('memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  householdId: uuid('household_id').notNull().references(() => households.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: memberRole('role').notNull().default('member'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique().on(t.householdId, t.userId),
  index('memberships_household_idx').on(t.householdId),
  index('memberships_user_idx').on(t.userId),
]);

export const invites = pgTable('invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  householdId: uuid('household_id').notNull().references(() => households.id, { onDelete: 'cascade' }),
  code: text('code').notNull().unique(), // generated in app (crypto.randomBytes)
  email: text('email'),
  role: memberRole('role').notNull().default('member'),
  invitedBy: uuid('invited_by').references(() => users.id, { onDelete: 'set null' }),
  acceptedBy: uuid('accepted_by').references(() => users.id, { onDelete: 'set null' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
}, (t) => [index('invites_code_idx').on(t.code)]);

export const inviteRedemptions = pgTable('invite_redemptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  inviteId: uuid('invite_id').notNull().references(() => invites.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [unique().on(t.inviteId, t.userId)]);

export const wishlistItems = pgTable('wishlist_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  householdId: uuid('household_id').notNull().references(() => households.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  item: text('item').notNull(),
  link: text('link'),
  claimed: boolean('claimed').notNull().default(false),
  // Never send this column to the client: anonymity is the core product promise.
  reservedBy: uuid('reserved_by').references(() => users.id, { onDelete: 'set null' }),
  purchased: boolean('purchased').notNull().default(false),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('wishlist_household_idx').on(t.householdId)]);

export const assignments = pgTable('assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  householdId: uuid('household_id').notNull().references(() => households.id, { onDelete: 'cascade' }),
  giverId: uuid('giver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: uuid('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [unique().on(t.householdId, t.giverId)]);

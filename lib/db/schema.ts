import { boolean, date, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  // Hash SHA-256 du jeton stocké dans le cookie : une fuite de la base ne permet pas d'usurper une session.
  id: text("id").primaryKey(),
  adminId: integer("admin_id")
    .notNull()
    .references(() => admins.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  invitedBy: integer("invited_by").references(() => admins.id, { onDelete: "set null" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reservationStatuses = ["en_attente", "confirmee", "annulee"] as const;
export type ReservationStatus = (typeof reservationStatuses)[number];

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  date: date("date").notNull(),
  time: text("time").notNull(),
  guests: text("guests").notNull(),
  area: text("area"),
  occasion: text("occasion"),
  notes: text("notes"),
  status: text("status").$type<ReservationStatus>().notNull().default("en_attente"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  label: text("label").notNull(),
  position: integer("position").notNull().default(0),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => menuCategories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: integer("price").notNull(),
  oldPrice: integer("old_price"),
  tags: text("tags").array().notNull().default([]),
  available: boolean("available").notNull().default(true),
  position: integer("position").notNull().default(0),
});

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    date: date("date").notNull(),
    time: text("time").notNull(),
    place: text("place").notNull(),
    description: text("description").notNull().default(""),
    image: text("image").notNull(),
    published: boolean("published").notNull().default(true),
  },
  (t) => [uniqueIndex("events_slug_idx").on(t.slug)],
);

export const photoCategories = ["Fleuve", "Terrasses", "Intérieur", "Loisirs"] as const;
export type PhotoCategory = (typeof photoCategories)[number];

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  src: text("src").notNull(),
  alt: text("alt").notNull(),
  category: text("category").$type<PhotoCategory>().notNull(),
  position: integer("position").notNull().default(0),
});

export type Hours = { days: string; slots: string[] }[];

export type SiteSettings = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  mapQuery: string;
  facebook: string;
  instagram: string;
  hours: Hours;
};

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<SiteSettings>().notNull(),
});

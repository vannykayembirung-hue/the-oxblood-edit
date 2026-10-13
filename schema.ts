import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";

export const articles = pgTable("articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  coverImage: text("cover_image"),
  contentHtml: text("content_html"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  category: text("category").default("style"),
  status: text("status").default("draft"),
  createdAt: timestamp("created_at").defaultNow()
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  price: integer("price").notNull(),
  gumroadUrl: text("gumroad_url"),
  description: text("description"),
  whatInside: text("what_inside").array()
});

export const affiliateLinks = pgTable("affiliate_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  merchant: text("merchant").notNull(),
  url: text("url").notNull(),
  priceUs: text("price_us"),
  priceUk: text("price_uk"),
  image: text("image"),
  clicks: integer("clicks").default(0)
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull()
});

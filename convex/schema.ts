import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Hologram conversation sessions
  sessions: defineTable({
    userId: v.id("users"),
    persona: v.string(), // "steve_jobs" or "jack_kirby"
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Individual messages in conversations
  messages: defineTable({
    sessionId: v.id("sessions"),
    userId: v.id("users"),
    role: v.string(), // "user" or "assistant"
    content: v.string(),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),

  // Cached knowledge from Firecrawl scraping
  knowledgeCache: defineTable({
    persona: v.string(),
    topic: v.string(),
    content: v.string(),
    sourceUrl: v.string(),
    scrapedAt: v.number(),
  }).index("by_persona", ["persona"]),

  // Generated hologram images
  hologramImages: defineTable({
    userId: v.id("users"),
    persona: v.string(),
    prompt: v.string(),
    imageBase64: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});

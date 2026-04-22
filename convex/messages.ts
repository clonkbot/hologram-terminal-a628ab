import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listBySession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
  },
});

export const send = mutation({
  args: { sessionId: v.id("sessions"), content: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) throw new Error("Session not found");

    await ctx.db.patch(args.sessionId, { updatedAt: Date.now() });

    return await ctx.db.insert("messages", {
      sessionId: args.sessionId,
      userId,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

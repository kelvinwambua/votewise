import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    authId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", args.authId))
      .first();

    if (existingUser) {
      console.log("User already exists, returning existing user");
      return existingUser._id;
    }

    const now = Date.now();
    return await ctx.db.insert("profile", {
      userId: args.authId,
      points: 0,
      rank: undefined, // Changed from null to undefined
      modulesCompleted: 0,
      totalModules: 0,
      badgesEarned: 0,
      progressPercentage: 0,
      lastActive: now,
      createdAt: now,
    });
  },
});

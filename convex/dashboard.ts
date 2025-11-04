import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
export const createUser = mutation({
  args: {
    authId: v.string(),
    name: v.string(),
    email: v.string(),
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
      name: args.name,
      email: args.email,
      points: 0,
      rank: undefined,
      modulesCompleted: 0,
      totalModules: 0,
      badgesEarned: 0,
      progressPercentage: 0,
      lastActive: now,
      createdAt: now,
    });
  },
});
export const getDashboardData = query({
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    console.log("User", user);
    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", user._id ?? ""))
      .first();
    console.log("Profile", profile);
    if (!profile) {
      return null;
    }

    const allModules = await ctx.db
      .query("modules")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();
    const totalModules = allModules.length;

    const recentActivity = await ctx.db
      .query("recentActivity")
      .withIndex("by_userId_and_timestamp", (q) =>
        q.eq("userId", user._id ?? ""),
      )
      .order("desc")
      .take(10);

    const userBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_userId", (q) => q.eq("userId", user._id ?? ""))
      .collect();

    const badgesWithDetails = await Promise.all(
      userBadges.map(async (userBadge) => {
        const badge = await ctx.db.get(userBadge.badgeId);
        return {
          ...userBadge,
          badgeDetails: badge,
        };
      }),
    );

    const resources = await ctx.db
      .query("resources")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("asc")
      .collect();

    const sortedResources = resources.sort((a, b) => a.order - b.order);

    // Calculate progress percentage safely
    const progressPercentage =
      totalModules > 0 ? (profile.modulesCompleted / totalModules) * 100 : 0;

    return {
      profile: {
        userId: profile.userId,
        points: profile.points,
        rank: profile.rank,
        modulesCompleted: profile.modulesCompleted,
        totalModules: totalModules,
        badgesEarned: profile.badgesEarned,
        progressPercentage: progressPercentage,
        lastActive: profile.lastActive,
      },
      recentActivity,
      badges: badgesWithDetails,
      resources: sortedResources,
    };
  },
});

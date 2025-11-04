import { query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const getLeaderboard = query({
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);

    const profiles = await ctx.db
      .query("profile")
      .withIndex("by_points", (q) => q.gt("points", -1))
      .order("desc")
      .collect();

    const userProfile = await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", user._id ?? ""))
      .first();

    let userRank = null;
    if (userProfile) {
      const userPosition = profiles.findIndex((p) => p._id === userProfile._id);
      userRank = {
        rank: userPosition + 1,
        userId: userProfile.userId,
        name: userProfile.name,
        email: userProfile.email,
        points: userProfile.points,
        modulesCompleted: userProfile.modulesCompleted,
        badgesEarned: userProfile.badgesEarned,
        progressPercentage: userProfile.progressPercentage,
        lastActive: userProfile.lastActive,
      };
    }

    const top20 = profiles.slice(0, 20).map((profile, index) => ({
      rank: index + 1,
      userId: profile.userId,
      name: profile.name,
      email: profile.email,
      points: profile.points,
      modulesCompleted: profile.modulesCompleted,
      badgesEarned: profile.badgesEarned,
      progressPercentage: profile.progressPercentage,
      lastActive: profile.lastActive,
    }));

    const isUserInTop20 = userRank && userRank.rank <= 20;

    return {
      top20,
      userRank,
      isUserInTop20,
    };
  },
});

export const getTopThree = query({
  handler: async (ctx) => {
    const topProfiles = await ctx.db
      .query("profile")
      .withIndex("by_points", (q) => q.gt("points", -1))
      .order("desc")
      .take(3);

    return topProfiles.map((profile, index) => ({
      rank: index + 1,
      userId: profile.userId,
      name: profile.name,
      points: profile.points,
      badgesEarned: profile.badgesEarned,
    }));
  },
});

export const getLeaderboardStats = query({
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profile").collect();

    const totalUsers = profiles.length;
    const totalPoints = profiles.reduce(
      (sum, profile) => sum + profile.points,
      0,
    );
    const averagePoints =
      totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;
    const topScore =
      profiles.length > 0 ? Math.max(...profiles.map((p) => p.points)) : 0;

    return {
      totalUsers,
      totalPoints,
      averagePoints,
      topScore,
    };
  },
});

export const searchLeaderboard = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const profiles = await ctx.db
      .query("profile")
      .withIndex("by_points", (q) => q.gt("points", -1))
      .order("desc")
      .collect();

    const searchLower = args.searchTerm.toLowerCase();
    const filteredProfiles = profiles.filter(
      (profile) =>
        profile.name.toLowerCase().includes(searchLower) ||
        profile.email.toLowerCase().includes(searchLower),
    );

    return filteredProfiles.map((profile) => {
      const actualRank = profiles.findIndex((p) => p._id === profile._id) + 1;

      return {
        rank: actualRank,
        userId: profile.userId,
        name: profile.name,
        email: profile.email,
        points: profile.points,
        modulesCompleted: profile.modulesCompleted,
        badgesEarned: profile.badgesEarned,
        progressPercentage: profile.progressPercentage,
        lastActive: profile.lastActive,
      };
    });
  },
});

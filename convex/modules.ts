import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const getAllModules = query({
  handler: async (ctx) => {
    const modules = await ctx.db
      .query("modules")
      .withIndex("by_order")
      .order("asc")
      .collect();
    return modules;
  },
});

export const getPublishedModules = query({
  handler: async (ctx) => {
    const modules = await ctx.db
      .query("modules")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .order("asc")
      .collect();
    return modules;
  },
});

export const getModuleById = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    const module = await ctx.db.get(args.moduleId);
    return module;
  },
});

export const getModulesByStatus = query({
  args: {
    status: v.union(
      v.literal("published"),
      v.literal("coming_soon"),
      v.literal("locked"),
    ),
  },
  handler: async (ctx, args) => {
    const modules = await ctx.db
      .query("modules")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("asc")
      .collect();
    return modules;
  },
});

export const getModuleWithProgress = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const module = await ctx.db.get(args.moduleId);
    if (!module) return null;

    const progress = await ctx.db
      .query("userModuleProgress")
      .withIndex("by_userId_and_moduleId", (q) =>
        q.eq("userId", user._id ?? "").eq("moduleId", args.moduleId),
      )
      .first();

    return {
      ...module,
      userProgress: progress,
    };
  },
});

export const createModule = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    content: v.string(),
    imageUrl: v.optional(v.string()),
    status: v.union(
      v.literal("published"),
      v.literal("coming_soon"),
      v.literal("locked"),
    ),
    order: v.number(),
    duration: v.optional(v.number()),
    category: v.optional(v.string()),
    badgeIcon: v.optional(v.string()),
    badgeText: v.optional(v.string()),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    const moduleId = await ctx.db.insert("modules", {
      ...args,
      createdAt: Date.now(),
    });
    return moduleId;
  },
});

export const updateModule = mutation({
  args: {
    moduleId: v.id("modules"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("published"),
        v.literal("coming_soon"),
        v.literal("locked"),
      ),
    ),
    order: v.optional(v.number()),
    duration: v.optional(v.number()),
    category: v.optional(v.string()),
    badgeIcon: v.optional(v.string()),
    badgeText: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { moduleId, ...updates } = args;
    await ctx.db.patch(moduleId, updates);
    return moduleId;
  },
});

export const deleteModule = mutation({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.moduleId);
  },
});

export const getModuleContent = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    const module = await ctx.db.get(args.moduleId);
    if (!module) return null;

    const flashcards = await ctx.db
      .query("flashcards")
      .withIndex("by_moduleId_and_order", (q) =>
        q.eq("moduleId", args.moduleId),
      )
      .order("asc")
      .collect();

    const multipleChoice = await ctx.db
      .query("multipleChoiceQuestions")
      .withIndex("by_moduleId_and_order", (q) =>
        q.eq("moduleId", args.moduleId),
      )
      .order("asc")
      .collect();

    return {
      module,
      flashcards,
      multipleChoice,
      totalFlashcards: flashcards.length,
      totalMultipleChoice: multipleChoice.length,
    };
  },
});

export const getUserModulesWithProgress = query({
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    const modules = await ctx.db
      .query("modules")
      .withIndex("by_order")
      .order("asc")
      .collect();

    const modulesWithProgress = await Promise.all(
      modules.map(async (module) => {
        const progress = await ctx.db
          .query("userModuleProgress")
          .withIndex("by_userId_and_moduleId", (q) =>
            q.eq("userId", user._id ?? "").eq("moduleId", module._id),
          )
          .first();

        return {
          ...module,
          userProgress: progress,
        };
      }),
    );

    return modulesWithProgress;
  },
});

export const startModule = mutation({
  args: {
    moduleId: v.id("modules"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const existing = await ctx.db
      .query("userModuleProgress")
      .withIndex("by_userId_and_moduleId", (q) =>
        q.eq("userId", user._id ?? "").eq("moduleId", args.moduleId),
      )
      .first();

    if (existing) {
      return existing._id;
    }

    const module = await ctx.db.get(args.moduleId);
    if (!module) throw new Error("Module not found");

    const flashcardsCount = await ctx.db
      .query("flashcards")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
      .collect()
      .then((cards) => cards.length);

    const multipleChoiceCount = await ctx.db
      .query("multipleChoiceQuestions")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
      .collect()
      .then((questions) => questions.length);

    const progressId = await ctx.db.insert("userModuleProgress", {
      userId: user._id ?? "",
      moduleId: args.moduleId,
      completed: false,
      startedAt: Date.now(),
      progress: 0,
      currentQuestionIndex: 0,
      flashcardsCompleted: 0,
      multipleChoiceCompleted: 0,
      totalFlashcards: flashcardsCount,
      totalMultipleChoice: multipleChoiceCount,
    });

    return progressId;
  },
});

export const updateModuleProgress = mutation({
  args: {
    moduleId: v.id("modules"),
    currentQuestionIndex: v.optional(v.number()),
    flashcardsCompleted: v.optional(v.number()),
    multipleChoiceCompleted: v.optional(v.number()),
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const progress = await ctx.db
      .query("userModuleProgress")
      .withIndex("by_userId_and_moduleId", (q) =>
        q.eq("userId", user._id ?? "").eq("moduleId", args.moduleId),
      )
      .first();

    if (!progress) throw new Error("Progress not found");

    const updates: any = {};
    if (args.currentQuestionIndex !== undefined)
      updates.currentQuestionIndex = args.currentQuestionIndex;
    if (args.flashcardsCompleted !== undefined)
      updates.flashcardsCompleted = args.flashcardsCompleted;
    if (args.multipleChoiceCompleted !== undefined)
      updates.multipleChoiceCompleted = args.multipleChoiceCompleted;
    if (args.completed !== undefined) {
      updates.completed = args.completed;
      if (args.completed) {
        updates.completedAt = Date.now();
        updates.progress = 100;
      }
    }

    if (
      args.flashcardsCompleted !== undefined ||
      args.multipleChoiceCompleted !== undefined
    ) {
      const flashcardsCompleted =
        args.flashcardsCompleted ?? progress.flashcardsCompleted;
      const multipleChoiceCompleted =
        args.multipleChoiceCompleted ?? progress.multipleChoiceCompleted;
      const totalQuestions =
        progress.totalFlashcards + progress.totalMultipleChoice;
      const completedQuestions = flashcardsCompleted + multipleChoiceCompleted;
      updates.progress =
        totalQuestions > 0
          ? Math.round((completedQuestions / totalQuestions) * 100)
          : 0;
    }

    await ctx.db.patch(progress._id, updates);
    return progress._id;
  },
});

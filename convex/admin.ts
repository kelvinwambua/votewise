import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getModules = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("modules").order("asc").collect();
  },
});

export const getModule = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.moduleId);
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
    return await ctx.db.insert("modules", {
      ...args,
      createdAt: Date.now(),
    });
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

export const getResources = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("resources").order("asc").collect();
  },
});

export const createResource = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    url: v.optional(v.string()),
    type: v.string(),
    category: v.optional(v.string()),
    order: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("resources", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateResource = mutation({
  args: {
    resourceId: v.id("resources"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    url: v.optional(v.string()),
    type: v.optional(v.string()),
    category: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { resourceId, ...updates } = args;
    await ctx.db.patch(resourceId, updates);
    return resourceId;
  },
});

export const deleteResource = mutation({
  args: { resourceId: v.id("resources") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.resourceId);
  },
});

export const getFlashcardsByModule = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flashcards")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
      .order("asc")
      .collect();
  },
});

export const createFlashcard = mutation({
  args: {
    moduleId: v.id("modules"),
    question: v.string(),
    answer: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("flashcards", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateFlashcard = mutation({
  args: {
    flashcardId: v.id("flashcards"),
    question: v.optional(v.string()),
    answer: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { flashcardId, ...updates } = args;
    await ctx.db.patch(flashcardId, updates);
    return flashcardId;
  },
});

export const deleteFlashcard = mutation({
  args: { flashcardId: v.id("flashcards") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.flashcardId);
  },
});

export const getMultipleChoiceByModule = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("multipleChoiceQuestions")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
      .order("asc")
      .collect();
  },
});

export const createMultipleChoice = mutation({
  args: {
    moduleId: v.id("modules"),
    question: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.number(),
    explanation: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("multipleChoiceQuestions", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateMultipleChoice = mutation({
  args: {
    questionId: v.id("multipleChoiceQuestions"),
    question: v.optional(v.string()),
    options: v.optional(v.array(v.string())),
    correctAnswer: v.optional(v.number()),
    explanation: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { questionId, ...updates } = args;
    await ctx.db.patch(questionId, updates);
    return questionId;
  },
});

export const deleteMultipleChoice = mutation({
  args: { questionId: v.id("multipleChoiceQuestions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.questionId);
  },
});

export const getQuizzesByModule = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizzes")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
      .collect();
  },
});

export const createQuiz = mutation({
  args: {
    moduleId: v.id("modules"),
    title: v.string(),
    description: v.optional(v.string()),
    passingScore: v.number(),
    timeLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("quizzes", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateQuiz = mutation({
  args: {
    quizId: v.id("quizzes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    passingScore: v.optional(v.number()),
    timeLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { quizId, ...updates } = args;
    await ctx.db.patch(quizId, updates);
    return quizId;
  },
});

export const deleteQuiz = mutation({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.quizId);
  },
});

export const getQuizQuestions = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizQuestions")
      .withIndex("by_quizId", (q) => q.eq("quizId", args.quizId))
      .order("asc")
      .collect();
  },
});

export const createQuizQuestion = mutation({
  args: {
    quizId: v.id("quizzes"),
    question: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.number(),
    points: v.number(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("quizQuestions", args);
  },
});

export const updateQuizQuestion = mutation({
  args: {
    questionId: v.id("quizQuestions"),
    question: v.optional(v.string()),
    options: v.optional(v.array(v.string())),
    correctAnswer: v.optional(v.number()),
    points: v.optional(v.number()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { questionId, ...updates } = args;
    await ctx.db.patch(questionId, updates);
    return questionId;
  },
});

export const deleteQuizQuestion = mutation({
  args: { questionId: v.id("quizQuestions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.questionId);
  },
});

export const getBadges = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("badges").collect();
  },
});

export const createBadge = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    requirement: v.string(),
    requiredModules: v.optional(v.number()),
    requiredPoints: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("badges", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateBadge = mutation({
  args: {
    badgeId: v.id("badges"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    requirement: v.optional(v.string()),
    requiredModules: v.optional(v.number()),
    requiredPoints: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { badgeId, ...updates } = args;
    await ctx.db.patch(badgeId, updates);
    return badgeId;
  },
});

export const deleteBadge = mutation({
  args: { badgeId: v.id("badges") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.badgeId);
  },
});

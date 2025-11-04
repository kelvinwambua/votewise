import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  profile: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    points: v.number(),
    rank: v.optional(v.string()),
    modulesCompleted: v.number(),
    totalModules: v.number(),
    badgesEarned: v.number(),
    progressPercentage: v.number(),
    lastActive: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_points", ["points"]),

  modules: defineTable({
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
    createdAt: v.number(),
  })
    .index("by_order", ["order"])
    .index("by_published", ["isPublished"])
    .index("by_status", ["status"]),

  userModuleProgress: defineTable({
    userId: v.string(),
    moduleId: v.id("modules"),
    completed: v.boolean(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    progress: v.number(),
    currentQuestionIndex: v.number(),
    flashcardsCompleted: v.number(),
    multipleChoiceCompleted: v.number(),
    totalFlashcards: v.number(),
    totalMultipleChoice: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_moduleId", ["moduleId"])
    .index("by_userId_and_moduleId", ["userId", "moduleId"]),

  badges: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    requirement: v.string(),
    requiredModules: v.optional(v.number()),
    requiredPoints: v.optional(v.number()),
    createdAt: v.number(),
  }),

  userBadges: defineTable({
    userId: v.string(),
    badgeId: v.id("badges"),
    earnedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_badgeId", ["badgeId"])
    .index("by_userId_and_badgeId", ["userId", "badgeId"]),

  recentActivity: defineTable({
    userId: v.string(),
    activityType: v.string(),
    moduleId: v.optional(v.id("modules")),
    badgeId: v.optional(v.id("badges")),
    description: v.string(),
    timestamp: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_userId_and_timestamp", ["userId", "timestamp"]),

  resources: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    url: v.optional(v.string()),
    type: v.string(),
    category: v.optional(v.string()),
    order: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_order", ["order"])
    .index("by_type", ["type"])
    .index("by_active", ["isActive"]),

  flashcards: defineTable({
    moduleId: v.id("modules"),
    question: v.string(),
    answer: v.string(),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_moduleId", ["moduleId"])
    .index("by_moduleId_and_order", ["moduleId", "order"]),

  multipleChoiceQuestions: defineTable({
    moduleId: v.id("modules"),
    question: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.number(),
    explanation: v.optional(v.string()),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_moduleId", ["moduleId"])
    .index("by_moduleId_and_order", ["moduleId", "order"]),

  userQuestionProgress: defineTable({
    userId: v.string(),
    moduleId: v.id("modules"),
    questionId: v.union(v.id("flashcards"), v.id("multipleChoiceQuestions")),
    questionType: v.union(v.literal("flashcard"), v.literal("multiple_choice")),
    completed: v.boolean(),
    correct: v.optional(v.boolean()),
    answeredAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_moduleId", ["moduleId"])
    .index("by_userId_and_moduleId", ["userId", "moduleId"])
    .index("by_questionId", ["questionId"]),

  quizzes: defineTable({
    moduleId: v.id("modules"),
    title: v.string(),
    description: v.optional(v.string()),
    passingScore: v.number(),
    timeLimit: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_moduleId", ["moduleId"]),

  quizQuestions: defineTable({
    quizId: v.id("quizzes"),
    question: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.number(),
    points: v.number(),
    order: v.number(),
  })
    .index("by_quizId", ["quizId"])
    .index("by_order", ["order"]),

  userQuizAttempts: defineTable({
    userId: v.string(),
    quizId: v.id("quizzes"),
    score: v.number(),
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    passed: v.boolean(),
    completedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_quizId", ["quizId"])
    .index("by_userId_and_quizId", ["userId", "quizId"]),
});

export default schema;

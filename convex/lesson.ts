import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// Get the current lesson state for a user in a module
export const getCurrentLesson = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    const progress = await ctx.db
      .query("userModuleProgress")
      .withIndex("by_userId_and_moduleId", (q) =>
        q.eq("userId", user._id ?? "").eq("moduleId", args.moduleId),
      )
      .first();

    if (!progress) {
      return null;
    }

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

    const allQuestions = [
      ...flashcards.map((fc) => ({
        _id: fc._id,
        type: "flashcard" as const,
        question: fc.question,
        answer: fc.answer,
        order: fc.order,
      })),
      ...multipleChoice.map((mc) => ({
        _id: mc._id,
        type: "multiple_choice" as const,
        question: mc.question,
        options: mc.options,
        correctAnswer: mc.correctAnswer,
        explanation: mc.explanation,
        order: mc.order,
      })),
    ].sort((a, b) => a.order - b.order);

    const currentIndex = progress.currentQuestionIndex;
    const currentQuestion = allQuestions[currentIndex] || null;

    const questionProgress = await ctx.db
      .query("userQuestionProgress")
      .withIndex("by_userId_and_moduleId", (q) =>
        q.eq("userId", user._id ?? "").eq("moduleId", args.moduleId),
      )
      .collect();

    const answeredQuestions = new Set(
      questionProgress.map((qp) => qp.questionId),
    );

    return {
      moduleId: args.moduleId,
      currentIndex,
      currentQuestion,
      totalQuestions: allQuestions.length,
      allQuestions,
      progress: progress.progress,
      flashcardsCompleted: progress.flashcardsCompleted,
      multipleChoiceCompleted: progress.multipleChoiceCompleted,
      totalFlashcards: progress.totalFlashcards,
      totalMultipleChoice: progress.totalMultipleChoice,
      completed: progress.completed,
      answeredQuestions: Array.from(answeredQuestions),
    };
  },
});

export const answerFlashcard = mutation({
  args: {
    moduleId: v.id("modules"),
    flashcardId: v.id("flashcards"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    const existingProgress = await ctx.db
      .query("userQuestionProgress")
      .withIndex("by_userId_and_moduleId", (q) =>
        q.eq("userId", user._id ?? "").eq("moduleId", args.moduleId),
      )
      .filter((q) => q.eq(q.field("questionId"), args.flashcardId))
      .first();

    if (!existingProgress) {
      await ctx.db.insert("userQuestionProgress", {
        userId: user._id ?? "",
        moduleId: args.moduleId,
        questionId: args.flashcardId,
        questionType: "flashcard",
        completed: true,
        answeredAt: Date.now(),
      });

      const progress = await ctx.db
        .query("userModuleProgress")
        .withIndex("by_userId_and_moduleId", (q) =>
          q.eq("userId", user._id ?? "").eq("moduleId", args.moduleId),
        )
        .first();

      if (progress) {
        const newFlashcardsCompleted = progress.flashcardsCompleted + 1;
        const totalQuestions =
          progress.totalFlashcards + progress.totalMultipleChoice;
        const completedQuestions =
          newFlashcardsCompleted + progress.multipleChoiceCompleted;
        const newProgress =
          totalQuestions > 0
            ? Math.round((completedQuestions / totalQuestions) * 100)
            : 0;

        await ctx.db.patch(progress._id, {
          flashcardsCompleted: newFlashcardsCompleted,
          progress: newProgress,
        });
      }
    }

    return { success: true };
  },
});

export const answerMultipleChoice = mutation({
  args: {
    moduleId: v.id("modules"),
    questionId: v.id("multipleChoiceQuestions"),
    selectedAnswer: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    const isCorrect = args.selectedAnswer === question.correctAnswer;

    const existingProgress = await ctx.db
      .query("userQuestionProgress")
      .withIndex("by_userId_and_moduleId", (q) =>
        q.eq("userId", user._id ?? "").eq("moduleId", args.moduleId),
      )
      .filter((q) => q.eq(q.field("questionId"), args.questionId))
      .first();

    if (!existingProgress) {
      await ctx.db.insert("userQuestionProgress", {
        userId: user._id ?? "",
        moduleId: args.moduleId,
        questionId: args.questionId,
        questionType: "multiple_choice",
        completed: true,
        correct: isCorrect,
        answeredAt: Date.now(),
      });

      const progress = await ctx.db
        .query("userModuleProgress")
        .withIndex("by_userId_and_moduleId", (q) =>
          q.eq("userId", user._id ?? "").eq("moduleId", args.moduleId),
        )
        .first();

      if (progress) {
        const newMultipleChoiceCompleted = progress.multipleChoiceCompleted + 1;
        const totalQuestions =
          progress.totalFlashcards + progress.totalMultipleChoice;
        const completedQuestions =
          progress.flashcardsCompleted + newMultipleChoiceCompleted;
        const newProgress =
          totalQuestions > 0
            ? Math.round((completedQuestions / totalQuestions) * 100)
            : 0;

        await ctx.db.patch(progress._id, {
          multipleChoiceCompleted: newMultipleChoiceCompleted,
          progress: newProgress,
        });
      }
    }

    return {
      success: true,
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    };
  },
});

export const moveToNextQuestion = mutation({
  args: {
    moduleId: v.id("modules"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    const progress = await ctx.db
      .query("userModuleProgress")
      .withIndex("by_userId_and_moduleId", (q) =>
        q.eq("userId", user._id ?? "").eq("moduleId", args.moduleId),
      )
      .first();

    if (!progress) {
      throw new Error("Progress not found");
    }

    const totalQuestions =
      progress.totalFlashcards + progress.totalMultipleChoice;
    const newIndex = progress.currentQuestionIndex + 1;

    if (newIndex >= totalQuestions) {
      await ctx.db.patch(progress._id, {
        currentQuestionIndex: newIndex,
        completed: true,
        completedAt: Date.now(),
        progress: 100,
      });

      await ctx.db.insert("recentActivity", {
        userId: user._id ?? "",
        activityType: "module_completed",
        moduleId: args.moduleId,
        description: "Completed module",
        timestamp: Date.now(),
      });

      const userProfile = await ctx.db
        .query("profile")
        .withIndex("by_userId", (q) => q.eq("userId", user._id ?? ""))
        .first();

      if (userProfile) {
        const newModulesCompleted = userProfile.modulesCompleted + 1;
        const newPoints = userProfile.points + 100;
        const newProgressPercentage = Math.round(
          (newModulesCompleted / userProfile.totalModules) * 100,
        );

        await ctx.db.patch(userProfile._id, {
          modulesCompleted: newModulesCompleted,
          points: newPoints,
          progressPercentage: newProgressPercentage,
          lastActive: Date.now(),
        });
      }

      return { completed: true, newIndex };
    }

    await ctx.db.patch(progress._id, {
      currentQuestionIndex: newIndex,
    });

    return { completed: false, newIndex };
  },
});

export const moveToPreviousQuestion = mutation({
  args: {
    moduleId: v.id("modules"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    const progress = await ctx.db
      .query("userModuleProgress")
      .withIndex("by_userId_and_moduleId", (q) =>
        q.eq("userId", user._id ?? "").eq("moduleId", args.moduleId),
      )
      .first();

    if (!progress) {
      throw new Error("Progress not found");
    }

    const newIndex = Math.max(0, progress.currentQuestionIndex - 1);

    await ctx.db.patch(progress._id, {
      currentQuestionIndex: newIndex,
    });

    return { newIndex };
  },
});

export const resetModuleProgress = mutation({
  args: {
    moduleId: v.id("modules"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    const progress = await ctx.db
      .query("userModuleProgress")
      .withIndex("by_userId_and_moduleId", (q) =>
        q.eq("userId", user._id ?? "").eq("moduleId", args.moduleId),
      )
      .first();

    if (!progress) {
      throw new Error("Progress not found");
    }

    await ctx.db.patch(progress._id, {
      currentQuestionIndex: 0,
      completed: false,
      completedAt: undefined,
      progress: 0,
      flashcardsCompleted: 0,
      multipleChoiceCompleted: 0,
    });

    const questionProgress = await ctx.db
      .query("userQuestionProgress")
      .withIndex("by_userId_and_moduleId", (q) =>
        q.eq("userId", user._id ?? "").eq("moduleId", args.moduleId),
      )
      .collect();

    for (const qp of questionProgress) {
      await ctx.db.delete(qp._id);
    }

    return { success: true };
  },
});

export const getQuestionDetails = query({
  args: {
    questionId: v.union(v.id("flashcards"), v.id("multipleChoiceQuestions")),
    questionType: v.union(v.literal("flashcard"), v.literal("multiple_choice")),
  },
  handler: async (ctx, args) => {
    if (args.questionType === "flashcard") {
      const flashcard = await ctx.db.get(args.questionId as any);
      return flashcard;
    } else {
      const question = await ctx.db.get(args.questionId as any);
      return question;
    }
  },
});

export const getUserQuestionProgress = query({
  args: {
    moduleId: v.id("modules"),
    questionId: v.union(v.id("flashcards"), v.id("multipleChoiceQuestions")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    const progress = await ctx.db
      .query("userQuestionProgress")
      .withIndex("by_userId_and_moduleId", (q) =>
        q.eq("userId", user._id ?? "").eq("moduleId", args.moduleId),
      )
      .filter((q) => q.eq(q.field("questionId"), args.questionId))
      .first();

    return progress;
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Animated,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function LessonScreen() {
  const { moduleId } = useLocalSearchParams();
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [flipAnimation] = useState(new Animated.Value(0));

  const lessonData = useQuery(api.lesson.getCurrentLesson, {
    moduleId: moduleId as Id<"modules">,
  });

  const answerFlashcard = useMutation(api.lesson.answerFlashcard);
  const answerMultipleChoice = useMutation(api.lesson.answerMultipleChoice);
  const moveToNext = useMutation(api.lesson.moveToNextQuestion);
  const moveToPrevious = useMutation(api.lesson.moveToPreviousQuestion);

  const handleFlipCard = () => {
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const handleFlashcardComplete = async () => {
    if (
      !lessonData?.currentQuestion ||
      lessonData.currentQuestion.type !== "flashcard"
    )
      return;

    try {
      await answerFlashcard({
        moduleId: moduleId as Id<"modules">,
        flashcardId: lessonData.currentQuestion._id as Id<"flashcards">,
      });

      await moveToNext({
        moduleId: moduleId as Id<"modules">,
      });

      setIsFlipped(false);
      flipAnimation.setValue(0);
    } catch (error) {
      console.error("Error completing flashcard:", error);
    }
  };

  const handleMultipleChoiceAnswer = async (optionIndex: number) => {
    if (
      !lessonData?.currentQuestion ||
      lessonData.currentQuestion.type !== "multiple_choice"
    )
      return;
    if (selectedAnswer !== null) return;

    setSelectedAnswer(optionIndex);

    try {
      const result = await answerMultipleChoice({
        moduleId: moduleId as Id<"modules">,
        questionId: lessonData.currentQuestion
          ._id as Id<"multipleChoiceQuestions">,
        selectedAnswer: optionIndex,
      });

      setShowExplanation(true);
    } catch (error) {
      console.error("Error answering question:", error);
    }
  };

  const handleNextQuestion = async () => {
    try {
      const result = await moveToNext({
        moduleId: moduleId as Id<"modules">,
      });

      if (result.completed) {
        router.push(`/module/${moduleId}`);
      } else {
        setSelectedAnswer(null);
        setShowExplanation(false);
        setIsFlipped(false);
        flipAnimation.setValue(0);
      }
    } catch (error) {
      console.error("Error moving to next:", error);
    }
  };

  const handlePreviousQuestion = async () => {
    try {
      await moveToPrevious({
        moduleId: moduleId as Id<"modules">,
      });

      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsFlipped(false);
      flipAnimation.setValue(0);
    } catch (error) {
      console.error("Error moving to previous:", error);
    }
  };

  if (lessonData === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  if (!lessonData || !lessonData.currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No lesson data available</Text>
      </View>
    );
  }

  const { currentQuestion, currentIndex, totalQuestions, progress } =
    lessonData;
  const progressWidth = (currentIndex / totalQuestions) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {lessonData.currentQuestion.question}
          </Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressWidth}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentQuestion.type === "flashcard" ? (
          <View style={styles.flashcardContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleFlipCard}
              style={styles.cardWrapper}
            >
              <Animated.View
                style={[
                  styles.flashcard,
                  { transform: [{ rotateY: frontInterpolate }] },
                  isFlipped && styles.cardHidden,
                ]}
              >
                <Text style={styles.questionText}>
                  {currentQuestion.question}
                </Text>
                <Text style={styles.tapToReveal}>Tap to reveal</Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.flashcard,
                  styles.flashcardBack,
                  { transform: [{ rotateY: backInterpolate }] },
                  !isFlipped && styles.cardHidden,
                ]}
              >
                <Text style={styles.answerText}>{currentQuestion.answer}</Text>
              </Animated.View>
            </TouchableOpacity>

            {isFlipped && (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleFlashcardComplete}
              >
                <Text style={styles.submitButtonText}>Continue</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.multipleChoiceContainer}>
            <View style={styles.questionCard}>
              <Text style={styles.questionTitle}>
                What is the main feature of a democratic system?
              </Text>
              <Text style={styles.questionText}>
                {currentQuestion.question}
              </Text>
            </View>

            <View style={styles.optionsContainer}>
              {currentQuestion.options?.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = currentQuestion.correctAnswer === index;
                const showResult = selectedAnswer !== null;

                let optionStyle = styles.option;
                if (showResult) {
                  if (isCorrect) {
                    optionStyle = styles.optionCorrect;
                  } else if (isSelected && !isCorrect) {
                    optionStyle = styles.optionIncorrect;
                  }
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.option, optionStyle]}
                    onPress={() => handleMultipleChoiceAnswer(index)}
                    disabled={selectedAnswer !== null}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        showResult && isCorrect && styles.optionTextCorrect,
                        showResult &&
                          isSelected &&
                          !isCorrect &&
                          styles.optionTextIncorrect,
                      ]}
                    >
                      {option}
                    </Text>
                    {showResult && isCorrect && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#16A34A"
                      />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <Ionicons name="close-circle" size={24} color="#DC2626" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {showExplanation && currentQuestion.explanation && (
              <View style={styles.explanationCard}>
                <Text style={styles.explanationTitle}>Explanation</Text>
                <Text style={styles.explanationText}>
                  {currentQuestion.explanation}
                </Text>
              </View>
            )}

            {selectedAnswer !== null && (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleNextQuestion}
              >
                <Text style={styles.submitButtonText}>
                  {currentIndex === totalQuestions - 1 ? "Complete" : "Submit"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navigationButton,
            currentIndex === 0 && styles.navigationButtonDisabled,
          ]}
          onPress={handlePreviousQuestion}
          disabled={currentIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentIndex === 0 ? "#CBD5E1" : "#1E293B"}
          />
        </TouchableOpacity>

        <Text style={styles.navigationText}>
          {currentIndex + 1} of {totalQuestions}
        </Text>

        <TouchableOpacity
          style={[
            styles.navigationButton,
            currentIndex === totalQuestions - 1 &&
              styles.navigationButtonDisabled,
          ]}
          onPress={handleNextQuestion}
          disabled={
            currentIndex === totalQuestions - 1 ||
            (currentQuestion.type === "flashcard" && !isFlipped) ||
            (currentQuestion.type === "multiple_choice" &&
              selectedAnswer === null)
          }
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={
              currentIndex === totalQuestions - 1 ||
              (currentQuestion.type === "flashcard" && !isFlipped) ||
              (currentQuestion.type === "multiple_choice" &&
                selectedAnswer === null)
                ? "#CBD5E1"
                : "#1E293B"
            }
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Manrope_500Medium",
    color: "#64748B",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Manrope_600SemiBold",
    color: "#1E293B",
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#16A34A",
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  flashcardContainer: {
    flex: 1,
    paddingTop: 40,
  },
  cardWrapper: {
    height: 400,
    marginBottom: 32,
  },
  flashcard: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    backfaceVisibility: "hidden",
  },
  flashcardBack: {
    backgroundColor: "#F0FDF4",
  },
  cardHidden: {
    opacity: 0,
  },
  questionText: {
    fontSize: 20,
    fontFamily: "Manrope_600SemiBold",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 16,
  },
  tapToReveal: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: "#94A3B8",
    textAlign: "center",
  },
  answerText: {
    fontSize: 18,
    fontFamily: "Manrope_500Medium",
    color: "#16A34A",
    textAlign: "center",
    lineHeight: 28,
  },
  multipleChoiceContainer: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  questionTitle: {
    fontSize: 14,
    fontFamily: "Manrope_500Medium",
    color: "#64748B",
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  option: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionCorrect: {
    backgroundColor: "#F0FDF4",
    borderColor: "#16A34A",
  },
  optionIncorrect: {
    backgroundColor: "#FEF2F2",
    borderColor: "#DC2626",
  },
  optionText: {
    fontSize: 15,
    fontFamily: "Manrope_500Medium",
    color: "#1E293B",
    flex: 1,
  },
  optionTextCorrect: {
    color: "#16A34A",
  },
  optionTextIncorrect: {
    color: "#DC2626",
  },
  explanationCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  explanationTitle: {
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: "#1E40AF",
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: "#1E293B",
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: "#16A34A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: "Manrope_600SemiBold",
    color: "#FFFFFF",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  navigationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  navigationButtonDisabled: {
    backgroundColor: "#F8FAFC",
    opacity: 0.5,
  },
  navigationText: {
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: "#64748B",
  },
});

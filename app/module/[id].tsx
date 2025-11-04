import { useQuery, useMutation } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ModuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const moduleId = id as Id<"modules">;

  const moduleData = useQuery(api.modules.getModuleWithProgress, {
    moduleId,
  });
  const moduleContent = useQuery(api.modules.getModuleContent, { moduleId });
  const startModule = useMutation(api.modules.startModule);

  if (moduleData === undefined || moduleContent === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  if (moduleData === null || moduleContent === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Module not found</Text>
      </View>
    );
  }

  const handleStartLearning = async () => {
    try {
      await startModule({ moduleId });
      router.push(`/module/${moduleId}/lesson/start`);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to start module");
    }
  };

  const handleContinueLearning = () => {
    router.push(`/module/${moduleId}/lesson/start`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          {moduleData.imageUrl ? (
            <Image
              source={{ uri: moduleData.imageUrl }}
              style={styles.moduleImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.modulePlaceholder}>
              <Image
                source={require("@/assets/images/KenyanFlag.jpg")}
                style={styles.flagImage}
                resizeMode="cover"
              />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{moduleData.title}</Text>

          {moduleData.badgeText && (
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Ionicons name="shield" size={16} color="#FFFFFF" />
                <Text style={styles.badgeText}>{moduleData.badgeText}</Text>
              </View>
              <Text style={styles.badgeSubtext}>Not earned yet</Text>
            </View>
          )}

          {moduleData.userProgress && (
            <View style={styles.progressCard}>
              <Text style={styles.progressLabel}>Your Progress</Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${moduleData.userProgress.progress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {moduleData.userProgress.progress}%
                </Text>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Module Content</Text>

            <View style={styles.contentCard}>
              <View style={styles.contentItem}>
                <View style={styles.contentIcon}>
                  <Ionicons name="layers" size={20} color="#16A34A" />
                </View>
                <Text style={styles.contentText}>
                  {moduleContent.totalFlashcards} learning flashcards
                </Text>
              </View>

              <View style={styles.contentItem}>
                <View style={styles.contentIcon}>
                  <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                </View>
                <Text style={styles.contentText}>
                  {moduleContent.totalMultipleChoice} quiz questions
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this module</Text>
            <View style={styles.descriptionCard}>
              <Text style={styles.description}>
                {moduleData.description ||
                  "Learn the basics of democratic principles and why they matter."}
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            {moduleData.userProgress ? (
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleContinueLearning}
              >
                <Text style={styles.startButtonText}>Continue Learning</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartLearning}
              >
                <Text style={styles.startButtonText}>Start Learning</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
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
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: 200,
    backgroundColor: "#F1F5F9",
  },
  moduleImage: {
    width: "100%",
    height: "100%",
  },
  modulePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  flagImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: "Manrope_700Bold",
    color: "#1E293B",
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC2626",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Manrope_600SemiBold",
    color: "#FFFFFF",
  },
  badgeSubtext: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: "#94A3B8",
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: "#1E293B",
    marginBottom: 12,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#16A34A",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: "#16A34A",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
    color: "#1E293B",
    marginBottom: 12,
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  contentText: {
    fontSize: 14,
    fontFamily: "Manrope_500Medium",
    color: "#1E293B",
  },
  descriptionCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  description: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: "#64748B",
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  startButtonText: {
    fontSize: 16,
    fontFamily: "Manrope_600SemiBold",
    color: "#FFFFFF",
  },
});

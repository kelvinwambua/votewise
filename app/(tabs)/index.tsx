import { useQuery } from "convex/react";
import { router } from "expo-router";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { authClient } from "@/lib/auth-client";
import { api } from "@/convex/_generated/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DashboardScreen() {
  const dashboardData = useQuery(api.dashboard.getDashboardData, {});
  console.log("Dashboard", dashboardData);
  const { data: session } = authClient.useSession();
  console.log("Session", session);

  const handleResourcePress = async (url: string | undefined) => {
    if (!url) {
      Alert.alert("Error", "No URL available for this resource");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this URL");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open the link");
      console.error("Error opening URL:", error);
    }
  };

  if (dashboardData === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  if (dashboardData === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No profile found</Text>
      </View>
    );
  }

  const { profile, recentActivity, badges, resources } = dashboardData;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.welcomeCard}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{session?.user.name}</Text>
          <Text style={styles.welcomeSubtext}>Start your learning journey</Text>
        </View>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsLabel}>Points</Text>
          <Text style={styles.pointsValue}>{profile.points}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Learning Progress</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${profile.progressPercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {profile.modulesCompleted} out of {profile.totalModules} modules
              completed
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="trophy" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.statLabel}>Your Rank</Text>
              <Text
                style={[
                  styles.statValue,
                  !profile.rank && styles.statValueInactive,
                ]}
              >
                {profile.rank || "Not ranked yet"}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="ribbon" size={24} color="#A855F7" />
              </View>
              <Text style={styles.statLabel}>Badges Earned</Text>
              <Text style={styles.statValue}>{profile.badgesEarned}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllLink}>View All Modules</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityCard}>
          {recentActivity.length > 0 ? (
            recentActivity.slice(0, 3).map((activity, index) => (
              <View
                key={activity._id}
                style={[
                  styles.activityItem,
                  index !== recentActivity.slice(0, 3).length - 1 &&
                    styles.activityItemBorder,
                ]}
              >
                <Ionicons name="book-outline" size={20} color="#16A34A" />
                <View style={styles.activityContent}>
                  <Text style={styles.activityDescription}>
                    {activity.description}
                  </Text>
                  <Text style={styles.activityTime}>
                    {formatTimestamp(activity.timestamp)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>No activity yet</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.startLearningButton}
            onPress={() => router.push("/(tabs)/learning")}
          >
            <Text style={styles.startLearningText}>Start Learning</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Badges</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.badgesCard}>
          {badges.length > 0 ? (
            <View style={styles.badgesGrid}>
              {badges.slice(0, 6).map((badge) => (
                <View key={badge._id} style={styles.badgeItem}>
                  <View style={styles.badgeIconContainer}>
                    <Ionicons name="ribbon" size={32} color="#A855F7" />
                  </View>
                  <Text style={styles.badgeName} numberOfLines={2}>
                    {badge.badgeDetails?.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="ribbon-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>
                Complete modules to earn badges
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Resources To Check</Text>
        </View>
        <View style={styles.resourcesCard}>
          {resources.length > 0 ? (
            resources.slice(0, 3).map((resource, index) => (
              <TouchableOpacity
                key={resource._id}
                style={[
                  styles.resourceItem,
                  index !== resources.slice(0, 3).length - 1 &&
                    styles.resourceItemBorder,
                ]}
                onPress={() => handleResourcePress(resource.url)}
              >
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceTitle}>{resource.title}</Text>
                  {resource.description && (
                    <Text style={styles.resourceDescription} numberOfLines={2}>
                      {resource.description}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="documents-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>No resources available</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
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
  welcomeCard: {
    backgroundColor: "#16A34A",
    marginHorizontal: 16,
    marginTop: 60,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
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
  welcomeText: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: "#FFFFFF",
    opacity: 0.9,
  },
  userName: {
    fontSize: 20,
    fontFamily: "Manrope_700Bold",
    color: "#FFFFFF",
    marginTop: 4,
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: "#FFFFFF",
    opacity: 0.8,
  },
  pointsContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pointsLabel: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: "#FFFFFF",
    opacity: 0.9,
  },
  pointsValue: {
    fontSize: 24,
    fontFamily: "Manrope_700Bold",
    color: "#FFFFFF",
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  lastSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
    color: "#1E293B",
    paddingHorizontal: 16,
  },
  viewAllLink: {
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: "#16A34A",
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
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
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#16A34A",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: "#64748B",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    color: "#64748B",
    marginBottom: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    color: "#1E293B",
    textAlign: "center",
  },
  statValueInactive: {
    color: "#F59E0B",
    fontSize: 12,
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
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
  activityItem: {
    flexDirection: "row",
    paddingVertical: 12,
    gap: 12,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    fontFamily: "Manrope_500Medium",
    color: "#1E293B",
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: "#94A3B8",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: "#94A3B8",
    marginTop: 12,
  },
  startLearningButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  startLearningText: {
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: "#FFFFFF",
  },
  badgesCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
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
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  badgeItem: {
    width: (SCREEN_WIDTH - 76) / 3,
    alignItems: "center",
  },
  badgeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FAF5FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 11,
    fontFamily: "Manrope_500Medium",
    color: "#1E293B",
    textAlign: "center",
  },
  resourcesCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
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
  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  resourceItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: "#1E293B",
    marginBottom: 2,
  },
  resourceDescription: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: "#64748B",
  },
});

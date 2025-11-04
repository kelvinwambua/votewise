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
  Image,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function LearningScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const modulesData = useQuery(api.modules.getUserModulesWithProgress);

  if (modulesData === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  const filteredModules = modulesData?.filter((module) =>
    module.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning Modules</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#94A3B8"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search modules..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {/*<TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color="#64748B" />
        </TouchableOpacity>*/}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.modulesGrid}>
          {filteredModules?.map((module, index) => (
            <TouchableOpacity
              key={module._id}
              style={[
                styles.moduleCard,
                index % 2 === 0
                  ? styles.moduleCardLeft
                  : styles.moduleCardRight,
              ]}
              onPress={() => router.push(`/module/${module._id}`)}
              disabled={
                module.status === "coming_soon" || module.status === "locked"
              }
            >
              {module.imageUrl ? (
                <Image
                  source={{ uri: module.imageUrl }}
                  style={styles.moduleImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.modulePlaceholder,
                    {
                      backgroundColor:
                        index % 3 === 0
                          ? "#F1F5F9"
                          : index % 3 === 1
                            ? "#DCFCE7"
                            : "#E0E7FF",
                    },
                  ]}
                >
                  <Ionicons
                    name="book-outline"
                    size={32}
                    color={
                      index % 3 === 0
                        ? "#64748B"
                        : index % 3 === 1
                          ? "#16A34A"
                          : "#4F46E5"
                    }
                  />
                </View>
              )}

              {module.status === "coming_soon" && (
                <View style={styles.overlay}>
                  <View style={styles.lockContainer}>
                    <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                  </View>
                </View>
              )}

              {module.status === "locked" && (
                <View style={styles.overlay}>
                  <View style={styles.lockContainer}>
                    <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
                  </View>
                </View>
              )}

              {module.badgeText && module.status === "published" && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{module.badgeText}</Text>
                </View>
              )}

              <View style={styles.moduleContent}>
                <Text style={styles.moduleTitle} numberOfLines={2}>
                  {module.title}
                </Text>

                {module.userProgress && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${module.userProgress.progress}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {module.userProgress.progress}%
                    </Text>
                  </View>
                )}

                {!module.userProgress && module.status === "published" && (
                  <View style={styles.moduleFooter}>
                    <View style={styles.contentInfo}>
                      <Ionicons
                        name="layers-outline"
                        size={14}
                        color="#64748B"
                      />
                      <Text style={styles.contentText}>
                        {module.duration
                          ? `${module.duration} min`
                          : "Start learning"}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredModules?.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyStateText}>No modules found</Text>
          </View>
        )}
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
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Manrope_700Bold",
    color: "#1E293B",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    fontFamily: "Manrope_400Regular",
    color: "#1E293B",
  },
  filterButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  modulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  moduleCard: {
    width: (SCREEN_WIDTH - 40) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  moduleCardLeft: {
    marginLeft: 8,
    marginRight: 4,
  },
  moduleCardRight: {
    marginLeft: 4,
    marginRight: 8,
  },
  moduleImage: {
    width: "100%",
    height: 120,
  },
  modulePlaceholder: {
    width: "100%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  lockContainer: {
    alignItems: "center",
  },
  comingSoonText: {
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: "#FFFFFF",
    marginTop: 8,
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#DC2626",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Manrope_600SemiBold",
    color: "#FFFFFF",
  },
  moduleContent: {
    padding: 12,
  },
  moduleTitle: {
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: "#1E293B",
    marginBottom: 8,
    minHeight: 40,
  },
  progressSection: {
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#16A34A",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontFamily: "Manrope_500Medium",
    color: "#16A34A",
  },
  moduleFooter: {
    marginTop: 4,
  },
  contentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  contentText: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: "#64748B",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: "#94A3B8",
    marginTop: 12,
  },
});

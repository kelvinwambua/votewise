import { useQuery } from "convex/react";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { api } from "@/convex/_generated/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function LeaderboardScreen() {
  const [searchTerm, setSearchTerm] = useState("");

  const leaderboardData = useQuery(api.leaderboard.getLeaderboard, {});
  const topThree = useQuery(api.leaderboard.getTopThree, {});
  const stats = useQuery(api.leaderboard.getLeaderboardStats, {});

  if (leaderboardData === undefined || topThree === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  const { top20, userRank, isUserInTop20 } = leaderboardData;

  const displayData = searchTerm.trim()
    ? top20.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : top20;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>VoteWise Kenya Leaderboard</Text>
      </View>

      {topThree && topThree.length >= 3 && (
        <View style={styles.podiumSection}>
          <View style={styles.podiumContainer}>
            <View style={styles.podiumItem}>
              <View style={[styles.podiumRank, styles.silverRank]}>
                <Ionicons name="person" size={32} color="#94A3B8" />
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {topThree[1]?.name}
              </Text>
              <Text style={styles.podiumPoints}>
                {topThree[1]?.points} points
              </Text>
            </View>

            <View style={[styles.podiumItem, styles.firstPlace]}>
              <View style={[styles.podiumRank, styles.goldRank]}>
                <Ionicons name="person" size={40} color="#F59E0B" />
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {topThree[0]?.name}
              </Text>
              <Text style={styles.podiumPoints}>
                {topThree[0]?.points} points
              </Text>
            </View>

            <View style={styles.podiumItem}>
              <View style={[styles.podiumRank, styles.bronzeRank]}>
                <Ionicons name="person" size={32} color="#CD7F32" />
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {topThree[2]?.name}
              </Text>
              <Text style={styles.podiumPoints}>
                {topThree[2]?.points} points
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search leaderboard"
            placeholderTextColor="#94A3B8"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      <View style={styles.tableSection}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.rankColumn]}>Rank</Text>
          <Text style={[styles.tableHeaderText, styles.nameColumn]}>Name</Text>
          <Text style={[styles.tableHeaderText, styles.pointsColumn]}>
            Points
          </Text>
        </View>

        {displayData && displayData.length > 0 ? (
          <>
            {displayData.map((user) => {
              const isCurrentUser = userRank && user.userId === userRank.userId;
              return (
                <View
                  key={user.userId}
                  style={[
                    styles.tableRow,
                    isCurrentUser && styles.currentUserRow,
                  ]}
                >
                  <View style={styles.rankColumn}>
                    <Text style={styles.rankText}>
                      {getRankIcon(user.rank) || user.rank}
                    </Text>
                  </View>
                  <View style={styles.nameColumn}>
                    <Text style={styles.nameText} numberOfLines={1}>
                      {user.name}
                    </Text>
                  </View>
                  <View style={styles.pointsColumn}>
                    <Text style={styles.pointsText}>{user.points}</Text>
                  </View>
                </View>
              );
            })}

            {!isUserInTop20 && userRank && !searchTerm.trim() && (
              <>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Your Position</Text>
                  <View style={styles.dividerLine} />
                </View>
                <View style={[styles.tableRow, styles.currentUserRow]}>
                  <View style={styles.rankColumn}>
                    <Text style={styles.rankText}>{userRank.rank}</Text>
                  </View>
                  <View style={styles.nameColumn}>
                    <Text style={styles.nameText} numberOfLines={1}>
                      {userRank.name}
                    </Text>
                  </View>
                  <View style={styles.pointsColumn}>
                    <Text style={styles.pointsText}>{userRank.points}</Text>
                  </View>
                </View>
              </>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyStateText}>No users found</Text>
          </View>
        )}
      </View>

      {stats && (
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Leaderboard Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color="#16A34A" />
              <Text style={styles.statValue}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={24} color="#F59E0B" />
              <Text style={styles.statValue}>{stats.topScore}</Text>
              <Text style={styles.statLabel}>Top Score</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="analytics" size={24} color="#A855F7" />
              <Text style={styles.statValue}>{stats.averagePoints}</Text>
              <Text style={styles.statLabel}>Average Points</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
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
    backgroundColor: "#16A34A",
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Manrope_700Bold",
    color: "#FFFFFF",
  },
  podiumSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  podiumItem: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 4,
  },
  firstPlace: {
    marginBottom: 20,
  },
  podiumRank: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  goldRank: {
    backgroundColor: "#FEF3C7",
    borderWidth: 3,
    borderColor: "#F59E0B",
  },
  silverRank: {
    backgroundColor: "#F1F5F9",
    borderWidth: 3,
    borderColor: "#94A3B8",
  },
  bronzeRank: {
    backgroundColor: "#FED7AA",
    borderWidth: 3,
    borderColor: "#CD7F32",
  },
  podiumName: {
    fontSize: 12,
    fontFamily: "Manrope_600SemiBold",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 4,
  },
  podiumPoints: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    color: "#16A34A",
    textAlign: "center",
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: "Manrope_400Regular",
    color: "#1E293B",
  },
  tableSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tableHeaderText: {
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
    color: "#64748B",
  },
  rankColumn: {
    width: 60,
  },
  nameColumn: {
    flex: 1,
  },
  pointsColumn: {
    width: 80,
    alignItems: "flex-end",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  currentUserRow: {
    backgroundColor: "#F0FDF4",
  },
  rankText: {
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: "#1E293B",
  },
  nameText: {
    fontSize: 14,
    fontFamily: "Manrope_500Medium",
    color: "#1E293B",
  },
  pointsText: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    color: "#F59E0B",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontFamily: "Manrope_600SemiBold",
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
  statsSection: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  statsTitle: {
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
    color: "#1E293B",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Manrope_700Bold",
    color: "#1E293B",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Manrope_500Medium",
    color: "#64748B",
    textAlign: "center",
  },
});

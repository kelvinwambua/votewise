import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authClient } from "@/lib/auth-client";
import Svg, { Path } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ProfileScreen() {
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const notificationCount = 2;

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await authClient.signOut();
            router.replace("/public/signin");
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to sign out");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleNotifications = () => {
    router.push("/notifications");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  if (!session?.user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  const { user } = session;
  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <Image
          source={require("@/assets/images/KenyanFlag.jpg")}
          style={styles.headerBackground}
          contentFit="cover"
        />
        <Svg
          height="100%"
          width="100%"
          style={styles.wavyOverlay}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <Path
            d="M 0 100
               C 5 95, 8 88, 10 82
               C 12 76, 14 72, 16 68
               C 18 64, 20 61, 22 58
               C 24 55, 26 53, 28 50
               C 30 47, 32 45, 34 42
               C 36 39, 38 37, 40 34
               C 42 31, 44 29, 46 26
               C 48 23, 50 21, 52 18
               C 54 15, 56 13, 58 11
               C 60 9, 62 7.5, 64 6
               C 66 4.5, 68 3.5, 70 2.5
               C 72 1.8, 74 1.2, 76 0.8
               C 78 0.5, 80 0.3, 82 0.2
               C 84 0.1, 86 0.05, 88 0.03
               C 90 0.01, 92 0, 94 0
               L 100 0
               L 100 100
               Z"
            fill="white"
          />
        </Svg>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleNotifications}
          >
            <Ionicons name="notifications" size={28} color="#1E293B" />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSettings}>
            <Ionicons name="settings-sharp" size={28} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: user.image }}
            style={styles.avatar}
            contentFit="cover"
          />
          {user.emailVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={28} color="#16A34A" />
            </View>
          )}
        </View>

        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.joinedDate}>Member since {joinedDate}</Text>

        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditProfile}
          disabled={loading}
        >
          <Ionicons
            name="pencil"
            size={18}
            color="#16A34A"
            style={styles.editIcon}
          />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="person" size={24} color="#64748B" />
            <Text style={styles.menuItemText}>Account Information</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="lock-closed" size={24} color="#64748B" />
            <Text style={styles.menuItemText}>Privacy & Security</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="heart" size={24} color="#64748B" />
            <Text style={styles.menuItemText}>Saved Items</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="help-circle" size={24} color="#64748B" />
            <Text style={styles.menuItemText}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="information-circle" size={24} color="#64748B" />
            <Text style={styles.menuItemText}>About</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.signOutButton, loading && styles.buttonDisabled]}
        onPress={handleSignOut}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#DC2626" />
        ) : (
          <>
            <Ionicons
              name="log-out"
              size={20}
              color="#DC2626"
              style={styles.signOutIcon}
            />
            <Text style={styles.signOutText}>Sign Out</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  headerSection: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.25,
    position: "relative",
    overflow: "hidden",
  },
  headerBackground: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  wavyOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  },
  headerButtons: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: 16,
    flexDirection: "row",
    gap: 12,
    zIndex: 10,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#DC2626",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: -50,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontFamily: "Manrope_700Bold",
    color: "#1E293B",
    marginBottom: 4,
    textAlign: "center",
  },
  userEmail: {
    fontSize: 15,
    fontFamily: "Manrope_400Regular",
    color: "#64748B",
    marginBottom: 6,
    textAlign: "center",
  },
  joinedDate: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: "#94A3B8",
    marginBottom: 20,
    textAlign: "center",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#16A34A",
    backgroundColor: "#FFFFFF",
  },
  editIcon: {
    marginRight: 6,
  },
  editButtonText: {
    fontSize: 15,
    fontFamily: "Manrope_600SemiBold",
    color: "#16A34A",
  },
  menuSection: {
    marginHorizontal: 24,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 8,
    marginTop: 32,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: "Manrope_500Medium",
    color: "#1E293B",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 16,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signOutIcon: {
    marginRight: 8,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: "Manrope_600SemiBold",
    color: "#DC2626",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: "#94A3B8",
  },
});

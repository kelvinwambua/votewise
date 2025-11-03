import { GoogleIcon } from "@/components/icons/google-icon";
import { authClient } from "@/lib/auth-client";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await authClient.signIn.email({
        email,
        password,
        callbackURL: "/(tabs)",
      });
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert(
        "Sign In Failed",
        error.message || "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/(tabs)",
      });
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert(
        "Google Sign In Failed",
        error.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.flagSection}>
        <Image
          source={require("@/assets/images/KenyanFlag.jpg")}
          style={styles.flag}
          resizeMode="cover"
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
      </View>

      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Log in to your account</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>New to VoteWise? </Text>
            <Link href="/public" asChild>
              <TouchableOpacity disabled={loading}>
                <Text style={styles.subtitleLink}>Create an account</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder=""
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[styles.socialButton, loading && styles.buttonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <GoogleIcon width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flagSection: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.4,
    position: "relative",
    overflow: "hidden",
  },
  flag: {
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontFamily: "Manrope_700Bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#1E293B",
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: "#64748B",
  },
  subtitleLink: {
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: "#16A34A",
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: "Manrope_500Medium",
    marginBottom: 8,
    color: "#1E293B",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Manrope_400Regular",
    backgroundColor: "#FFFFFF",
    color: "#1E293B",
    borderColor: "#E2E8F0",
  },
  button: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Manrope_600SemiBold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: "#64748B",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
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
});

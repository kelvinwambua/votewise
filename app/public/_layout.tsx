
import { authClient } from "@/lib/auth-client";
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from "react-native";

export default function PublicLayout() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="signin" />
    </Stack>
  );
}
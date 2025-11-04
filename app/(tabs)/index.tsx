import { TouchableOpacity, View, Text } from "react-native";
import { authClient } from "@/lib/auth-client";

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <TouchableOpacity
        style={{
          backgroundColor: "red",
          padding: 10,
          borderRadius: 5,
        }}
        onPress={async () => {
          await authClient.signOut();
        }}
      >
        <Text style={{ color: "white" }}>Hello Does this work?</Text>
      </TouchableOpacity>
    </View>
  );
}

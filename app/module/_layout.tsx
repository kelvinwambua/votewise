import { Stack } from "expo-router";
import React from "react";

export default function ModuleLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#F8FAFC",
        },
      }}
    >
      <Stack.Screen name="[id]" />
    </Stack>
  );
}

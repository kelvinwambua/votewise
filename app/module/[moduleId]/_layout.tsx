import { Stack } from "expo-router";
import React from "react";

export default function SingleModuleLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#F8FAFC",
        },
      }}
    >
      <Stack.Screen name="lesson/[lessonId]" />
    </Stack>
  );
}

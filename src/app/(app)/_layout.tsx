import React from "react";
import { Stack } from "expo-router";

const AppLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="add-task"
        options={{
          presentation: "modal",
        }}
      />
    </Stack>
  );
};
export default AppLayout;

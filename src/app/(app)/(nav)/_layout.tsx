import React from "react";
import { Stack } from "expo-router";

const NavLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="settings" />
      <Stack.Screen name="task-list" />
      <Stack.Screen name="recurring-task-list" />
    </Stack>
  );
};
export default NavLayout;

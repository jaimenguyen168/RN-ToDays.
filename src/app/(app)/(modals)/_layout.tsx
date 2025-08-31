import React from "react";
import { Stack } from "expo-router";

const ModalLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="add-task" />
      <Stack.Screen name="edit-task" />
    </Stack>
  );
};
export default ModalLayout;

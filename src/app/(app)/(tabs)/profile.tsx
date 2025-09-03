import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { useNotifications } from "@/hooks/useNotifications";

const ProfileScreen = () => {
  const getUser = useQuery(api.private.users.getUser, {
    userId: "j57fgqzy3wkwx3381xw5ezvjcs7pga7v" as Id<"users">,
  });

  const { getScheduledNotifications, clearAllNotifications } =
    useNotifications();

  const handleDisplayNotifications = async () => {
    const scheduledNotifications = await getScheduledNotifications();

    console.log("Scheduled notifications:", scheduledNotifications);
  };

  return (
    <View className="flex-1 items-center justify-center bg-red-200 px-6">
      <TouchableOpacity onPress={handleDisplayNotifications}>
        <Text>Display</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={clearAllNotifications}>
        <Text>Clear</Text>
      </TouchableOpacity>
    </View>
  );
};
export default ProfileScreen;

import { View, Text } from "react-native";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

const ProfileScreen = () => {
  const getUser = useQuery(api.private.users.getUser, {
    userId: "j57fgqzy3wkwx3381xw5ezvjcs7pga7v" as Id<"users">,
  });

  return (
    <View className="flex-1 items-center justify-center bg-red-200 px-6">
      <Text>{JSON.stringify(getUser, null, 2)}</Text>
    </View>
  );
};
export default ProfileScreen;

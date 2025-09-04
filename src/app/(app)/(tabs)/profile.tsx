import { View, Text, TouchableOpacity, TextInput } from "react-native";
import React, { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";

const ProfileScreen = () => {
  const [time, setTime] = useState("");
  const [time2, setTime2] = useState("");
  const [displayedDateTime, setDisplayedDateTime] = useState("");
  const [displayedDateTime2, setDisplayedDateTime2] = useState("");

  const { getScheduledNotifications, clearAllNotifications } =
    useNotifications();

  const handleDisplayNotifications = async () => {
    const scheduledNotifications = await getScheduledNotifications();

    console.log("Scheduled notifications:", scheduledNotifications);
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const getExactNotificationTime = (
    triggerSeconds: number,
    creationTime: number,
  ): number => {
    return creationTime + triggerSeconds * 1000;
  };

  const handleSetDateTime = () => {
    if (time) {
      const timestamp = parseInt(time);
      const formattedDateTime = formatTimestamp(timestamp);
      setDisplayedDateTime(formattedDateTime);
    }
  };

  const handleSetDateTime2 = () => {
    if (time2) {
      const seconds = parseFloat(time2);
      const timestamp = getExactNotificationTime(seconds, Date.now());
      const formattedDateTime = formatTimestamp(timestamp);
      setDisplayedDateTime2(formattedDateTime);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-red-200 px-6 gap-4">
      <TouchableOpacity
        onPress={handleDisplayNotifications}
        className="bg-blue-500 px-4 py-2 rounded"
      >
        <Text className="text-white">Display Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={clearAllNotifications}
        className="bg-red-500 px-4 py-2 rounded"
      >
        <Text className="text-white">Clear Notifications</Text>
      </TouchableOpacity>

      <TextInput
        value={time}
        onChangeText={setTime}
        keyboardType="numeric"
        placeholder="Enter timestamp (e.g., 1756872000000)"
        className="border border-gray-400 px-4 py-2 rounded w-full text-center"
      />

      <TouchableOpacity
        onPress={handleSetDateTime}
        className="bg-green-500 px-4 py-2 rounded"
      >
        <Text className="text-white">Convert to Date/Time</Text>
      </TouchableOpacity>

      {displayedDateTime && (
        <View className="bg-white p-4 rounded shadow-lg">
          <Text className="text-lg font-semibold text-center">
            {displayedDateTime}
          </Text>
        </View>
      )}

      <TextInput
        value={time2}
        onChangeText={setTime2}
        keyboardType="numeric"
        placeholder="Enter seconds (e.g., 1158.6123390197754)"
        className="border border-gray-400 px-4 py-2 rounded w-full text-center"
      />

      <TouchableOpacity
        onPress={handleSetDateTime2}
        className="bg-green-500 px-4 py-2 rounded"
      >
        <Text className="text-white">Convert Noti Time</Text>
      </TouchableOpacity>

      {displayedDateTime2 && (
        <View className="bg-white p-4 rounded shadow-lg">
          <Text className="text-lg font-semibold text-center">
            {displayedDateTime2}
          </Text>
        </View>
      )}
    </View>
  );
};
export default ProfileScreen;

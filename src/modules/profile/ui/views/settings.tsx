import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import ActionButton from "@/components/ActionButton";
import { ThemedIcon } from "@/components/ThemedIcon";
import { useNotifications } from "@/hooks/useNotifications";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";

const SettingsView = () => {
  const router = useRouter();
  const { user } = useUser();

  const {
    permissionStatus,
    requestPermissions,
    clearAllNotifications,
    scheduleTaskNotifications,
  } = useNotifications();

  const [allowNotifications, setAllowNotifications] = useState(false);

  const allTasks = useQuery(api.private.tasks.getTasksWithFilters, {});

  const scheduleNotificationsForTasks = async () => {
    if (!allTasks || allTasks.length === 0) {
      console.log("No tasks to schedule notifications for");
      return;
    }

    console.log(`Found ${allTasks.length} tasks before filtering`);

    const today = new Date().setHours(0, 0, 0, 0);

    const tasksToSchedule = allTasks.filter((task) => {
      const taskDate = new Date(task.date).setHours(0, 0, 0, 0);
      return (
        taskDate >= today &&
        task.notifications &&
        task.notifications.length > 0 &&
        !task.isCompleted
      );
    });

    console.log(
      `Found ${tasksToSchedule.length} tasks to schedule notifications for`,
    );

    for (const task of tasksToSchedule) {
      try {
        await scheduleTaskNotifications({
          _id: task._id,
          title: task.title,
          notifications: task.notifications,
        });
        console.log(`Scheduled notifications for task: ${task.title}`);
      } catch (notificationError) {
        console.error(
          `Error scheduling notifications for task ${task._id}:`,
          notificationError,
        );
      }
    }

    console.log(
      `Completed scheduling notifications for ${tasksToSchedule.length} tasks`,
    );
  };

  useEffect(() => {
    setAllowNotifications(permissionStatus === "granted");
  }, [permissionStatus]);

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestPermissions();
      setAllowNotifications(granted);

      if (granted) {
        await scheduleNotificationsForTasks();
      }
    } else {
      setAllowNotifications(false);

      await clearAllNotifications();
    }
  };

  const handleLanguagePress = () => {
    console.log("Language pressed");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Delete account cancelled"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              console.log("Account deletion confirmed");

              await user?.delete();

              router.replace("/");
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert(
                "Error",
                "Failed to delete account. Please try again.",
                [{ text: "OK" }],
              );
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-8 justify-between">
          <ActionButton
            onPress={() => router.back()}
            icon="arrow-left"
            iconLibrary="feather"
            size={24}
          />
          <View className="flex-1 items-center">
            <Text className="text-foreground text-xl font-semibold">
              Setting
            </Text>
          </View>

          <View className="w-10" />
        </View>

        {/* General Section */}
        <View className="mb-8">
          <Text className="text-foreground text-lg font-semibold mb-4">
            General
          </Text>

          {/* Language */}
          <TouchableOpacity
            className="flex-row items-center justify-between py-4"
            onPress={handleLanguagePress}
          >
            <Text className="text-foreground">Language</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-muted-foreground">English</Text>
              <ThemedIcon
                name="chevron-right"
                size={20}
                library="feather"
                lightColor="#6B7280"
                darkColor="#9CA3AF"
              />
            </View>
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity className="py-4" onPress={handleDeleteAccount}>
            <Text className="text-foreground">Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View>
          <Text className="text-foreground text-lg font-semibold mb-4">
            Notifications
          </Text>

          {/* Allow Notification */}
          <View className="flex-row items-center justify-between py-4">
            <Text className="text-foreground">Allow Notification</Text>
            <Switch
              value={allowNotifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: "#E5E7EB", true: "#6366F1" }}
              thumbColor={allowNotifications ? "#FFFFFF" : "#FFFFFF"}
              ios_backgroundColor="#E5E7EB"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SettingsView;

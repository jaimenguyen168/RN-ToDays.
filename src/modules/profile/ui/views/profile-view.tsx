import React from "react";
import { View, Text, Image, ScrollView, useColorScheme } from "react-native";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import ActionButton from "@/components/ActionButton";
import { useClerk } from "@clerk/clerk-expo";
import TaskProfileCard from "@/modules/profile/ui/components/TaskProfileCard";
import { useRouter } from "expo-router";
import { TaskTypes } from "~/convex/schemas/tasks";
import { startOfToday } from "date-fns";
import DropdownMenu, { MenuItem } from "@/components/DropdownMenu";

interface TaskCounts {
  personal: number;
  work: number;
  emergency: number;
  today: number;
  completed: number;
  pending: number;
}

const ProfileView = () => {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { signOut } = useClerk();

  const user = useQuery(api.private.users.getUser);
  const allTasks = useQuery(api.private.tasks.getTasksWithFilters, {});

  const todayDate = startOfToday().getTime();
  const todayTasks = useQuery(api.private.tasks.getTasksForDate, {
    date: todayDate,
  });

  const calculateTaskCounts = (): TaskCounts => {
    if (!allTasks)
      return {
        personal: 0,
        work: 0,
        emergency: 0,
        today: 0,
        completed: 0,
        pending: 0,
      };

    const now = Date.now();
    let personal = 0;
    let work = 0;
    let emergency = 0;
    let completed = 0;
    let pending = 0;

    allTasks.forEach((task) => {
      // Count by type
      if (task.type === TaskTypes.PERSONAL) {
        personal++;
      } else if (task.type === TaskTypes.WORK) {
        work++;
      } else if (task.type === TaskTypes.EMERGENCY) {
        emergency++;
      }

      // Count by status
      if (task.isCompleted) {
        completed++;
      } else if (task.endTime < now) {
        pending++;
      }
    });

    const today = todayTasks?.length || 0;

    return { personal, work, emergency, today, completed, pending };
  };

  const taskCounts = calculateTaskCounts();

  const handleLogout = async () => {
    await signOut();
    router.replace("/");
  };

  const menuItems: MenuItem[] = [
    {
      title: "Settings",
      icon: "settings-outline",
      library: "ionicons",
      onPress: () => router.push("/settings"),
    },
    {
      title: "Logout",
      icon: "log-out",
      library: "feather",
      onPress: handleLogout,
    },
  ];

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-16 pb-8">
          <View className="flex-row items-center justify-end m-2">
            {/* Dropdown Menu */}
            <DropdownMenu menuItems={menuItems}>
              <ActionButton
                onPress={() => {}}
                icon="more-horizontal"
                iconLibrary="feather"
                size={24}
                disabled
              />
            </DropdownMenu>
          </View>

          {/* Profile Section */}
          <View className="items-center">
            {/* Avatar */}
            <View className="mb-6">
              {user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  className="w-24 h-24 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-muted items-center justify-center">
                  <Text className="text-4xl">👨‍💻</Text>
                </View>
              )}
            </View>

            {/* User Info */}
            <Text className="text-foreground text-2xl font-bold mb-1">
              {user?.username || "Steve Job"}
            </Text>
            {user?.email && (
              <Text className="text-muted-foreground text-base">
                {user.email}
              </Text>
            )}
          </View>
        </View>

        {/* Task Categories Grid */}
        <View className="px-4 pb-8 gap-3">
          <View className="flex-row">
            <TaskProfileCard
              title="Personal"
              count={taskCounts.personal}
              icon="user"
              iconLibrary="feather"
              iconColor="#7C3AED"
              colors={["#A5B4FC", "#8B5CF6"]}
              onPress={() => console.log("Personal tasks")}
            />
            <TaskProfileCard
              title="Work"
              count={taskCounts.work}
              icon="briefcase"
              iconColor="#16A34A"
              colors={["#BBF7D0", "#22C55E"]}
              onPress={() => console.log("Work tasks")}
            />
          </View>

          <View className="flex-row">
            <TaskProfileCard
              title="Emergency"
              count={taskCounts.emergency}
              icon="calendar-alert"
              iconLibrary="material-community"
              iconColor="#DC2626"
              colors={["#FECACA", "#EF4444"]}
              onPress={() => console.log("Emergency tasks")}
            />
            <TaskProfileCard
              title="Today"
              count={taskCounts.today}
              icon="today-outline"
              iconColor="#0891B2"
              colors={["#A5F3FC", "#06B6D4"]}
              onPress={() => console.log("Today tasks")}
            />
          </View>

          <View className="flex-row">
            <TaskProfileCard
              title="Completed"
              count={taskCounts.completed}
              iconLibrary="ionicons"
              iconColor="#EA580C"
              icon="calendar-outline"
              colors={["#FED7AA", "#F97316"]}
              onPress={() => console.log("Completed tasks")}
            />
            <TaskProfileCard
              title="Pending"
              count={taskCounts.pending}
              icon="clock"
              iconColor="#4B5563"
              iconLibrary="feather"
              colors={["#D1D5DB", "#6B7280"]}
              onPress={() => console.log("Pending tasks")}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileView;

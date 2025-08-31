import { View, Text, TouchableOpacity, Image, Animated } from "react-native";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { TaskTypes } from "~/convex/schemas/tasks";
import { ThemedIcon } from "@/components/ThemedIcon";
import TaskCard from "@/components/TaskCard";
import { images } from "@/constants/images";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { ScrollHeader } from "@/components/ScrollHeader";
import TaskItem from "@/components/TaskItem";
import { Task } from "@/types";

interface TaskCounts {
  completed: number;
  pending: number;
  onGoing: number;
  emergency: number;
}

const HomeScreen = () => {
  const userId = "j57fgqzy3wkwx3381xw5ezvjcs7pga7v";
  const { headerOpacity, handleScroll } = useScrollHeader(15);

  const user = useQuery(api.private.users.getUser, {
    userId: userId as Id<"users">,
  });

  const allTasks = useQuery(api.private.tasks.getTasksWithFilters, {
    userId,
  });
  const allRecurringTasks = useQuery(api.private.tasks.getRecurringTasks, {
    userId,
  });

  const isToday = (timestamp: number) => {
    const today = new Date();
    const date = new Date(timestamp);
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const calculateTaskCounts = (): TaskCounts => {
    if (!allTasks)
      return { completed: 0, pending: 0, onGoing: 0, emergency: 0 };

    const now = Date.now();
    let completed = 0;
    let pending = 0;
    let onGoing = allRecurringTasks?.length || 0;
    let emergency = 0;

    allTasks.forEach((task) => {
      // Emergency count
      if (task.type === TaskTypes.EMERGENCY) {
        emergency++;
      }

      // Task status
      if (task.isCompleted) {
        completed++;
      }

      // Pending count
      if (!task.isCompleted) {
        const [hours, minutes] = task.endTime.split(":").map(Number);
        const taskEndDateTime = new Date(task.date);
        taskEndDateTime.setHours(hours, minutes, 0, 0);

        if (taskEndDateTime.getTime() < now) {
          pending++;
        }
      }
    });

    return { completed, pending, onGoing, emergency };
  };

  const getTodayTasks = (): Task[] => {
    if (!allTasks) return [];

    return allTasks
      .filter((task) => isToday(task.date))
      .map((task) => ({
        _id: task._id,
        title: task.title,
        startTime: task.startTime,
        endTime: task.endTime,
        tags: task.tags,
        type: task.type,
        isCompleted: task.isCompleted,
        note: task.note,
        date: task.date,
      }))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const taskCounts = calculateTaskCounts();
  const todayTasks = getTodayTasks();

  const handleTaskPress = (taskId: string) => {
    console.log("Task pressed:", taskId);
  };

  const renderHeader = () => (
    <View className="bg-background pt-20 px-6 gap-8">
      {/* Header */}
      <View className="mr-2">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-foreground text-2xl font-semibold">
              Hi, {user?.fullName?.split(" ")[0] || "User"}
            </Text>
            <Text className="text-muted-foreground text-sm">
              Let&apos;s make this day productive
            </Text>
          </View>

          {user?.imageUrl && (
            <Image
              source={{ uri: user.imageUrl }}
              className="w-12 h-12 rounded-full"
              resizeMode="cover"
            />
          )}
        </View>
      </View>

      {/* Task Cards */}
      <View className="gap-3">
        <Text className="text-xl font-semibold text-foreground">My Task</Text>

        <View className="flex-row w-full gap-4">
          <View className="gap-4 flex-1">
            <TaskCard
              title="Completed"
              count={taskCounts.completed}
              colors={["#84fab0", "#4ade80", "#22c55e"]}
              image={images.complete}
            />
            <TaskCard
              title="Pending"
              count={taskCounts.pending}
              colors={["#818cf8", "#6366f1", "#4f46e5"]}
              icon="clock"
            />
          </View>

          <View className="gap-4 flex-1">
            <TaskCard
              title="On Going"
              count={taskCounts.onGoing}
              colors={["#7dd3fc", "#22d3ee", "#06b6d4"]}
              icon="play-circle"
            />
            <TaskCard
              title="Emergency"
              count={taskCounts.emergency}
              colors={["#ff6b6b", "#ff4757", "#e74c3c"]}
              image={images.emergency}
            />
          </View>
        </View>
      </View>

      {/* Today Tasks Header */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-foreground">
            Today Task
          </Text>
          <TouchableOpacity>
            <Text className="text-accent-foreground font-medium">View all</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="px-6">
      <View className="bg-muted-accent rounded-2xl p-8 items-center">
        <ThemedIcon
          name="calendar-outline"
          size={48}
          lightColor="#5B67CA"
          darkColor="#F9FAFD"
        />
        <Text className="text-accent-foreground text-center mt-4 font-semibold">
          No tasks scheduled for today
        </Text>
        <Text className="text-muted-accent text-center text-sm">
          Enjoy your free day!
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => <View className="h-36" />;

  return (
    <View className="flex-1 bg-background">
      {/* Animated Top Bar */}
      <ScrollHeader opacity={headerOpacity}>
        <Text className="text-foreground text-lg font-semibold text-center">
          Home
        </Text>
      </ScrollHeader>

      <Animated.FlatList
        data={todayTasks}
        className="flex-1"
        renderItem={({ item }) => (
          <View className="px-6 mb-3">
            <TaskItem task={item} />
          </View>
        )}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
};

export default HomeScreen;

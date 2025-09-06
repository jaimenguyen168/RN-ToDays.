import { View, Text, Image, TouchableOpacity, Animated } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { TaskTypes } from "~/convex/schemas/tasks";
import { images } from "@/constants/images";
import { ScrollHeader } from "@/components/ScrollHeader";
import TaskItem from "@/modules/tasks/ui/components/TaskItem";
import EmptyState from "@/modules/activity/ui/components/EmptyState";
import { useQuery } from "convex/react";
import TaskGroupCard from "@/modules/home/ui/components/TaskGroupCard";
import { startOfToday } from "date-fns";

interface TaskCounts {
  completed: number;
  pending: number;
  onGoing: number;
  emergency: number;
}

const HomeView = () => {
  const router = useRouter();
  const { headerOpacity, handleScroll } = useScrollHeader(15);

  const user = useQuery(api.private.users.getUser);

  const allTasks = useQuery(api.private.tasks.getTasksWithFilters, {});
  const allRecurringTasks = useQuery(api.private.tasks.getRecurringTasks);

  const todayDate = startOfToday().getTime();
  const todayTasks = useQuery(api.private.tasks.getTasksForDate, {
    date: todayDate,
  });

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

      // Pending count - now using timestamp directly
      if (!task.isCompleted) {
        // task.endTime is already a timestamp, so compare directly
        if (task.endTime < now) {
          pending++;
        }
      }
    });

    return { completed, pending, onGoing, emergency };
  };

  const taskCounts = calculateTaskCounts();

  const renderHeader = () => (
    <View className="bg-background pt-20 gap-8">
      {/* Header */}
      <View className="mr-2">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-foreground text-2xl font-semibold">
              Hi, {user?.username}
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
            <TaskGroupCard
              title="Completed"
              count={taskCounts.completed}
              colors={["#84fab0", "#4ade80", "#22c55e"]}
              image={images.complete}
            />
            <TaskGroupCard
              title="Pending"
              count={taskCounts.pending}
              colors={["#818cf8", "#6366f1", "#4f46e5"]}
              icon="clock"
            />
          </View>

          <View className="gap-4 flex-1">
            <TaskGroupCard
              title="On Going"
              count={taskCounts.onGoing}
              colors={["#7dd3fc", "#22d3ee", "#06b6d4"]}
              icon="play-circle"
            />
            <TaskGroupCard
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
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/tasks",
                params: {
                  today: Boolean(true).toString(),
                },
              })
            }
          >
            <Text className="text-accent-foreground font-medium">View all</Text>
          </TouchableOpacity>
        </View>
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
        className="flex-1 px-6"
        renderItem={({ item }) => (
          <View className="mb-3">
            <TaskItem task={item} />
          </View>
        )}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="calendar"
            title="No tasks scheduled for today"
            description="Enjoy your free day!"
          />
        }
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
};
export default HomeView;

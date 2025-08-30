import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { TaskTypes } from "~/convex/schemas/tasks";
import { ThemedIcon, ThemedIconProps } from "@/components/ThemedIcon";
import TaskCard from "@/components/TaskCard";
import { images } from "@/constants/images";

interface TaskCounts {
  completed: number;
  pending: number;
  onGoing: number;
  emergency: number;
}

interface TodayTask {
  _id: string;
  title: string;
  startTime: string;
  endTime?: string;
  tags: string[];
  type: string;
  isRecurring?: boolean;
}

const HomeScreen = () => {
  const userId = "j57fgqzy3wkwx3381xw5ezvjcs7pga7v";

  const user = useQuery(api.private.users.getUser, {
    userId: userId as Id<"users">,
  });
  const allTasks = useQuery(api.private.tasks.getAllTasks, { userId });

  const getTodayTimestamp = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
  };

  // Helper function to check if a timestamp is today
  const isToday = (timestamp: number) => {
    const today = new Date();
    const date = new Date(timestamp);
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // Calculate task counts
  const calculateTaskCounts = (): TaskCounts => {
    if (!allTasks)
      return { completed: 0, pending: 0, onGoing: 0, emergency: 0 };

    const now = Date.now();
    const today = getTodayTimestamp();

    let completed = 0;
    let pending = 0;
    let onGoing = 0;
    let emergency = 0;

    allTasks.forEach((task) => {
      // Emergency count
      if (task.type === TaskTypes.EMERGENCY) {
        emergency++;
      }

      if (task.hasEndDate) {
        // Recurring task
        const weeklyCompletions = task.weeklyCompletions || {};
        completed += Object.keys(weeklyCompletions).length;

        // Check if task is ongoing (has future end date)
        if (task.endDate && task.endDate > now) {
          onGoing++;
        }
      } else {
        // One-time task
        if (task.isCompleted) {
          completed++;
        } else if (task.startDate > now) {
          // Future start date = pending
          pending++;
        } else {
          // Past or current start date but not completed = ongoing
          onGoing++;
        }
      }
    });

    return { completed, pending, onGoing, emergency };
  };

  const getTodayTasks = (): TodayTask[] => {
    if (!allTasks) return [];

    const today = getTodayTimestamp();
    const todayTasks: TodayTask[] = [];

    allTasks.forEach((task) => {
      if (task.hasEndDate) {
        // Recurring task - check if any recurring date is today
        if (task.recurringDates?.some((date) => isToday(date))) {
          todayTasks.push({
            _id: task._id,
            title: task.title,
            startTime: task.startTime,
            endTime: task.endTime,
            tags: task.tags,
            type: task.type,
            isRecurring: true,
          });
        }
      } else {
        // One-time task - check if start date is today
        if (isToday(task.startDate)) {
          todayTasks.push({
            _id: task._id,
            title: task.title,
            startTime: task.startTime,
            endTime: task.endTime,
            tags: task.tags,
            type: task.type,
            isRecurring: false,
          });
        }
      }
    });

    return todayTasks.sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const taskCounts = calculateTaskCounts();
  const todayTasks = getTodayTasks();

  const TodayTaskItem = ({ task }: { task: TodayTask }) => {
    const getTaskTypeColor = (type: string) => {
      switch (type) {
        case TaskTypes.EMERGENCY:
          return "border-l-red-500";
        case TaskTypes.PERSONAL:
          return "border-l-primary-500";
        case TaskTypes.JOB:
          return "border-l-purple-500";
        default:
          return "border-l-gray-500";
      }
    };

    const getTaskTypeBg = (type: string) => {
      switch (type) {
        case TaskTypes.EMERGENCY:
          return "bg-[#f87171]/20 dark:bg-[#f87171]/50";
        case TaskTypes.PERSONAL:
          return "bg-[#8F99EB]/10 dark:bg-[#8F99EB]/50";
        case TaskTypes.JOB:
          return "bg-[#16a34a]/20 dark:bg-[#16a34a]/50";
        default:
          return "bg-[#8F99EB]/10 dark:bg-[#8F99EB]/50";
      }
    };

    return (
      <View className={`p-4 rounded-2xl gap-4 ${getTaskTypeBg(task.type)}`}>
        <View className={`pl-4 border-l-[3px] ${getTaskTypeColor(task.type)}`}>
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-accent-foreground flex-1">
              {task.title}
            </Text>
            <TouchableOpacity>
              <ThemedIcon name="ellipsis-vertical" size={16} />
            </TouchableOpacity>
          </View>

          <Text className="text-accent-foreground font-light">
            {task.startTime} - {task.endTime}
          </Text>
        </View>

        <View className="flex-row items-center flex-wrap pl-4">
          {task.tags.map((tag, index) => (
            <View key={index} className="bg-input px-3 py-1 rounded-full mr-2">
              <Text className="text-xs font-semibold text-accent-foreground">
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
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
              colors={["#84fab0", "#4ade80", "#22c55e"]} // Very bright mint to green
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
    <FlatList
      data={todayTasks}
      className="flex-1 bg-background"
      renderItem={({ item }) => (
        <View className="px-6 mb-3">
          <TodayTaskItem task={item} />
        </View>
      )}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    />
  );
};

export default HomeScreen;

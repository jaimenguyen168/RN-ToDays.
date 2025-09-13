import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from "react-native";
import React, { useState, useMemo } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { ScrollHeader } from "@/components/ScrollHeader";
import TaskItem from "@/modules/tasks/ui/components/TaskItem";
import EmptyState from "@/modules/activity/ui/components/EmptyState";
import { IconLibrary, ThemedIcon } from "@/components/ThemedIcon";
import ActionButton from "@/components/ActionButton";
import SearchBar from "@/modules/tasks/ui/components/SearchBar";
import { Ionicons } from "@expo/vector-icons";
import { TaskTypes } from "~/convex/schemas/tasks";
import { Id } from "~/convex/_generated/dataModel";

// Filter types for secondary filtering
type SecondaryFilter =
  | "all"
  | "completed"
  | "pending"
  | "today"
  | "work"
  | "personal"
  | "emergency";

const TaskListView = () => {
  const router = useRouter();
  const { category, recurringId, recurringTitle } = useLocalSearchParams<{
    category: string;
    recurringId: string;
    recurringTitle: string;
  }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [secondaryFilter, setSecondaryFilter] =
    useState<SecondaryFilter>("all");
  const { headerOpacity, handleScroll } = useScrollHeader(15);

  // Check if current category is a task type that should show secondary filters
  const isTaskTypeCategory = () => {
    return ["work", "personal", "emergency"].includes(category?.toLowerCase());
  };

  // Check if current category is a status/time filter that should show type filters
  const isStatusCategory = () => {
    return ["completed", "pending", "today"].includes(category?.toLowerCase());
  };

  const getQueryArgs = () => {
    if (recurringId) {
      return { recurringId: recurringId as Id<"recurrings"> };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let baseArgs: any = {};

    // Set base filter based on category
    switch (category?.toLowerCase()) {
      case "completed":
        baseArgs.isCompleted = true;
        break;
      case "pending":
        baseArgs.isPending = true;
        break;
      case "emergency":
        baseArgs.type = TaskTypes.EMERGENCY;
        break;
      case "work":
        baseArgs.type = TaskTypes.WORK;
        break;
      case "personal":
        baseArgs.type = TaskTypes.PERSONAL;
        break;
      case "today":
        baseArgs.todayDate = today.getTime();
        break;
      default:
        break;
    }

    // Apply secondary filter if we're in a task type category
    if (isTaskTypeCategory()) {
      switch (secondaryFilter) {
        case "completed":
          baseArgs.isCompleted = true;
          break;
        case "pending":
          baseArgs.isPending = true;
          break;
        case "today":
          baseArgs.todayDate = today.getTime();
          break;
        default:
          break;
      }
    }

    // Apply type filter if we're in a status category
    if (isStatusCategory()) {
      switch (secondaryFilter) {
        case "work":
          baseArgs.type = TaskTypes.WORK;
          break;
        case "personal":
          baseArgs.type = TaskTypes.PERSONAL;
          break;
        case "emergency":
          baseArgs.type = TaskTypes.EMERGENCY;
          break;
        default:
          break;
      }
    }

    return baseArgs;
  };

  const allTasks = useQuery(
    api.private.tasks.getTasksWithFilters,
    getQueryArgs(),
  );

  const getTitle = (): string => {
    if (recurringTitle) {
      return recurringTitle;
    }

    switch (category?.toLowerCase()) {
      case "completed":
        return "Completed Tasks";
      case "pending":
        return "Pending Tasks";
      case "emergency":
        return "Emergency Tasks";
      case "work":
        return "Work Tasks";
      case "personal":
        return "Personal Tasks";
      case "today":
        return "Today's Tasks";
      default:
        return "All Tasks";
    }
  };

  // Get filter buttons based on category
  const getFilterButtons = () => {
    if (isTaskTypeCategory()) {
      return [
        { key: "all", label: "All", icon: "list" },
        { key: "completed", label: "Completed", icon: "check-circle" },
        { key: "pending", label: "Pending", icon: "clock" },
        { key: "today", label: "Today", icon: "calendar" },
      ];
    }

    if (isStatusCategory()) {
      return [
        { key: "all", label: "All", icon: "list" },
        { key: "work", label: "Work", icon: "briefcase" },
        { key: "personal", label: "Personal", icon: "user" },
        { key: "emergency", label: "Emergency", icon: "alert-triangle" },
      ];
    }

    return [];
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();

    return {
      dayMonth: `${day} ${month} ${year}`,
      monthYear: `${month} ${year}`,
    };
  };

  const filteredTasks = useMemo(() => {
    if (!allTasks) return [];

    let tasksToProcess = allTasks;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      tasksToProcess = tasksToProcess.filter(
        (task) =>
          task.title?.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.note?.toLowerCase().includes(query) ||
          task.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    const sortedTasks = tasksToProcess.sort((a, b) => {
      return a.date - b.date;
    });

    // Group tasks by date
    const grouped: any[] = [];
    const tasksByDate = new Map<string, any[]>();

    // Group all tasks by their date
    sortedTasks.forEach((task) => {
      const taskDate = new Date(task.date);
      const year = taskDate.getFullYear();
      const month = taskDate.getMonth();
      const day = taskDate.getDate();

      const dateKey = `${year}-${month}-${day}`;

      if (!tasksByDate.has(dateKey)) {
        tasksByDate.set(dateKey, []);
      }
      tasksByDate.get(dateKey)!.push(task);
    });

    // Create grouped structure with headers
    let currentMonth = "";

    // Sort dates chronologically
    const sortedDates = Array.from(tasksByDate.keys()).sort((a, b) => {
      const [yearA, monthA, dayA] = a.split("-").map(Number);
      const [yearB, monthB, dayB] = b.split("-").map(Number);
      const dateA = new Date(yearA, monthA, dayA);
      const dateB = new Date(yearB, monthB, dayB);
      return dateA.getTime() - dateB.getTime();
    });

    sortedDates.forEach((dateKey) => {
      const tasks = tasksByDate.get(dateKey)!;
      const firstTask = tasks[0];
      const taskDate = formatDate(firstTask.date);

      // Add month header if this is a new month
      if (currentMonth !== taskDate.monthYear) {
        currentMonth = taskDate.monthYear;
        grouped.push({
          type: "month",
          monthYear: taskDate.monthYear,
          _id: `month-${taskDate.monthYear}`,
        });
      }

      // Add date header with task count
      const taskCount = tasks.length;
      grouped.push({
        type: "date",
        date: taskDate.dayMonth,
        taskCount: taskCount,
        _id: `date-${dateKey}`,
      });

      // Add all tasks for this date
      tasks.forEach((task) => {
        grouped.push(task);
      });
    });

    return grouped;
  }, [allTasks, searchQuery]);

  const renderFilterButtons = () => {
    const buttons = getFilterButtons();
    if (buttons.length === 0) return null;

    return (
      <View className="flex-row gap-3 mb-4">
        {buttons.map((button) => (
          <TouchableOpacity
            key={button.key}
            onPress={() => setSecondaryFilter(button.key as SecondaryFilter)}
            className={`flex-row items-center px-4 py-2 rounded-full border ${
              secondaryFilter === button.key
                ? "bg-app-primary border-app-primary"
                : "bg-background border-border"
            }`}
          >
            <ThemedIcon
              name={button.icon as any}
              size={14}
              library="feather"
              lightColor={
                secondaryFilter === button.key ? "#ffffff" : "#1a1a1a"
              }
              darkColor="#ffffff"
            />
            <Text
              className={`ml-2 text-sm font-medium ${
                secondaryFilter === button.key
                  ? "text-white"
                  : "text-foreground"
              }`}
            >
              {button.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTaskItem = ({ item }: { item: any }) => {
    if (item.type === "month") {
      return (
        <View className="mt-6 mb-4 flex-row items-center gap-2">
          <ThemedIcon name="calendar-outline" size={16} />
          <Text className="text-foreground font-semibold">
            {item.monthYear}
          </Text>
        </View>
      );
    }

    if (item.type === "date") {
      return (
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-muted-foreground text-sm font-medium">
            {item.date}
          </Text>
          {item.taskCount > 1 && (
            <View className="bg-app-primary/10 px-2 py-1 rounded-full">
              <Text className="text-app-primary text-xs font-medium">
                {item.taskCount} tasks
              </Text>
            </View>
          )}
        </View>
      );
    }

    return (
      <View className="mb-3">
        <TaskItem task={item} key={item._id} />
      </View>
    );
  };

  const renderEmptyState = () => {
    const getEmptyStateConfig = () => {
      switch (category) {
        case "completed":
          return {
            icon: "check-circle",
            title: "No completed tasks",
            description: "Complete some tasks to see them here",
            library: "fontawesome6",
          };
        case "pending":
          return {
            icon: "clock",
            title: "No pending tasks",
            description: "Great! You're all caught up with overdue tasks",
            library: "fontawesome6",
          };
        case "emergency":
          return {
            icon: "alert-triangle",
            title: "No emergency tasks",
            description: "No urgent tasks at the moment",
            library: "feather",
          };
        case "work":
          return {
            icon: "briefcase",
            title: "No work tasks",
            description: "No work-related tasks found",
            library: "feather",
          };
        case "personal":
          return {
            icon: "user",
            title: "No personal tasks",
            description: "No personal tasks found",
            library: "feather",
          };
        case "today":
          return {
            icon: "calendar",
            title: "No tasks for today",
            description: "Your schedule is clear for today",
            library: "feather",
          };
        default:
          return {
            icon: "calendar",
            title: "No tasks found",
            description: "Try adjusting your search or add new tasks",
            library: "feather",
          };
      }
    };

    const config = getEmptyStateConfig();

    if (searchQuery.trim()) {
      return (
        <EmptyState
          icon="search"
          title="No tasks found"
          description={`No tasks match "${searchQuery}"`}
          library="feather"
        />
      );
    }

    return (
      <View className="pt-4">
        <EmptyState
          icon={config.icon}
          title={config.title}
          description={config.description}
          library={config.library as IconLibrary}
        />
      </View>
    );
  };

  const renderMainContent = () => (
    <View className="flex-1">
      {/* Header Content */}
      <View className="px-6 pt-4 gap-6">
        {/* Header with back button and title */}
        <View className="flex-row items-center mb-2">
          <ActionButton
            onPress={() => router.back()}
            icon="arrow-left"
            iconLibrary="feather"
            size={20}
          />
          <View className="flex-1 items-center">
            <Text className="text-foreground text-xl font-semibold">
              {getTitle()}
            </Text>
          </View>
          <View className="w-10" />
        </View>

        {/* Search Bar */}
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        {/* Filter Buttons */}
        {renderFilterButtons()}

        {/* Results count */}
        {searchQuery.trim() && (
          <Text className="text-muted-foreground text-sm">
            {filteredTasks.filter((item) => !item.type).length} task
            {filteredTasks.filter((item) => !item.type).length !== 1
              ? "s"
              : ""}{" "}
            found
          </Text>
        )}

        {/* Tasks FlatList */}
        <Animated.FlatList
          data={filteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={20}
          className="-mt-6"
          contentContainerStyle={{
            flexGrow: 1,
          }}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={<View className="h-16" />}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background relative">
      {/* Animated Top Bar */}
      <ScrollHeader opacity={headerOpacity} height={95}>
        <View className="flex-row items-center justify-between px-6">
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedIcon name="chevron-left" size={20} library="feather" />
          </TouchableOpacity>
          <Text className="text-foreground text-lg font-semibold">
            {getTitle()}
          </Text>
        </View>
      </ScrollHeader>

      <Animated.FlatList
        data={[{ id: "main-content" }]}
        renderItem={renderMainContent}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* Floating action button for adding new tasks */}
      <TouchableOpacity
        onPress={() => router.push("/add-task")}
        className="absolute bottom-8 right-8 w-14 h-14 bg-app-primary rounded-full items-center justify-center"
        style={{
          elevation: 10,
          shadowColor: "#5B67CA",
          shadowOffset: {
            width: 0,
            height: 8,
          },
        }}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default TaskListView;

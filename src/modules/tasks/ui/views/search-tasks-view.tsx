import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from "react-native";
import React, { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { ScrollHeader } from "@/components/ScrollHeader";
import TaskItem from "@/modules/tasks/ui/components/TaskItem";
import EmptyState from "@/modules/activity/ui/components/EmptyState";
import { ThemedIcon } from "@/components/ThemedIcon";
import ActionButton from "@/components/ActionButton";
import SearchBar from "@/modules/tasks/ui/components/SearchBar";
import { Ionicons } from "@expo/vector-icons";
import { useDebounce } from "@/modules/tasks/hooks/useDebounce";

const SearchTasksView = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { headerOpacity, handleScroll } = useScrollHeader(15);

  // Search query - only run when there's a search term
  const searchResults = useQuery(
    api.private.tasks.searchTasks,
    debouncedSearchQuery.trim()
      ? { searchQuery: debouncedSearchQuery }
      : "skip",
  );

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

  const groupedTasks = useMemo(() => {
    if (!searchResults || searchResults.length === 0) return [];

    const sortedTasks = searchResults.sort((a, b) => {
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
  }, [searchResults]);

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
    // If there's a search query but no results
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

    // Default empty state for search
    return (
      <View className="pt-4">
        <EmptyState
          icon="search"
          title="Search your tasks"
          description="Enter a search term to find your tasks by title, description, notes, or tags"
          library="feather"
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
              Search Tasks
            </Text>
          </View>
          <View className="w-10" />
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tasks, notes, or tags..."
        />

        {/* Results count - only show when searching and have results */}
        {searchQuery.trim() && searchResults && (
          <Text className="text-muted-foreground text-sm">
            {searchResults.length} task{searchResults.length !== 1 ? "s" : ""}{" "}
            found
          </Text>
        )}

        {/* Tasks FlatList */}
        <Animated.FlatList
          data={groupedTasks}
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
            Search Tasks
          </Text>
          <View className="w-6" />
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

export default SearchTasksView;

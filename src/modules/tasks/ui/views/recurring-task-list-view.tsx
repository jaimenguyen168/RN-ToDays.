import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  FlatList,
} from "react-native";
import React, { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { ScrollHeader } from "@/components/ScrollHeader";
import RecurringTaskItem from "@/modules/tasks/ui/components/RecurringTaskItem";
import EmptyState from "@/modules/activity/ui/components/EmptyState";
import { IconLibrary, ThemedIcon } from "@/components/ThemedIcon";
import ActionButton from "@/components/ActionButton";
import SearchBar from "@/modules/tasks/ui/components/SearchBar";
import { Ionicons } from "@expo/vector-icons";
import { TaskTypes } from "~/convex/schemas/tasks";
import { Doc } from "~/convex/_generated/dataModel";

const RecurringTaskListView = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { headerOpacity, handleScroll } = useScrollHeader(15);

  const allRecurringTasks = useQuery(api.private.tasks.getRecurringTasks);

  const filteredRecurringTasks = useMemo(() => {
    if (!allRecurringTasks) return [];

    let filtered = allRecurringTasks;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (recurringTask: Doc<"recurrings">) =>
          recurringTask.title?.toLowerCase().includes(query) ||
          recurringTask.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Sort by title alphabetically
    return filtered.sort((a: any, b: any) => a.title.localeCompare(b.title));
  }, [allRecurringTasks, searchQuery]);

  const groupedRecurringTasks = useMemo(() => {
    const grouped: any[] = [];
    const tasksByType = new Map<string, any[]>();

    // Group recurring tasks by type
    filteredRecurringTasks.forEach((recurringTask: Doc<"recurrings">) => {
      const type = recurringTask.type;
      if (!tasksByType.has(type)) {
        tasksByType.set(type, []);
      }
      tasksByType.get(type)!.push(recurringTask);
    });

    // Create grouped structure with type headers
    const typeOrder = [TaskTypes.EMERGENCY, TaskTypes.WORK, TaskTypes.PERSONAL];

    typeOrder.forEach((type) => {
      const tasks = tasksByType.get(type);
      if (tasks && tasks.length > 0) {
        // Add type header
        grouped.push({
          type: "header",
          taskType: type,
          count: tasks.length,
          _id: `header-${type}`,
        });

        // Add all recurring tasks for this type
        tasks.forEach((recurringTask) => {
          grouped.push(recurringTask);
        });
      }
    });

    return grouped;
  }, [filteredRecurringTasks]);

  const getTypeIconAndLib = (
    type: string,
  ): { icon: string; library: IconLibrary } => {
    switch (type) {
      case TaskTypes.EMERGENCY:
        return { icon: "calendar-alert", library: "material-community" };
      case TaskTypes.WORK:
        return { icon: "briefcase-outline", library: "material-community" };
      case TaskTypes.PERSONAL:
        return { icon: "user", library: "fontawesome6" };
      default:
        return { icon: "circle", library: "feather" };
    }
  };

  const renderRecurringTaskItem = ({ item }: { item: any }) => {
    if (item.type === "header") {
      return (
        <View className="mt-6 mb-4 flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-2">
            <ThemedIcon
              name={getTypeIconAndLib(item.taskType).icon as any}
              size={16}
              library={getTypeIconAndLib(item.taskType).library}
            />
            <Text className="text-foreground font-semibold">
              {item.taskType}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/task-list",
                params: { category: item.taskType },
              })
            }
          >
            <Text className="text-app-primary text-xs font-medium">
              {item.count} recurring task{item.count !== 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="mb-3">
        <RecurringTaskItem
          recurringTask={item}
          key={item._id}
          onPress={() =>
            router.push({
              pathname: "/task-list",
              params: { recurringId: item._id, recurringTitle: item.title },
            })
          }
        />
      </View>
    );
  };

  const renderEmptyState = () => {
    if (searchQuery.trim()) {
      return (
        <EmptyState
          icon="search"
          title="No recurring tasks found"
          description={`No recurring tasks match "${searchQuery}"`}
          library="ionicons"
        />
      );
    }

    return (
      <View className="pt-4">
        <EmptyState
          icon="refresh"
          title="No recurring tasks"
          description="Create recurring tasks to automate your schedule"
          library="ionicons"
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
              Recurring Tasks
            </Text>
          </View>
          <View className="w-10" />
        </View>

        {/* Search Bar */}
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        {/* Results count */}
        {searchQuery.trim() && (
          <Text className="text-muted-foreground text-sm">
            {filteredRecurringTasks.length} recurring task
            {filteredRecurringTasks.length !== 1 ? "s" : ""} found
          </Text>
        )}

        {/* Summary stats */}
        {!searchQuery.trim() &&
          allRecurringTasks &&
          allRecurringTasks.length > 0 && (
            <View className="flex-row items-center gap-4">
              <View className="bg-muted px-3 py-2 rounded-full">
                <Text className="text-muted-foreground text-sm font-medium">
                  {allRecurringTasks.length} total
                </Text>
              </View>
            </View>
          )}

        {/* Recurring Tasks FlatList */}
        <FlatList
          data={groupedRecurringTasks}
          renderItem={renderRecurringTaskItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={20}
          className="-mt-6"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 100,
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
            Recurring Tasks
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

      {/* Floating action button for adding new recurring tasks */}
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
export default RecurringTaskListView;

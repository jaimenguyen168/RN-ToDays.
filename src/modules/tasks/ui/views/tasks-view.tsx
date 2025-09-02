import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { TimeSlot, useTimeSlots } from "@/modules/tasks/hooks/useTimeSlots";
import { ThemedIcon } from "@/components/ThemedIcon";
import { subtractOneMinute } from "@/utils/time";
import TaskItem from "@/modules/tasks/ui/components/TaskItem";
import WeekNavigation from "@/modules/tasks/ui/components/WeekNavigation";
import { ScrollHeader } from "@/components/ScrollHeader";

const TasksView = () => {
  const router = useRouter();

  const userId = "j57fgqzy3wkwx3381xw5ezvjcs7pga7v";
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  const { headerOpacity, handleScroll } = useScrollHeader(15);

  const tasksForDate = useQuery(api.private.tasks.getTasksForDate, {
    userId,
    date: selectedDate.getTime(),
  });

  const isPast = selectedDate.getTime() < new Date().setHours(0, 0, 0, 0);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Use the custom hook for time slots
  const timeSlots = useTimeSlots(tasksForDate);

  const handleAddTask = () => {
    router.push({
      pathname: "/add-task",
      params: { selectedDate: selectedDate.toISOString() },
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const renderTimeSlot = ({ item: timeSlot }: { item: TimeSlot }) => (
    <View>
      {timeSlot.isFreeTime ? (
        <View className="flex-row mb-4 px-6">
          <View className={`w-16`}>
            <View className="justify-between flex-1">
              <Text className="text-muted-foreground font-medium text-sm">
                {timeSlot.time}
              </Text>
              <Text className="text-muted-foreground font-medium text-sm">
                {subtractOneMinute(timeSlot.endTime)}
              </Text>
            </View>
          </View>

          <View className="justify-between items-center w-1">
            {Array.from({ length: 7 }).map((_, dotIndex) => (
              <View
                key={dotIndex}
                className="w-0.5 bg-muted-foreground"
                style={{ height: 4, marginVertical: 2 }}
              />
            ))}
          </View>

          <View className="flex-1 ml-4 h-20 justify-center">
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-2">
                <ThemedIcon
                  name="coffee"
                  size={16}
                  library="feather"
                  lightColor="#64748B"
                  darkColor="#94A3B8"
                />
                <Text className="text-muted-foreground italic">
                  ~ {timeSlot.freeTime}
                </Text>
              </View>
              {!isPast && (
                <TouchableOpacity onPress={handleAddTask}>
                  <Text className="text-accent-foreground font-medium">
                    + Add
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View className="flex-row mb-4 px-6 ">
          <View className="w-16 -mt-1">
            <View className="justify-between flex-1">
              <Text className="text-accent-foreground font-semibold">
                {timeSlot.time}
              </Text>
              <Text className="text-muted-foreground font-medium text-sm">
                {subtractOneMinute(timeSlot.endTime)}
              </Text>
            </View>
          </View>

          <View className="justify-between items-center w-1">
            {Array.from({
              length: timeSlot.hasOverlap ? 24 : timeSlot.isEmpty ? 6 : 10,
            }).map((_, dotIndex) => (
              <View
                key={dotIndex}
                className="w-0.5 bg-muted-foreground"
                style={{ height: 4, marginVertical: 2 }}
              />
            ))}
          </View>

          <View className="flex-1 ml-4">
            {timeSlot.isEmpty ? (
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-400">
                  {timeSlot.freeTime || "You don't have any schedule"}
                </Text>
                {!isPast && (
                  <TouchableOpacity onPress={handleAddTask}>
                    <Text className="text-accent-foreground font-medium">
                      + Add
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <>
                {timeSlot.tasks.map((task) => (
                  <View
                    className={`${timeSlot.hasOverlap && "mb-2"}`}
                    key={task._id}
                  >
                    <TaskItem task={task} />
                  </View>
                ))}
                {timeSlot.hasOverlap && (
                  <View className="flex-row items-center gap-2 bg-yellow-100 border border-yellow-200 rounded-lg p-2 dark:bg-yellow-900/30 dark:border-yellow-700/50">
                    <ThemedIcon
                      name="alert-triangle"
                      size={12}
                      library="feather"
                      lightColor="#D97706"
                      darkColor="#FBBF24"
                    />
                    <Text className="text-amber-700 text-sm font-medium dark:text-amber-300">
                      {timeSlot.tasks.length} tasks overlapped
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );

  const renderMainContent = () => (
    <View className="flex-1">
      {/* Header Content */}
      <View className="px-6 pt-4 gap-6">
        {/* Search Bar */}
        <View className="flex-row items-center bg-muted rounded-full px-4 h-14 gap-3">
          <ThemedIcon name="search" size={20} />
          <TextInput
            placeholder="Search for task"
            className="flex-1 text-foreground"
            placeholderTextColor="#9CA3AF"
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              className="p-3"
            >
              <ThemedIcon name="xmark" size={16} library="fontawesome6" />
            </TouchableOpacity>
          )}
        </View>

        {/* Task Title and Date */}
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-semibold text-foreground justify-center -mb-2">
            Task
          </Text>
          <TouchableOpacity
            className="flex-row items-center gap-2"
            onPress={() => router.push("/activity")}
          >
            <ThemedIcon
              name="calendar-outline"
              size={16}
              lightColor="#64748B"
              darkColor="#94A3B8"
            />
            <Text className="text-muted-foreground text-sm">
              {formatDate(selectedDate)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Week Navigation - Now using the component */}
        <WeekNavigation
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />

        {/* Today/Selected Date Section */}
        <View className="mb-6 mt-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-semibold text-foreground">
              {isToday(selectedDate)
                ? "Today"
                : selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
            </Text>
            {isToday(selectedDate) && (
              <View className="flex-row items-center gap-2">
                <ThemedIcon
                  name="clock"
                  size={16}
                  lightColor="#64748B"
                  darkColor="#94A3B8"
                  library="fontawesome6"
                />
                <Text className="text-muted-foreground">
                  {getCurrentTime()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Time Slots FlatList */}
      <Animated.FlatList
        data={timeSlots}
        renderItem={renderTimeSlot}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={8}
        windowSize={8}
        initialNumToRender={6}
      />

      {/* Footer spacing */}
      <View className="h-36" />
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Animated Top Bar */}
      <ScrollHeader opacity={headerOpacity}>
        <View className="flex-row justify-between items-center px-6">
          <Text className="text-lg font-semibold text-foreground">Task</Text>
          <Text className="text-muted-foreground">
            {isToday(selectedDate) ? "Today" : formatDate(selectedDate)}
          </Text>
        </View>
      </ScrollHeader>

      <Animated.FlatList
        data={[{ id: "main-content" }]}
        renderItem={renderMainContent}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 56,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
};
export default TasksView;

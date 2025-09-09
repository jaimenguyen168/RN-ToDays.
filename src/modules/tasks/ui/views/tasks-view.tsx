import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { TimeSlot, useTimeSlots } from "@/modules/tasks/hooks/useTimeSlots";
import { ThemedIcon } from "@/components/ThemedIcon";
import { hasPassed, subtractMinutes } from "@/utils/time";
import TaskItem from "@/modules/tasks/ui/components/TaskItem";
import WeekNavigation from "@/modules/tasks/ui/components/WeekNavigation";
import { ScrollHeader } from "@/components/ScrollHeader";
import { format, isAfter, isBefore, isSameDay } from "date-fns";
import SearchBar from "@/modules/tasks/ui/components/SearchBar";

const TasksView = () => {
  const router = useRouter();
  const { today } = useLocalSearchParams<{
    today: string;
  }>();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  const { headerOpacity, handleScroll } = useScrollHeader(15);

  useFocusEffect(
    React.useCallback(() => {
      if (!!today) {
        setSelectedDate(new Date());
        router.setParams({ today: undefined });
      }
    }, [today, router]),
  );

  const tasksForDate = useQuery(api.private.tasks.getTasksForDate, {
    date: selectedDate.getTime(),
  });

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Use the custom hook for time slots
  const timeSlots = useTimeSlots(tasksForDate);

  const canAddTask = (timeSlot: TimeSlot) => {
    const today = new Date();

    if (isBefore(selectedDate, today) && !isSameDay(selectedDate, today)) {
      return false;
    }

    if (isAfter(selectedDate, today) && !isSameDay(selectedDate, today)) {
      return true;
    }

    return !hasPassed(timeSlot.endTimestamp);
  };

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

  const renderTimeSlot = ({
    item: timeSlot,
    isLast,
  }: {
    item: TimeSlot;
    isLast: boolean;
  }) => (
    <View>
      {timeSlot.isFreeTime ? (
        <View className="flex-row mb-4 px-6">
          <View className={`w-16`}>
            <View className="justify-between flex-1">
              <Text className="text-muted-foreground font-medium text-sm">
                {format(timeSlot.startTimestamp, "HH:mm")}
              </Text>
              <Text className="text-muted-foreground font-medium text-sm">
                {subtractMinutes(timeSlot.endTimestamp, isLast ? 0 : 1)}
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
              {canAddTask(timeSlot) ? (
                <>
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

                  <TouchableOpacity onPress={handleAddTask}>
                    <Text className="text-accent-foreground font-medium">
                      + Add
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View className="flex-row items-center gap-2">
                  <ThemedIcon
                    name="bed-outline"
                    size={16}
                    lightColor="#64748B"
                    darkColor="#94A3B8"
                  />
                  <Text className="text-muted-foreground italic">
                    ~ Relax and recharge
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View className="flex-row mb-4 px-6 ">
          <View className="w-16 -mt-1">
            <View className="justify-between flex-1">
              <Text className="text-accent-foreground font-semibold">
                {format(timeSlot.startTimestamp, "HH:mm")}
              </Text>
              <Text className="text-muted-foreground font-medium text-sm">
                {subtractMinutes(timeSlot.endTimestamp, 1)}
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
                {canAddTask(timeSlot) && (
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
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

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
        renderItem={({ item, index }) =>
          renderTimeSlot({ item, isLast: index === timeSlots.length - 1 })
        }
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
    <SafeAreaView className="flex-1 bg-background">
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
        contentContainerStyle={{ flexGrow: 1 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </SafeAreaView>
  );
};
export default TasksView;

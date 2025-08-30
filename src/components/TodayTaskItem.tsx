import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ThemedIcon } from "@/components/ThemedIcon";
import { TaskTypes } from "~/convex/schemas/tasks";
import { hasTimePassed } from "@/utils/time-passed";

interface TodayTask {
  _id: string;
  title: string;
  startTime: string;
  endTime?: string;
  tags: string[];
  type: string;
  isRecurring?: boolean;
  // For one-time tasks
  isCompleted?: boolean;
  // For recurring tasks
  weeklyCompletions?: Record<
    string,
    { isCompleted: boolean; completedAt?: number }
  >;
}

interface TodayTaskItemProps {
  task: TodayTask;
  onPress?: () => void;
}

const TodayTaskItem = ({ task, onPress }: TodayTaskItemProps) => {
  console.log("Task", task);

  const getTaskColors = (type: string) => {
    switch (type) {
      case TaskTypes.EMERGENCY:
        return {
          borderColor: "border-l-red-500",
          backgroundColor: "bg-red-100/60 dark:bg-red-800/30",
          tagBackground: "bg-red-200 dark:bg-red-800/60",
          tagText: "text-red-600 dark:text-red-200",
          iconColor: "#ef4444",
        };
      case TaskTypes.PERSONAL:
        return {
          borderColor: "border-l-primary-500",
          backgroundColor: "bg-primary-200/60 dark:bg-primary-500/30",
          tagBackground: "bg-primary-300/30 dark:bg-primary-500",
          tagText: "text-primary-500 dark:text-primary-200",
          iconColor: "#3b82f6",
        };
      case TaskTypes.JOB:
        return {
          borderColor: "border-l-green-500",
          backgroundColor: "bg-green-50/80 dark:bg-green-700/30",
          tagBackground: "bg-green-100 dark:bg-green-500/40",
          tagText: "text-green-700 dark:text-green-200",
          iconColor: "#22c55e",
        };
      default:
        return {
          borderColor: "border-l-gray-500",
          backgroundColor: "bg-gray-50/80 dark:bg-gray-950/30",
          tagBackground: "bg-gray-100 dark:bg-gray-900/40",
          tagText: "text-gray-700 dark:text-gray-300",
          iconColor: "#6b7280",
        };
    }
  };

  // Check if task is completed
  const isTaskCompleted = () => {
    if (task.isRecurring && task.weeklyCompletions) {
      // For recurring tasks, check today's completion
      const today = new Date().toDateString();
      console.log("This block 1");
      return task.weeklyCompletions[today]?.isCompleted || false;
    }

    console.log("This block 2");
    // For one-time tasks
    return task.isCompleted || false;
  };

  const colors = getTaskColors(task.type);
  const completed = isTaskCompleted();
  const timeHasPassed = hasTimePassed(task.endTime);

  console.log("Task completed", task.title, completed);

  return (
    <TouchableOpacity
      className={`p-4 rounded-2xl gap-4 ${colors.backgroundColor}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className={`pl-4 border-l-[3px] ${colors.borderColor}`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 gap-2">
            <Text
              className={`text-lg font-semibold ${colors.tagText} ${
                completed ? "line-through opacity-60" : ""
              }`}
            >
              {task.title}
            </Text>

            {completed && (
              <ThemedIcon
                name="checkmark-done"
                size={20}
                lightColor={colors.iconColor}
                darkColor={colors.iconColor}
              />
            )}
          </View>
          <TouchableOpacity>
            <ThemedIcon name="ellipsis-vertical" size={16} />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-2">
          <Text
            className={`${colors.tagText} font-light gap-3 ${
              timeHasPassed || completed ? "line-through opacity-60" : ""
            }`}
          >
            {task.startTime} - {task.endTime}
          </Text>
          <Text className={` font-medium ${colors.tagText} opacity-70`}>
            {task.isRecurring && "(Recurring)"}
          </Text>
        </View>
      </View>

      {/* Tags */}
      {task.tags.length > 0 && (
        <View className="flex-row items-center flex-wrap pl-4 gap-2">
          {task.tags.map((tag, index) => (
            <View
              key={index}
              className={`${colors.tagBackground} px-3 py-1 rounded-full`}
            >
              <Text className={`text-xs font-semibold ${colors.tagText}`}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default TodayTaskItem;

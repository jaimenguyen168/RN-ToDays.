import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ThemedIcon } from "@/components/ThemedIcon";
import { TaskTypes } from "~/convex/schemas/tasks";
import { hasTimePassed } from "@/utils/time-passed";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

interface TodayTask {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  tags: string[];
  type: string;
  isCompleted: boolean;
  note?: string;
}

interface TodayTaskItemProps {
  task: TodayTask;
  onPress?: () => void;
}

const TodayTaskItem = ({ task, onPress }: TodayTaskItemProps) => {
  const toggleCompleted = useMutation(api.private.tasks.toggleCompleted);

  const handleToggleCompleted = async () => {
    await toggleCompleted({
      taskId: task._id as Id<"tasks">,
    });
  };

  const getTaskColors = (type: string) => {
    switch (type) {
      case TaskTypes.EMERGENCY:
        return {
          borderColor: "border-l-red-500",
          backgroundColor: "bg-red-100/40 dark:bg-red-800/30",
          tagBackground: "bg-red-200/60 dark:bg-red-800/60",
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

  const colors = getTaskColors(task.type);
  const timeHasPassed = hasTimePassed(task.endTime);

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
                task.isCompleted ? "line-through opacity-60" : ""
              }`}
            >
              {task.title}
            </Text>

            {task.isCompleted && (
              <ThemedIcon
                name="checkmark-done"
                size={20}
                lightColor={colors.iconColor}
                darkColor={colors.iconColor}
              />
            )}
          </View>
          <TouchableOpacity onPress={handleToggleCompleted}>
            <ThemedIcon name="ellipsis-vertical" size={16} />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-2">
          <Text
            className={`${colors.tagText} font-light gap-3 ${
              timeHasPassed || task.isCompleted ? "line-through opacity-60" : ""
            }`}
          >
            {task.startTime} - {task.endTime}
          </Text>
        </View>

        {/* Note */}
        {task.note && (
          <Text className={`${colors.tagText} text-sm opacity-70 mt-1`}>
            {task.note}
          </Text>
        )}
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

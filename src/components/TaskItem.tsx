import React from "react";
import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { ThemedIcon } from "@/components/ThemedIcon";
import { TaskTypes } from "~/convex/schemas/tasks";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { useRouter } from "expo-router";
import { Task } from "@/types";
import { hasTimePassed } from "@/utils/time";

interface TaskItemProps {
  task: Task;
  onPress?: () => void;
}

const TaskItem = ({ task, onPress }: TaskItemProps) => {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const toggleCompleted = useMutation(api.private.tasks.toggleCompleted);

  const handleToggleCompleted = async () => {
    await toggleCompleted({
      taskId: task._id as Id<"tasks">,
    });
  };

  const handleEditTask = () => {
    router.push({
      pathname: "/edit-task",
      params: { taskId: task._id },
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
          iconColor: "#dc2626",
          iconColorDark: "#fca5a5",
        };
      case TaskTypes.PERSONAL:
        return {
          borderColor: "border-l-primary-500",
          backgroundColor: "bg-primary-200/60 dark:bg-primary-500/30",
          tagBackground: "bg-primary-300/30 dark:bg-primary-400/30",
          tagText: "text-primary-500 dark:text-primary-200",
          iconColor: "#5B67CA",
          iconColorDark: "#ECEAFF",
        };
      case TaskTypes.JOB:
        return {
          borderColor: "border-l-green-500",
          backgroundColor: "bg-green-50/80 dark:bg-green-800/30",
          tagBackground: "bg-green-400/30 dark:bg-green-700/40",
          tagText: "text-green-700 dark:text-green-200",
          iconColor: "#15803d",
          iconColorDark: "#bbf7d0",
        };
      default:
        return {
          borderColor: "border-l-gray-500",
          backgroundColor: "bg-gray-50/80 dark:bg-gray-900/30",
          tagBackground: "bg-gray-100/60 dark:bg-gray-800/40",
          tagText: "text-gray-700 dark:text-gray-300",
          iconColor: "#374151",
          iconColorDark: "#d1d5db",
        };
    }
  };

  const colors = getTaskColors(task.type);
  const timeHasPassed = hasTimePassed(task.endTime, task.date);

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

          {/* Dropdown Menu */}
          <Menu>
            <MenuTrigger>
              <ThemedIcon name="ellipsis-vertical" size={16} />
            </MenuTrigger>
            <MenuOptions
              customStyles={{
                optionsContainer: {
                  backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "white",
                  borderRadius: 12,
                  padding: 4,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                },
              }}
            >
              <MenuOption onSelect={handleToggleCompleted}>
                <View className="flex-row items-center px-3 py-2 gap-3">
                  <ThemedIcon
                    name={task.isCompleted ? "close" : "checkmark"}
                    size={16}
                    lightColor={task.isCompleted ? "#ef4444" : "#22c55e"}
                    darkColor={task.isCompleted ? "#ef4444" : "#22c55e"}
                  />
                  <Text className="text-foreground font-medium">
                    {task.isCompleted
                      ? "Mark as Incomplete"
                      : "Mark as Complete"}
                  </Text>
                </View>
              </MenuOption>

              <MenuOption onSelect={handleEditTask}>
                <View className="flex-row items-center px-3 py-2 gap-3">
                  <ThemedIcon
                    name="edit"
                    size={16}
                    lightColor="#6366f1"
                    darkColor="#818cf8"
                    library="antdesign"
                  />
                  <Text className="text-foreground font-medium">Edit Task</Text>
                </View>
              </MenuOption>
            </MenuOptions>
          </Menu>
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

export default TaskItem;

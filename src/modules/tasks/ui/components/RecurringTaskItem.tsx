import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { ThemedIcon } from "@/components/ThemedIcon";
import { format } from "date-fns";
import DropdownMenu, { MenuItem } from "@/components/DropdownMenu";
import { TaskTypes } from "~/convex/schemas/tasks";
import { RecurringTask } from "@/types";
import { formatWeekDays } from "@/utils/time";

interface RecurringTaskItemProps {
  recurringTask: RecurringTask;
  onPress?: () => void;
}

const RecurringTaskItem = ({
  recurringTask,
  onPress,
}: RecurringTaskItemProps) => {
  const handleDeletePress = async () => {
    Alert.alert(
      "Delete Recurring Task",
      `Are you sure you want to delete "${recurringTask.title}"? This will also delete all associated tasks.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
            } catch (error) {
              console.error("Error deleting recurring task:", error);
              Alert.alert("Error", "Failed to delete recurring task");
            }
          },
        },
      ],
    );
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
      case TaskTypes.WORK:
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

  const colors = getTaskColors(recurringTask.type);

  const recurringMenuItems: MenuItem[] = [
    {
      title: "Edit Recurring",
      icon: "edit",
      library: "antdesign",
      lightColor: "#6366f1",
      darkColor: "#818cf8",
      onPress: () => {},
    },
    {
      title: "Delete Recurring",
      icon: "delete-outline",
      library: "material-community",
      lightColor: "#ef4444",
      darkColor: "#ef4444",
      onPress: handleDeletePress,
    },
  ];

  return (
    <TouchableOpacity
      className={`p-4 rounded-2xl gap-4 ${colors.backgroundColor}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className={`pl-4 border-l-[3px] ${colors.borderColor}`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 gap-2">
            <ThemedIcon
              name="refresh"
              size={16}
              lightColor={colors.iconColor}
              darkColor={colors.iconColorDark}
            />
            <Text
              className={`text-lg font-semibold ${colors.tagText} ${
                !recurringTask.isActive ? "line-through opacity-60" : ""
              }`}
            >
              {recurringTask.title}
            </Text>
          </View>

          {/* Dropdown Menu */}
          <DropdownMenu menuItems={recurringMenuItems} menuWidth={190}>
            <ThemedIcon name="ellipsis-vertical" size={16} />
          </DropdownMenu>
        </View>

        <View className="flex-row items-center gap-2 mt-1">
          <Text className={`${colors.tagText} font-light text-sm`}>
            {formatWeekDays(recurringTask.selectedWeekDays)}
          </Text>

          <Text className={`${colors.tagText} text-sm mb-1`}>|</Text>

          <Text className={`${colors.tagText} font-light text-sm`}>
            {format(recurringTask.startDate, "MMM d")} -{" "}
            {format(recurringTask.endDate, "MMM d, yyyy")}
          </Text>
        </View>

        {/* Task count */}
        <View className="flex-row items-center gap-2 mt-1">
          <Text className={`${colors.tagText} font-medium text-sm`}>
            {recurringTask.taskCount} tasks
          </Text>
        </View>
      </View>

      {/* Tags */}
      {recurringTask.tags.length > 0 && (
        <View className="flex-row items-center flex-wrap pl-4 gap-2">
          {recurringTask.tags.map((tag, index) => (
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

export default RecurringTaskItem;

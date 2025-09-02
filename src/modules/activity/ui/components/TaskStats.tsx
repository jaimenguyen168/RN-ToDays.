import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { format, isSameDay } from "date-fns";
import { ThemedIcon } from "@/components/ThemedIcon";
import { Task } from "@/types";

interface TaskStatsProps {
  selectedDate: number;
  tasks: Task[] | undefined;
}

const TaskStats = ({ selectedDate, tasks }: TaskStatsProps) => {
  const selectedDateObj = new Date(selectedDate);

  const selectedDateTasks = useMemo(() => {
    if (!tasks) return [];

    return tasks.filter((task: Task) => {
      const taskDate = new Date(task.date);
      return isSameDay(taskDate, selectedDateObj);
    });
  }, [tasks]);

  const formattedDate = isSameDay(selectedDateObj, new Date())
    ? "Today"
    : format(selectedDateObj, "EEE, MMM d, yyyy");

  const total = selectedDateTasks.length;
  const completed = selectedDateTasks.filter(
    (task: Task) => task.isCompleted,
  ).length;

  const completionPercentage =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View className="bg-muted rounded-lg px-6 py-4 gap-1">
      <Text className="text-lg font-semibold text-foreground">
        {formattedDate}
      </Text>

      {/* Task Statistics */}
      <View className="flex-row items-center gap-4">
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 bg-primary-500 rounded-full" />
          <Text className="text-muted-foreground text-sm">
            {total} {total === 1 ? "task" : "tasks"}
          </Text>
        </View>

        {total > 0 && (
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 bg-green-500 rounded-full" />
            <Text className="text-muted-foreground text-sm">
              {completed} completed
            </Text>
          </View>
        )}

        {total > 0 && (
          <View className="flex-row items-center gap-2">
            <ThemedIcon
              name="trending-up"
              size={14}
              library="feather"
              lightColor="#10B981"
              darkColor="#34D399"
            />
            <Text className="text-green-600 text-sm font-medium">
              {completionPercentage}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default TaskStats;

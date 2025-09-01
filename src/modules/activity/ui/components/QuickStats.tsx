import React from "react";
import { View, Text } from "react-native";
import { Task } from "@/types";

interface QuickStatsProps {
  tasks: Task[];
}

const QuickStats = ({ tasks }: QuickStatsProps) => {
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const successRate = Math.round(
    (completedTasks / Math.max(tasks.length, 1)) * 100,
  );

  return (
    <View className="bg-card rounded-lg p-4">
      <Text className="text-lg font-semibold text-foreground mb-4">
        Quick Stats
      </Text>
      <View className="flex-row justify-between">
        <View className="items-center flex-1">
          <Text className="text-2xl font-bold text-blue-600">
            {tasks.length}
          </Text>
          <Text className="text-muted-foreground text-sm">Total Tasks</Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-2xl font-bold text-green-600">
            {completedTasks}
          </Text>
          <Text className="text-muted-foreground text-sm">Completed</Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-2xl font-bold text-orange-600">
            {successRate}%
          </Text>
          <Text className="text-muted-foreground text-sm">Success Rate</Text>
        </View>
      </View>
    </View>
  );
};

export default QuickStats;

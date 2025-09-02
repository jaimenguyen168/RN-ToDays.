import React from "react";
import { View, Text } from "react-native";
import { PieChart } from "react-native-gifted-charts";

interface TaskDistributionPieChartProps {
  data: Array<{
    value: number;
    color: string;
    text: string;
    label: string;
  }>;
  totalTasks: number;
}

const TaskDistributionPieChart = ({
  data,
  totalTasks,
}: TaskDistributionPieChartProps) => {
  if (data.length === 0) return null;

  return (
    <View className="bg-card rounded-lg p-4">
      <Text className="text-lg font-semibold text-foreground mb-4">
        Task Distribution
      </Text>
      <View className="items-center">
        <PieChart
          data={data}
          donut
          showGradient
          sectionAutoFocus
          radius={80}
          innerRadius={60}
          innerCircleColor="transparent"
          centerLabelComponent={() => (
            <View className="items-center justify-center">
              <Text className="font-semibold text-2xl">{totalTasks}</Text>
              <Text className="text-sm font-light">Total</Text>
            </View>
          )}
        />
      </View>
      <View className="flex-row justify-center gap-4 mt-4">
        {data.map((item, index) => (
          <View key={index} className="flex-row items-center gap-2">
            <View
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <Text className="text-foreground text-sm">
              {item.label} ({item.value})
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
export default TaskDistributionPieChart;

import React from "react";
import { View, Text } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { TaskTypes } from "~/convex/schemas/tasks";

interface WeeklyTasksStackedBarChartProps {
  data: any[];
  getTaskColors: (type: string) => string;
}

const WeeklyTasksStackedBarChart = ({
  data,
  getTaskColors,
}: WeeklyTasksStackedBarChartProps) => {
  return (
    <View className="bg-card rounded-lg p-4 overflow-hidden">
      <Text className="text-lg font-semibold text-foreground mb-4">
        This Week's Tasks
      </Text>
      <BarChart
        stackData={data}
        width={260}
        height={200}
        barWidth={30}
        spacing={30}
        xAxisThickness={1}
        yAxisThickness={1}
        xAxisColor="#94a3b8"
        yAxisColor="#94a3b8"
        yAxisTextStyle={{ color: "#6B7280" }}
        showValuesAsTopLabel={false}
        noOfSections={3}
        maxValue={
          Math.max(
            ...data.map(
              (d) =>
                d.stacks?.reduce(
                  (sum: number, stack: any) => sum + stack.value,
                  0,
                ) || d.value,
            ),
          ) + 1
        }
        isAnimated
      />
      <View className="flex-row justify-center gap-4 mt-4">
        <View className="flex-row items-center gap-2">
          <View
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: getTaskColors(TaskTypes.PERSONAL),
            }}
          />
          <Text className="text-foreground text-sm">Personal</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: getTaskColors(TaskTypes.JOB),
            }}
          />
          <Text className="text-foreground text-sm">Job</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: getTaskColors(TaskTypes.EMERGENCY),
            }}
          />
          <Text className="text-foreground text-sm">Emergency</Text>
        </View>
      </View>
    </View>
  );
};
export default WeeklyTasksStackedBarChart;

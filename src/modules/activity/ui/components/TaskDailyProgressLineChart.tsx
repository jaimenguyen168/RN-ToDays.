import React from "react";
import { View, Text } from "react-native";
import { LineChart } from "react-native-gifted-charts";

interface TaskDailyProgressLineChartProps {
  completedData: any[];
  totalData: any[];
}

const TaskDailyProgressLineChart = ({
  completedData,
  totalData,
}: TaskDailyProgressLineChartProps) => {
  if (!completedData || !totalData) return null;

  const maxValue = Math.max(
    3,
    ...completedData.map(
      (d) =>
        d.stacks?.reduce((sum: number, stack: any) => sum + stack.value, 0) ||
        d.value,
    ),
  );

  return (
    <View className="bg-card rounded-lg p-4 overflow-hidden">
      <Text className="text-lg font-semibold text-foreground mb-4">
        Daily Progress (Last 7 Days)
      </Text>
      <LineChart
        data={completedData}
        data2={totalData}
        width={260}
        height={200}
        color1="#10B981"
        color2="#3B82F6"
        xAxisType="solid"
        thickness1={2}
        thickness2={2}
        dataPointsColor1="#10B981"
        dataPointsColor2="#3B82F6"
        dataPointsRadius1={3}
        dataPointsRadius2={3}
        initialSpacing={20}
        spacing={40}
        endSpacing={10}
        noOfSections={3}
        isAnimated
        animateTogether
        yAxisTextStyle={{ color: "#6B7280" }}
        verticalLinesColor="rgba(14,165,233,0.1)"
        xAxisThickness={0}
        yAxisThickness={0}
        xAxisColor="#94a3b8"
        yAxisColor="#94a3b8"
        maxValue={maxValue}
      />
      <View className="flex-row justify-center gap-6 mt-4">
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-full bg-green-500" />
          <Text className="text-foreground text-sm">Completed</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-full bg-blue-500" />
          <Text className="text-foreground text-sm">Total Tasks</Text>
        </View>
      </View>
    </View>
  );
};

export default TaskDailyProgressLineChart;

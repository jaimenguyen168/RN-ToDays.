import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { Task } from "@/types";
import { TaskTypes } from "~/convex/schemas/tasks";
import EmptyState from "@/modules/activity/ui/components/EmptyState";
import TaskDistributionPieChart from "@/modules/activity/ui/components/TaskDistributionPieChart";
import WeeklyTasksStackedBarChart from "@/modules/activity/ui/components/WeeklyTasksStackedBarChart";
import TaskDailyProgressLineChart from "@/modules/activity/ui/components/TaskDailyProgressLineChart";
import QuickStats from "@/modules/activity/ui/components/QuickStats";
import { getTaskColors } from "@/utils/color";

interface AnalyticsViewProps {
  tasks: Task[] | undefined;
}

const AnalyticsView = ({ tasks }: AnalyticsViewProps) => {
  const chartData = useMemo(() => {
    if (!tasks) return null;

    const last7DaysCompleted = [];
    const last7DaysTotal = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      const dayTasks = tasks.filter((task: Task) => {
        const taskDate = new Date(task.date).toISOString().split("T")[0];
        return taskDate === dateString;
      });

      const completed = dayTasks.filter((task) => task.isCompleted).length;
      const total = dayTasks.length;

      last7DaysCompleted.push({
        value: completed,
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        labelTextStyle: { color: "#64748B" },
        dataPointText: completed.toString(),
        textShiftY: -15,
        textShiftX: -5,
        textColor: "#10B981",
        textFontSize: 10,
      });

      last7DaysTotal.push({
        value: total,
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        labelTextStyle: { color: "#64748B" },
        dataPointText: total.toString(),
        textShiftY: -15,
        textShiftX: -5,
        textColor: "#3B82F6",
        textFontSize: 10,
      });
    }

    // 2. Current week stacked bar chart (Mon-Sun)
    const currentWeekData = [];
    const today = new Date();
    const currentWeekStart = new Date(today);
    // Get Monday of current week
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday (0), go back 6 days, else go back (dayOfWeek - 1)
    currentWeekStart.setDate(today.getDate() - daysToSubtract);

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      const dateString = date.toISOString().split("T")[0];

      const dayTasks = tasks.filter((task: Task) => {
        const taskDate = new Date(task.date).toISOString().split("T")[0];
        return taskDate === dateString;
      });

      const personalCount = dayTasks.filter(
        (task) => task.type === TaskTypes.PERSONAL,
      ).length;
      const jobCount = dayTasks.filter(
        (task) => task.type === TaskTypes.WORK,
      ).length;
      const emergencyCount = dayTasks.filter(
        (task) => task.type === TaskTypes.EMERGENCY,
      ).length;

      currentWeekData.push({
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        value: personalCount,
        spacing: 2,
        labelWidth: 30,
        labelTextStyle: { color: "#64748B", fontWeight: "bold" as const },
        frontColor: getTaskColors(TaskTypes.PERSONAL),
        stacks: [
          {
            value: personalCount,
            color: getTaskColors(TaskTypes.PERSONAL),
          },
          {
            value: jobCount,
            color: getTaskColors(TaskTypes.WORK),
          },
          {
            value: emergencyCount,
            color: getTaskColors(TaskTypes.EMERGENCY),
          },
        ],
        topLabelComponent: () => (
          <Text style={{ color: "#64748B", fontSize: 10, marginBottom: 6 }}>
            {personalCount + jobCount + emergencyCount}
          </Text>
        ),
      });
    }

    // 2. Task distribution by type (Pie Chart)
    const tasksByType: Record<string, number> = {
      [TaskTypes.PERSONAL]: 0,
      [TaskTypes.WORK]: 0,
      [TaskTypes.EMERGENCY]: 0,
    };

    tasks.forEach((task: Task) => {
      if (tasksByType.hasOwnProperty(task.type)) {
        tasksByType[task.type]++;
      }
    });

    const pieData = Object.entries(tasksByType)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => ({
        value: count,
        color: getTaskColors(type),
        text: count.toString(),
        label: type,
      }));

    // 3. Weekly completion trend (Line Chart)
    const weeklyTrend = [];
    for (let i = 4; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekTasks = tasks.filter((task: Task) => {
        const taskDate = new Date(task.date);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });

      const completed = weekTasks.filter((task) => task.isCompleted).length;
      const total = weekTasks.length;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      weeklyTrend.push({
        value: Math.round(completionRate),
        label: `W${i === 0 ? "eek" : i + 1}`,
        labelTextStyle: { color: "#64748B" },
        dataPointText: `${Math.round(completionRate)}%`,
        textShiftY: -10,
        textShiftX: -10,
        textColor: "#3B82F6",
        textFontSize: 10,
      });
    }

    return {
      dailyCompletedLine: last7DaysCompleted,
      dailyTotalLine: last7DaysTotal,
      currentWeekStacked: currentWeekData,
      taskDistribution: pieData,
      weeklyTrend: weeklyTrend,
    };
  }, [tasks]);

  if (!chartData || !tasks?.length) {
    return (
      <View className="px-6">
        <EmptyState
          icon="chart-line"
          title="No data for analytics yet"
          description="Complete some tasks to see your productivity insights"
        />
      </View>
    );
  }

  return (
    <View className="px-6 gap-6">
      {/* Task Distribution Pie Chart */}
      <TaskDistributionPieChart
        data={chartData.taskDistribution}
        totalTasks={tasks.length}
      />

      {/* Current Week Stacked Bar Chart */}
      <WeeklyTasksStackedBarChart
        data={chartData.currentWeekStacked}
        getTaskColors={getTaskColors}
      />

      {/* Daily Completion vs Total Line Chart */}
      <TaskDailyProgressLineChart
        completedData={chartData.dailyCompletedLine}
        totalData={chartData.dailyTotalLine}
      />

      {/* Quick Stats */}
      <QuickStats tasks={tasks} />
    </View>
  );
};

export default AnalyticsView;

import React, { useMemo } from "react";
import { View, Text, useColorScheme } from "react-native";
import { Calendar } from "react-native-calendars";
import { format, parseISO, startOfDay } from "date-fns";
import { Task } from "@/types";
import { TaskTypes } from "~/convex/schemas/tasks";
import { getTaskColors } from "@/utils/color";

const numberToDateString = (timestamp: number): string => {
  return format(new Date(timestamp), "yyyy-MM-dd");
};

const dateStringToNumber = (dateString: string): number => {
  return startOfDay(parseISO(dateString)).getTime();
};

interface TaskCalendarProps {
  tasks: Task[] | undefined;
  selectedDate: number;
  onDateSelect: (date: number) => void;
}

const TasksCalendar = ({
  tasks,
  selectedDate,
  onDateSelect,
}: TaskCalendarProps) => {
  const colorScheme = useColorScheme();

  const selectedDateString = useMemo(() => {
    return numberToDateString(selectedDate);
  }, [selectedDate]);

  const taskMarkedDates = useMemo(() => {
    if (!tasks) return {};

    const marked: { [key: string]: any } = {};

    const tasksByDate = tasks.reduce(
      (acc: { [key: string]: Task[] }, task: Task) => {
        // Use date-fns to format the task date
        const dateString = format(new Date(task.date), "yyyy-MM-dd");

        if (!acc[dateString]) {
          acc[dateString] = [];
        }
        acc[dateString].push(task);
        return acc;
      },
      {},
    );

    Object.keys(tasksByDate).forEach((dateString) => {
      const tasksForDate = tasksByDate[dateString];

      const typeCount: { [key: string]: number } = {};
      tasksForDate.forEach((task) => {
        typeCount[task.type] = (typeCount[task.type] || 0) + 1;
      });

      const dots = Object.entries(typeCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([type]) => ({
          key: type,
          color: getTaskColors(type),
          selectedDotColor: getTaskColors(type),
        }));

      marked[dateString] = {
        dots,
        selected: dateString === selectedDateString,
        selectedColor:
          dateString === selectedDateString ? "#8F99EB" : undefined,
      };
    });

    if (!marked[selectedDateString]) {
      marked[selectedDateString] = {
        selected: true,
        selectedColor: "#8F99EB",
        dots: [],
      };
    }

    return marked;
  }, [tasks, selectedDateString]);

  const handleDatePress = (day: { dateString: string }) => {
    const timestamp = dateStringToNumber(day.dateString);
    onDateSelect(timestamp);
  };

  return (
    <View className="flex-1 gap-4">
      {/* Legend */}
      <View className="px-6">
        <TaskLegend getTaskColors={getTaskColors} />
      </View>

      {/* Calendar */}
      <View className="px-6">
        <Calendar
          current={selectedDateString}
          onDayPress={handleDatePress}
          markingType="multi-dot"
          markedDates={taskMarkedDates}
          theme={{
            backgroundColor: "transparent",
            calendarBackground: "transparent",
            textSectionTitleColor:
              colorScheme === "dark" ? "#F9FAFD" : "#64748B",
            selectedDayBackgroundColor: "#BEC2F5",
            selectedDayTextColor: "#F9FAFD",
            todayTextColor: "#6366f1",
            dayTextColor: colorScheme === "dark" ? "#F9FAFD" : "#1F2937",
            dotColor: "#F59E0B",
            selectedDotColor: "#ffffff",
            arrowColor: "#6366f1",
            monthTextColor: colorScheme === "dark" ? "#F9FAFD" : "#1F2937",
            textDayFontWeight: "500",
            textMonthFontWeight: "600",
            textDayHeaderFontWeight: "500",
            textDayFontSize: 14,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
          enableSwipeMonths={true}
          hideExtraDays={true}
          firstDay={1} // Monday as first day
        />
      </View>
    </View>
  );
};

export default TasksCalendar;

interface TaskLegendProps {
  getTaskColors: (type: string) => string;
}

const TaskLegend = ({ getTaskColors }: TaskLegendProps) => {
  return (
    <View className="bg-muted rounded-lg p-4 gap-3 flex-row justify-between">
      <View className="flex-row items-center gap-3">
        <View
          className="size-2 rounded-full"
          style={{
            backgroundColor: getTaskColors(TaskTypes.PERSONAL),
          }}
        />
        <Text className="text-foreground">Personal</Text>
      </View>
      <View className="flex-row items-center gap-3">
        <View
          className="size-2 rounded-full"
          style={{
            backgroundColor: getTaskColors(TaskTypes.WORK),
          }}
        />
        <Text className="text-foreground">Job</Text>
      </View>
      <View className="flex-row items-center gap-3">
        <View
          className="size-2 rounded-full"
          style={{
            backgroundColor: getTaskColors(TaskTypes.EMERGENCY),
          }}
        />
        <Text className="text-foreground">Emergency</Text>
      </View>
    </View>
  );
};

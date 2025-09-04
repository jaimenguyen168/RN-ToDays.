import React from "react";
import { View, Text, useColorScheme } from "react-native";
import { Calendar } from "react-native-calendars";
import { Task } from "@/types";
import { TaskTypes } from "~/convex/schemas/tasks";
import { getTaskColors } from "@/utils/color";

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
  if (!tasks) return null;

  // Group tasks by date and create marked dates object
  const markedDates = React.useMemo(() => {
    const marked: any = {};

    // Group tasks by date string (YYYY-MM-DD format)
    const tasksByDate = tasks.reduce(
      (acc, task) => {
        const dateStr = new Date(task.date).toISOString().split("T")[0]; // Get YYYY-MM-DD
        if (!acc[dateStr]) {
          acc[dateStr] = [];
        }
        acc[dateStr].push(task);
        return acc;
      },
      {} as Record<string, Task[]>,
    );

    // Convert to react-native-calendars format
    Object.entries(tasksByDate).forEach(([dateStr, dateTasks]) => {
      // Get unique task types for this date
      const uniqueTypes = [...new Set(dateTasks.map((task) => task.type))];

      // Create dots for each unique task type
      const dots = uniqueTypes.map((type) => ({
        color: getTaskColors(type),
        selectedDotColor: "#ffffff",
      }));

      marked[dateStr] = {
        dots: dots,
        selected: false,
        selectedColor: "#BEC2F5",
      };
    });

    // Mark the selected date
    const selectedDateStr = new Date(selectedDate).toISOString().split("T")[0];
    if (marked[selectedDateStr]) {
      marked[selectedDateStr].selected = true;
    } else {
      marked[selectedDateStr] = {
        selected: true,
        selectedColor: "#BEC2F5",
        dots: [],
      };
    }

    return marked;
  }, [tasks, selectedDate]);

  // Convert selectedDate timestamp to date string for Calendar current prop
  const currentDateStr = new Date(selectedDate).toISOString().split("T")[0];

  const handleDayPress = (day: any) => {
    // Convert date string back to timestamp at midnight
    const dateTimestamp = new Date(day.dateString + "T00:00:00.000").getTime();
    onDateSelect(dateTimestamp);
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
          current={currentDateStr}
          onDayPress={handleDayPress}
          markingType="multi-dot"
          markedDates={markedDates}
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
